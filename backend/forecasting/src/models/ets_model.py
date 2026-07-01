"""
ETS (Error-Trend-Seasonal / Holt-Winters exponential smoothing) baseline.
Uses additive trend + additive seasonality (weekly data -> yearly period=52).
Falls back to non-seasonal Holt if a series has too few observations for a
full seasonal cycle, which is common near the start of the rolling-origin
CV folds.
"""

from __future__ import annotations
import warnings
import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing

from .base import ForecastModel

warnings.filterwarnings("ignore")

SEASONAL_PERIOD = 52  # weekly data, annual seasonality


class ETSModel(ForecastModel):
    name = "ETS"

    def __init__(self):
        self._fitted = None

    def fit(self, train: pd.DataFrame) -> "ETSModel":
        y = train["y"].values.astype(float)
        y = np.clip(y, a_min=1e-3, a_max=None)  # ETS multiplicative-safe; additive is fine with 0s but keep stable

        use_seasonal = len(y) >= 2 * SEASONAL_PERIOD
        try:
            if use_seasonal:
                model = ExponentialSmoothing(
                    y, trend="add", seasonal="add", seasonal_periods=SEASONAL_PERIOD,
                    initialization_method="estimated",
                )
            else:
                model = ExponentialSmoothing(
                    y, trend="add", seasonal=None, initialization_method="estimated",
                )
            self._fitted = model.fit(optimized=True)
        except Exception:
            model = ExponentialSmoothing(y, trend=None, seasonal=None, initialization_method="estimated")
            self._fitted = model.fit(optimized=True)
        return self

    def predict(self, horizon: int, future_calendar: pd.DataFrame) -> np.ndarray:
        fc = self._fitted.forecast(horizon)
        return np.clip(np.asarray(fc), a_min=0, a_max=None)
