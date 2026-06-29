import io
import os
import json
import datetime
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from column_mapper import map_columns, ColumnMappingError
from process_mining import extract_dfg
from database import engine, Base, get_db, SessionLocal
import models
from carbon_budget import calculate_carbon_budget
from conformance import detect_violations, get_rule_scope_summary
from carbon_fitness import calculate_cfs, calculate_supplier_fitness
from process_optimization import compute_process_optimization
from brsr_report import assemble_brsr_report
from esg_report import assemble_esg_report
from green_routes import compute_green_routes

# Create tables in trace.db (stateless for now, but ready for future features)
Base.metadata.create_all(bind=engine)

# --- Ollama configuration (read from env so production deployments work) ---
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "gemma3:4b")

app = FastAPI(title="TRACE. Process Mining Backend")

# Configure CORS to allow origin http://localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/ocel/upload")
async def upload_ocel_log(
    file: UploadFile = File(...),
    mapping_override: str | None = Form(default=None),
    workspace_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    filename = file.filename or "unknown.csv"
    
    if workspace_id is not None:
        workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found"
            )
    
    # File size guard — reject files over 50 MB before reading into memory
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    file_size_mb = len(contents) / (1024 * 1024)
    if file_size_mb > 50:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File exceeds 50 MB limit ({file_size_mb:.1f} MB received). "
                "Please upload a smaller dataset or contact support for bulk processing."
            )
        )

    # Read uploaded CSV
    try:
        # Decode as utf-8 (handling common CSV encodings)
        try:
            decoded = contents.decode("utf-8")
        except UnicodeDecodeError:
            # Fallback to latin-1 if utf-8 fails
            decoded = contents.decode("latin-1")
            
        df = pd.read_csv(io.StringIO(decoded))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV file: {str(e)}"
        )
        
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded CSV file is empty."
        )

    # Parse mapping_override if present
    parsed_override = None
    if mapping_override:
        stripped = mapping_override.strip()
        if stripped and stripped != "null":
            try:
                parsed_override = json.loads(mapping_override)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={"error": "Invalid mapping_override format", "message": str(e)}
                )

    # Detect/Manual columns mapping
    try:
        mapping = map_columns(df, mapping_override=parsed_override)
    except ColumnMappingError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.to_dict()
        )
    
    # Auto-detect validation block
    if parsed_override is None:
        required_fields = ["case_id", "activity", "timestamp"]
        missing_fields = []
        
        for field in required_fields:
            if mapping[field]["confidence"] < 0.5:
                missing_fields.append(field)
                
        if missing_fields:
            error_body = {
                "error": f"Failed to auto-detect process columns with sufficient confidence. Missing fields: {', '.join(missing_fields)}",
                "missing_fields": missing_fields,
                "detected_mapping": mapping,
                "available_columns": df.columns.tolist()
            }
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=error_body
            )

    # Validate that the mapped timestamp column contains at least one parseable date/time value
    # Also count how many rows are dropped due to unparseable timestamps.
    ts_col = mapping["timestamp"]["column"]
    dropped_rows_count = 0
    if ts_col and ts_col in df.columns:
        parsed_ts = pd.to_datetime(df[ts_col], errors='coerce', format='mixed')
        valid_rows = parsed_ts.notna().sum()
        dropped_rows_count = int(parsed_ts.isna().sum())
        if valid_rows == 0:
            error_body = {
                "error": "Column mapped to Timestamp contains no parseable date/time values",
                "missing_fields": ["timestamp"],
                "detected_mapping": mapping,
                "available_columns": df.columns.tolist()
            }
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=error_body
            )
        
    # Extract Directly-Follows Graph
    try:
        nodes, edges, act_count, case_count, total_events = extract_dfg(df, mapping)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed during process mining DFG calculation: {str(e)}"
        )

    # Calculate carbon budget
    try:
        overrides = db.query(models.EmissionFactorOverride).all()
        custom_factors = {ov.category: {"factor": ov.factor} for ov in overrides}
        carbon_data = calculate_carbon_budget(
            df,
            case_col=mapping["case_id"]["column"],
            activity_col=mapping["activity"]["column"],
            ts_col=mapping["timestamp"]["column"],
            custom_factors=custom_factors
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed during carbon budget calculation: {str(e)}"
        )

    # Load conformance rules override if exists
    override_rules = None
    try:
        rule_override = db.query(models.ConformanceRuleOverride).order_by(models.ConformanceRuleOverride.id.desc()).first()
        if rule_override:
            override_rules = json.loads(rule_override.rules_json)
    except Exception as e:
        print(f"Error loading conformance rule overrides: {e}")

    # Detect process violations
    try:
        violations = detect_violations(
            df,
            case_id_col=mapping["case_id"]["column"],
            activity_col=mapping["activity"]["column"],
            timestamp_col=mapping["timestamp"]["column"],
            override_rules=override_rules
        )
    except Exception:
        violations = []

    # Calculate case carbon fitness scores (CFS)
    try:
        cfs_scores = calculate_cfs(
            df,
            case_id_col=mapping["case_id"]["column"],
            activity_col=mapping["activity"]["column"]
        )
    except Exception:
        cfs_scores = []
        
    # Calculate supplier fitness scores
    try:
        sup_info = mapping["supplier"]
        sup_col = sup_info["column"]
        if sup_col is None:
            sup_col = mapping["resource"]["column"]
            
        if sup_col is not None:
            supplier_fitness = calculate_supplier_fitness(
                df,
                case_id_col=mapping["case_id"]["column"],
                activity_col=mapping["activity"]["column"],
                supplier_col=sup_col,
                is_resource_fallback=sup_info["isResourceFallback"]
            )
        else:
            supplier_fitness = []
    except Exception:
        supplier_fitness = []

    # Calculate process optimization metrics
    try:
        process_optimization_result = compute_process_optimization(
            df,
            activity_col=mapping["activity"]["column"],
            case_col=mapping["case_id"]["column"],
            timestamp_col=mapping["timestamp"]["column"]
        )
    except Exception as e:
        import traceback
        print(f"[WARN] process_optimization failed: {traceback.format_exc()}")
        process_optimization_result = {
            "bottlenecks": [], 
            "rework": [], 
            "caseDurationDistribution": [], 
            "totalCasesAnalyzed": 0
        }

    # Calculate water/electricity/cost sums if mapped
    water_liters = None
    water_info = mapping.get("water")
    if water_info and water_info.get("column"):
        col = water_info["column"]
        if col in df.columns:
            water_liters = float(pd.to_numeric(df[col], errors='coerce').sum())

    energy_kwh = None
    elec_info = mapping.get("electricity")
    if elec_info and elec_info.get("column"):
        col = elec_info["column"]
        if col in df.columns:
            energy_kwh = float(pd.to_numeric(df[col], errors='coerce').sum())

    total_cost = None
    cost_info = mapping.get("cost")
    if cost_info and cost_info.get("column"):
        col = cost_info["column"]
        if col in df.columns:
            total_cost = float(pd.to_numeric(df[col], errors='coerce').sum())

    # Calculate BRSR report
    try:
        brsr_report_result = assemble_brsr_report(
            metadata={
                "filename": filename,
                "rowCount": len(df),
                "caseCount": case_count,
                "activityCount": act_count,
                "totalEvents": total_events
            },
            carbon_budget=carbon_data["carbonBudget"],
            total_carbon_kg=carbon_data["totalCarbonKg"],
            activity_carbon_breakdown=carbon_data["activityCarbonBreakdown"],
            violations=violations,
            cfs_scores=cfs_scores,
            supplier_fitness=supplier_fitness,
            process_optimization=process_optimization_result,
            water_liters=water_liters,
            energy_kwh=energy_kwh
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed during BRSR report assembly: {str(e)}"
        )

    # Calculate ESG report
    try:
        esg_report_result = assemble_esg_report(
            metadata={
                "filename": filename,
                "rowCount": len(df),
                "caseCount": case_count,
                "activityCount": act_count,
                "totalEvents": total_events
            },
            carbon_budget=carbon_data["carbonBudget"],
            total_carbon_kg=carbon_data["totalCarbonKg"],
            activity_carbon_breakdown=carbon_data["activityCarbonBreakdown"],
            violations=violations,
            cfs_scores=cfs_scores,
            supplier_fitness=supplier_fitness
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed during ESG report assembly: {str(e)}"
        )

    # Calculate green routes recommendations
    try:
        green_routes_result = compute_green_routes(
            activity_carbon_breakdown=carbon_data["activityCarbonBreakdown"],
            violations=violations
        )
    except Exception:
        green_routes_result = []

    # Forecasting module has been replaced by the benchmarking engine.
    # The dedicated /api/benchmarking/run endpoint handles conformance benchmarking.
    # The forecasting field is retained in the response schema for backward
    # compatibility but is always null from this endpoint.
    forecasting_result = None

    # Return output contract
    # metadata keys exactly: filename, rowCount, caseCount, activityCount, totalEvents
    response_payload = {
        "metadata": {
            "filename": filename,
            "rowCount": len(df),
            "caseCount": case_count,
            "activityCount": act_count,
            "totalEvents": total_events,
            "droppedRows": dropped_rows_count,
        },
        "dataQuality": {
            "droppedRows": dropped_rows_count,
            "dropReason": "unparseable_timestamp" if dropped_rows_count > 0 else None,
        },
        "nodes": nodes,
        "edges": edges,
        "columnMapping": mapping,
        "carbonBudget": carbon_data["carbonBudget"],
        "totalCarbonKg": carbon_data["totalCarbonKg"],
        "activityCarbonBreakdown": carbon_data["activityCarbonBreakdown"],
        "violations": violations,
        "cfsScores": cfs_scores,
        "supplierFitness": supplier_fitness,
        "processOptimization": process_optimization_result,
        "brsrReport": brsr_report_result,
        "esgReport": esg_report_result,
        "greenRoutes": green_routes_result,
        "forecasting": forecasting_result
    }
    if not violations:
        response_payload["conformanceRuleScope"] = get_rule_scope_summary(override_rules=override_rules)
    if total_cost is not None:
        response_payload["totalOperationalCostUSD"] = round(total_cost, 2)

    if workspace_id is not None:
        try:
            snapshot = models.AnalysisSnapshot(
                workspace_id=workspace_id,
                upload_response_json=json.dumps(response_payload)
            )
            db.add(snapshot)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save analysis snapshot: {str(e)}"
            )

    return response_payload


