"""
TRACE Benchmarking Engine
=========================
Runs 6 conformance-checking models against an uploaded event-log DataFrame
and returns a structured BenchmarkReport containing per-model metrics plus
TRACE's novel Carbon Fitness Score (CFS) layered on top of each model.

Models
------
1. Token Replay        – fitness via token-based replay on an Inductive Miner net
2. Alignments          – alignment-cost-based fitness on an Inductive Miner net
3. Footprint           – footprint-similarity fitness / precision
4. Inductive Miner     – dedicated IM discovery + token replay evaluation
5. Heuristics Miner    – HM discovery + token replay evaluation
6. DECLARE             – declarative constraint discovery + conformance checking

CFS is computed once from the raw event log and applied uniformly to all models
as an additional column so evaluators can compare standard conformance with the
carbon-adjusted variant side-by-side.
"""

from __future__ import annotations

import time
import sys

def _footprint_net_worker(net, im, fm, q):
    """Module-level worker for multiprocessing — must NOT be nested inside
    another function, or it cannot be pickled for the child process."""
    try:
        from pm4py.algo.discovery.footprints import algorithm as footprints_algo
        result = footprints_algo.apply(net, im, fm)
        q.put(("ok", result))
    except Exception as e:
        q.put(("error", str(e)))
import os
from dataclasses import dataclass, field, asdict
from typing import List, Optional

import pandas as pd
import numpy as np

# ── pm4py imports (guarded so the module can still be *imported* even if
#    pm4py is not yet installed – the actual run_benchmark() call will fail
#    with a clear ImportError message in that case) ──────────────────────────
try:
    import pm4py
    from pm4py.objects.log.obj import EventLog
    from pm4py.objects.conversion.log import converter as log_converter
    from pm4py.algo.discovery.inductive import algorithm as inductive_miner
    from pm4py.algo.discovery.heuristics import algorithm as heuristics_miner
    from pm4py.algo.conformance.tokenreplay import algorithm as token_replay
    from pm4py.algo.conformance.alignments.petri_net import algorithm as alignments_algo
    from pm4py.algo.discovery.footprints import algorithm as footprints_algo
    from pm4py.algo.conformance.footprints import algorithm as footprints_conf
    from pm4py.objects.petri_net.utils import reachability_graph
    from pm4py.statistics.traces.generic.log import case_statistics
    PM4PY_AVAILABLE = True
except ImportError:
    PM4PY_AVAILABLE = False

# ── DECLARE support (pm4py >= 2.7 ships it) ────────────────────────────────
try:
    from pm4py.algo.discovery.declare import algorithm as declare_discovery
    from pm4py.algo.conformance.declare import algorithm as declare_conformance
    DECLARE_AVAILABLE = True
except ImportError:
    DECLARE_AVAILABLE = False

# ── Internal TRACE CFS helpers ──────────────────────────────────────────────
# We import from the parent backend package.  When run from within backend/
# these imports work directly.  When called from tests elsewhere, the caller
# must ensure sys.path includes the backend directory.
try:
    from carbon_budget import classify_activity
    from conformance import VIOLATION_RULES
    TRACE_HELPERS_AVAILABLE = True
except ImportError:
    TRACE_HELPERS_AVAILABLE = False


# ════════════════════════════════════════════════════════════════════════════
# Data classes
# ════════════════════════════════════════════════════════════════════════════

@dataclass
class ModelResult:
    """Metrics for a single conformance model."""
    model_name: str
    fitness: Optional[float]           # 0–1; None if model errored
    precision: Optional[float]         # 0–1; None if N/A or errored
    f1_score: Optional[float]          # harmonic mean; None if inputs None
    cfs_score: float                   # TRACE novel metric, always computed
    execution_time_ms: float
    error: Optional[str] = None        # set if the model raised an exception

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class BenchmarkReport:
    """Full benchmark result returned to the API layer."""
    results: List[ModelResult]
    winner: ModelResult
    winner_justification: str
    dataset_summary: dict
    timed_out: bool = False

    def to_dict(self) -> dict:
        return {
            "results": [r.to_dict() for r in self.results],
            "winner": self.winner.to_dict(),
            "winner_justification": self.winner_justification,
            "dataset_summary": self.dataset_summary,
            "timed_out": self.timed_out,
        }


