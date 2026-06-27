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

    # Work on a minimal copy with safe, sanitized column names to avoid AttributeError
    # when column names contain spaces or special chars (pandas itertuples sanitizes them).
    df_clean = df[[case_col, activity_col, timestamp_col]].copy()
    df_clean.columns = ["_case", "_act", "_ts"]
    df_clean["_ts"] = pd.to_datetime(df_clean["_ts"], errors='coerce', format='mixed')
    df_clean = df_clean.dropna(subset=["_case", "_act", "_ts"])

    # Sort chronologically by case and timestamp to ensure correct sequencing
    df_clean = df_clean.sort_values(by=["_case", "_ts"]).reset_index(drop=True)

    total_cases = df_clean["_case"].nunique()
    if total_cases == 0:
        return {
            "bottlenecks": [],
            "rework": [],
            "caseDurationDistribution": [],
            "totalCasesAnalyzed": 0
        }

    # 1. Bottlenecks (avgWaitHours, occurrences, status)
    # Vectorized: use shift() within each case group to compute inter-event wait times
    df_clean["_prev_ts"] = df_clean.groupby("_case")["_ts"].shift(1)
    df_clean["_prev_case"] = df_clean.groupby("_case")["_case"].shift(1)
    # Only keep rows where there is a previous event in the same case
    transitions = df_clean.dropna(subset=["_prev_ts"])
    transitions = transitions[transitions["_case"] == transitions["_prev_case"]].copy()
    transitions["_wait_hours"] = (
        transitions["_ts"] - transitions["_prev_ts"]
    ).dt.total_seconds() / 3600.0

    bottleneck_stats = (
        transitions.groupby("_act")["_wait_hours"]
        .agg(["mean", "count"])
        .reset_index()
    )
    bottleneck_stats.columns = ["activity", "avg_wait", "occurrences"]

    bottlenecks = []
    for _, row in bottleneck_stats.iterrows():
        avg_wait = float(row["avg_wait"])
        occurrences = int(row["occurrences"])
        if avg_wait > 20.0:
            status = "critical"
        elif avg_wait >= 8.0:
            status = "moderate"
        else:
            status = "optimized"
        bottlenecks.append({
            "activity": str(row["activity"]),
            "avgWaitHours": round(avg_wait, 2),
            "occurrences": occurrences,
            "status": status
        })
    bottlenecks = sorted(bottlenecks, key=lambda x: x["activity"])

    # 2. Rework (reworkCount, reworkPercentage, carbonImpactKg)
    all_activities = df_clean["_act"].unique()
    activity_reworks = {act: 0 for act in all_activities}

    for case_id, group in df_clean.groupby("_case"):
        counts = group["_act"].value_counts().to_dict()
        for act, cnt in counts.items():
            if cnt > 1:
                activity_reworks[act] += (cnt - 1)

    rework = []
    for act, r_count in activity_reworks.items():
        r_pct = (r_count / total_cases * 100) if total_cases > 0 else 0.0
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
    case_durations_df = df_clean.groupby("_case")["_ts"].agg(["min", "max"])
    case_durations_df["duration_hours"] = (
        case_durations_df["max"] - case_durations_df["min"]
    ).dt.total_seconds() / 3600.0
    case_durations = case_durations_df["duration_hours"].tolist()

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