# ─────────────────────────────────────────────────────────────────────────
# Carbon Budget Settings endpoints
# ─────────────────────────────────────────────────────────────────────────

@app.get("/api/settings/carbon-budget")
def get_carbon_budget_setting(db: Session = Depends(get_db)):
    """
    Return the current monthly carbon budget limit in kg CO2e.
    Falls back to the DEFAULT_MONTHLY_BUDGET_KG constant in carbon_budget.py
    if no override has been saved.
    """
    from carbon_budget import DEFAULT_MONTHLY_BUDGET_KG
    try:
        override = db.query(models.CarbonBudgetSetting).order_by(
            models.CarbonBudgetSetting.id.desc()
        ).first()
        value = float(override.monthly_budget_kg) if override else float(DEFAULT_MONTHLY_BUDGET_KG)
        return {"monthly_budget_kg": value, "is_default": override is None}
    except Exception:
        # CarbonBudgetSetting table may not exist yet on older DBs
        from carbon_budget import DEFAULT_MONTHLY_BUDGET_KG
        return {"monthly_budget_kg": float(DEFAULT_MONTHLY_BUDGET_KG), "is_default": True}


class CarbonBudgetUpdate(BaseModel):
    monthly_budget_kg: float


@app.patch("/api/settings/carbon-budget")
def update_carbon_budget_setting(payload: CarbonBudgetUpdate, db: Session = Depends(get_db)):
    """
    Persist a new monthly carbon budget limit.
    Value must be > 0.
    """
    if payload.monthly_budget_kg <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="monthly_budget_kg must be a positive number."
        )
    try:
        # Ensure table exists (graceful migration)
        models.Base.metadata.create_all(bind=db.get_bind())
        existing = db.query(models.CarbonBudgetSetting).order_by(
            models.CarbonBudgetSetting.id.desc()
        ).first()
        if existing:
            existing.monthly_budget_kg = payload.monthly_budget_kg
        else:
            setting = models.CarbonBudgetSetting(
                monthly_budget_kg=payload.monthly_budget_kg
            )
            db.add(setting)
        db.commit()
        return {"monthly_budget_kg": payload.monthly_budget_kg, "status": "updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save carbon budget setting: {str(e)}"
        )


