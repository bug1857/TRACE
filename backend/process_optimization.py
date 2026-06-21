import pandas as pd
from typing import Dict, Any, List
from carbon_budget import classify_activity

def compute_process_optimization(df: pd.DataFrame, activity_col: str, case_col: str, timestamp_col: str) -> dict:
    """
    Computes bottleneck and rework metrics from the parsed event log DataFrame.
    """
    if df.empty:
        return {
            "bottlenecks": [],
            "rework": [],
            "caseDurationDistribution": [],
            "totalCasesAnalyzed": 0
        }

    # Ensure timestamp column is parsed as datetime
    df_clean = df.copy()
    df_clean[timestamp_col] = pd.to_datetime(df_clean[timestamp_col], errors='coerce', format='mixed')
    df_clean = df_clean.dropna(subset=[case_col, activity_col, timestamp_col])
    
    # Sort chronologically by case and timestamp to ensure correct sequencing
    df_clean = df_clean.sort_values(by=[case_col, timestamp_col]).reset_index(drop=True)
    
    total_cases = df_clean[case_col].nunique()
    if total_cases == 0:
        return {
            "bottlenecks": [],
            "rework": [],
            "caseDurationDistribution": [],
            "totalCasesAnalyzed": 0
        }

    # 1. Bottlenecks (avgWaitHours, occurrences, status)
    activity_waits = {}
    for case_id, group in df_clean.groupby(case_col):
        sorted_events = group.sort_values(by=timestamp_col)
        events_list = list(sorted_events.itertuples(index=False))
        
        for i in range(1, len(events_list)):
            prev_event = events_list[i-1]
            curr_event = events_list[i]
            
            prev_ts = getattr(prev_event, timestamp_col)
            curr_ts = getattr(curr_event, timestamp_col)
            
            # Duration in hours between previous activity's timestamp and this activity's timestamp
            wait_hours = (curr_ts - prev_ts).total_seconds() / 3600.0
            act_name = getattr(curr_event, activity_col)
            
            if act_name not in activity_waits:
                activity_waits[act_name] = []
            activity_waits[act_name].append(wait_hours)

    bottlenecks = []
    for act_name, waits in activity_waits.items():
        avg_wait = sum(waits) / len(waits) if waits else 0.0
        occurrences = len(waits)
        
        # Threshold rules: critical (>20h), moderate (8-20h), optimized (<8h)
        if avg_wait > 20.0:
            status = "critical"
        elif avg_wait >= 8.0:
            status = "moderate"
        else:
            status = "optimized"
            
        bottlenecks.append({
            "activity": act_name,
            "avgWaitHours": round(avg_wait, 2),
            "occurrences": occurrences,
            "status": status
        })
    # Sort alphabetically by activity name for deterministic outputs
    bottlenecks = sorted(bottlenecks, key=lambda x: x["activity"])

    # 2. Rework (reworkCount, reworkPercentage, carbonImpactKg)
    activity_reworks = {}
    all_activities = df_clean[activity_col].unique()
    for act in all_activities:
        activity_reworks[act] = 0
        
    for case_id, group in df_clean.groupby(case_col):
        counts = group[activity_col].value_counts().to_dict()
        for act, cnt in counts.items():
            if cnt > 1:
                # Count repeats only: k - 1 rework instances
                activity_reworks[act] += (cnt - 1)

    rework = []
    for act, r_count in activity_reworks.items():
        r_pct = (r_count / total_cases * 100) if total_cases > 0 else 0.0
        
        # Retrieve carbon factor from carbon_budget.py
        cat, factor, est = classify_activity(act)
        if est:
            factor = 0.0
        carbon_impact = r_count * factor
        
        rework.append({
            "activity": act,
            "reworkCount": r_count,
            "reworkPercentage": round(r_pct, 2),
            "carbonImpactKg": round(carbon_impact, 2)
        })
    rework = sorted(rework, key=lambda x: x["activity"])

    # 3. Case Duration Distribution
    case_durations = []
    for case_id, group in df_clean.groupby(case_col):
        min_ts = group[timestamp_col].min()
        max_ts = group[timestamp_col].max()
        duration_hours = (max_ts - min_ts).total_seconds() / 3600.0
        case_durations.append(duration_hours)

    distribution_counts = {
        "0-4h": 0,
        "4-8h": 0,
        "8-12h": 0,
        "12-24h": 0,
        "24h+": 0
    }
    
    for dur in case_durations:
        if dur < 4.0:
            distribution_counts["0-4h"] += 1
        elif dur < 8.0:
            distribution_counts["4-8h"] += 1
        elif dur < 12.0:
            distribution_counts["8-12h"] += 1
        elif dur < 24.0:
            distribution_counts["12-24h"] += 1
        else:
            distribution_counts["24h+"] += 1
            
    case_duration_distribution = []
    for bucket, count in distribution_counts.items():
        percentage = (count / total_cases * 100) if total_cases > 0 else 0.0
        case_duration_distribution.append({
            "bucket": bucket,
            "count": count,
            "percentage": round(percentage, 2)
        })

    return {
        "bottlenecks": bottlenecks,
        "rework": rework,
        "caseDurationDistribution": case_duration_distribution,
        "totalCasesAnalyzed": total_cases
    }
