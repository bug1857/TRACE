import pandas as pd

def extract_dfg(df: pd.DataFrame, mapping: dict) -> tuple:
    case_col = mapping["case_id"]["column"]
    act_col = mapping["activity"]["column"]
    ts_col = mapping["timestamp"]["column"]
    
    # Extract and clean
    mining_df = df[[case_col, act_col, ts_col]].copy()
    mining_df.columns = ["case_id", "activity", "timestamp"]
    
    # Convert and sort
    mining_df["timestamp"] = pd.to_datetime(mining_df["timestamp"], errors="coerce", format="mixed")
    mining_df = mining_df.dropna(subset=["case_id", "activity", "timestamp"])
    mining_df = mining_df.sort_values(by=["case_id", "timestamp"]).reset_index(drop=True)
    
    # Establish node IDs in order of first appearance of each activity task
    activities_order = []
    seen_activities = set()
    for act in mining_df["activity"]:
        if act not in seen_activities:
            seen_activities.add(act)
            activities_order.append(act)
            
    activity_to_id = {act: str(idx + 1) for idx, act in enumerate(activities_order)}
    id_to_activity = {str(idx + 1): act for idx, act in enumerate(activities_order)}
    
    # Activity frequencies
    activity_freq = mining_df["activity"].value_counts().to_dict()
    
    # Transitions data structures
    transitions = {}
    node_durations = {act_id: [] for act_id in id_to_activity}
    
    # Group by cases to calculate delays and durations
    for case_id, group in mining_df.groupby("case_id"):
        events = list(group.sort_values("timestamp").itertuples(index=False))
        for i in range(len(events) - 1):
            curr_event = events[i]
            next_event = events[i+1]
            
            curr_id = activity_to_id[curr_event.activity]
            next_id = activity_to_id[next_event.activity]
            
            # Difference in hours
            time_diff = (next_event.timestamp - curr_event.timestamp).total_seconds() / 3600.0
            
            # Transition edge data
            trans_key = (curr_id, next_id)
            if trans_key not in transitions:
                transitions[trans_key] = []
            transitions[trans_key].append(time_diff)
            
            # Duration spent at curr_id node before moving to next
            node_durations[curr_id].append(time_diff)
            
    # Compile nodes list
    nodes = []
    for act_id, label in id_to_activity.items():
        freq = activity_freq.get(label, 0)
        durations = node_durations[act_id]
        if durations:
            avg_dur = sum(durations) / len(durations)
            avg_dur_str = f"{avg_dur:.1f}h"
        else:
            avg_dur_str = "0.0h"
            
        nodes.append({
            "id": act_id,
            "label": label,
            "frequency": freq,
            "avgDuration": avg_dur_str
        })
        
    # Compile edges list
    edges = []
    for (src_id, tgt_id), delays in transitions.items():
        freq = len(delays)
        avg_delay = sum(delays) / freq if freq > 0 else 0.0
        
        edges.append({
            "id": f"e{src_id}-{tgt_id}",
            "source": src_id,
            "target": tgt_id,
            "frequency": freq,
            "avgDelay": f"{avg_delay:.1f}h"
        })
        
    return nodes, edges, len(activities_order), mining_df["case_id"].nunique(), len(mining_df)
