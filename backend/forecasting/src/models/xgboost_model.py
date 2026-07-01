"""
XGBoost baseline.

Feature engineering (all computed causally — no leakage from future y):
  - lag_1, lag_2, lag_4, lag_8, lag_52 (last year, same week)
  - rolling mean/std over 4 and 8 week windows
  - calendar covariates: week_of_year, month, quarter, is_holiday_season
  - avg_price, avg_discount_rate, n_orders (assumed available at forecast
    time as planned/known covariates, consistent with the other models)

Forecasting is done recursively: predict week t+1, append it to the history,
recompute lag/rolling features, predict t+2, etc. This is the standard way
to get a multi-step horizon out of a one-step-ahead regressor.
"""

from __future__ import annotations
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

from .base import ForecastModel

LAGS = [1, 2, 4, 8, 52]
ROLL_WINDOWS = [4, 8]


def _make_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy().reset_index(drop=True)
    for lag in LAGS:
        df[f"lag_{lag}"] = df["y"].shift(lag)
    for w in ROLL_WINDOWS:
        df[f"roll_mean_{w}"] = df["y"].shift(1).rolling(w).mean()
        df[f"roll_std_{w}"] = df["y"].shift(1).rolling(w).std()
    return df


FEATURE_COLS = (
    [f"lag_{l}" for l in LAGS]
    + [f"roll_mean_{w}" for w in ROLL_WINDOWS]
    + [f"roll_std_{w}" for w in ROLL_WINDOWS]
    + ["week_of_year", "month", "quarter", "is_holiday_season",
       "avg_price", "avg_discount_rate", "n_orders"]
)


class XGBoostModel(ForecastModel):
    name = "XGBoost"

    def __init__(self):
        self._model = None
        self._history = None  # full training frame retained for recursive forecasting

    def fit(self, train: pd.DataFrame) -> "XGBoostModel":
        feat = _make_features(train)
        feat = feat.dropna(subset=[c for c in FEATURE_COLS if c.startswith("lag_") or c.startswith("roll_")])

        X = feat[FEATURE_COLS]
        y = feat["y"]

        self._model = XGBRegressor(
            n_estimators=300,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.85,
            colsample_bytree=0.85,
            min_child_weight=3,
            objective="reg:squarederror",
            random_state=42,
            n_jobs=2,
        )
        self._model.fit(X, y)
        self._history = train.copy().reset_index(drop=True)
        return self

    def predict(self, horizon: int, future_calendar: pd.DataFrame) -> np.ndarray:
        history = self._history.copy()
        preds = []
        for i in range(horizon):
            next_row = future_calendar.iloc[i].to_dict()
            # placeholder y for the row we're about to predict (not used as a feature)
            next_row["y"] = np.nan
            extended = pd.concat([history, pd.DataFrame([next_row])], ignore_index=True)
            feat_all = _make_features(extended)
            x_next = feat_all.iloc[[-1]][FEATURE_COLS]
            x_next = x_next.fillna(0.0)
            pred = float(self._model.predict(x_next)[0])
            pred = max(pred, 0.0)
            preds.append(pred)

            next_row["y"] = pred
            history = pd.concat([history, pd.DataFrame([next_row])], ignore_index=True)

        return np.array(preds)