# ════════════════════════════════════════════════════════════════════════════
# CFS computation (independent of conformance model)
# ════════════════════════════════════════════════════════════════════════════

def _compute_cfs_for_log(df: pd.DataFrame, activity_col: str) -> float:
    """
    Compute the dataset-level Carbon Fitness Score using the same formula
    as carbon_fitness.py:
        CFS = 100 * (ideal_carbon / actual_carbon)
    where ideal_carbon = actual_carbon * (1 - reduction_factor) for any
    event whose activity matches a VIOLATION_RULES entry, otherwise
    ideal_carbon == actual_carbon.

    Returns a float in [0, 100].  Returns 100.0 if helpers are unavailable
    or total carbon is zero.
    """
    if not TRACE_HELPERS_AVAILABLE:
        return 100.0

    activities = df[activity_col].astype(str)
    unique_acts = activities.unique()

    factor_map: dict[str, float] = {}
    rf_map: dict[str, Optional[float]] = {}

    for act in unique_acts:
        _, factor, _ = classify_activity(act)
        factor_map[act] = factor
        act_lower = act.lower()
        matched_rf = None
        for rule in VIOLATION_RULES:
            if rule["forbidden"].lower() in act_lower:
                matched_rf = rule["reduction_factor"]
                break
        rf_map[act] = matched_rf

    actual_carbon_series = activities.map(factor_map).fillna(0.0)
    actual_carbon = float(actual_carbon_series.sum())

    if actual_carbon == 0.0:
        return 100.0

    ideal_parts = []
    for act, ac in zip(activities, actual_carbon_series):
        rf = rf_map.get(act)
        if rf is not None:
            ideal_parts.append(ac * (1.0 - rf))
        else:
            ideal_parts.append(ac)
    ideal_carbon = float(sum(ideal_parts))

    cfs = 100.0 * (ideal_carbon / actual_carbon)
    return round(min(100.0, max(0.0, cfs)), 2)


# ════════════════════════════════════════════════════════════════════════════
# Helpers
# ════════════════════════════════════════════════════════════════════════════

def _df_to_event_log(df: pd.DataFrame, case_col: str,
                     activity_col: str, timestamp_col: str) -> "EventLog":
    """Convert a pandas DataFrame to a pm4py EventLog object."""
    df_pm = df[[case_col, activity_col, timestamp_col]].copy()
    
    # Cast to save memory before pm4py conversion
    df_pm[case_col] = df_pm[case_col].astype(str)
    df_pm[activity_col] = df_pm[activity_col].astype('category')
    
    df_pm = df_pm.rename(columns={
        case_col: "case:concept:name",
        activity_col: "concept:name",
        timestamp_col: "time:timestamp",
    })
    df_pm["time:timestamp"] = pd.to_datetime(
        df_pm["time:timestamp"], errors="coerce", format="mixed"
    )
    df_pm = df_pm.dropna(subset=["time:timestamp"])
    df_pm["time:timestamp"] = df_pm["time:timestamp"].dt.tz_localize(None)
    return log_converter.apply(
        df_pm,
        variant=log_converter.Variants.TO_EVENT_LOG,
    )


def _safe_f1(fitness: Optional[float], precision: Optional[float]) -> Optional[float]:
    if fitness is None or precision is None:
        return None
    denom = fitness + precision
    if denom == 0.0:
        return 0.0
    return round(2.0 * fitness * precision / denom, 4)


def _dataset_summary(df: pd.DataFrame, case_col: str,
                     activity_col: str, timestamp_col: str) -> dict:
    parsed_ts = pd.to_datetime(df[timestamp_col], errors="coerce", format="mixed")
    min_ts = parsed_ts.min()
    max_ts = parsed_ts.max()
    if pd.notna(min_ts) and pd.notna(max_ts):
        date_range = f"{min_ts.strftime('%b %Y')} – {max_ts.strftime('%b %Y')}"
    else:
        date_range = "Unknown"
    return {
        "cases": int(df[case_col].nunique()),
        "events": int(len(df)),
        "activities": int(df[activity_col].nunique()),
        "date_range": date_range,
    }


