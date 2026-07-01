"""
TRACE Forecasting Benchmark — Evaluation
==========================================
Rolling-origin cross-validation (a.k.a. walk-forward validation) and
standard point-forecast error metrics (RMSE, MAPE), as required by PS1.

Rolling-origin CV protocol:
  - For each series, the training window EXPANDS forward in time.
  - At each origin, the model is fit on all data up to that origin and
    asked to forecast the next `horizon` weeks.
  - The origin then advances by `step` weeks, and the process repeats
    for `n_folds` folds.
  - This mirrors production reality: at each point in time we can only
    use the past to forecast the future, and every fold re-evaluates
    the model as if it were being retrained "today".
"""

from __future__ import annotations

from dataclasses import dataclass
import numpy as np
import pandas as pd


@dataclass
class Fold:
    fold_id: int
    train: pd.DataFrame
    test: pd.DataFrame
    origin: pd.Timestamp


def rolling_origin_splits(
    series_df: pd.DataFrame,
    horizon: int = 4,
    n_folds: int = 5,
    step: int = 4,
    min_train_size: int = 52,
    date_col: str = "week_start",
) -> list[Fold]:
    """
    series_df: single-series dataframe sorted by date_col (one series_id only).
    Returns folds ordered oldest -> newest origin.
    """
    series_df = series_df.sort_values(date_col).reset_index(drop=True)
    n = len(series_df)
    max_origin_idx = n - horizon
    min_origin_idx = min_train_size

    if max_origin_idx <= min_origin_idx:
        raise ValueError(
            f"Series too short for min_train_size={min_train_size} and horizon={horizon} "
            f"(length={n})."
        )

    # anchor the last fold's origin at the latest possible point, then step backwards
    origins = []
    origin_idx = max_origin_idx
    for _ in range(n_folds):
        if origin_idx < min_origin_idx:
            break
        origins.append(origin_idx)
        origin_idx -= step
    origins = sorted(origins)  # oldest -> newest

    folds = []
    for i, oidx in enumerate(origins):
        train = series_df.iloc[:oidx].copy()
        test = series_df.iloc[oidx: oidx + horizon].copy()
        origin_date = series_df.iloc[oidx][date_col]
        folds.append(Fold(fold_id=i, train=train, test=test, origin=origin_date))

    return folds


def rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def mape(y_true: np.ndarray, y_pred: np.ndarray, eps: float = 1e-6) -> float:
    """Mean Absolute Percentage Error. Rows where |y_true| < eps are excluded
    to avoid division blow-up on zero-demand weeks."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mask = np.abs(y_true) >= eps
    if mask.sum() == 0:
        return float("nan")
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100.0)


def smape(y_true: np.ndarray, y_pred: np.ndarray, eps: float = 1e-6) -> float:
    """Symmetric MAPE — reported alongside MAPE since MAPE is unstable near-zero."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    denom = np.abs(y_true) + np.abs(y_pred) + eps
    return float(np.mean(2.0 * np.abs(y_pred - y_true) / denom) * 100.0)


def evaluate_fold(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    return {
        "rmse": rmse(y_true, y_pred),
        "mape": mape(y_true, y_pred),
        "smape": smape(y_true, y_pred),
    }
