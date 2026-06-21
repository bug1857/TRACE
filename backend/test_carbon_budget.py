import pandas as pd
import json
from carbon_budget import calculate_carbon_budget

def run_test():
    # Load test_common.csv
    df = pd.read_csv("backend/test_common.csv")
    
    # Calculate carbon budget
    result = calculate_carbon_budget(
        df,
        case_col="case_id",
        activity_col="activity",
        ts_col="timestamp"
    )
    
    # Print the full output dict
    print("\n--- STANDALONE CARBON BUDGET TEST OUTPUT ---")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    run_test()