# ─────────────────────────────────────────────────────────────────────────
# Benchmarking endpoint
# ─────────────────────────────────────────────────────────────────────────

@app.post("/api/benchmarking/run")
async def run_benchmarking(
    file: UploadFile = File(...),
    mapping_override: str | None = Form(default=None),
):
    """
    Run the full 6-model conformance benchmarking suite against an uploaded
    event-log CSV.  Returns a BenchmarkReport containing per-model metrics
    (fitness, precision, F1, CFS, execution_time_ms) plus a winner card.

    If the total run takes longer than 120 seconds the endpoint returns
    partial results with timed_out=true.
    """
    # ── Read file ────────────────────────────────────────────────────────
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    file_size_mb = len(contents) / (1024 * 1024)
    if file_size_mb > 50:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File exceeds 50 MB limit ({file_size_mb:.1f} MB received). "
                "Please upload a smaller dataset or contact support for bulk processing."
            )
        )

    try:
        try:
            decoded = contents.decode("utf-8")
        except UnicodeDecodeError:
            decoded = contents.decode("latin-1")
        df = pd.read_csv(io.StringIO(decoded))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV file: {str(e)}"
        )

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded CSV file is empty."
        )

    # ── Column mapping ────────────────────────────────────────────────────
    parsed_override = None
    if mapping_override:
        stripped = mapping_override.strip()
        if stripped and stripped != "null":
            try:
                parsed_override = json.loads(mapping_override)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={"error": "Invalid mapping_override format", "message": str(e)}
                )

    try:
        mapping = map_columns(df, mapping_override=parsed_override)
    except ColumnMappingError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.to_dict()
        )

    if parsed_override is None:
        required_fields = ["case_id", "activity", "timestamp"]
        missing_fields = [
            f for f in required_fields if mapping[f]["confidence"] < 0.5
        ]
        if missing_fields:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "error": f"Cannot auto-detect required columns: {', '.join(missing_fields)}",
                    "missing_fields": missing_fields,
                    "detected_mapping": mapping,
                    "available_columns": df.columns.tolist()
                }
            )

    case_col = mapping["case_id"]["column"]
    activity_col = mapping["activity"]["column"]
    timestamp_col = mapping["timestamp"]["column"]

    # Validate timestamp column
    parsed_ts = pd.to_datetime(df[timestamp_col], errors="coerce", format="mixed")
    if parsed_ts.notna().sum() == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Timestamp column contains no parseable date/time values."
        )

    # ── Run benchmark ─────────────────────────────────────────────────────
    try:
        from benchmarking.engine import run_benchmark
        report = run_benchmark(
            df=df,
            case_col=case_col,
            activity_col=activity_col,
            timestamp_col=timestamp_col,
            timeout_seconds=120.0,
        )
        return report.to_dict()
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                f"pm4py is not installed on this server. "
                f"Install it with: pip install pm4py>=2.7.0. Error: {str(e)}"
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Benchmarking failed: {str(e)}"
        )


