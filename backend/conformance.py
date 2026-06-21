import pandas as pd
from typing import List, Dict, Any
from carbon_budget import classify_activity

CONFORMANCE_RULES = [
    {
        "disallowed_activities": ["Air Freight Dispatch", "Truck Delivery Transport Dispatch"],
        "mandated_alternative": "Rail",
        "category": "transport",
        "reduction_factors": {
            "Air Freight Dispatch": 0.85,
            "Truck Delivery Transport Dispatch": 0.75
        }
    },
    {
        "disallowed_activities": ["Incineration Disposal", "Landfill Disposal"],
        "mandated_alternative": "Recycling",
        "category": "waste",
        "reduction_factors": {
            "Incineration Disposal": 0.70,
            "Landfill Disposal": 0.60
        }
    }
]

# Dynamically construct legacy VIOLATION_RULES for backward compatibility with carbon_fitness.py
VIOLATION_RULES = []
for rule in CONFORMANCE_RULES:
    mandated = rule["mandated_alternative"]
    category = rule["category"]
    for disallowed in rule["disallowed_activities"]:
        reduction_factor = rule["reduction_factors"].get(disallowed, 1.0)
        # Determine the mandated alternative string byte-for-byte as today
        if mandated == "Rail":
            if "freight" in disallowed.lower():
                mandated_alternative_str = "rail freight"
            else:
                mandated_alternative_str = "rail delivery"
        else:
            mandated_alternative_str = mandated.lower()
            
        # carbon_fitness.py expects substrings as forbidden keys:
        if "air freight" in disallowed.lower():
            forbidden_substring = "air freight"
        elif "truck delivery" in disallowed.lower():
            forbidden_substring = "truck delivery"
        elif "incineration" in disallowed.lower():
            forbidden_substring = "incineration"
        elif "landfill" in disallowed.lower():
            forbidden_substring = "landfill"
        else:
            forbidden_substring = disallowed.lower()

        VIOLATION_RULES.append({
            "forbidden": forbidden_substring,
            "mandated": mandated_alternative_str,
            "category": category,
            "reduction_factor": reduction_factor
        })

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
        for rule in CONFORMANCE_RULES:
            for disallowed in rule["disallowed_activities"]:
                if disallowed.lower() in activity_lower:
                    mandated = rule["mandated_alternative"]
                    category = rule["category"]
                    reduction_factor = rule["reduction_factors"].get(disallowed, 1.0)
                    
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
                    
                    # Format mandated alternative string byte-for-byte as today
                    if mandated == "Rail":
                        if "freight" in activity_lower:
                            mandated_alternative_str = "rail freight"
                        else:
                            mandated_alternative_str = "rail delivery"
                    else:
                        mandated_alternative_str = mandated.lower()
                    
                    violations.append({
                        "id": v_id,
                        "caseId": case_id,
                        "activity": activity,
                        "mandatedAlternative": mandated_alternative_str,
                        "category": category,
                        "severity": severity,
                        "carbonDeltaKg": round(delta, 2),
                        "estimated": True,
                        "timestamp": ts_str
                    })
                    break  # Matched one disallowed activity for this rule category, move to next rule
                    
    return violations


def get_rule_scope_summary() -> List[Dict[str, Any]]:
    summary = []
    for rule in CONFORMANCE_RULES:
        summary.append({
            "disallowed_activities": rule["disallowed_activities"],
            "mandated_alternative": rule["mandated_alternative"]
        })
    return summary


