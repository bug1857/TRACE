"""
Prophet baseline.

NOTE ON THIS SANDBOX: Prophet's Stan backend (cmdstanpy) needs to download and
compile CmdStan from GitHub release assets on first use. This container's
network egress is restricted to a small allowlist that does not include
GitHub's release-asset CDN, so `cmdstan_path()` cannot be initialized here and
this model cannot be executed inside this sandbox.

This code is production-ready and will run as-is anywhere with normal
internet access (your MacBook, CI, Railway, etc.) — just run once:
    pip install prophet
    python -c "import cmdstanpy; cmdstanpy.install_cmdstan()"
before calling benchmark.py with PROPHET enabled.
"""

from __future__ import annotations
import warnings
import numpy as np
import pandas as pd

from .base import ForecastModel

warnings.filterwarnings("ignore")


class ProphetModel(ForecastModel):
    name = "Prophet"

    def __init__(self):
        self._fitted = None

    def fit(self, train: pd.DataFrame) -> "ProphetModel":
        from prophet import Prophet  # local import: only required if this model is actually run

        df = train[["week_start", "y"]].rename(columns={"week_start": "ds", "y": "y"})
        model = Prophet(
            growth="linear",
            yearly_seasonality=True,
            weekly_seasonality=False,  # data is already weekly-aggregated
            daily_seasonality=False,
            seasonality_mode="additive",
            changepoint_prior_scale=0.5,
        )
        model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
        model.fit(df)
        self._fitted = model
        return self

    def predict(self, horizon: int, future_calendar: pd.DataFrame) -> np.ndarray:
        future = future_calendar[["week_start"]].rename(columns={"week_start": "ds"})
        fc = self._fitted.predict(future)
        return np.clip(fc["yhat"].values, a_min=0, a_max=None)
