import pandas as pd
from typing import List, Dict, Any
from carbon_budget import classify_activity

VIOLATION_RULES = [
    {"forbidden": "air freight", "mandated": "rail freight", "category": "transport", "reduction_factor": 0.85},
    {"forbidden": "truck delivery", "mandated": "rail delivery", "category": "transport", "reduction_factor": 0.75},
    {"forbidden": "incineration", "mandated": "recycling", "category": "waste", "reduction_factor": 0.70},
    {"forbidden": "landfill", "mandated": "recycling", "category": "waste", "reduction_factor": 0.60},
]

def detect_violations(events_df: pd.DataFrame, case_id_col: str, activity_col: str, timestamp_col: str) -> List[Dict[str, Any]]:
    """
    Detect process conformance violations and calculate estimated carbon deltas.
    """
    violations = []
    
    if events_df.empty:
        return violations
        
    # Sort chronologically within each case
    df_sorted = events_df.copy()
    df_sorted["_parsed_ts"] = pd.to_datetime(df_sorted[timestamp_col], errors="coerce", format="mixed")
    df_sorted = df_sorted.sort_values(by=[case_id_col, "_parsed_ts"]).reset_index()
    
    for idx, row in df_sorted.iterrows():
        activity = str(row[activity_col])
        activity_lower = activity.lower()
        case_id = str(row[case_id_col])
        
        # Format timestamp
        if pd.notna(row["_parsed_ts"]):
            ts_str = row["_parsed_ts"].isoformat()
        else:
            ts_str = str(row[timestamp_col])
            
        # Check against rules
        for rule in VIOLATION_RULES:
            forbidden = rule["forbidden"].lower()
            if forbidden in activity_lower:
                mandated = rule["mandated"]
                category = rule["category"]
                reduction_factor = rule["reduction_factor"]
                
                # Compute carbon factors
                _, forbidden_factor, _ = classify_activity(activity)
                
                # Check for weight/quantity column to scale carbon
                qty = 1.0
                for col in ["weight", "quantity", "cargo_weight", "volume", "amount"]:
                    if col in row and pd.notna(row[col]):
                        try:
                            qty = float(row[col])
                        except ValueError:
                            pass
                        break
                        
                forbidden_carbon = forbidden_factor * qty
                delta = forbidden_carbon * reduction_factor
                
                # Determine severity
                if delta > 2.0:
                    severity = "critical"
                elif delta > 0.5:
                    severity = "warning"
                else:
                    severity = "info"
                    
                # Build unique violation ID
                clean_act = "".join(c for c in activity if c.isalnum() or c in ("-", "_"))
                v_id = f"v-{case_id}-{clean_act}-{idx}"
                
                violations.append({
                    "id": v_id,
                    "caseId": case_id,
                    "activity": activity,
                    "mandatedAlternative": mandated,
                    "category": category,
                    "severity": severity,
                    "carbonDeltaKg": round(delta, 2),
                    "estimated": True,
                    "timestamp": ts_str
                })
                
    return violations
