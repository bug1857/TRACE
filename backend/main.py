import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from column_mapper import map_columns, ColumnMappingError
from process_mining import extract_dfg
from database import engine, Base, get_db
import models
from carbon_budget import calculate_carbon_budget
from conformance import detect_violations
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
    mapping_override: Optional[str] = Form(None)
):
    filename = file.filename or "unknown.csv"
    
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
                import json
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
        carbon_data = calculate_carbon_budget(
            df,
            case_col=mapping["case_id"]["column"],
            activity_col=mapping["activity"]["column"],
            ts_col=mapping["timestamp"]["column"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed during carbon budget calculation: {str(e)}"
        )

    # Detect process violations
    try:
        violations = detect_violations(
            df,
            case_id_col=mapping["case_id"]["column"],
            activity_col=mapping["activity"]["column"],
            timestamp_col=mapping["timestamp"]["column"]
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed during process optimization calculation: {str(e)}"
        )

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
            process_optimization=process_optimization_result
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

    # Return output contract
    # metadata keys exactly: filename, rowCount, caseCount, activityCount, totalEvents
    return {
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
        "greenRoutes": green_routes_result
    }


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