class AuditLogCreate(BaseModel):
    action_type: str
    target: str
    details: Optional[str] = None


@app.post("/api/audit-logs", status_code=201)
def create_audit_log(payload: AuditLogCreate, db: Session = Depends(get_db)):
    try:
        db_log = models.AuditLog(
            action_type=payload.action_type,
            target=payload.target,
            details=payload.details
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return {
            "id": db_log.id,
            "timestamp": db_log.timestamp.isoformat() + "Z",
            "action_type": db_log.action_type,
            "target": db_log.target,
            "details": db_log.details,
            "project_id": db_log.project_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database insertion failed: {str(e)}"
        )


@app.get("/api/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    try:
        logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(100).all()
        result = []
        for l in logs:
            result.append({
                "id": l.id,
                "timestamp": l.timestamp.isoformat() + "Z",
                "action_type": l.action_type,
                "target": l.target,
                "details": l.details,
                "project_id": l.project_id
            })
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database query failed: {str(e)}"
        )


@app.get("/api/emission-factors")
def get_emission_factors(db: Session = Depends(get_db)):
    try:
        overrides = db.query(models.EmissionFactorOverride).all()
        return {ov.category: ov.factor for ov in overrides}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database query failed: {str(e)}"
        )


@app.post("/api/emission-factors")
def update_emission_factors(factors: Dict[str, float], db: Session = Depends(get_db)):
    try:
        for category, factor in factors.items():
            # Check if override already exists
            override = db.query(models.EmissionFactorOverride).filter(models.EmissionFactorOverride.category == category).first()
            if override:
                override.factor = factor
            else:
                override = models.EmissionFactorOverride(category=category, factor=factor)
                db.add(override)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database upsert failed: {str(e)}"
        )


@app.get("/api/conformance-rules")
def get_conformance_rules(db: Session = Depends(get_db)):
    try:
        from conformance import CONFORMANCE_RULES
        override = db.query(models.ConformanceRuleOverride).order_by(models.ConformanceRuleOverride.id.desc()).first()
        if override:
            rules = json.loads(override.rules_json)
            return {
                "active": True,
                "filename": override.filename,
                "rule_count": len(rules),
                "rules": rules
            }
        else:
            return {
                "active": False,
                "filename": "decarbonization_policy_rules_v2.pnml (default)",
                "rule_count": len(CONFORMANCE_RULES),
                "rules": CONFORMANCE_RULES
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conformance rules: {str(e)}"
        )