def _pick_winner(results: List[ModelResult]) -> tuple[ModelResult, str]:
    """
    Pick the best model.  Priority:
    1. Highest F1 score (among models that have it)
    2. Highest fitness (for models without precision / F1)
    3. Highest CFS as tiebreaker
    """
    valid = [r for r in results if r.fitness is not None and r.error is None]
    if not valid:
        # all errored – return dummy
        dummy = results[0]
        return dummy, "All models failed to run. See error fields for details."

    # prefer F1
    has_f1 = [r for r in valid if r.f1_score is not None]
    if has_f1:
        winner = max(has_f1, key=lambda r: (r.f1_score, r.cfs_score))
        justification = (
            f"{winner.model_name} achieves the highest F1 score "
            f"({winner.f1_score:.3f}) on this dataset, balancing fitness "
            f"({winner.fitness:.3f}) and precision ({winner.precision:.3f}) "
            f"with a CFS of {winner.cfs_score:.1f}."
        )
    else:
        winner = max(valid, key=lambda r: (r.fitness, r.cfs_score))
        justification = (
            f"{winner.model_name} achieves the highest fitness "
            f"({winner.fitness:.3f}) on this dataset with a CFS of "
            f"{winner.cfs_score:.1f}. Precision is not applicable for this model."
        )
    return winner, justification


# ════════════════════════════════════════════════════════════════════════════
# Individual model runners
# ════════════════════════════════════════════════════════════════════════════

def _run_token_replay(log: "EventLog", cfs: float) -> ModelResult:
    """Model 1: Token Replay on an Inductive Miner discovered net."""
    t0 = time.perf_counter()
    try:
        net, im, fm = pm4py.discover_petri_net_inductive(log)
        replayed = token_replay.apply(log, net, im, fm)
        fitness_vals = [t.get("trace_fitness", 0.0) for t in replayed]
        fitness = float(np.mean(fitness_vals)) if fitness_vals else 0.0
        fitness = round(min(1.0, max(0.0, fitness)), 4)

        # Precision via ETC (Entropic Relevance Conformance)
        try:
            from pm4py.algo.evaluation.precision import algorithm as precision_algo
            precision = precision_algo.apply(
                log, net, im, fm,
                variant=precision_algo.Variants.ETCONFORMANCE_TOKEN
            )
            precision = round(min(1.0, max(0.0, float(precision))), 4)
        except Exception:
            precision = None

        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Token Replay",
            fitness=fitness,
            precision=precision,
            f1_score=_safe_f1(fitness, precision),
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
        )
    except Exception as exc:
        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Token Replay",
            fitness=None, precision=None, f1_score=None,
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
            error=str(exc),
        )


def _run_alignments(log: "EventLog", cfs: float) -> ModelResult:
    """Model 2: Alignment-based conformance on an Inductive Miner net."""
    t0 = time.perf_counter()
    try:
        net, im, fm = pm4py.discover_petri_net_inductive(log)
        aligned = alignments_algo.apply(log, net, im, fm)

        costs = []
        for trace_align in aligned:
            cost = trace_align.get("cost", None)
            if cost is not None:
                costs.append(float(cost))

        if costs:
            max_cost = max(costs) if max(costs) > 0 else 1.0
            avg_normalised = 1.0 - float(np.mean(costs)) / max_cost
            fitness = round(min(1.0, max(0.0, avg_normalised)), 4)
        else:
            fitness = 0.0

        # Precision via ETC
        try:
            from pm4py.algo.evaluation.precision import algorithm as precision_algo
            precision = precision_algo.apply(
                log, net, im, fm,
                variant=precision_algo.Variants.ETCONFORMANCE_TOKEN
            )
            precision = round(min(1.0, max(0.0, float(precision))), 4)
        except Exception:
            precision = None

        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Alignments",
            fitness=fitness,
            precision=precision,
            f1_score=_safe_f1(fitness, precision),
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
        )
    except Exception as exc:
        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Alignments",
            fitness=None, precision=None, f1_score=None,
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
            error=str(exc),
        )


