"""
TRACE Forecasting Benchmark — Orchestrator
=============================================
Runs the full rolling-origin cross-validation benchmark for every model
(ARIMA, ETS, Prophet, XGBoost, TFT) across every series in the processed
weekly demand dataset, and writes a results table with RMSE / MAPE / sMAPE
per (model, series, fold), plus an aggregated summary.

Usage:
    python -m src.benchmark --horizon 4 --folds 5 --step 4 [--skip-prophet] [--skip-tft]
"""

from __future__ import annotations
import argparse
import os
import time
import warnings

import numpy as np
import pandas as pd

from .data_prep import load_or_build
from .evaluation import rolling_origin_splits, evaluate_fold
from .models.arima_model import ARIMAModel
from .models.ets_model import ETSModel
from .models.xgboost_model import XGBoostModel
from .models.tft_model import TFTGlobalModel

warnings.filterwarnings("ignore")

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "reports", "results")
CALENDAR_COLS = ["week_start", "week_of_year", "month", "quarter", "is_holiday_season"]


def run_per_series_models(weekly: pd.DataFrame, horizon: int, n_folds: int, step: int,
                           min_train_size: int, run_prophet: bool) -> pd.DataFrame:
    """ARIMA, ETS, (Prophet), XGBoost are fit independently per series per fold."""
    rows = []
    series_ids = sorted(weekly["series_id"].unique())

    model_classes = {"ARIMA": ARIMAModel, "ETS": ETSModel, "XGBoost": XGBoostModel}
    if run_prophet:
        from .models.prophet_model import ProphetModel
        model_classes["Prophet"] = ProphetModel

    for s in series_ids:
        s_df = weekly[weekly["series_id"] == s].sort_values("week_start").reset_index(drop=True)
        try:
            folds = rolling_origin_splits(s_df, horizon=horizon, n_folds=n_folds, step=step,
                                           min_train_size=min_train_size)
        except ValueError as e:
            print(f"  [skip] {s}: {e}")
            continue

        for fold in folds:
            future_calendar = fold.test[CALENDAR_COLS].reset_index(drop=True)
            y_true = fold.test["y"].values

            for model_name, ModelCls in model_classes.items():
                t0 = time.time()
                try:
                    model = ModelCls()
                    y_pred = model.fit_predict(fold.train, horizon, future_calendar)
                    metrics = evaluate_fold(y_true, y_pred)
                    status = "ok"
                except Exception as e:
                    metrics = {"rmse": np.nan, "mape": np.nan, "smape": np.nan}
                    status = f"error: {e}"
                elapsed = time.time() - t0

                rows.append({
                    "model": model_name, "series_id": s, "fold_id": fold.fold_id,
                    "origin": fold.origin, "horizon": horizon,
                    "rmse": metrics["rmse"], "mape": metrics["mape"], "smape": metrics["smape"],
                    "train_size": len(fold.train), "runtime_sec": round(elapsed, 3), "status": status,
                })
                print(f"  {s:22s} fold {fold.fold_id} {model_name:8s} "
                      f"RMSE={metrics['rmse']:.2f} MAPE={metrics['mape']:.1f}% ({elapsed:.2f}s) [{status}]")

    return pd.DataFrame(rows)


