import pandas as pd

def extract_dfg(df: pd.DataFrame, mapping: dict) -> tuple:
    case_col = mapping["case_id"]["column"]
    act_col = mapping["activity"]["column"]
    ts_col = mapping["timestamp"]["column"]

    # Extract and clean with safe, sanitized column names
    mining_df = df[[case_col, act_col, ts_col]].copy()
    mining_df.columns = ["case_id", "activity", "timestamp"]

    # Convert and sort
    mining_df["timestamp"] = pd.to_datetime(mining_df["timestamp"], errors="coerce", format="mixed")
    mining_df = mining_df.dropna(subset=["case_id", "activity", "timestamp"])
    mining_df = mining_df.sort_values(by=["case_id", "timestamp"]).reset_index(drop=True)

    # Establish node IDs in order of first appearance of each activity
    activities_order = []
    seen_activities = set()
    for act in mining_df["activity"]:
        if act not in seen_activities:
            seen_activities.add(act)
            activities_order.append(act)

    activity_to_id = {act: str(idx + 1) for idx, act in enumerate(activities_order)}

    # Activity frequencies
    activity_freq = mining_df["activity"].value_counts().to_dict()

    # --- Vectorized DFG transition computation using shift() ---
    # Shift activity and timestamp within each case group
    mining_df["next_activity"] = mining_df.groupby("case_id")["activity"].shift(-1)
    mining_df["next_timestamp"] = mining_df.groupby("case_id")["timestamp"].shift(-1)

    # Keep only rows that have a next event (i.e., not the last event in a case)
    pairs = mining_df.dropna(subset=["next_activity", "next_timestamp"]).copy()

    # Compute time diff in hours for each transition
    pairs["delay_hours"] = (
        pairs["next_timestamp"] - pairs["timestamp"]
    ).dt.total_seconds() / 3600.0

    # Map activity names to IDs
    pairs["src_id"] = pairs["activity"].map(activity_to_id)
    pairs["tgt_id"] = pairs["next_activity"].map(activity_to_id)

    # Aggregate transitions: frequency + mean delay
    edge_stats = (
        pairs.groupby(["src_id", "tgt_id"])["delay_hours"]
        .agg(["count", "mean"])
        .reset_index()
    )
    edge_stats.columns = ["src_id", "tgt_id", "freq", "avg_delay"]

    # Node average durations: mean time spent at a node before moving to the next
    node_duration_stats = (
        pairs.groupby("src_id")["delay_hours"]
        .mean()
        .reset_index()
    )
    node_duration_stats.columns = ["act_id", "avg_dur"]
    node_dur_map = dict(zip(node_duration_stats["act_id"], node_duration_stats["avg_dur"]))

    # Compile nodes list
    id_to_activity = {str(idx + 1): act for idx, act in enumerate(activities_order)}
    nodes = []
    for act_id, label in id_to_activity.items():
        freq = activity_freq.get(label, 0)
        avg_dur = node_dur_map.get(act_id, 0.0)
        avg_dur_str = f"{avg_dur:.1f}h"
        nodes.append({
            "id": act_id,
            "label": label,
            "frequency": int(freq),
            "avgDuration": avg_dur_str
        })

    # Compile edges list
    edges = []
    for _, row in edge_stats.iterrows():
        edges.append({
            "id": f"e{row['src_id']}-{row['tgt_id']}",
            "source": str(row["src_id"]),
            "target": str(row["tgt_id"]),
            "frequency": int(row["freq"]),
            "avgDelay": f"{row['avg_delay']:.1f}h"
        })

    return nodes, edges, len(activities_order), mining_df["case_id"].nunique(), len(mining_df)