def _run_footprint(log: "EventLog", cfs: float) -> ModelResult:
    """Model 3: Footprint-based fitness and precision."""
    t0 = time.perf_counter()
    try:
        net, im, fm = pm4py.discover_petri_net_inductive(log)
        fp_log = footprints_algo.apply(log, variant=footprints_algo.Variants.ENTIRE_EVENT_LOG)

        # NOTE: footprints_algo.apply(net, im, fm) computes footprints via the
        # Petri net's reachability graph, which can take 100+ seconds even on
        # tiny datasets depending on net topology (parallel branches/loops),
        # independent of event log size. ThreadPoolExecutor.result(timeout=)
        # does NOT actually kill a CPU-bound thread — it only stops waiting,
        # leaving a zombie thread consuming CPU. We use multiprocessing here
        # instead, since terminate() can actually kill a process.
        import multiprocessing as _mp

        _q = _mp.Queue()
        _p = _mp.Process(target=_footprint_net_worker, args=(net, im, fm, _q))
        _p.start()
        _p.join(timeout=10.0)

        if _p.is_alive():
            _p.terminate()
            _p.join(timeout=2.0)
            if _p.is_alive():
                _p.kill()
                _p.join()
            elapsed = (time.perf_counter() - t0) * 1000.0
            return ModelResult(
                model_name="Footprint",
                fitness=None, precision=None, f1_score=None,
                cfs_score=cfs,
                execution_time_ms=round(elapsed, 1),
                error="Skipped: Petri-net footprint computation exceeded 10s and was terminated (process model has high branching/loop complexity).",
            )

        if _q.empty():
            elapsed = (time.perf_counter() - t0) * 1000.0
            return ModelResult(
                model_name="Footprint",
                fitness=None, precision=None, f1_score=None,
                cfs_score=cfs,
                execution_time_ms=round(elapsed, 1),
                error="Footprint computation process exited without returning a result.",
            )

        _status, _payload = _q.get()
        if _status == "error":
            elapsed = (time.perf_counter() - t0) * 1000.0
            return ModelResult(
                model_name="Footprint",
                fitness=None, precision=None, f1_score=None,
                cfs_score=cfs,
                execution_time_ms=round(elapsed, 1),
                error=_payload,
            )
        fp_net = _payload

        conf_result = footprints_conf.apply(fp_log, fp_net)

        # pm4py's footprint conformance API returns an empty set() when there
        # are zero deviating relations (i.e. the log perfectly conforms to the
        # footprint model), and a dict with 'fitness'/'precision' keys otherwise.
        if isinstance(conf_result, dict):
            fitness_val = conf_result.get("fitness", conf_result.get("fitnesss", None))
            precision_val = conf_result.get("precision", None)
        else:
            # Empty set (or any non-dict) means no deviations found — perfect conformance.
            fitness_val = 1.0
            precision_val = 1.0

        fitness = round(float(fitness_val), 4) if fitness_val is not None else None
        precision = round(float(precision_val), 4) if precision_val is not None else None

        if fitness is not None:
            fitness = min(1.0, max(0.0, fitness))
        if precision is not None:
            precision = min(1.0, max(0.0, precision))

        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Footprint",
            fitness=fitness,
            precision=precision,
            f1_score=_safe_f1(fitness, precision),
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
        )
    except Exception as exc:
        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Footprint",
            fitness=None, precision=None, f1_score=None,
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
            error=str(exc),
        )