def run_tft_global(weekly: pd.DataFrame, horizon: int, n_folds: int, step: int,
                    min_train_size: int, epochs: int) -> pd.DataFrame:
    """TFT is trained globally across all series, once per fold."""
    rows = []
    series_ids = sorted(weekly["series_id"].unique())

    # build per-series frames once, then derive per-fold slices from a shared origin schedule
    per_series_df = {s: weekly[weekly["series_id"] == s].sort_values("week_start").reset_index(drop=True)
                      for s in series_ids}

    # use the shortest series to define valid fold origins so every series has data at every fold
    shortest = min(per_series_df.values(), key=len)
    folds_template = rolling_origin_splits(shortest, horizon=horizon, n_folds=n_folds, step=step,
                                            min_train_size=min_train_size)

    for fold in folds_template:
        origin_date = fold.origin
        train_by_series, future_by_series, y_true_by_series = {}, {}, {}
        for s in series_ids:
            df = per_series_df[s]
            train_by_series[s] = df[df["week_start"] < origin_date].reset_index(drop=True)
            test_slice = df[df["week_start"] >= origin_date].head(horizon).reset_index(drop=True)
            future_by_series[s] = test_slice[CALENDAR_COLS]
            y_true_by_series[s] = test_slice["y"].values

        t0 = time.time()
        try:
            tft = TFTGlobalModel(horizon=horizon, epochs=epochs)
            preds = tft.fit_predict_global(train_by_series, future_by_series)
            status = "ok"
        except Exception as e:
            preds = {s: np.full(horizon, np.nan) for s in series_ids}
            status = f"error: {e}"
        elapsed = time.time() - t0

        for s in series_ids:
            y_true = y_true_by_series[s]
            y_pred = preds.get(s, np.full(horizon, np.nan))
            if len(y_true) < horizon:
                continue
            metrics = evaluate_fold(y_true, y_pred[:len(y_true)])
            rows.append({
                "model": "TFT", "series_id": s, "fold_id": fold.fold_id,
                "origin": origin_date, "horizon": horizon,
                "rmse": metrics["rmse"], "mape": metrics["mape"], "smape": metrics["smape"],
                "train_size": len(train_by_series[s]), "runtime_sec": round(elapsed / len(series_ids), 3),
                "status": status,
            })
            print(f"  {s:22s} fold {fold.fold_id} TFT      "
                  f"RMSE={metrics['rmse']:.2f} MAPE={metrics['mape']:.1f}% "
                  f"(shared {elapsed:.2f}s) [{status}]")

    return pd.DataFrame(rows)


def summarize(results: pd.DataFrame) -> pd.DataFrame:
    return (
        results.groupby("model")
        .agg(
            mean_rmse=("rmse", "mean"), std_rmse=("rmse", "std"),
            mean_mape=("mape", "mean"), std_mape=("mape", "std"),
            mean_smape=("smape", "mean"),
            mean_runtime_sec=("runtime_sec", "mean"),
            n_folds_evaluated=("rmse", "count"),
        )
        .sort_values("mean_rmse")
        .reset_index()
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--horizon", type=int, default=4)
    parser.add_argument("--folds", type=int, default=5)
    parser.add_argument("--step", type=int, default=4)
    parser.add_argument("--min-train-size", type=int, default=52)
    parser.add_argument("--tft-epochs", type=int, default=80)
    parser.add_argument("--skip-prophet", action="store_true", default=True,
                         help="Prophet's Stan backend cannot run in this sandbox; enabled=True by default here.")
    parser.add_argument("--run-prophet", action="store_true", help="Force-enable Prophet (needs cmdstan installed).")
    args = parser.parse_args()

    os.makedirs(RESULTS_DIR, exist_ok=True)
    weekly = load_or_build()
    print(f"Loaded {len(weekly)} rows across {weekly['series_id'].nunique()} series.\n")

    print("=== Per-series models: ARIMA, ETS, XGBoost" + (", Prophet" if args.run_prophet else "") + " ===")
    per_series_results = run_per_series_models(
        weekly, args.horizon, args.folds, args.step, args.min_train_size, run_prophet=args.run_prophet
    )

    print("\n=== Global model: TFT ===")
    tft_results = run_tft_global(weekly, args.horizon, args.folds, args.step, args.min_train_size, args.tft_epochs)

    all_results = pd.concat([per_series_results, tft_results], ignore_index=True)
    all_results.to_csv(os.path.join(RESULTS_DIR, "benchmark_raw_results.csv"), index=False)

    summary = summarize(all_results)
    summary.to_csv(os.path.join(RESULTS_DIR, "benchmark_summary.csv"), index=False)

    print("\n=== SUMMARY (lower is better) ===")
    print(summary.to_string(index=False))
    print(f"\nSaved: {RESULTS_DIR}/benchmark_raw_results.csv")
    print(f"Saved: {RESULTS_DIR}/benchmark_summary.csv")


if __name__ == "__main__":
    main()
