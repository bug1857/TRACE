import pandas as pd
from typing import List, Dict, Any
from carbon_budget import classify_activity
from conformance import VIOLATION_RULES

def calculate_cfs(events_df: pd.DataFrame, case_id_col: str, activity_col: str) -> List[Dict[str, Any]]:
    """
    Score each case on carbon efficiency (CFS), on a 0-100 scale.
    """
    if events_df.empty:
        return []
        
    results = []
    
    # Group events by case
    grouped = events_df.groupby(case_id_col)
    
    for case_id, group in grouped:
        actual_carbon = 0.0
        ideal_carbon = 0.0
        violation_count = 0
        
        for _, row in group.iterrows():
            activity = str(row[activity_col])
            activity_lower = activity.lower()
            
            # Compute actual carbon
            _, factor, _ = classify_activity(activity)
            qty = 1.0
            for col in ["weight", "quantity", "cargo_weight", "volume", "amount"]:
                if col in row and pd.notna(row[col]):
                    try:
                        qty = float(row[col])
                    except ValueError:
                        pass
                    break
            event_carbon = factor * qty
            actual_carbon += event_carbon
            
            # Check if this event is violating
            matched_rf = None
            for rule in VIOLATION_RULES:
                forbidden = rule["forbidden"].lower()
                if forbidden in activity_lower:
                    matched_rf = rule["reduction_factor"]
                    break  # Take first matching rule (only one per forbidden activity exists)
            
            if matched_rf is not None:
                # Violating activity
                violation_count += 1
                event_ideal_carbon = event_carbon * (1.0 - matched_rf)
                ideal_carbon += event_ideal_carbon
            else:
                # Non-violating activity
                ideal_carbon += event_carbon
                
        # Calculate CFS score
        if actual_carbon == 0.0:
            cfs_score = 100.0
        else:
            cfs_score = 100.0 * (ideal_carbon / actual_carbon)
            
        cfs_score = min(100.0, max(0.0, cfs_score))
        
        results.append({
            "caseId": str(case_id),
            "actualCarbonKg": round(actual_carbon, 2),
            "idealCarbonKg": round(ideal_carbon, 2),
            "cfsScore": round(cfs_score, 2),
            "violationCount": violation_count
        })
        
    return results

def calculate_supplier_fitness(
    events_df: pd.DataFrame, 
    case_id_col: str, 
    activity_col: str, 
    supplier_col: str, 
    is_resource_fallback: bool
) -> List[Dict[str, Any]]:
    """
    Aggregate carbon efficiency and violation metrics per supplier.
    """
    if events_df.empty or supplier_col not in events_df.columns:
        return []
        
    # Get case CFS scores first
    cfs_results = calculate_cfs(events_df, case_id_col, activity_col)
    case_cfs = {r["caseId"]: r["cfsScore"] for r in cfs_results}
    
    # Calculate carbon and check violations for each event
    df_events = events_df.copy()
    
    factors = []
    violation_flags = []
    
    for _, row in df_events.iterrows():
        activity = str(row[activity_col])
        activity_lower = activity.lower()
        
        # Carbon factor
        _, factor, _ = classify_activity(activity)
        qty = 1.0
        for col in ["weight", "quantity", "cargo_weight", "volume", "amount"]:
            if col in row and pd.notna(row[col]):
                try:
                    qty = float(row[col])
                except ValueError:
                    pass
                break
        factors.append(factor * qty)
        
        # Violation check
        is_violating = False
        for rule in VIOLATION_RULES:
            forbidden = rule["forbidden"].lower()
            if forbidden in activity_lower:
                is_violating = True
                break
        violation_flags.append(is_violating)
        
    df_events["_carbon"] = factors
    df_events["_violating"] = violation_flags
    
    # Group events by supplier
    grouped = df_events.groupby(supplier_col)
    supplier_fitness_list = []
    
    for supplier_val, group in grouped:
        supplier_name = str(supplier_val)
        if pd.isna(supplier_val) or supplier_name == "nan" or supplier_name == "":
            continue
            
        total_carbon = float(group["_carbon"].sum())
        violation_count = int(group["_violating"].sum())
        
        # Cases involved
        involved_cases = group[case_id_col].dropna().unique()
        case_count = len(involved_cases)
        
        if case_count > 0:
            avg_cfs = sum(case_cfs[str(cid)] for cid in involved_cases if str(cid) in case_cfs) / case_count
        else:
            avg_cfs = 100.0
            
        supplier_fitness_list.append({
            "supplier": supplier_name,
            "totalCarbonKg": round(total_carbon, 2),
            "violationCount": violation_count,
            "avgCfsScore": round(avg_cfs, 2),
            "caseCount": case_count,
            "isResourceFallback": is_resource_fallback
        })
        
    # Sort descending by avgCfsScore (best performers first)
    supplier_fitness_list = sorted(supplier_fitness_list, key=lambda x: x["avgCfsScore"], reverse=True)
    return supplier_fitness_list
