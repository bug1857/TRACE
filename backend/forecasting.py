import numpy as np

def benchmark_forecasts(carbon_budget: list, holdout_months: int = 3) -> dict:
    """
    Input: carbon_budget = [{"month": str, "actual": float, ...}, ...] sorted chronologically ascending.
    
    Returns a dictionary containing forecasting benchmarking results.
    """
    n = len(carbon_budget)
    min_required = holdout_months + 3
    
    if n < min_required:
        return {
            "dataAvailable": False,
            "insufficientDataNote": f"Only {n} months of history; need at least {min_required} to backtest reliably.",
            "trainMonths": max(0, n - holdout_months),
            "holdoutMonths": holdout_months,
            "baselines": [],
            "bestBaseline": None,
            "forecastNextMonth": None
        }
        
    train_data = carbon_budget[:-holdout_months]
    holdout_data = carbon_budget[-holdout_months:]
    
    train_actuals = [x["actual"] for x in train_data]
    holdout_actuals = [x["actual"] for x in holdout_data]
    
    # 1. Naive
    naive_preds = [train_actuals[-1]] * holdout_months
    
    # 2. MovingAverage3
    ma3_preds = [sum(train_actuals[-3:]) / 3.0] * holdout_months
    
    # 3. LinearTrend
    x_train = np.arange(len(train_actuals))
    y_train = np.array(train_actuals)
    slope, intercept = np.polyfit(x_train, y_train, 1)
    lineartrend_preds = [float(slope * (len(train_actuals) + j) + intercept) for j in range(holdout_months)]
    
    # 4. SeasonalNaive
    seasonal_preds = []
    has_valid_prediction = False
    for j in range(holdout_months):
        idx = (n - holdout_months + j) - 12
        if idx >= 0:
            seasonal_preds.append(carbon_budget[idx]["actual"])
            has_valid_prediction = True
        else:
            seasonal_preds.append(None)
            
    seasonal_applicable = has_valid_prediction
    if not seasonal_applicable:
        seasonal_preds = None
                
    def calc_metrics(actuals, preds):
        if preds is None:
            return None, None
        valid_pairs = [(a, p) for a, p in zip(actuals, preds) if p is not None]
        if not valid_pairs:
            return None, None
        mae = sum(abs(a - p) for a, p in valid_pairs) / len(valid_pairs)
        
        # MAPE check
        if any(a == 0 for a, p in valid_pairs):
            mape = None
        else:
            mape = (sum(abs((a - p) / a) for a, p in valid_pairs) / len(valid_pairs)) * 100
        return float(mae), float(mape) if mape is not None else None

    baselines_list = []
    
    # Naive
    naive_mae, naive_mape = calc_metrics(holdout_actuals, naive_preds)
    baselines_list.append({
        "name": "Naive",
        "applicable": True,
        "predictions": [float(p) for p in naive_preds],
        "mae": naive_mae,
        "mape": naive_mape
    })
    
    # MovingAverage3
    ma3_mae, ma3_mape = calc_metrics(holdout_actuals, ma3_preds)
    baselines_list.append({
        "name": "MovingAverage3",
        "applicable": True,
        "predictions": [float(p) for p in ma3_preds],
        "mae": ma3_mae,
        "mape": ma3_mape
    })
    
    # LinearTrend
    lt_mae, lt_mape = calc_metrics(holdout_actuals, lineartrend_preds)
    baselines_list.append({
        "name": "LinearTrend",
        "applicable": True,
        "predictions": [float(p) for p in lineartrend_preds],
        "mae": lt_mae,
        "mape": lt_mape
    })
    
    # SeasonalNaive
    s_mae, s_mape = None, None
    s_preds_formatted = None
    if seasonal_applicable:
        s_mae, s_mape = calc_metrics(holdout_actuals, seasonal_preds)
        s_preds_formatted = [float(p) if p is not None else None for p in seasonal_preds]
        
    baselines_list.append({
        "name": "SeasonalNaive",
        "applicable": seasonal_applicable,
        "predictions": s_preds_formatted,
        "mae": s_mae,
        "mape": s_mape
    })
    
    # Find best baseline based on lowest MAE among applicable ones
    best_baseline = None
    min_mae = float('inf')
    for b in baselines_list:
        if b["applicable"] and b["mae"] is not None:
            if b["mae"] < min_mae:
                min_mae = b["mae"]
                best_baseline = b["name"]
                
    # Refit best baseline on FULL data to forecast next month
    forecast_next = None
    if best_baseline is not None:
        full_actuals = [x["actual"] for x in carbon_budget]
        next_pred = None
        if best_baseline == "Naive":
            next_pred = full_actuals[-1]
        elif best_baseline == "MovingAverage3":
            next_pred = sum(full_actuals[-3:]) / 3.0
        elif best_baseline == "LinearTrend":
            x_full = np.arange(n)
            y_full = np.array(full_actuals)
            slope_full, intercept_full = np.polyfit(x_full, y_full, 1)
            next_pred = slope_full * n + intercept_full
        elif best_baseline == "SeasonalNaive":
            # next month has index n. 12 months before has index n - 12.
            # since seasonal is applicable, n >= 12, so n - 12 is valid.
            next_pred = carbon_budget[n - 12]["actual"]
            
        forecast_next = {
            "usingBaseline": best_baseline,
            "predictedActualKg": float(next_pred)
        }
        
    return {
        "dataAvailable": True,
        "insufficientDataNote": None,
        "trainMonths": n - holdout_months,
        "holdoutMonths": holdout_months,
        "baselines": baselines_list,
        "bestBaseline": best_baseline,
        "forecastNextMonth": forecast_next
    }
