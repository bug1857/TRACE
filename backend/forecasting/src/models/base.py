"""
Common interface every forecasting model in the benchmark implements.
Keeps benchmark.py agnostic to model internals (classical stats vs. ML vs. DL).
"""

from __future__ import annotations
from abc import ABC, abstractmethod
import pandas as pd
import numpy as np


class ForecastModel(ABC):
    """Every model consumes a single-series training frame with columns
    [week_start, y, avg_price, avg_discount_rate, n_orders, week_of_year,
    month, quarter, year, is_holiday_season] and produces `horizon`
    point forecasts for the weeks immediately following train.
    """

    name: str = "base"

    @abstractmethod
    def fit(self, train: pd.DataFrame) -> "ForecastModel":
        ...

    @abstractmethod
    def predict(self, horizon: int, future_calendar: pd.DataFrame) -> np.ndarray:
        """future_calendar has the same calendar columns as train, one row
        per forecasted week, so calendar-aware models (XGBoost, TFT, Prophet)
        can use known-future covariates."""
        ...

    def fit_predict(self, train: pd.DataFrame, horizon: int, future_calendar: pd.DataFrame) -> np.ndarray:
        self.fit(train)
        return self.predict(horizon, future_calendar)
