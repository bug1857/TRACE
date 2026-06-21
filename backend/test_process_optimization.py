import sys
import pandas as pd
import json
from process_optimization import compute_process_optimization

# Setup path to import backend modules if needed, though they are in same dir
sys.path.append("backend")

def run_test():
    print("--- STARTING PROCESS OPTIMIZATION TEST ---")
    
    # 1. Create a synthetic event log DataFrame
    # 4 cases, 12 rows total
    # A = "Road Transport Dispatch" (matches "road" keyword -> factor 0.85)
    # B = "Warehouse Pick & Pack" (matches "warehouse" keyword -> factor 0.12)
    # C = "Customs Clearance" (matches "customs" keyword -> factor 1.45)
    data = [
        # Case 1 (Duration: 6 hours)
        {"case_id": "Case1", "activity": "Road Transport Dispatch", "timestamp": "2026-06-21 00:00:00"},
        {"case_id": "Case1", "activity": "Warehouse Pick & Pack", "timestamp": "2026-06-21 02:00:00"},   # wait 2.0h
        {"case_id": "Case1", "activity": "Customs Clearance", "timestamp": "2026-06-21 05:00:00"},       # wait 3.0h
        {"case_id": "Case1", "activity": "Road Transport Dispatch", "timestamp": "2026-06-21 06:00:00"},  # wait 1.0h, rework for A!
        
        # Case 2 (Duration: 34 hours)
        {"case_id": "Case2", "activity": "Road Transport Dispatch", "timestamp": "2026-06-21 00:00:00"},
        {"case_id": "Case2", "activity": "Warehouse Pick & Pack", "timestamp": "2026-06-21 10:00:00"},   # wait 10.0h
        {"case_id": "Case2", "activity": "Customs Clearance", "timestamp": "2026-06-22 10:00:00"},       # wait 24.0h
        
        # Case 3 (Duration: 6 hours)
        {"case_id": "Case3", "activity": "Road Transport Dispatch", "timestamp": "2026-06-21 00:00:00"},
        {"case_id": "Case3", "activity": "Customs Clearance", "timestamp": "2026-06-21 05:00:00"},       # wait 5.0h
        {"case_id": "Case3", "activity": "Warehouse Pick & Pack", "timestamp": "2026-06-21 06:00:00"},   # wait 1.0h
        
        # Case 4 (Duration: 1 hour)
        {"case_id": "Case4", "activity": "Road Transport Dispatch", "timestamp": "2026-06-21 00:00:00"},
        {"case_id": "Case4", "activity": "Road Transport Dispatch", "timestamp": "2026-06-21 01:00:00"}   # wait 1.0h, rework for A!
    ]
    df = pd.DataFrame(data)
    print("SYNTHETIC DATAFRAME:")
    print(df.to_string())
    print()

    # 2. Define expected outputs
    expected_total_cases = 4
    
    # Expected Bottlenecks (sorted alphabetically by activity)
    # A (Road Transport Dispatch): waits [1.0, 1.0]. avgWaitHours = 1.0, occurrences = 2, status = "optimized"
    # B (Warehouse Pick & Pack): waits [2.0, 10.0, 1.0]. avgWaitHours = (2+10+1)/3 = 4.33, occurrences = 3, status = "optimized"
    # C (Customs Clearance): waits [3.0, 24.0, 5.0]. avgWaitHours = (3+24+5)/3 = 10.67, occurrences = 3, status = "moderate"
    expected_bottlenecks = [
        {"activity": "Customs Clearance", "avgWaitHours": 10.67, "occurrences": 3, "status": "moderate"},
        {"activity": "Road Transport Dispatch", "avgWaitHours": 1.00, "occurrences": 2, "status": "optimized"},
        {"activity": "Warehouse Pick & Pack", "avgWaitHours": 4.33, "occurrences": 3, "status": "optimized"}
    ]

    # Expected Rework (sorted alphabetically by activity)
    # A (Road Transport Dispatch): Case1: 2 times (1 rework), Case4: 2 times (1 rework). reworkCount = 2. % = 2/4*100 = 50.0%. carbon = 2 * 0.85 = 1.70.
    # B (Warehouse Pick & Pack): reworkCount = 0. % = 0.0%. carbon = 0.00
    # C (Customs Clearance): reworkCount = 0. % = 0.0%. carbon = 0.00
    expected_rework = [
        {"activity": "Customs Clearance", "reworkCount": 0, "reworkPercentage": 0.00, "carbonImpactKg": 0.00},
        {"activity": "Road Transport Dispatch", "reworkCount": 2, "reworkPercentage": 50.00, "carbonImpactKg": 1.70},
        {"activity": "Warehouse Pick & Pack", "reworkCount": 0, "reworkPercentage": 0.00, "carbonImpactKg": 0.00}
    ]

    # Expected Case Duration Distribution
    # Case1: 6h (4-8h)
    # Case2: 34h (24h+)
    # Case3: 6h (4-8h)
    # Case4: 1h (0-4h)
    # 0-4h: 1 case (25.0%)
    # 4-8h: 2 cases (50.0%)
    # 8-12h: 0 cases (0.0%)
    # 12-24h: 0 cases (0.0%)
    # 24h+: 1 case (25.0%)
    expected_duration_distribution = [
        {"bucket": "0-4h", "count": 1, "percentage": 25.00},
        {"bucket": "4-8h", "count": 2, "percentage": 50.00},
        {"bucket": "8-12h", "count": 0, "percentage": 0.00},
        {"bucket": "12-24h", "count": 0, "percentage": 0.00},
        {"bucket": "24h+", "count": 1, "percentage": 25.00}
    ]

    # 3. Call compute function
    actual = compute_process_optimization(
        df=df,
        activity_col="activity",
        case_col="case_id",
        timestamp_col="timestamp"
    )

    # 4. Print results
    print("\nACTUAL METRICS:")
    print(json.dumps(actual, indent=2))
    
    print("\nEXPECTED METRICS:")
    expected = {
        "bottlenecks": expected_bottlenecks,
        "rework": expected_rework,
        "caseDurationDistribution": expected_duration_distribution,
        "totalCasesAnalyzed": expected_total_cases
    }
    print(json.dumps(expected, indent=2))

    # 5. Assertions
    print("\nRunning validations...")
    assert actual["totalCasesAnalyzed"] == expected_total_cases, f"Expected {expected_total_cases} cases analyzed, got {actual['totalCasesAnalyzed']}"
    print("✓ totalCasesAnalyzed matched.")

    # Validate bottlenecks
    assert len(actual["bottlenecks"]) == len(expected_bottlenecks), "Bottlenecks count mismatch."
    for act, exp in zip(actual["bottlenecks"], expected_bottlenecks):
        assert act["activity"] == exp["activity"], f"Activity mismatch: {act['activity']} vs {exp['activity']}"
        assert abs(act["avgWaitHours"] - exp["avgWaitHours"]) < 0.05, f"Avg wait mismatch for {act['activity']}: {act['avgWaitHours']} vs {exp['avgWaitHours']}"
        assert act["occurrences"] == exp["occurrences"], f"Occurrences mismatch for {act['activity']}: {act['occurrences']} vs {exp['occurrences']}"
        assert act["status"] == exp["status"], f"Status mismatch for {act['activity']}: {act['status']} vs {exp['status']}"
    print("✓ Bottlenecks matched successfully.")

    # Validate rework
    assert len(actual["rework"]) == len(expected_rework), "Rework count mismatch."
    for act, exp in zip(actual["rework"], expected_rework):
        assert act["activity"] == exp["activity"], f"Activity mismatch: {act['activity']} vs {exp['activity']}"
        assert act["reworkCount"] == exp["reworkCount"], f"Rework count mismatch for {act['activity']}: {act['reworkCount']} vs {exp['reworkCount']}"
        assert abs(act["reworkPercentage"] - exp["reworkPercentage"]) < 0.05, f"Rework percentage mismatch for {act['activity']}: {act['reworkPercentage']} vs {exp['reworkPercentage']}"
        assert abs(act["carbonImpactKg"] - exp["carbonImpactKg"]) < 0.05, f"Carbon impact mismatch for {act['activity']}: {act['carbonImpactKg']} vs {exp['carbonImpactKg']}"
    print("✓ Rework matched successfully.")

    # Validate duration distribution
    assert len(actual["caseDurationDistribution"]) == len(expected_duration_distribution), "Duration distribution count mismatch."
    for act, exp in zip(actual["caseDurationDistribution"], expected_duration_distribution):
        assert act["bucket"] == exp["bucket"], f"Bucket mismatch: {act['bucket']} vs {exp['bucket']}"
        assert act["count"] == exp["count"], f"Count mismatch for {act['bucket']}: {act['count']} vs {exp['count']}"
        assert abs(act["percentage"] - exp["percentage"]) < 0.05, f"Percentage mismatch for {act['bucket']}: {act['percentage']} vs {exp['percentage']}"
    print("✓ Case duration distribution matched successfully.")

    print("\n=============================================")
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("=============================================")

if __name__ == "__main__":
    run_test()