@app.post("/api/conformance-rules/upload")
async def upload_conformance_rules(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        from conformance import parse_csv_rules
        contents = await file.read()
        csv_text = contents.decode("utf-8")
        
        try:
            parsed_rules = parse_csv_rules(csv_text)
        except ValueError as ve:
            raise HTTPException(status_code=422, detail=str(ve))
            
        # Delete all existing overrides
        db.query(models.ConformanceRuleOverride).delete()
        
        # Insert new override
        override = models.ConformanceRuleOverride(
            rules_json=json.dumps(parsed_rules),
            filename=file.filename or "uploaded_rules.csv"
        )
        db.add(override)
        db.commit()
        
        return {
            "active": True,
            "filename": override.filename,
            "rule_count": len(parsed_rules),
            "rules": parsed_rules
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload conformance rules: {str(e)}"
        )

@app.delete("/api/conformance-rules")
def delete_conformance_rules(db: Session = Depends(get_db)):
    try:
        db.query(models.ConformanceRuleOverride).delete()
        db.commit()
        return {
            "status": "reset",
            "message": "Reverted to default conformance rules"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset conformance rules: {str(e)}"
        )


# Copilot Schemas
class CopilotQuery(BaseModel):
    query: str
    model: Optional[str] = None  # falls back to OLLAMA_DEFAULT_MODEL env var
    style: Optional[str] = "balanced"
    context: Optional[Dict[str, Any]] = None


@app.get("/api/copilot/status")
def get_copilot_status():
    import urllib.request
    import json
    url = f"{OLLAMA_BASE_URL}/api/tags"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=2.0) as response:
            if response.status == 200:
                res_body = response.read().decode('utf-8')
                data = json.loads(res_body)
                available_models = [m["name"] for m in data.get("models", [])]
                return {"online": True, "availableModels": available_models}
    except Exception:
        pass
    return {"online": False, "availableModels": []}