def _run_inductive_miner_eval(log: "EventLog", cfs: float) -> ModelResult:
    """
    Model 4: Inductive Miner (separate discovery pass) evaluated with
    token replay.  This differs from Model 1 in that it uses the IM
    'ITMF' (inductive miner infrequent) variant for a potentially
    different discovered net, and reports metrics under a separate label.
    """
    t0 = time.perf_counter()
    try:
        try:
            net, im_marking, fm_marking = pm4py.discover_petri_net_inductive(log, noise_threshold=0.2)
        except Exception:
            # Fallback to base IM if IMf variant unavailable
            net, im_marking, fm_marking = pm4py.discover_petri_net_inductive(log)

        replayed = token_replay.apply(log, net, im_marking, fm_marking)
        fitness_vals = [t.get("trace_fitness", 0.0) for t in replayed]
        fitness = float(np.mean(fitness_vals)) if fitness_vals else 0.0
        fitness = round(min(1.0, max(0.0, fitness)), 4)

        try:
            from pm4py.algo.evaluation.precision import algorithm as precision_algo
            precision = precision_algo.apply(
                log, net, im_marking, fm_marking,
                variant=precision_algo.Variants.ETCONFORMANCE_TOKEN
            )
            precision = round(min(1.0, max(0.0, float(precision))), 4)
        except Exception:
            precision = None

        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Inductive Miner",
            fitness=fitness,
            precision=precision,
            f1_score=_safe_f1(fitness, precision),
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
        )
    except Exception as exc:
        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Inductive Miner",
            fitness=None, precision=None, f1_score=None,
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
            error=str(exc),
        )


def _run_heuristics_miner(log: "EventLog", cfs: float) -> ModelResult:
    """Model 5: Heuristics Miner discovery + token replay evaluation."""
    t0 = time.perf_counter()
    try:
        net, im_marking, fm_marking = heuristics_miner.apply(log)
        replayed = token_replay.apply(log, net, im_marking, fm_marking)
        fitness_vals = [t.get("trace_fitness", 0.0) for t in replayed]
        fitness = float(np.mean(fitness_vals)) if fitness_vals else 0.0
        fitness = round(min(1.0, max(0.0, fitness)), 4)

        try:
            from pm4py.algo.evaluation.precision import algorithm as precision_algo
            precision = precision_algo.apply(
                log, net, im_marking, fm_marking,
                variant=precision_algo.Variants.ETCONFORMANCE_TOKEN
            )
            precision = round(min(1.0, max(0.0, float(precision))), 4)
        except Exception:
            precision = None

        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Heuristics Miner",
            fitness=fitness,
            precision=precision,
            f1_score=_safe_f1(fitness, precision),
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
        )
    except Exception as exc:
        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="Heuristics Miner",
            fitness=None, precision=None, f1_score=None,
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
            error=str(exc),
        )


def _run_declare(log: "EventLog", cfs: float) -> ModelResult:
    """Model 6: DECLARE constraint discovery + conformance checking."""
    t0 = time.perf_counter()
    if not DECLARE_AVAILABLE:
        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="DECLARE",
            fitness=None, precision=None, f1_score=None,
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
            error="DECLARE module not available in this pm4py version.",
        )
    try:
        declare_model = declare_discovery.apply(log)
        conf_results = declare_conformance.apply(log, declare_model)

        # conf_results: list of dicts per trace with 'dev_fitness' and 'is_fit'
        if conf_results:
            fitness_vals = [
                float(r.get("dev_fitness", r.get("fitness", 0.0)))
                for r in conf_results
            ]
            fitness = round(float(np.mean(fitness_vals)), 4)
            fitness = min(1.0, max(0.0, fitness))
        else:
            fitness = 0.0

        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="DECLARE",
            fitness=fitness,
            precision=None,        # precision is N/A for DECLARE
            f1_score=None,         # cannot compute without precision
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
        )
    except Exception as exc:
        elapsed = (time.perf_counter() - t0) * 1000.0
        return ModelResult(
            model_name="DECLARE",
            fitness=None, precision=None, f1_score=None,
            cfs_score=cfs,
            execution_time_ms=round(elapsed, 1),
            error=str(exc),
        )


def _run_alignments_guarded(log_obj, cfs_val, n_events):
    if n_events > 15000:
        return ModelResult(
            model_name="Alignments",
            fitness=None, precision=None, f1_score=None,
            cfs_score=cfs_val,
            execution_time_ms=0.0,
            error="Skipped: Alignments model is O(n²) and exceeds 15,000 events limit."
        )
    return _run_alignments(log_obj, cfs_val)


