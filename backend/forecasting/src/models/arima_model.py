"""
ARIMA baseline. Order (p,d,q) is chosen per-fold via a small AIC grid search
(kept small deliberately — full auto_arima-style search is unnecessary for
weekly series of this length and would blow up runtime across folds x series).
"""

from __future__ import annotations
import warnings
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

from .base import ForecastModel

warnings.filterwarnings("ignore")

PDQ_GRID = [
    (1, 1, 0), (0, 1, 1), (1, 1, 1),
    (2, 1, 1), (1, 1, 2), (2, 1, 0),
    (0, 1, 2), (2, 1, 2),
]


class ARIMAModel(ForecastModel):
    name = "ARIMA"

    def __init__(self):
        self._fitted = None
        self._order = None

    def fit(self, train: pd.DataFrame) -> "ARIMAModel":
        y = train["y"].values.astype(float)
        best_aic = np.inf
        best_fit = None
        best_order = None
        for order in PDQ_GRID:
            try:
                model = ARIMA(y, order=order, enforce_stationarity=False, enforce_invertibility=False)
                res = model.fit()
                if res.aic < best_aic:
                    best_aic = res.aic
                    best_fit = res
                    best_order = order
            except Exception:
                continue
        if best_fit is None:
            # fallback: simple random-walk-with-drift equivalent
            model = ARIMA(y, order=(1, 1, 0), enforce_stationarity=False, enforce_invertibility=False)
            best_fit = model.fit()
            best_order = (1, 1, 0)
        self._fitted = best_fit
        self._order = best_order
        return self

    def predict(self, horizon: int, future_calendar: pd.DataFrame) -> np.ndarray:
        fc = self._fitted.forecast(steps=horizon)
        return np.clip(np.asarray(fc), a_min=0, a_max=None)
