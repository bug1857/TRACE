import sys
import os
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.models.arima_model import ARIMAModel
from src.models.ets_model import ETSModel
from src.models.xgboost_model import XGBoostModel


def _toy_train(n=80):
    dates = pd.date_range("2020-01-06", periods=n, freq="7D")
    y = 100 + 10 * np.sin(np.arange(n) / 4.0) + np.arange(n) * 0.5
    return pd.DataFrame({
        "week_start": dates,
        "y": y,
        "avg_price": 50.0,
        "avg_discount_rate": 0.1,
        "n_orders": 20.0,
        "week_of_year": dates.isocalendar().week.values,
        "month": dates.month,
        "quarter": dates.quarter,
        "year": dates.year,
        "is_holiday_season": dates.month.isin([11, 12]).astype(int),
    })


def _toy_future_calendar(train, horizon=4):
    last = train["week_start"].max()
    dates = pd.date_range(last + pd.Timedelta(days=7), periods=horizon, freq="7D")
    return pd.DataFrame({
        "week_start": dates,
        "week_of_year": dates.isocalendar().week.values,
        "month": dates.month,
        "quarter": dates.quarter,
        "is_holiday_season": dates.month.isin([11, 12]).astype(int),
    })


def test_arima_fit_predict_shape():
    train = _toy_train()
    future = _toy_future_calendar(train)
    preds = ARIMAModel().fit_predict(train, horizon=4, future_calendar=future)
    assert len(preds) == 4
    assert np.all(np.isfinite(preds))
    assert np.all(preds >= 0)


def test_ets_fit_predict_shape():
    train = _toy_train()
    future = _toy_future_calendar(train)
    preds = ETSModel().fit_predict(train, horizon=4, future_calendar=future)
    assert len(preds) == 4
    assert np.all(np.isfinite(preds))
    assert np.all(preds >= 0)


def test_xgboost_fit_predict_shape():
    train = _toy_train()
    future = _toy_future_calendar(train)
    preds = XGBoostModel().fit_predict(train, horizon=4, future_calendar=future)
    assert len(preds) == 4
    assert np.all(np.isfinite(preds))
    assert np.all(preds >= 0)


def test_tft_global_fit_predict_shape():
    from src.models.tft_model import TFTGlobalModel
    train_a, train_b = _toy_train(), _toy_train()
    train_a["y"] = train_a["y"] + 10  # differentiate the two series slightly
    future_a, future_b = _toy_future_calendar(train_a), _toy_future_calendar(train_b)

    tft = TFTGlobalModel(horizon=4, epochs=3)  # tiny epoch count for speed
    preds = tft.fit_predict_global(
        {"series_a": train_a, "series_b": train_b},
        {"series_a": future_a, "series_b": future_b},
    )
    assert set(preds.keys()) == {"series_a", "series_b"}
    for s, p in preds.items():
        assert len(p) == 4
        assert np.all(np.isfinite(p))
        assert np.all(p >= 0)


if __name__ == "__main__":
    import subprocess
    subprocess.run(["python3", "-m", "pytest", __file__, "-v"])
