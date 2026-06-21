import pandas as pd
import json
from carbon_budget import calculate_carbon_budget

def run_test():
    # 1. Load test_common.csv
    df = pd.read_csv("backend/test_common.csv")
    
    # 2. Run with custom_factors=None (default behavior)
    default_result = calculate_carbon_budget(
        df,
        case_col="case_id",
        activity_col="activity",
        ts_col="timestamp",
        custom_factors=None
    )
    
    # Expected defaults:
    # - "Order Received" -> uncategorized, factor 0.5 (occurs twice -> 1.0)
    # - "Warehouse Pick & Pack" -> warehouse, factor 0.12 (occurs twice -> 0.24)
    # - "Road Transport Dispatch" -> road_transport, factor 0.85 (occurs twice -> 1.70)
    # Total = 2.94
    print("\n--- DEFAULT RUN (custom_factors=None) ---")
    print(f"Total Carbon: {default_result['totalCarbonKg']} kg")
    print("Breakdown:")
    for item in default_result['activityCarbonBreakdown']:
        print(f"  - {item['activity']}: {item['totalCarbon']} kg (category: {item['category']})")
    
    assert default_result['totalCarbonKg'] == 2.94
    
    # 3. Run with custom overrides (doubling road_transport's factor to 1.70)
    custom_overrides = {
        "road_transport": {"factor": 1.70}
    }
    overridden_result = calculate_carbon_budget(
        df,
        case_col="case_id",
        activity_col="activity",
        ts_col="timestamp",
        custom_factors=custom_overrides
    )
    
    # Expected overridden:
    # - "Order Received" -> uncategorized, factor 0.5 (occurs twice -> 1.0)
    # - "Warehouse Pick & Pack" -> warehouse, factor 0.12 (occurs twice -> 0.24)
    # - "Road Transport Dispatch" -> road_transport, factor 1.70 (occurs twice -> 3.40)
    # Total = 4.64
    print("\n--- OVERRIDDEN RUN (road_transport factor = 1.70) ---")
    print(f"Total Carbon: {overridden_result['totalCarbonKg']} kg")
    print("Breakdown:")
    for item in overridden_result['activityCarbonBreakdown']:
        print(f"  - {item['activity']}: {item['totalCarbon']} kg (category: {item['category']})")
        
    assert overridden_result['totalCarbonKg'] == 4.64
    
    # 4. Verify specific breakdown items
    default_breakdown = {item['activity']: item for item in default_result['activityCarbonBreakdown']}
    overridden_breakdown = {item['activity']: item for item in overridden_result['activityCarbonBreakdown']}
    
    # "Road Transport Dispatch" should change from 1.70 to 3.40
    assert default_breakdown['Road Transport Dispatch']['totalCarbon'] == 1.70
    assert overridden_breakdown['Road Transport Dispatch']['totalCarbon'] == 3.40
    
    # "Warehouse Pick & Pack" should remain 0.24
    assert default_breakdown['Warehouse Pick & Pack']['totalCarbon'] == 0.24
    assert overridden_breakdown['Warehouse Pick & Pack']['totalCarbon'] == 0.24
    
    # "Order Received" should remain 1.00
    assert default_breakdown['Order Received']['totalCarbon'] == 1.00
    assert overridden_breakdown['Order Received']['totalCarbon'] == 1.00
    
    print("\n[SUCCESS] Regression proof assert passed: custom_factors=None matches baseline.")
    print("[SUCCESS] Math correctness assert passed: only the overridden category changed.")

if __name__ == "__main__":
    run_test()
