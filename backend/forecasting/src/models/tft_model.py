"""
Temporal Fusion Transformer — custom lightweight implementation.

Rather than pull in the full pytorch-forecasting dependency stack, this is a
from-scratch implementation of the core mechanisms from Lim et al. (2019),
"Temporal Fusion Transformers for Interpretable Multi-horizon Time Series
Forecasting", scoped down for this benchmark's dataset size:

  1. Static covariate embedding      — per-series (category) embedding
  2. Gated Residual Networks (GRN)   — the TFT building block used everywhere
  3. Variable Selection Networks     — learned soft weighting over input
                                        features, separately for the encoder
                                        (past) and decoder (known-future) legs
  4. LSTM encoder-decoder            — local temporal processing
  5. Interpretable multi-head attention over the encoder+decoder sequence
  6. Gated output layer              — direct multi-horizon point forecast

Trained GLOBALLY across all series per fold (one model sees every category,
with a learned embedding distinguishing them) — this is the standard way TFT
is used in production, since it lets rare/short series borrow statistical
strength from the others, and is why TFT tends to outperform per-series
models like ARIMA/ETS at scale.
"""

from __future__ import annotations
import numpy as np
import pandas as pd
import torch
import torch.nn as nn

TIME_VARYING_COLS = [
    "y", "avg_price", "avg_discount_rate", "n_orders",
    "week_of_year", "month", "quarter", "is_holiday_season",
]
KNOWN_FUTURE_COLS = ["week_of_year", "month", "quarter", "is_holiday_season"]  # available for decoder
ENCODER_LEN = 26  # weeks of context fed to the encoder


class GRN(nn.Module):
    """Gated Residual Network — TFT's core nonlinear building block.
    Applies a nonlinear transform with a learned gate, plus a residual skip.
    """

    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int, dropout: float = 0.1):
        super().__init__()
        self.skip = nn.Linear(input_dim, output_dim) if input_dim != output_dim else nn.Identity()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.elu = nn.ELU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        self.gate = nn.Linear(hidden_dim, output_dim)
        self.sigmoid = nn.Sigmoid()
        self.dropout = nn.Dropout(dropout)
        self.norm = nn.LayerNorm(output_dim)

    def forward(self, x):
        residual = self.skip(x)
        h = self.elu(self.fc1(x))
        h = self.dropout(h)
        out = self.fc2(h)
        gate = self.sigmoid(self.gate(h))
        return self.norm(residual + gate * out)


class VariableSelectionNetwork(nn.Module):
    """Learns a softmax weighting over input variables at each timestep,
    then passes each (weighted) variable through its own GRN before summing.
    This is what gives TFT its per-feature "attention" / interpretability.
    """

    def __init__(self, n_vars: int, hidden_dim: int, dropout: float = 0.1):
        super().__init__()
        self.n_vars = n_vars
        self.hidden_dim = hidden_dim
        self.flatten_grn = GRN(n_vars * hidden_dim, hidden_dim, n_vars, dropout)
        self.var_grns = nn.ModuleList([GRN(hidden_dim, hidden_dim, hidden_dim, dropout) for _ in range(n_vars)])
        self.softmax = nn.Softmax(dim=-1)

    def forward(self, var_embeddings: torch.Tensor):
        # var_embeddings: (batch, time, n_vars, hidden_dim)
        b, t, n, h = var_embeddings.shape
        flat = var_embeddings.reshape(b, t, n * h)
        weights = self.softmax(self.flatten_grn(flat))  # (b, t, n_vars)
        processed = torch.stack(
            [self.var_grns[i](var_embeddings[:, :, i, :]) for i in range(n)], dim=2
        )  # (b, t, n_vars, hidden_dim)
        combined = (processed * weights.unsqueeze(-1)).sum(dim=2)  # (b, t, hidden_dim)
        return combined, weights


class InterpretableMultiHeadAttention(nn.Module):
    def __init__(self, hidden_dim: int, n_heads: int = 4, dropout: float = 0.1):
        super().__init__()
        self.attn = nn.MultiheadAttention(hidden_dim, n_heads, dropout=dropout, batch_first=True)
        self.norm = nn.LayerNorm(hidden_dim)

    def forward(self, query, key, value, attn_mask=None):
        out, weights = self.attn(query, key, value, attn_mask=attn_mask)
        return self.norm(query + out), weights


