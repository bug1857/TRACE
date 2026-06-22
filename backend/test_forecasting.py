import sys
import json
from forecasting import benchmark_forecasts

def run_tests():
    print("=== STARTING FORECASTING TESTS ===")

    # -------------------------------------------------------------
    # Case 1: 8 months of data, perfectly linear (y = 2x + 10)
    # -------------------------------------------------------------
    print("\n--- CASE 1: 8 Months of Data (Linear Trend) ---")
    case1_data = [
        {"month": f"2026-{i:02d}", "actual": float(2 * i + 10)}
        for i in range(8)
    ]
    print("Synthetic Input Data:")
    print(json.dumps(case1_data, indent=2))
    
    result1 = benchmark_forecasts(case1_data, holdout_months=3)
    print("\nResult Dictionary:")
    print(json.dumps(result1, indent=2))
    
    # Hand-calculated expected values:
    # Training: indices 0..4 (10, 12, 14, 16, 18).
    # Holdout: indices 5..7 (20, 22, 24).
    # 1. Naive: preds = [18, 18, 18], errors = [2, 4, 6], MAE = 4.0, MAPE = (2/20 + 4/22 + 6/24) / 3 * 100 = 17.7272727...
    # 2. MovingAverage3: preds = [16, 16, 16], errors = [4, 6, 8], MAE = 6.0, MAPE = (4/20 + 6/22 + 8/24) / 3 * 100 = 26.868686...
    # 3. LinearTrend: fit on 0..4 is exactly slope=2, intercept=10.
    #    preds = [20, 22, 24], errors = [0, 0, 0], MAE = 0.0, MAPE = 0.0
    # 4. SeasonalNaive: applicable = False (N = 8 < 12)
    # Best baseline = LinearTrend. Refit on 0..7 is slope=2, intercept=10. Next month (index 8) prediction = 26.0
    
    print("\nVerifying Case 1 Assertions:")
    assert result1["dataAvailable"] == True, "Expected dataAvailable to be True"
    assert result1["trainMonths"] == 5, "Expected 5 training months"
    assert result1["holdoutMonths"] == 3, "Expected 3 holdout months"
    
    baselines = {b["name"]: b for b in result1["baselines"]}
    
    # Check Naive
    assert baselines["Naive"]["applicable"] == True
    assert baselines["Naive"]["predictions"] == [18.0, 18.0, 18.0]
    assert abs(baselines["Naive"]["mae"] - 4.0) < 1e-6
    assert abs(baselines["Naive"]["mape"] - 17.727272727) < 1e-4
    print("  [PASS] Naive baseline predictions and metrics match hand-calculated values.")
    
    # Check MovingAverage3
    assert baselines["MovingAverage3"]["applicable"] == True
    assert baselines["MovingAverage3"]["predictions"] == [16.0, 16.0, 16.0]
    assert abs(baselines["MovingAverage3"]["mae"] - 6.0) < 1e-6
    assert abs(baselines["MovingAverage3"]["mape"] - 26.868686868) < 1e-4
    print("  [PASS] MovingAverage3 baseline predictions and metrics match hand-calculated values.")
    
    # Check LinearTrend
    assert baselines["LinearTrend"]["applicable"] == True
    assert len(baselines["LinearTrend"]["predictions"]) == 3
    assert all(abs(p - expected) < 1e-9 for p, expected in zip(baselines["LinearTrend"]["predictions"], [20.0, 22.0, 24.0]))
    assert abs(baselines["LinearTrend"]["mae"] - 0.0) < 1e-6
    assert abs(baselines["LinearTrend"]["mape"] - 0.0) < 1e-6
    print("  [PASS] LinearTrend baseline predictions and metrics match hand-calculated values.")
    
    # Check SeasonalNaive
    assert baselines["SeasonalNaive"]["applicable"] == False
    assert baselines["SeasonalNaive"]["predictions"] is None
    assert baselines["SeasonalNaive"]["mae"] is None
    assert baselines["SeasonalNaive"]["mape"] is None
    print("  [PASS] SeasonalNaive is correctly marked as not applicable.")
    
    # Check bestBaseline and next month forecast
    assert result1["bestBaseline"] == "LinearTrend"
    assert result1["forecastNextMonth"]["usingBaseline"] == "LinearTrend"
    assert abs(result1["forecastNextMonth"]["predictedActualKg"] - 26.0) < 1e-6
    print("  [PASS] Best baseline is LinearTrend and next month forecast is 26.0.")

    # -------------------------------------------------------------
    # Case 2: 4 months of data (insufficient history)
    # -------------------------------------------------------------
    print("\n--- CASE 2: 4 Months of Data (Insufficient) ---")
    case2_data = [
        {"month": f"2026-{i:02d}", "actual": float(10 + i)}
        for i in range(4)
    ]
    print("Synthetic Input Data:")
    print(json.dumps(case2_data, indent=2))
    
    result2 = benchmark_forecasts(case2_data, holdout_months=3)
    print("\nResult Dictionary:")
    print(json.dumps(result2, indent=2))
    
    print("\nVerifying Case 2 Assertions:")
    assert result2["dataAvailable"] == False, "Expected dataAvailable to be False"
    assert isinstance(result2["insufficientDataNote"], str)
    assert len(result2["insufficientDataNote"]) > 0
    assert "Only 4 months of history; need at least 6" in result2["insufficientDataNote"]
    assert result2["baselines"] == []
    assert result2["bestBaseline"] is None
    assert result2["forecastNextMonth"] is None
    print("  [PASS] Insufficient data correctly detected and returned.")

    # -------------------------------------------------------------
    # Case 3: 14 months of data (SeasonalNaive applicable = True)
    # -------------------------------------------------------------
    print("\n--- CASE 3: 14 Months of Data (SeasonalNaive Applicable) ---")
    case3_data = [
        {"month": f"2026-{i:02d}" if i < 12 else f"2027-{i-12:02d}", "actual": float(i + 10)}
        for i in range(14)
    ]
    print("Synthetic Input Data:")
    print(json.dumps(case3_data, indent=2))
    
    result3 = benchmark_forecasts(case3_data, holdout_months=3)
    print("\nResult Dictionary:")
    print(json.dumps(result3, indent=2))
    
    # Hand-calculation for SeasonalNaive:
    # N = 14. holdout_months = 3.
    # Holdout indices: 11, 12, 13.
    # Seasonal predictions:
    # - index 11: 11 - 12 = -1 (out of range, prediction is None)
    # - index 12: 12 - 12 = 0. actual[0] = 10.0
    # - index 13: 13 - 12 = 1. actual[1] = 11.0
    # Expected predictions: [None, 10.0, 11.0]
    # Errors on valid predictions:
    # - index 12: actual is 22.0. error = abs(22.0 - 10.0) = 12.0
    # - index 13: actual is 23.0. error = abs(23.0 - 11.0) = 12.0
    # MAE = (12.0 + 12.0) / 2 = 12.0.
    # MAPE = ((12.0/22.0) + (12.0/23.0)) / 2 * 100 = (0.5454545 + 0.5217391) / 2 * 100 = 53.35968379%
    
    print("\nVerifying Case 3 Assertions:")
    assert result3["dataAvailable"] == True
    baselines3 = {b["name"]: b for b in result3["baselines"]}
    
    assert baselines3["SeasonalNaive"]["applicable"] == True
    assert baselines3["SeasonalNaive"]["predictions"][0] is None
    assert abs(baselines3["SeasonalNaive"]["predictions"][1] - 10.0) < 1e-9
    assert abs(baselines3["SeasonalNaive"]["predictions"][2] - 11.0) < 1e-9
    assert abs(baselines3["SeasonalNaive"]["mae"] - 12.0) < 1e-6
    assert abs(baselines3["SeasonalNaive"]["mape"] - 53.35968379) < 1e-4
    print("  [PASS] SeasonalNaive predictions, MAE, and MAPE match hand-calculated values.")

    # -------------------------------------------------------------
    # Case 4: exactly 12 months of data (SeasonalNaive applicable = False)
    # -------------------------------------------------------------
    print("\n--- CASE 4: 12 Months of Data (SeasonalNaive Not Applicable Boundary) ---")
    case4_data = [
        {"month": f"2026-{i:02d}", "actual": float(i + 10)}
        for i in range(12)
    ]
    print("Synthetic Input Data:")
    print(json.dumps(case4_data, indent=2))
    
    result4 = benchmark_forecasts(case4_data, holdout_months=3)
    print("\nResult Dictionary:")
    print(json.dumps(result4, indent=2))
    
    print("\nVerifying Case 4 Assertions:")
    assert result4["dataAvailable"] == True
    baselines4 = {b["name"]: b for b in result4["baselines"]}
    
    assert baselines4["SeasonalNaive"]["applicable"] == False
    assert baselines4["SeasonalNaive"]["predictions"] is None
    assert baselines4["SeasonalNaive"]["mae"] is None
    assert baselines4["SeasonalNaive"]["mape"] is None
    print("  [PASS] SeasonalNaive is correctly marked as not applicable with 12 months of data.")
    
    print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
