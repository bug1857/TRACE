import pandas as pd
from typing import Dict, List, Any

EMISSION_CATEGORIES = {
    "air_freight":    {"keywords": ["air", "flight", "plane", "aviation"], "factor": 2.62},
    "road_transport": {"keywords": ["road", "truck", "van", "vehicle", "transport dispatch"], "factor": 0.85},
    "warehouse":      {"keywords": ["warehouse", "pick", "pack", "storage", "inventory"], "factor": 0.12},
    "customs":        {"keywords": ["customs", "clearance", "inspection", "yard"], "factor": 1.45},
    "last_mile":      {"keywords": ["last mile", "delivery", "doorstep", "final dispatch"], "factor": 0.38},
}

DEFAULT_FACTOR = 0.5
DEFAULT_MONTHLY_BUDGET_KG = 10000

def classify_activity(activity: str, custom_factors: dict = None) -> tuple[str, float, bool]:
    """
    Classify an activity name based on keyword matches.
    Returns: (category_name, factor, estimated)
    """
    if not activity or not isinstance(activity, str):
        return "uncategorized", DEFAULT_FACTOR, True
        
    activity_lower = activity.lower()
    best_cat = None
    best_factor = DEFAULT_FACTOR
    best_keyword_len = -1
    
    # Merge custom factors locally to avoid modifying the global dict
    categories = {}
    for cat_name, info in EMISSION_CATEGORIES.items():
        categories[cat_name] = info.copy()
        if custom_factors and cat_name in custom_factors:
            categories[cat_name].update(custom_factors[cat_name])
            
    for cat_name, info in categories.items():
        for kw in info["keywords"]:
            if kw in activity_lower:
                if len(kw) > best_keyword_len:
                    best_keyword_len = len(kw)
                    best_cat = cat_name
                    best_factor = info["factor"]
                    
    if best_cat is not None:
        return best_cat, best_factor, False
    else:
        return "uncategorized", DEFAULT_FACTOR, True

def calculate_carbon_budget(
    df: pd.DataFrame, 
    case_col: str, 
    activity_col: str, 
    ts_col: str, 
    custom_factors: dict = None
) -> Dict[str, Any]:
    """
    Calculate monthly carbon budget and activity breakdown from event log dataframe.
    """
    if df.empty:
        return {
            "carbonBudget": [],
            "totalCarbonKg": 0.0,
            "activityCarbonBreakdown": []
        }
        
    # Make a copy to avoid SettingWithCopyWarning
    df_clean = df.copy()
    
    # Parse timestamp
    df_clean["parsed_ts"] = pd.to_datetime(df_clean[ts_col], errors='coerce', format='mixed')
    df_clean = df_clean.dropna(subset=["parsed_ts"])
    
    if df_clean.empty:
        return {
            "carbonBudget": [],
            "totalCarbonKg": 0.0,
            "activityCarbonBreakdown": []
        }
        
    # Classify each event row
    unique_acts = df_clean[activity_col].unique()
    act_lookup = {
        act: classify_activity(str(act), custom_factors=custom_factors) 
        for act in unique_acts
    }
    
    df_clean[["category", "carbon", "estimated"]] = pd.DataFrame(
        df_clean[activity_col].map(
            lambda a: act_lookup[a]
        ).tolist(),
        columns=["category", "carbon", "estimated"],
        index=df_clean.index
    )
    
    # Total overall carbon
    total_carbon = float(df_clean["carbon"].sum())
    
    # Group by month chronologically
    df_clean["month_period"] = df_clean["parsed_ts"].dt.tz_localize(None).dt.to_period("M")
    monthly_grouped = df_clean.groupby("month_period")["carbon"].sum().reset_index()
    monthly_grouped = monthly_grouped.sort_values("month_period")
    
    carbon_budget_list = []
    for _, row in monthly_grouped.iterrows():
        period = row["month_period"]
        actual = float(row["carbon"])
        budget = float(DEFAULT_MONTHLY_BUDGET_KG)
        delta = actual - budget
        
        # Calculate status
        if delta <= 0:
            status = "pass"
        elif delta <= budget * 0.20:
            status = "warning"
        else:
            status = "critical"
            
        # Format month period as "Mon YYYY"
        month_str = period.to_timestamp().strftime("%b %Y")
        
        carbon_budget_list.append({
            "month": month_str,
            "budget": round(budget, 2),
            "actual": round(actual, 2),
            "delta": round(delta, 2),
            "status": status
        })
        
    # Activity carbon breakdown
    activity_breakdown_df = df_clean.groupby(activity_col).agg(
        category=(activity_col, lambda x: act_lookup[x.iloc[0]][0]),
        estimated=(activity_col, lambda x: bool(act_lookup[x.iloc[0]][2])),
        frequency=(activity_col, 'count'),
        totalCarbon=('carbon', 'sum')
    ).reset_index()
    
    activity_breakdown = activity_breakdown_df.rename(
        columns={activity_col: "activity"}
    ).to_dict(orient='records')
    
    activity_breakdown = sorted(
        activity_breakdown, key=lambda x: x["totalCarbon"], reverse=True
    )
    
    return {
        "carbonBudget": carbon_budget_list,
        "totalCarbonKg": round(total_carbon, 2),
        "activityCarbonBreakdown": activity_breakdown
    }