class TFT(nn.Module):
    def __init__(self, n_series: int, hidden_dim: int = 32, n_heads: int = 4, horizon: int = 4, dropout: float = 0.1):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.horizon = horizon

        self.series_embedding = nn.Embedding(n_series, hidden_dim)

        # per-variable input projections (scalar -> hidden_dim) for VSN
        self.encoder_var_proj = nn.ModuleList(
            [nn.Linear(1, hidden_dim) for _ in TIME_VARYING_COLS]
        )
        self.decoder_var_proj = nn.ModuleList(
            [nn.Linear(1, hidden_dim) for _ in KNOWN_FUTURE_COLS]
        )

        self.encoder_vsn = VariableSelectionNetwork(len(TIME_VARYING_COLS), hidden_dim, dropout)
        self.decoder_vsn = VariableSelectionNetwork(len(KNOWN_FUTURE_COLS), hidden_dim, dropout)

        self.static_grn = GRN(hidden_dim, hidden_dim, hidden_dim, dropout)

        self.encoder_lstm = nn.LSTM(hidden_dim, hidden_dim, batch_first=True)
        self.decoder_lstm = nn.LSTM(hidden_dim, hidden_dim, batch_first=True)

        self.attention = InterpretableMultiHeadAttention(hidden_dim, n_heads, dropout)
        self.post_attn_grn = GRN(hidden_dim, hidden_dim, hidden_dim, dropout)
        self.output_layer = nn.Linear(hidden_dim, 1)

    def forward(self, x_enc: torch.Tensor, x_dec: torch.Tensor, series_idx: torch.Tensor):
        """
        x_enc: (batch, ENCODER_LEN, len(TIME_VARYING_COLS))
        x_dec: (batch, horizon, len(KNOWN_FUTURE_COLS))
        series_idx: (batch,) long
        """
        b = x_enc.shape[0]
        static_emb = self.series_embedding(series_idx)  # (b, hidden)
        static_ctx = self.static_grn(static_emb)  # (b, hidden)

        enc_vars = torch.stack(
            [self.encoder_var_proj[i](x_enc[:, :, i: i + 1]) for i in range(len(TIME_VARYING_COLS))],
            dim=2,
        )  # (b, T_enc, n_vars, hidden)
        enc_combined, enc_weights = self.encoder_vsn(enc_vars)
        enc_combined = enc_combined + static_ctx.unsqueeze(1)

        dec_vars = torch.stack(
            [self.decoder_var_proj[i](x_dec[:, :, i: i + 1]) for i in range(len(KNOWN_FUTURE_COLS))],
            dim=2,
        )  # (b, T_dec, n_vars, hidden)
        dec_combined, dec_weights = self.decoder_vsn(dec_vars)
        dec_combined = dec_combined + static_ctx.unsqueeze(1)

        enc_out, (h, c) = self.encoder_lstm(enc_combined)
        dec_out, _ = self.decoder_lstm(dec_combined, (h, c))

        full_seq = torch.cat([enc_out, dec_out], dim=1)
        attn_out, _ = self.attention(dec_out, full_seq, full_seq)
        gated = self.post_attn_grn(attn_out)
        preds = self.output_layer(gated).squeeze(-1)  # (b, horizon)
        return preds


# ---------------------------------------------------------------------------
# Wrapper matching the ForecastModel interface (base.py), operating GLOBALLY
# across all series rather than per-series like the other models.
# ---------------------------------------------------------------------------

from .base import ForecastModel


