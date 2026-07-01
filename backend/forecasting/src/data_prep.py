"""
TRACE Forecasting Benchmark — Data Preparation
================================================
Loads the raw DataCo Smart Supply Chain dataset and aggregates it into
weekly demand time series per product category, suitable for time-series
forecasting benchmarking (PS1: ARIMA / ETS / Prophet / XGBoost / TFT).

Source dataset: DataCo Smart Supply Chain for Big Data Analysis
(Constante, Silva, Pereira; Mendeley Data, 2019) — 180,519 real order
records, 2015-01-01 to 2018-01-31, across 5 markets and 50+ categories.

Output: one row per (category, week) with target = total units ordered
that week, plus calendar covariates used by the models.
"""

from __future__ import annotations

import os
import pandas as pd
import numpy as np

RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "DataCoSupplyChainDataset.csv")
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
TOP_N_CATEGORIES = 8  # number of category-level series to benchmark on


def load_raw(path: str = RAW_PATH) -> pd.DataFrame:
    df = pd.read_csv(path, encoding="latin-1")
    df["order_date"] = pd.to_datetime(df["order date (DateOrders)"])
    return df


def top_categories(df: pd.DataFrame, n: int = TOP_N_CATEGORIES) -> list[str]:
    return (
        df.groupby("Category Name")["Order Item Quantity"]
        .sum()
        .sort_values(ascending=False)
        .head(n)
        .index.tolist()
    )


def build_weekly_series(df: pd.DataFrame, categories: list[str]) -> pd.DataFrame:
    """Returns long-format dataframe: series_id, week_start, y, + calendar covariates."""
    sub = df[df["Category Name"].isin(categories)].copy()
    # Normalize every timestamp down to the Monday of its calendar week.
    sub["week_start"] = sub["order_date"].dt.normalize() - pd.to_timedelta(
        sub["order_date"].dt.weekday, unit="D"
    )

    grouped = (
        sub.groupby(["Category Name", "week_start"])
        .agg(
            y=("Order Item Quantity", "sum"),
            avg_price=("Product Price", "mean"),
            avg_discount_rate=("Order Item Discount Rate", "mean"),
            n_orders=("Order Id", "nunique"),
        )
        .reset_index()
        .rename(columns={"Category Name": "series_id"})
    )

    # Fill missing weeks per series with 0 demand (continuous weekly index)
    filled = []
    for sid, g in grouped.groupby("series_id"):
        g = g.set_index("week_start").sort_index()
        full_idx = pd.date_range(g.index.min(), g.index.max(), freq="7D")
        g = g.reindex(full_idx)
        g["series_id"] = sid
        g["y"] = g["y"].fillna(0.0)
        g["avg_price"] = g["avg_price"].ffill().bfill()
        g["avg_discount_rate"] = g["avg_discount_rate"].fillna(0.0)
        g["n_orders"] = g["n_orders"].fillna(0.0)
        g.index.name = "week_start"
        filled.append(g.reset_index())

    out = pd.concat(filled, ignore_index=True)

    # The raw dataset's timestamps end mid-week (2018-01-31), so the final
    # calendar week of every series is a partial week with truncated demand.
    # Drop it -- otherwise it looks like a demand cliff and wrecks every
    # model's error metrics on the most recent (most-tested) fold.
    max_week = out["week_start"].max()
    out = out[out["week_start"] < max_week].copy()

    # Calendar covariates (known in advance -> usable as future/decoder inputs)
    out["week_of_year"] = out["week_start"].dt.isocalendar().week.astype(int)
    out["month"] = out["week_start"].dt.month
    out["quarter"] = out["week_start"].dt.quarter
    out["year"] = out["week_start"].dt.year
    out["is_holiday_season"] = out["month"].isin([11, 12]).astype(int)

    return out.sort_values(["series_id", "week_start"]).reset_index(drop=True)


def save_processed(df: pd.DataFrame, path: str = None) -> str:
    path = path or os.path.join(PROCESSED_DIR, "weekly_demand.csv")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    return path


def load_or_build(raw_path: str = RAW_PATH, force_rebuild: bool = False) -> pd.DataFrame:
    processed_path = os.path.join(PROCESSED_DIR, "weekly_demand.csv")
    if not force_rebuild and os.path.exists(processed_path):
        df = pd.read_csv(processed_path, parse_dates=["week_start"])
        return df

    raw = load_raw(raw_path)
    cats = top_categories(raw)
    weekly = build_weekly_series(raw, cats)
    save_processed(weekly, processed_path)
    return weekly


if __name__ == "__main__":
    weekly = load_or_build(force_rebuild=True)
    print(weekly.groupby("series_id").agg(
        weeks=("week_start", "count"),
        start=("week_start", "min"),
        end=("week_start", "max"),
        mean_demand=("y", "mean"),
    ))
    print(f"\nSaved to {os.path.join(PROCESSED_DIR, 'weekly_demand.csv')}")
