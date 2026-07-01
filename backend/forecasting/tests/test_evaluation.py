import numpy as np
import pandas as pd
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.evaluation import rmse, mape, smape, rolling_origin_splits


def test_rmse_zero_for_perfect_prediction():
    y = np.array([10, 20, 30])
    assert rmse(y, y) == 0.0


def test_rmse_basic():
    y_true = np.array([10, 20])
    y_pred = np.array([12, 18])
    assert rmse(y_true, y_pred) == pytest.approx(2.0)


def test_mape_basic():
    y_true = np.array([100, 200])
    y_pred = np.array([110, 180])
    # |100-110|/100=10%, |200-180|/200=10% -> mean = 10%
    assert mape(y_true, y_pred) == pytest.approx(10.0)


def test_mape_excludes_near_zero_true_values():
    y_true = np.array([0, 100])
    y_pred = np.array([5, 110])
    # only the second point should count
    assert mape(y_true, y_pred) == pytest.approx(10.0)


def test_smape_symmetric():
    y_true = np.array([100])
    y_pred = np.array([120])
    a = smape(y_true, y_pred)
    b = smape(y_pred, y_true)  # swap args -> should give same value (symmetry)
    assert a == pytest.approx(b)


def _make_series(n=100):
    dates = pd.date_range("2020-01-06", periods=n, freq="7D")  # Mondays
    return pd.DataFrame({
        "week_start": dates,
        "y": np.arange(n, dtype=float),
        "week_of_year": dates.isocalendar().week.values,
    })


def test_rolling_origin_splits_shapes():
    df = _make_series(100)
    folds = rolling_origin_splits(df, horizon=4, n_folds=3, step=4, min_train_size=52)
    assert len(folds) == 3
    for f in folds:
        assert len(f.test) == 4
        assert len(f.train) >= 52


def test_rolling_origin_splits_no_leakage():
    df = _make_series(100)
    folds = rolling_origin_splits(df, horizon=4, n_folds=3, step=4, min_train_size=52)
    for f in folds:
        assert f.train["week_start"].max() < f.test["week_start"].min()


def test_rolling_origin_splits_expanding_window():
    df = _make_series(100)
    folds = rolling_origin_splits(df, horizon=4, n_folds=3, step=4, min_train_size=52)
    sizes = [len(f.train) for f in folds]
    assert sizes == sorted(sizes)  # training window should grow (or stay flat), never shrink


def test_rolling_origin_splits_too_short_raises():
    df = _make_series(20)
    with pytest.raises(ValueError):
        rolling_origin_splits(df, horizon=4, n_folds=3, step=4, min_train_size=52)


if __name__ == "__main__":
    import subprocess
    subprocess.run(["python3", "-m", "pytest", __file__, "-v"])