@app.post("/api/copilot/query")
def query_copilot(payload: CopilotQuery):
    import urllib.request
    import urllib.error
    import json
    import time

    # 1. Build RICH context string with all available data
    context_str = ""
    if payload.context:
        meta = payload.context.get("metadata", {})
        filename = meta.get("filename", "unknown.csv")
        case_count = meta.get("caseCount", "unknown")
        total_events = meta.get("totalEvents", "unknown")
        activity_count = meta.get("activityCount", "unknown")
        total_carbon = payload.context.get("totalCarbonKg", "unknown")

        violations = payload.context.get("violations", [])
        v_count = len(violations)
        critical_v = sum(1 for v in violations if str(v.get("severity", "")).upper() == "CRITICAL")

        suppliers = payload.context.get("supplierFitness", [])
        s_count = len(suppliers)
        avg_cfs = "unknown"
        if s_count > 0:
            avg_cfs = round(sum(s.get("avgCfsScore", 0) for s in suppliers) / s_count, 1)

        context_str = (
            f"=== ACTIVE PROJECT CONTEXT ===\n"
            f"Log File: {filename}\n"
            f"Cases Analyzed: {case_count}\n"
            f"Total Events: {total_events}\n"
            f"Unique Activities: {activity_count}\n"
            f"Total Carbon Footprint: {total_carbon} kg CO2e\n"
            f"Conformance Violations: {v_count} total ({critical_v} critical)\n"
            f"Suppliers Monitored: {s_count} (Average CFS: {avg_cfs})\n"
        )

        # --- Detailed Supplier Fitness Data (sorted worst-first) ---
        if suppliers:
            sorted_suppliers = sorted(suppliers, key=lambda x: x.get("violationCount", 0), reverse=True)
            context_str += "\n=== SUPPLIER FITNESS RANKING (worst to best by violations) ===\n"
            for rank, s in enumerate(sorted_suppliers, 1):
                name = s.get("supplier", s.get("supplierName", "Unknown"))
                total_cases = s.get("caseCount", s.get("totalCases", 0))
                violation_count = s.get("violationCount", 0)
                avg_score = s.get("avgCfsScore", 0)
                total_carbon = s.get("totalCarbonKg", 0)
                context_str += (
                    f"  #{rank}. {name}: {violation_count} violations across {total_cases} cases, "
                    f"CFS Score: {avg_score}, Total Carbon: {total_carbon} kg\n"
                )

        # --- Detailed Violation Data (top 20 to keep context manageable) ---
        if violations:
            context_str += f"\n=== CONFORMANCE VIOLATIONS (showing top 20 of {v_count}) ===\n"
            for v in violations[:20]:
                case_id = v.get("caseId", "?")
                activity = v.get("activity", "?")
                severity = v.get("severity", "?")
                carbon_excess = v.get("carbonExcessKg", 0)
                mandated = v.get("mandatedAlternative", "?")
                context_str += (
                    f"- Case {case_id}: '{activity}' used instead of '{mandated}' | "
                    f"Severity: {severity} | Excess CO2: {carbon_excess} kg\n"
                )

        # --- Carbon Activity Breakdown ---
        carbon_breakdown = payload.context.get("activityCarbonBreakdown", [])
        if carbon_breakdown:
            context_str += "\n=== CARBON BREAKDOWN BY ACTIVITY ===\n"
            for item in carbon_breakdown:
                act = item.get("activity", "?")
                total_kg = item.get("totalCarbonKg", 0)
                freq = item.get("frequency", 0)
                per_case = item.get("perCaseAvgKg", 0)
                context_str += f"- {act}: {total_kg} kg total ({freq} occurrences, {per_case} kg/case avg)\n"

        # --- Green Routes Recommendations ---
        green_routes = payload.context.get("greenRoutes", [])
        if green_routes:
            context_str += "\n=== GREEN ROUTE RECOMMENDATIONS ===\n"
            for r in green_routes:
                current = r.get("currentRoute", "?")
                recommended = r.get("recommendedRoute", "?")
                saving = r.get("carbonSaving", 0)
                cost_delta = r.get("costDelta", 0)
                confidence = r.get("confidence", 0)
                context_str += (
                    f"- Switch '{current}' -> '{recommended}': "
                    f"saves {saving} kg CO2, cost delta ${cost_delta}, "
                    f"confidence {round(confidence * 100)}%\n"
                )

        # --- Process Optimization / Bottlenecks ---
        proc_opt = payload.context.get("processOptimization", {})
        bottlenecks = proc_opt.get("bottlenecks", []) if proc_opt else []
        if bottlenecks:
            context_str += "\n=== PROCESS BOTTLENECKS ===\n"
            for b in bottlenecks:
                act = b.get("activity", "?")
                avg_wait = b.get("avgWaitHours", 0)
                occ = b.get("occurrences", 0)
                st = b.get("status", "?")
                context_str += f"- {act}: {avg_wait}h avg wait, {occ} occurrences, status: {st}\n"

        # --- Case Duration Distribution ---
        case_dist = proc_opt.get("caseDurationDistribution", []) if proc_opt else []
        if case_dist:
            context_str += "\n=== CASE DURATION DISTRIBUTION ===\n"
            for bucket in case_dist:
                label = bucket.get("bucket", "?")
                count = bucket.get("count", 0)
                pct = bucket.get("percentage", 0)
                context_str += f"- {label}: {count} cases ({pct}%)\n"

        # --- Carbon Budget ---
        carbon_budget = payload.context.get("carbonBudget", [])
        if carbon_budget:
            context_str += "\n=== CARBON BUDGET (MONTHLY) ===\n"
            for m in carbon_budget:
                month = m.get("month", "?")
                actual = m.get("actualKg", 0)
                cumulative = m.get("cumulativeKg", 0)
                limit = m.get("limitKg", None)
                context_str += f"- {month}: {actual} kg (cumulative: {cumulative} kg"
                if limit:
                    context_str += f", limit: {limit} kg"
                context_str += ")\n"

        # --- Forecasting ---
        forecasting = payload.context.get("forecasting", {})
        if forecasting and forecasting.get("dataAvailable"):
            best = forecasting.get("bestBaseline", "?")
            forecast_next = forecasting.get("forecastNextMonth", {})
            predicted = forecast_next.get("predictedActualKg", "?")
            context_str += (
                f"\n=== FORECASTING ===\n"
                f"Best Model: {best}\n"
                f"Next Month Forecast: {predicted} kg CO2e\n"
            )

        # --- ESG Report ---
        esg = payload.context.get("esgReport", {})
        if esg:
            env = esg.get("environmental", {})
            soc = esg.get("social", {})
            gov = esg.get("governance", {})
            overall = esg.get("overallScore", "?")
            context_str += (
                f"\n=== ESG SCORES ===\n"
                f"Overall ESG: {overall}%\n"
                f"Environmental: {env.get('score', '?')}% (Carbon Budget: {env.get('carbonBudgetStatus', '?')})\n"
                f"Social: {soc.get('score', 'N/A')} ({soc.get('note', '')})\n"
                f"Governance: {gov.get('score', '?')}% (Violations: {gov.get('violationCount', '?')}, Audit: {gov.get('auditReadiness', '?')})\n"
            )

        # --- Conformance Rule Scope Note ---
        if v_count == 0:
            rule_scope = payload.context.get("conformanceRuleScope", [])
            if rule_scope:
                all_disallowed = []
                for entry in rule_scope:
                    all_disallowed.extend(entry.get("disallowed_activities", []))
                disallowed_str = ", ".join(all_disallowed)
            else:
                disallowed_str = "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"
            context_str += (
                f"\nNote: Conformance checking targeted: [{disallowed_str}]. "
                f"0 violations = no matches for these specific activities.\n"
            )
    else:
        context_str = "No active project data loaded yet. User has not uploaded any event log."

    # 2. Select system prompt style
    style_prompts = {
        "numerical": (
            "You are TRACE Copilot, an AI carbon auditing assistant for supply chain analytics. "
            "Focus heavily on numerical data, metrics, and statistics from the provided context. "
            "Lead with raw numbers. Use bullet points. Keep prose minimal. "
            "CRITICAL: Only use numbers and facts from the provided context. Never invent data."
        ),
        "executive": (
            "You are TRACE Copilot, an AI carbon auditing assistant for supply chain analytics. "
            "Use a concise, professional, bottom-line-oriented business summary tone. "
            "Give actionable insights. Avoid fluff. Reference specific supplier names and numbers. "
            "CRITICAL: Only use numbers and facts from the provided context. Never invent data."
        ),
        "formal": (
            "You are TRACE Copilot, an AI carbon auditing assistant for supply chain analytics. "
            "Use a highly structured, objective, and formal audit-report tone. "
            "Use clear bullet points, headings, and precise definitions. "
            "CRITICAL: Only use numbers and facts from the provided context. Never invent data."
        ),
    }
    system_prompt = style_prompts.get(payload.style, (
        "You are TRACE Copilot, an AI carbon auditing assistant for supply chain analytics. "
        "Use a balanced, professional, conversational, and helpful tone. "
        "Always reference specific data points (supplier names, case IDs, carbon values) from the context. "
        "Give clear, actionable answers. "
        "CRITICAL: Only use numbers and facts from the provided context. Never invent data."
    ))

    # 3. Call Ollama (URL and model read from environment variables)
    ollama_generate_url = f"{OLLAMA_BASE_URL}/api/generate"
    model_name = payload.model or OLLAMA_DEFAULT_MODEL

    # Vision-Language models (qwen3-vl, llava, etc.) are slow on pure-text tasks.
    # Give them a longer timeout and truncate context to avoid prompt overflow.
    is_vl_model = any(tag in model_name.lower() for tag in ["-vl", ":vl", "llava", "vision"])
    ollama_timeout = 120.0 if is_vl_model else 60.0

    # Truncate context for VL models to prevent token overflow
    context_for_prompt = context_str
    if is_vl_model and len(context_str) > 3000:
        context_for_prompt = context_str[:3000] + "\n[Context truncated for VL model compatibility]"

    ollama_payload = {
        "model": model_name,
        "prompt": f"Data Context:\n{context_for_prompt}\n\nUser Question:\n{payload.query}",
        "system": system_prompt,
        "stream": False
    }

    start_time = time.time()

    try:
        data = json.dumps(ollama_payload).encode('utf-8')
        req = urllib.request.Request(
            ollama_generate_url,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        # Per-model timeout: VL models get 120s, text models get 60s
        with urllib.request.urlopen(req, timeout=ollama_timeout) as response:
            latency_ms = int((time.time() - start_time) * 1000)
            if response.status == 200:
                res_body = response.read().decode('utf-8')
                result = json.loads(res_body)
                answer = result.get("response", "")
                # Strip thinking tags if present (qwen3 models)
                if "<think>" in answer:
                    import re
                    answer = re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL).strip()
                return {
                    "answer": answer,
                    "model": model_name,
                    "latencyMs": latency_ms
                }
            else:
                raise Exception(f"Ollama returned status {response.status}")
    except urllib.error.URLError as e:
        # Ollama is not reachable — return 503 so the frontend can handle it distinctly
        raise HTTPException(
            status_code=503,
            detail=f"AI Copilot offline. Start Ollama locally with `ollama serve` to activate this feature. (Could not reach {OLLAMA_BASE_URL})"
        )
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while querying the local LLM: {str(e)}"
        )


