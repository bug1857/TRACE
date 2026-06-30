'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import {
  Upload, Trophy, Download, AlertTriangle, CheckCircle2,
  Clock, Loader2, Database,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { BenchmarkReport, ModelResult } from '@/lib/types';

// ── Colour palette for 6 models ─────────────────────────────────────────────
const MODEL_COLORS: Record<string, string> = {
  'Token Replay':    '#2DD4BF',
  'Alignments':      '#818CF8',
  'Footprint':       '#F59E0B',
  'Inductive Miner': '#34D399',
  'Heuristics Miner':'#F472B6',
  'DECLARE':         '#60A5FA',
};

const MODEL_KEYS = [
  'Token Replay', 'Alignments', 'Footprint',
  'Inductive Miner', 'Heuristics Miner', 'DECLARE',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number | null, decimals = 3): string {
  if (v === null || v === undefined) return 'N/A';
  return v.toFixed(decimals);
}

function pct(v: number | null): string {
  if (v === null || v === undefined) return 'N/A';
  return `${(v * 100).toFixed(1)}%`;
}

/** Returns the column-level min/max for green/red colouring. */
function columnExtremes(results: ModelResult[], key: keyof ModelResult) {
  const vals = results
    .map(r => r[key] as number | null)
    .filter((v): v is number => v !== null);
  if (vals.length === 0) return { min: null, max: null };
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

function cellBg(
  value: number | null,
  min: number | null,
  max: number | null,
  invert = false,   // true = lower is better (execution_time)
): string {
  if (value === null || min === null || max === null || min === max) return '';
  const ratio = (value - min) / (max - min); // 0 = worst, 1 = best
  const adjusted = invert ? 1 - ratio : ratio;
  if (adjusted >= 0.9) return 'bg-emerald-500/20 text-emerald-300';
  if (adjusted <= 0.1) return 'bg-red-500/15 text-red-300';
  return '';
}

/** Build radar data from results — normalise execution_time to [0,1] (inverted). */
function buildRadarData(results: ModelResult[]) {
  const maxTime = Math.max(...results.map(r => r.execution_time_ms || 0)) || 1;

  return ['Fitness', 'Precision', 'F1', 'CFS', 'Speed'].map(axis => {
    const entry: Record<string, string | number> = { axis };
    results.forEach(r => {
      if (axis === 'Fitness')    entry[r.model_name] = (r.fitness ?? 0) * 100;
      if (axis === 'Precision')  entry[r.model_name] = (r.precision ?? 0) * 100;
      if (axis === 'F1')         entry[r.model_name] = (r.f1_score ?? 0) * 100;
      if (axis === 'CFS')        entry[r.model_name] = r.cfs_score ?? 0;
      if (axis === 'Speed')      entry[r.model_name] = Math.max(0, 100 - (r.execution_time_ms / maxTime) * 100);
    });
    return entry;
  });
}

/** Client-side CSV export from results array. */
function exportCsv(results: ModelResult[], datasetSummary: BenchmarkReport['dataset_summary']) {
  const headers = ['Model', 'Fitness', 'Precision', 'F1 Score', 'CFS Score', 'Time (ms)', 'Error'];
  const rows = results.map(r => [
    r.model_name,
    r.fitness !== null ? r.fitness.toFixed(4) : 'N/A',
    r.precision !== null ? r.precision.toFixed(4) : 'N/A',
    r.f1_score !== null ? r.f1_score.toFixed(4) : 'N/A',
    r.cfs_score.toFixed(2),
    r.execution_time_ms.toFixed(1),
    r.error ?? '',
  ]);
  const meta = [
    ['# Dataset', `${datasetSummary.cases} cases | ${datasetSummary.events} events | ${datasetSummary.activities} activities | ${datasetSummary.date_range}`],
    [],
    headers,
    ...rows,
  ];
  const csv = meta.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trace_benchmark_results.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Column Mapping UI ────────────────────────────────────────────────────────

interface MappingOverride {
  case_id: string;
  activity: string;
  timestamp: string;
}

function ColumnMappingUI({
  columns,
  override,
  onChange,
}: {
  columns: string[];
  override: MappingOverride;
  onChange: (o: MappingOverride) => void;
}) {
  const fields: Array<{ key: keyof MappingOverride; label: string }> = [
    { key: 'case_id', label: 'Case ID Column' },
    { key: 'activity', label: 'Activity Column' },
    { key: 'timestamp', label: 'Timestamp Column' },
  ];
  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 space-y-4">
      <div className="flex items-center gap-2 text-yellow-300 text-[12px] font-sans">
        <AlertTriangle className="w-4 h-4" />
        <span>
          Auto-detection confidence is low for one or more required columns.
          Please confirm the correct column for each field.
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {fields.map(f => (
          <div key={f.key} className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-trace-muted font-sans">
              {f.label}
            </label>
            <select
              value={override[f.key]}
              onChange={e => onChange({ ...override, [f.key]: e.target.value })}
              className="text-[12px] font-mono bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-trace-accent"
            >
              <option value="">-- select --</option>
              {columns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function BenchmarkingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BenchmarkReport | null>(null);

  // Column mapping override state (shown when auto-detect fails)
  const [needsMapping, setNeedsMapping] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [mappingOverride, setMappingOverride] = useState<MappingOverride>({
    case_id: '',
    activity: '',
    timestamp: '',
  });

  // ── File selection handlers ──────────────────────────────────────────────
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setReport(null);
    setError(null);
    setNeedsMapping(false);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = () => setIsDragActive(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Run benchmark ────────────────────────────────────────────────────────
  const runBenchmark = useCallback(async () => {
    if (!selectedFile) return;
    setIsRunning(true);
    setError(null);
    setReport(null);

    const startMs = Date.now();
    const timer = setInterval(() => setElapsedMs(Date.now() - startMs), 500);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      if (needsMapping && mappingOverride.case_id && mappingOverride.activity && mappingOverride.timestamp) {
        const overridePayload = {
          case_id: mappingOverride.case_id,
          activity: mappingOverride.activity,
          timestamp: mappingOverride.timestamp,
        };
        formData.append('mapping_override', JSON.stringify(overridePayload));
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/benchmarking/run`, {
        method: 'POST',
        body: formData,
      });

      let data = await res.json();

      if (res.ok && data.job_id) {
        const jobId = data.job_id;
        const poll = async (): Promise<any> => {
          const statusRes = await fetch(`${baseUrl}/api/benchmarking/status/${jobId}`);
          if (!statusRes.ok) {
            throw new Error(`Status check failed: HTTP ${statusRes.status}`);
          }
          const statusData = await statusRes.json();
          if (statusData.status === 'completed') {
            if (!statusData.result || !statusData.result.dataset_summary || !Array.isArray(statusData.result.results)) {
              throw new Error('Benchmark job completed but returned an incomplete result. This usually means the dataset was too large to process within the timeout — try a smaller file.');
            }
            return statusData.result;
          } else if (statusData.status === 'error') {
            throw new Error(statusData.error || 'Benchmarking job failed');
          } else if (statusData.status === 'cancelled') {
            throw new Error('Benchmark job was cancelled.');
          } else {
            await new Promise(r => setTimeout(r, 2000));
            return poll();
          }
        };
        data = await poll();
      }

      if (!res.ok) {
        // Check if it's a column mapping detection failure
        if (res.status === 422 && data.detail?.missing_fields) {
          setAvailableColumns(data.detail.available_columns ?? []);
          setNeedsMapping(true);
          setError('Column auto-detection failed. Please select the correct columns below, then run again.');
        } else {
          const msg =
            typeof data.detail === 'string'
              ? data.detail
              : JSON.stringify(data.detail);
          setError(msg);
        }
        return;
      }

      if (!data || !data.dataset_summary || !Array.isArray(data.results) || !data.winner) {
        setError('Received an incomplete benchmark report from the server. Try again or use a smaller dataset.');
        return;
      }
      setReport(data as BenchmarkReport);
      setNeedsMapping(false);
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error occurred.');
    } finally {
      clearInterval(timer);
      setIsRunning(false);
    }
  }, [selectedFile, needsMapping, mappingOverride]);

  const canRun =
    !!selectedFile &&
    !isRunning &&
    (!needsMapping || (mappingOverride.case_id && mappingOverride.activity && mappingOverride.timestamp));

  // ── Derived display data ─────────────────────────────────────────────────
  const results = report?.results ?? [];
  const fitnessEx   = columnExtremes(results, 'fitness');
  const precisionEx = columnExtremes(results, 'precision');
  const f1Ex        = columnExtremes(results, 'f1_score');
  const cfsEx       = columnExtremes(results, 'cfs_score');
  const timeEx      = columnExtremes(results, 'execution_time_ms');

  const radarData = results.length > 0 ? buildRadarData(results) : [];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.03)_0%,_transparent_60%)] pointer-events-none" />
      <div className="flex flex-col flex-1 pt-2 pb-16 relative z-10">

        {/* ── Page Header ── */}
        <PageHeader
          title="Process Conformance Benchmark"
          subtitle="Compare 6 conformance models on your event log. CFS is TRACE's novel metric — not available in Celonis or OCEAn."
        />

        {/* ── Upload Zone ── */}
        <div className="mt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[160px] ${
              isDragActive
                ? 'border-trace-accent bg-trace-accent/5'
                : selectedFile
                ? 'border-trace-success/50 bg-trace-success/5'
                : 'border-white/[0.12] bg-white/[0.03] hover:border-white/[0.2] hover:bg-white/[0.05]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleInputChange}
            />
            {selectedFile ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-trace-success mb-2" />
                <p className="text-[13px] font-sans font-medium text-trace-text">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-trace-muted font-sans mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Click or drop to replace
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-trace-muted mb-3" strokeWidth={1.5} />
                <p className="text-[13px] font-sans font-medium text-trace-text">
                  Drop your OCEL 2.0 CSV here, or click to select
                </p>
                <p className="text-[11px] text-trace-muted font-sans mt-1">
                  Required columns: case ID, activity, timestamp · Max 50 MB
                </p>
              </>
            )}
          </div>

          {/* Column mapping override */}
          {needsMapping && (
            <div className="mt-4">
              <ColumnMappingUI
                columns={availableColumns}
                override={mappingOverride}
                onChange={setMappingOverride}
              />
            </div>
          )}

          {/* Run button */}
          <div className="mt-4 flex items-center gap-4">
            <Button
              onClick={runBenchmark}
              disabled={!canRun}
              className="h-[40px] px-8 bg-trace-accent hover:bg-trace-accent/90 disabled:bg-trace-accent/30 text-[#0A0A0A] font-semibold text-[13px] rounded-lg flex items-center gap-2 transition-all"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Benchmark…</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Run Benchmark</span>
                </>
              )}
            </Button>

            {isRunning && (
              <div className="flex items-center gap-2 text-trace-muted text-[12px] font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{(elapsedMs / 1000).toFixed(1)}s elapsed</span>
                <span className="text-trace-subtle">· up to 120s total</span>
              </div>
            )}

            {report && !isRunning && (
              <button
                onClick={() => exportCsv(report.results, report.dataset_summary)}
                className="flex items-center gap-1.5 text-[12px] font-sans text-trace-muted hover:text-trace-text transition-colors px-3 py-2 rounded-lg border border-white/[0.08] hover:border-white/[0.15]"
              >
                <Download className="w-3.5 h-3.5" />
                Export Results CSV
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-[12px] font-sans">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Partial timeout warning */}
          {report?.timed_out && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 text-[12px] font-sans">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Benchmark timed out after 120 s. Showing partial results — some models were skipped.
              </span>
            </div>
          )}
        </div>

        {/* ── Results ── */}
        {report && (
          <>
            {/* Dataset summary strip */}
            <div className="mt-8 flex items-center gap-6 flex-wrap">
              {[
                ['Cases', report.dataset_summary.cases.toLocaleString()],
                ['Events', report.dataset_summary.events.toLocaleString()],
                ['Activities', report.dataset_summary.activities.toLocaleString()],
                ['Date Range', report.dataset_summary.date_range],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-trace-muted font-sans">{label}</span>
                  <span className="text-[14px] font-mono font-medium text-trace-text">{value}</span>
                </div>
              ))}
            </div>

            {/* Winner Card */}
            <div className="mt-6 relative rounded-xl border border-trace-accent/30 bg-gradient-to-br from-trace-accent/10 to-trace-accent/5 backdrop-blur-xl p-5 overflow-hidden">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-trace-accent/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-trace-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-trace-text font-sans">
                      {report.winner.model_name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-trace-accent/20 text-trace-accent uppercase tracking-wider">
                      Recommended for this dataset
                    </span>
                  </div>
                  <p className="text-[12px] text-trace-muted font-sans leading-relaxed">
                    {report.winner_justification}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[12px] font-mono flex-wrap">
                    <span className="text-trace-subtle">
                      Fitness: <span className="text-trace-text">{pct(report.winner.fitness)}</span>
                    </span>
                    <span className="text-trace-subtle">
                      Precision: <span className="text-trace-text">{pct(report.winner.precision)}</span>
                    </span>
                    <span className="text-trace-subtle">
                      F1: <span className="text-trace-text">{pct(report.winner.f1_score)}</span>
                    </span>
                    <span className="text-trace-accent font-semibold">
                      ★ CFS: {report.winner.cfs_score.toFixed(1)}
                    </span>
                    <span className="text-trace-subtle">
                      Time: <span className="text-trace-text">{report.winner.execution_time_ms.toFixed(0)} ms</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results table + Radar chart grid */}
            <div className="mt-6 grid grid-cols-[1fr_380px] gap-4">

              {/* Results Table */}
              <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <table className="w-full text-[12px] font-sans">
                    <thead>
                      <tr className="border-b border-white/[0.07]">
                        <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-trace-muted font-sans">
                          Model
                        </th>
                        <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-trace-muted font-sans">
                          Fitness
                        </th>
                        <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-trace-muted font-sans">
                          Precision
                        </th>
                        <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-trace-muted font-sans">
                          F1
                        </th>
                        <th className="text-right px-3 py-3 text-[10px] uppercase tracking-wider font-sans bg-trace-accent/10">
                          <span className="text-trace-accent">★ CFS</span>
                          <span className="ml-1 text-[8px] bg-trace-accent/20 text-trace-accent px-1 py-0.5 rounded font-mono leading-none">
                            NOVEL
                          </span>
                        </th>
                        <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-trace-muted font-sans">
                          Time (ms)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => {
                        const isWinner = r.model_name === report.winner.model_name && !r.error;
                        return (
                          <tr
                            key={r.model_name}
                            className={`border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02] ${
                              isWinner ? 'bg-trace-accent/5' : ''
                            }`}
                          >
                            {/* Model name */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: MODEL_COLORS[r.model_name] ?? '#888' }}
                                />
                                <span className={`font-medium ${isWinner ? 'text-trace-accent' : 'text-trace-text'}`}>
                                  {r.model_name}
                                  {isWinner && (
                                    <Trophy className="w-3 h-3 inline ml-1 text-trace-accent" />
                                  )}
                                </span>
                              </div>
                              {r.error && (
                                <span className="block text-[10px] text-red-400 mt-0.5 font-mono max-w-[250px] whitespace-normal leading-relaxed">
                                  Error: {r.error}
                                </span>
                              )}
                            </td>

                            {/* Fitness */}
                            <td className={`px-4 py-3 text-right font-mono rounded-sm ${cellBg(r.fitness, fitnessEx.min, fitnessEx.max)}`}>
                              {pct(r.fitness)}
                            </td>

                            {/* Precision */}
                            <td className={`px-4 py-3 text-right font-mono ${
                              r.model_name === 'DECLARE'
                                ? 'text-trace-subtle italic'
                                : cellBg(r.precision, precisionEx.min, precisionEx.max)
                            }`}>
                              {r.model_name === 'DECLARE' ? 'N/A' : pct(r.precision)}
                            </td>

                            {/* F1 */}
                            <td className={`px-4 py-3 text-right font-mono ${
                              r.model_name === 'DECLARE'
                                ? 'text-trace-subtle italic'
                                : cellBg(r.f1_score, f1Ex.min, f1Ex.max)
                            }`}>
                              {r.model_name === 'DECLARE' ? 'N/A' : pct(r.f1_score)}
                            </td>

                            {/* CFS — accent background always */}
                            <td className={`px-3 py-3 text-right font-mono font-semibold bg-trace-accent/10 ${cellBg(r.cfs_score, cfsEx.min, cfsEx.max)}`}>
                              <span className="text-trace-accent">{r.cfs_score.toFixed(1)}</span>
                            </td>

                            {/* Time */}
                            <td className={`px-4 py-3 text-right font-mono ${r.error ? 'text-trace-subtle' : cellBg(r.execution_time_ms, timeEx.min, timeEx.max, true)}`}>
                              {r.error ? '—' : r.execution_time_ms.toFixed(0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* CFS tooltip footer */}
                  <div className="px-4 py-2 border-t border-white/[0.04] bg-trace-accent/5">
                    <p className="text-[10px] text-trace-muted font-sans">
                      <span className="text-trace-accent font-semibold">★ CFS</span>
                      {' '}— Carbon Fitness Score measures how well process conformance aligns with carbon
                      efficiency targets. This metric is exclusive to TRACE and is not available in Celonis or OCEAn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-5 overflow-hidden">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
                <h3 className="text-[12px] font-sans font-medium text-trace-text mb-4 relative z-10">
                  Model Comparison Radar
                </h3>
                <div className="relative z-10">
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData} margin={{ top: 8, right: 20, left: 20, bottom: 8 }}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis
                        dataKey="axis"
                        tick={{ fontSize: 10, fill: '#7D8590', fontFamily: 'inherit' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 9, fill: '#484F58' }}
                        tickCount={4}
                      />
                      {MODEL_KEYS.filter(k => results.find(r => r.model_name === k)).map(key => (
                        <Radar
                          key={key}
                          name={key}
                          dataKey={key}
                          stroke={MODEL_COLORS[key]}
                          fill={MODEL_COLORS[key]}
                          fillOpacity={0.08}
                          strokeWidth={1.5}
                        />
                      ))}
                      <Tooltip
                        contentStyle={{
                          background: '#111',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6,
                          fontSize: 11,
                        }}
                        formatter={(v: any) => [`${Number(v).toFixed(1)}`, '']}
                      />
                      <Legend
                        iconSize={8}
                        wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                        formatter={(value) => (
                          <span style={{ color: MODEL_COLORS[value] ?? '#888', fontSize: 10 }}>
                            {value}
                          </span>
                        )}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