class TFTGlobalModel:
    """Not a per-series ForecastModel: this is trained once per fold across
    every series and produces a horizon forecast per series. benchmark.py
    calls fit_predict_global() instead of the usual per-series fit_predict().
    """

    name = "TFT"

    def __init__(self, horizon: int = 4, epochs: int = 80, lr: float = 5e-3, hidden_dim: int = 32, seed: int = 42):
        self.horizon = horizon
        self.epochs = epochs
        self.lr = lr
        self.hidden_dim = hidden_dim
        self.seed = seed
        self._model = None
        self._series_to_idx = None
        self._y_mean = None
        self._y_std = None

    def _normalize(self, df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
        df = df.copy()
        for c in cols:
            mean = df[c].mean()
            std = df[c].std() if df[c].std() > 1e-6 else 1.0
            df[c] = (df[c] - mean) / std
        return df

    def fit_predict_global(
        self, train_by_series: dict[str, pd.DataFrame], future_calendar_by_series: dict[str, pd.DataFrame]
    ) -> dict[str, np.ndarray]:
        torch.manual_seed(self.seed)
        np.random.seed(self.seed)

        series_ids = sorted(train_by_series.keys())
        self._series_to_idx = {s: i for i, s in enumerate(series_ids)}
        n_series = len(series_ids)

        # -------- normalization stats (per-series, computed on train only) --------
        norm_cols = ["y", "avg_price", "avg_discount_rate", "n_orders"]
        stats = {}
        normed_train = {}
        for s in series_ids:
            df = train_by_series[s].copy()
            s_stats = {}
            for c in norm_cols:
                mean, std = df[c].mean(), (df[c].std() if df[c].std() > 1e-6 else 1.0)
                s_stats[c] = (mean, std)
                df[c] = (df[c] - mean) / std
            stats[s] = s_stats
            normed_train[s] = df

        # -------- build training windows: sliding (encoder, decoder-target) pairs --------
        X_enc, X_dec, Y, S = [], [], [], []
        for s in series_ids:
            df = normed_train[s].reset_index(drop=True)
            n = len(df)
            for start in range(0, n - ENCODER_LEN - self.horizon + 1):
                enc_slice = df.iloc[start: start + ENCODER_LEN]
                dec_slice = df.iloc[start + ENCODER_LEN: start + ENCODER_LEN + self.horizon]
                X_enc.append(enc_slice[TIME_VARYING_COLS].values.astype(np.float32))
                X_dec.append(dec_slice[KNOWN_FUTURE_COLS].values.astype(np.float32))
                Y.append(dec_slice["y"].values.astype(np.float32))
                S.append(self._series_to_idx[s])

        if len(X_enc) < 4:
            # not enough history yet in this fold to train a global sequence model;
            # fall back to naive seasonal-persistence per series
            return {
                s: np.repeat(train_by_series[s]["y"].iloc[-1:].values, self.horizon)
                for s in series_ids
            }

        X_enc_t = torch.tensor(np.stack(X_enc))
        X_dec_t = torch.tensor(np.stack(X_dec))
        Y_t = torch.tensor(np.stack(Y))
        S_t = torch.tensor(np.array(S), dtype=torch.long)

        model = TFT(n_series=n_series, hidden_dim=self.hidden_dim, horizon=self.horizon)
        optimizer = torch.optim.Adam(model.parameters(), lr=self.lr, weight_decay=1e-5)
        loss_fn = nn.MSELoss()

        model.train()
        batch_size = min(64, X_enc_t.shape[0])
        n_samples = X_enc_t.shape[0]
        for epoch in range(self.epochs):
            perm = torch.randperm(n_samples)
            for i in range(0, n_samples, batch_size):
                idx = perm[i: i + batch_size]
                optimizer.zero_grad()
                preds = model(X_enc_t[idx], X_dec_t[idx], S_t[idx])
                loss = loss_fn(preds, Y_t[idx])
                loss.backward()
                optimizer.step()

        self._model = model

        # -------- forecast: use the LAST ENCODER_LEN weeks of each series as context --------
        model.eval()
        results = {}
        with torch.no_grad():
            for s in series_ids:
                df = normed_train[s].reset_index(drop=True)
                if len(df) < ENCODER_LEN:
                    pad = pd.concat([df.iloc[[0]]] * (ENCODER_LEN - len(df)), ignore_index=True)
                    df = pd.concat([pad, df], ignore_index=True)
                enc_slice = df.iloc[-ENCODER_LEN:][TIME_VARYING_COLS].values.astype(np.float32)

                fut_cal = future_calendar_by_series[s][KNOWN_FUTURE_COLS].values.astype(np.float32)

                x_enc = torch.tensor(enc_slice).unsqueeze(0)
                x_dec = torch.tensor(fut_cal).unsqueeze(0)
                s_idx = torch.tensor([self._series_to_idx[s]], dtype=torch.long)

                pred_norm = model(x_enc, x_dec, s_idx).squeeze(0).numpy()
                mean, std = stats[s]["y"]
                pred = pred_norm * std + mean
                results[s] = np.clip(pred, a_min=0, a_max=None)

        return results