# --- Multi-Tenancy Schemas ---

class OrganizationBase(BaseModel):
    name: str
    country: Optional[str] = None
    fiscal_year: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    fiscal_year: Optional[str] = None

class OrganizationResponse(OrganizationBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
        orm_mode = True

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    org_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
        orm_mode = True

class WorkspaceBase(BaseModel):
    name: str

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceResponse(WorkspaceBase):
    id: int
    project_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
        orm_mode = True

class TeamMemberCreate(BaseModel):
    name: str
    email: str
    role: str = "viewer"

class TeamMemberResponse(BaseModel):
    id: int
    org_id: int
    name: str
    email: str
    role: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# --- Multi-Tenancy Endpoints ---

@app.get("/api/organizations", response_model=List[OrganizationResponse])
def get_organizations(db: Session = Depends(get_db)):
    return db.query(models.Organization).all()

@app.post("/api/organizations", response_model=OrganizationResponse, status_code=201)
def create_organization(org: OrganizationCreate, db: Session = Depends(get_db)):
    try:
        db_org = models.Organization(
            name=org.name,
            country=org.country,
            fiscal_year=org.fiscal_year
        )
        db.add(db_org)
        db.commit()
        db.refresh(db_org)
        return db_org
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database organization creation failed: {str(e)}"
        )

