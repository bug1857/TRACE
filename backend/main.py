import io
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

app = FastAPI(title="TRACE. Process Mining Backend")

# Configure CORS to allow origin http://localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/ocel/upload")
async def upload_ocel_log(
    file: UploadFile = File(...),
    mapping_override: Optional[str] = Form(None),
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
    
    # Read uploaded CSV
    try:
        contents = await file.read()
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
    ts_col = mapping["timestamp"]["column"]
    if ts_col and ts_col in df.columns:
        parsed_ts = pd.to_datetime(df[ts_col], errors='coerce', format='mixed')
        valid_rows = parsed_ts.notna().sum()
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

    # Calculate forecasting benchmarking
    try:
        from forecasting import benchmark_forecasts
        forecasting_result = benchmark_forecasts(carbon_data["carbonBudget"], holdout_months=3)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed during forecasting calculation: {str(e)}"
        )

    # Return output contract
    # metadata keys exactly: filename, rowCount, caseCount, activityCount, totalEvents
    response_payload = {
        "metadata": {
            "filename": filename,
            "rowCount": len(df),
            "caseCount": case_count,
            "activityCount": act_count,
            "totalEvents": total_events
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
    model: Optional[str] = "gemma3:4b"
    style: Optional[str] = "balanced"
    context: Optional[Dict[str, Any]] = None


@app.get("/api/copilot/status")
def get_copilot_status():
    import urllib.request
    import json
    url = "http://localhost:11434/api/tags"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=2.0) as response:
            if response.status == 200:
                res_body = response.read().decode('utf-8')
                data = json.loads(res_body)
                models = [m["name"] for m in data.get("models", [])]
                return {"online": True, "availableModels": models}
    except Exception:
        pass
    return {"online": False, "availableModels": []}


@app.post("/api/copilot/query")
def query_copilot(payload: CopilotQuery):
    # 1. Build context string
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
        critical_v = sum(1 for v in violations if v.get("severity") == "critical" or v.get("severity") == "CRITICAL")
        
        suppliers = payload.context.get("supplierFitness", [])
        s_count = len(suppliers)
        avg_cfs = "unknown"
        if s_count > 0:
            avg_cfs = round(sum(s.get("avgCfsScore", 0) for s in suppliers) / s_count, 1)
            
        context_str = (
            f"Active Project Context:\n"
            f"- Loaded Log File: {filename}\n"
            f"- Cases Analyzed: {case_count}\n"
            f"- Total Events: {total_events}\n"
            f"- Unique Activities: {activity_count}\n"
            f"- Total Carbon Footprint: {total_carbon} kg\n"
            f"- Conformance Gaps/Violations: {v_count} detected ({critical_v} critical)\n"
            f"- Suppliers Monitored: {s_count} (Average Carrier CFS: {avg_cfs})\n"
        )
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
                f"- Note on conformance rule scope: Conformance checking was conducted against limited rules targeting: "
                f"[{disallowed_str}]. A count of 0 violations indicates no matches for these specific activities "
                f"were found, and does not imply complete compliance across other unmonitored activities.\n"
            )
    else:
        context_str = "No active project data loaded yet. User has not uploaded any event log."

    # 2. Select system prompt style
    system_prompt = ""
    if payload.style == "numerical":
        system_prompt = "You are TRACE. Copilot, an AI carbon auditing assistant. Focus heavily on numerical data, metrics, and statistics. Lead with raw numbers and keep prose/paragraphs minimal. Do not make up any numbers; use only the provided context."
    elif payload.style == "executive":
        system_prompt = "You are TRACE. Copilot, an AI carbon auditing assistant. Use a concise, professional, and bottom-line-oriented business summary tone. Avoid excessive fluff or details. Do not make up any numbers; use only the provided context."
    elif payload.style == "formal":
        system_prompt = "You are TRACE. Copilot, an AI carbon auditing assistant. Use a highly structured, objective, and formal audit-report tone. Use clear bullet points and clear definitions. Do not make up any numbers; use only the provided context."
    else:  # balanced
        system_prompt = "You are TRACE. Copilot, an AI carbon auditing assistant. Use a balanced, professional, conversational, and helpful tone. Do not make up any numbers; use only the provided context."

    # 3. Call local Ollama
    url = "http://localhost:11434/api/generate"
    ollama_payload = {
        "model": payload.model or "gemma3:4b",
        "prompt": f"Data Context:\n{context_str}\n\nUser Question:\n{payload.query}",
        "system": system_prompt,
        "stream": False
    }
    
    import urllib.request
    import urllib.error
    import json
    import time

    start_time = time.time()
    try:
        data = json.dumps(ollama_payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30.0) as response:
            latency_ms = int((time.time() - start_time) * 1000)
            if response.status == 200:
                res_body = response.read().decode('utf-8')
                result = json.loads(res_body)
                return {
                    "answer": result.get("response", ""),
                    "model": payload.model or "gemma3:4b",
                    "latencyMs": latency_ms
                }
            else:
                raise HTTPException(
                    status_code=502,
                    detail=f"Ollama returned bad status: {response.status}"
                )
    except urllib.error.URLError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Ollama service is unreachable. Make sure Ollama is running locally. Error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query local LLM: {str(e)}"
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

