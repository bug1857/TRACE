import pandas as pd
from typing import List, Dict, Any
from carbon_budget import classify_activity
from conformance import VIOLATION_RULES

def get_qty(row: pd.Series) -> float:
    for col in ["weight", "quantity", "cargo_weight", "volume", "amount"]:
        if col in row and pd.notna(row[col]):
            try:
                return float(row[col])
            except ValueError:
                pass
    return 1.0

def calculate_cfs(events_df: pd.DataFrame, case_id_col: str, activity_col: str) -> List[Dict[str, Any]]:
    """
    Score each case on carbon efficiency (CFS), on a 0-100 scale.
    """
    if events_df.empty:
        return []

    # Fast check for quantities
    df = events_df[[case_id_col, activity_col]].copy()
    
    qty_series = pd.Series(1.0, index=df.index)
    for col in ["weight", "quantity", "cargo_weight", "volume", "amount"]:
        if col in events_df.columns:
            qty_series = pd.to_numeric(events_df[col], errors='coerce').fillna(qty_series)
            break
            
    df["_qty"] = qty_series

    # Pre-calculate factors and rules for all unique activities to avoid looping over 100k+ rows
    unique_activities = df[activity_col].astype(str).unique()
    
    factor_map = {}
    rf_map = {}
    
    for act in unique_activities:
        # Carbon factor
        _, factor, _ = classify_activity(act)
        factor_map[act] = factor
        
        # Violation reduction factor
        act_lower = act.lower()
        matched_rf = None
        for rule in VIOLATION_RULES:
            if rule["forbidden"].lower() in act_lower:
                matched_rf = rule["reduction_factor"]
                break
        rf_map[act] = matched_rf

    # Map the pre-calculated values to the entire dataframe in a vectorized way
    df["_factor"] = df[activity_col].astype(str).map(factor_map).fillna(0.0)
    df["_event_carbon"] = df["_factor"] * df["_qty"]
    
    # Map reduction factors
    df["_matched_rf"] = df[activity_col].astype(str).map(rf_map)
    
    # Violating events flag
    df["_is_violating"] = df["_matched_rf"].notna()
    
    # Calculate ideal carbon
    # If violating: event_carbon * (1.0 - matched_rf)
    # If not violating: event_carbon
    df["_ideal_carbon"] = df.apply(
        lambda x: x["_event_carbon"] * (1.0 - x["_matched_rf"]) if x["_is_violating"] else x["_event_carbon"], 
        axis=1
    )

    # Group by case and sum
    grouped = df.groupby(case_id_col).agg(
        actual_carbon=("_event_carbon", "sum"),
        ideal_carbon=("_ideal_carbon", "sum"),
        violation_count=("_is_violating", "sum")
    ).reset_index()

    results = []
    for _, row in grouped.iterrows():
        case_id = row[case_id_col]
        actual_carbon = float(row["actual_carbon"])
        ideal_carbon = float(row["ideal_carbon"])
        violation_count = int(row["violation_count"])
        
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
    
    # Vectorized carbon and violation check
    df = events_df[[case_id_col, activity_col, supplier_col]].copy()
    
    qty_series = pd.Series(1.0, index=df.index)
    for col in ["weight", "quantity", "cargo_weight", "volume", "amount"]:
        if col in events_df.columns:
            qty_series = pd.to_numeric(events_df[col], errors='coerce').fillna(qty_series)
            break
    df["_qty"] = qty_series
    
    unique_activities = df[activity_col].astype(str).unique()
    factor_map = {}
    violating_map = {}
    
    for act in unique_activities:
        _, factor, _ = classify_activity(act)
        factor_map[act] = factor
        
        act_lower = act.lower()
        is_violating = False
        for rule in VIOLATION_RULES:
            if rule["forbidden"].lower() in act_lower:
                is_violating = True
                break
        violating_map[act] = is_violating
        
    df["_carbon"] = df[activity_col].astype(str).map(factor_map).fillna(0.0) * df["_qty"]
    df["_violating"] = df[activity_col].astype(str).map(violating_map).fillna(False)
    
    # Group by supplier
    grouped = df.groupby(supplier_col)
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
            avg_cfs = sum(case_cfs.get(str(cid), 100.0) for cid in involved_cases) / case_count
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