@app.patch("/api/organizations/{org_id}", response_model=OrganizationResponse)
def update_organization(org_id: int, org_update: OrganizationUpdate, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    update_data = org_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_org, key, value)
    
    try:
        db.commit()
        db.refresh(db_org)
        return db_org
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database organization update failed: {str(e)}"
        )

@app.delete("/api/organizations/{org_id}")
def delete_organization(org_id: int, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    try:
        db.delete(db_org)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database organization deletion failed: {str(e)}"
        )

@app.get("/api/organizations/{org_id}/members", response_model=List[TeamMemberResponse])
def get_team_members(org_id: int, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db.query(models.TeamMember).filter(models.TeamMember.org_id == org_id).all()

@app.post("/api/organizations/{org_id}/members", response_model=TeamMemberResponse, status_code=201)
def create_team_member(org_id: int, member: TeamMemberCreate, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Check if email already exists in that org
    existing = db.query(models.TeamMember).filter(
        models.TeamMember.org_id == org_id,
        models.TeamMember.email == member.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team member with this email already exists in this organization")
    
    try:
        db_member = models.TeamMember(
            org_id=org_id,
            name=member.name,
            email=member.email,
            role=member.role
        )
        db.add(db_member)
        db.commit()
        db.refresh(db_member)
        return db_member
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database team member creation failed: {str(e)}"
        )

@app.delete("/api/organizations/{org_id}/members/{member_id}")
def delete_team_member(org_id: int, member_id: int, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    db_member = db.query(models.TeamMember).filter(
        models.TeamMember.id == member_id,
        models.TeamMember.org_id == org_id
    ).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Team member not found in this organization")
    
    try:
        db.delete(db_member)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database team member deletion failed: {str(e)}"
        )

@app.get("/api/organizations/{org_id}/projects", response_model=List[ProjectResponse])
def get_projects(org_id: int, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return db.query(models.Project).filter(models.Project.org_id == org_id).all()

@app.post("/api/organizations/{org_id}/projects", response_model=ProjectResponse, status_code=201)
def create_project(org_id: int, project: ProjectCreate, db: Session = Depends(get_db)):
    db_org = db.query(models.Organization).filter(models.Organization.id == org_id).first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    try:
        db_project = models.Project(org_id=org_id, name=project.name)
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database project creation failed: {str(e)}"
        )

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    try:
        db.delete(db_project)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database project deletion failed: {str(e)}"
        )

@app.get("/api/projects/{project_id}/workspaces", response_model=List[WorkspaceResponse])
def get_workspaces(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.query(models.Workspace).filter(models.Workspace.project_id == project_id).all()

@app.post("/api/projects/{project_id}/workspaces", response_model=WorkspaceResponse, status_code=201)
def create_workspace(project_id: int, workspace: WorkspaceCreate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    try:
        db_workspace = models.Workspace(project_id=project_id, name=workspace.name)
        db.add(db_workspace)
        db.commit()
        db.refresh(db_workspace)
        return db_workspace
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database workspace creation failed: {str(e)}"
        )

@app.delete("/api/workspaces/{workspace_id}")
def delete_workspace(workspace_id: int, db: Session = Depends(get_db)):
    db_workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()
    if not db_workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    try:
        db.delete(db_workspace)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database workspace deletion failed: {str(e)}"
        )

@app.get("/api/workspaces/{workspace_id}/latest-analysis")
def get_latest_analysis(workspace_id: int, db: Session = Depends(get_db)):
    db_workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()
    if not db_workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    snapshot = db.query(models.AnalysisSnapshot).filter(
        models.AnalysisSnapshot.workspace_id == workspace_id
    ).order_by(models.AnalysisSnapshot.created_at.desc()).first()
    
    if not snapshot:
        raise HTTPException(status_code=404, detail="No analysis snapshot found for this workspace")
    
    return json.loads(snapshot.upload_response_json)

# --- Startup Seed Logic ---

@app.on_event("startup")
def startup_event():
    # Ensure tables are created in the database
    Base.metadata.create_all(bind=engine)
    
    # Run dynamic SQLite migrations to add nullable country and fiscal_year columns if missing
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        columns = [col["name"] for col in inspector.get_columns("organizations")]
        if "country" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE organizations ADD COLUMN country TEXT"))
        if "fiscal_year" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE organizations ADD COLUMN fiscal_year TEXT"))
    except Exception as e:
        print(f"Error running organization schema migration: {e}")

    db = SessionLocal()
    try:
        if db.query(models.Organization).count() == 0:
            org = models.Organization(id=1, name="Louis India Pvt. Ltd.")
            db.add(org)
            db.commit()
            
            project = models.Project(id=1, org_id=1, name="Q3 Supply Chain Audit 2024")
            db.add(project)
            db.commit()
            
            workspace = models.Workspace(id=1, project_id=1, name="proj-1")
            db.add(workspace)
            db.commit()
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