def _benchmark_model_worker(runner, log, cfs, n_events, q):
    try:
        if runner is _run_alignments_guarded:
            result = runner(log, cfs, n_events)
        else:
            result = runner(log, cfs)
        q.put(("ok", result))
    except Exception as e:
        q.put(("error", str(e)))


# ════════════════════════════════════════════════════════════════════════════
# Public API
# ════════════════════════════════════════════════════════════════════════════

def run_benchmark(
    df: pd.DataFrame,
    case_col: str,
    activity_col: str,
    timestamp_col: str,
    timeout_seconds: float = 120.0,
) -> BenchmarkReport:
    """
    Run all 6 conformance models against the supplied event-log DataFrame.

    Parameters
    ----------
    df : pd.DataFrame
        The event log (already decoded from the uploaded CSV).
    case_col : str
        Column name for case / trace identifiers.
    activity_col : str
        Column name for activity / event names.
    timestamp_col : str
        Column name for event timestamps.
    timeout_seconds : float
        Wall-clock limit for the entire benchmark run.  Models that haven't
        started before the limit are skipped with a timeout error.

    Returns
    -------
    BenchmarkReport
        Contains per-model results, the winner, and dataset summary.
    """
    if not PM4PY_AVAILABLE:
        raise ImportError(
            "pm4py is not installed. Run: pip install pm4py>=2.7.0"
        )

    global_start = time.perf_counter()

    # ── Prepare event log ──────────────────────────────────────────────────
    log = _df_to_event_log(df, case_col, activity_col, timestamp_col)
    summary = _dataset_summary(df, case_col, activity_col, timestamp_col)

    # ── Pre-compute CFS (model-independent) ───────────────────────────────
    cfs = _compute_cfs_for_log(df, activity_col)

    # ── Define model runners in order ─────────────────────────────────────
    n_events = len(df)
    
    runners = [
        ("Token Replay", _run_token_replay),
        ("Alignments", _run_alignments_guarded),
        ("Footprint", _run_footprint),
        ("Inductive Miner", _run_inductive_miner_eval),
        ("Heuristics Miner", _run_heuristics_miner),
        ("DECLARE", _run_declare),
    ]

    results: List[ModelResult] = []
    timed_out = False

    import multiprocessing as _mp

    for model_name, runner in runners:
        elapsed_so_far = time.perf_counter() - global_start
        remaining = timeout_seconds - elapsed_so_far
        if remaining <= 0:
            timed_out = True
            results.append(ModelResult(
                model_name=model_name,
                fitness=None, precision=None, f1_score=None,
                cfs_score=cfs,
                execution_time_ms=0.0,
                error="Skipped: global timeout reached.",
            ))
            continue

        _q = _mp.Queue()
        _p = _mp.Process(target=_benchmark_model_worker, args=(runner, log, cfs, n_events, _q))
        _p.start()
        _p.join(timeout=remaining)

        if _p.is_alive():
            _p.terminate()
            _p.join(timeout=2.0)
            if _p.is_alive():
                _p.kill()
                _p.join()
            
            timed_out = True
            results.append(ModelResult(
                model_name=model_name,
                fitness=None, precision=None, f1_score=None,
                cfs_score=cfs,
                execution_time_ms=round(remaining * 1000, 1),
                error=f"Timed out after {remaining:.1f}s — dataset too large for this model within the global timeout.",
            ))
            continue

        if _q.empty():
            timed_out = True
            results.append(ModelResult(
                model_name=model_name,
                fitness=None, precision=None, f1_score=None,
                cfs_score=cfs,
                execution_time_ms=round(remaining * 1000, 1),
                error="Model runner process exited without returning a result.",
            ))
            continue

        _status, _payload = _q.get()
        if _status == "error":
            results.append(ModelResult(
                model_name=model_name,
                fitness=None, precision=None, f1_score=None,
                cfs_score=cfs,
                execution_time_ms=round(remaining * 1000, 1),
                error=_payload,
            ))
        else:
            results.append(_payload)

    # ── Determine winner ───────────────────────────────────────────────────
    winner, justification = _pick_winner(results)

    return BenchmarkReport(
        results=results,
        winner=winner,
        winner_justification=justification,
        dataset_summary=summary,
        timed_out=timed_out,
    )
