'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload, AlertTriangle, Download, Database, CheckCircle2,
  Clock, Loader2, TrendingUp
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ForecastingBenchmarkingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
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

  const runBenchmark = useCallback(async () => {
    if (!selectedFile) return;
    setIsRunning(true);
    setError(null);
    setResult(null);

    const startMs = Date.now();
    const timer = setInterval(() => setElapsedMs(Date.now() - startMs), 500);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('horizon', '4');
      formData.append('n_folds', '2');
      formData.append('step', '4');
      formData.append('min_train_size', '52');
      formData.append('tft_epochs', '10');

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/benchmark/forecast`, {
        method: 'POST',
        body: formData,
      });

      let data = await res.json();

      if (res.ok && data.job_id) {
        const jobId = data.job_id;
        const poll = async (): Promise<any> => {
          const statusRes = await fetch(`${baseUrl}/api/benchmarking/status/${jobId}`);
          if (!statusRes.ok) throw new Error(`Status check failed: HTTP ${statusRes.status}`);
          const statusData = await statusRes.json();
          if (statusData.status === 'completed') {
            return statusData.result;
          } else if (statusData.status === 'error') {
            throw new Error(statusData.error || 'Job failed');
          } else {
            await new Promise(r => setTimeout(r, 2000));
            return poll();
          }
        };
        const finalResult = await poll();
        setResult(finalResult);
      } else {
        throw new Error(data.detail || data.error || 'Failed to start benchmark');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      clearInterval(timer);
      setIsRunning(false);
    }
  }, [selectedFile]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Demand Forecasting Benchmark"
        subtitle="Evaluate state-of-the-art time series models (ARIMA, ETS, Prophet, XGBoost, TFT) on your demand datasets."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
            <h3 className="font-sans font-semibold text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-trace-accent" />
              Upload Dataset
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Upload a processed weekly demand CSV (with <code>series_id, week_start, y</code>) or a raw DataCo CSV to auto-aggregate.
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragActive
                  ? 'border-trace-accent bg-trace-accent/5'
                  : 'border-[var(--border)] hover:border-trace-accent/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <Upload className="w-8 h-8 mx-auto mb-4 text-[var(--muted-foreground)]" />
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="font-medium text-sm text-[var(--foreground)]">{selectedFile.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Click or drag and drop your CSV file here.
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <Button
              className="w-full h-12 text-base font-semibold"
              disabled={!selectedFile || isRunning}
              onClick={runBenchmark}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running... ({(elapsedMs / 1000).toFixed(1)}s)
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Run Forecast Benchmark
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
                <h3 className="font-sans font-semibold text-lg mb-6">Model Performance Summary</h3>
                <div className="h-80 w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.summary}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                      <XAxis dataKey="model" stroke="#888" />
                      <YAxis yAxisId="left" orientation="left" stroke="#888" label={{ value: 'RMSE', angle: -90, position: 'insideLeft', fill: '#888' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#888" label={{ value: 'MAPE (%)', angle: 90, position: 'insideRight', fill: '#888' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="mean_rmse" name="Mean RMSE" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="mean_mape" name="Mean MAPE %" fill="#34D399" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-[var(--background)] text-[var(--muted-foreground)]">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Model</th>
                        <th className="px-4 py-3">Mean RMSE</th>
                        <th className="px-4 py-3">Mean MAPE</th>
                        <th className="px-4 py-3">Avg Runtime (s)</th>
                        <th className="px-4 py-3 rounded-tr-lg">Folds Evaluated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.summary.map((row: any) => (
                        <tr key={row.model} className="border-b border-[var(--border)] hover:bg-[var(--background)] transition-colors">
                          <td className="px-4 py-3 font-medium">{row.model}</td>
                          <td className="px-4 py-3">{row.mean_rmse?.toFixed(2) || 'N/A'}</td>
                          <td className="px-4 py-3">{row.mean_mape?.toFixed(2) || 'N/A'}%</td>
                          <td className="px-4 py-3">{row.mean_runtime_sec?.toFixed(2) || 'N/A'}</td>
                          <td className="px-4 py-3">{row.n_folds_evaluated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col items-center justify-center p-8 text-center space-y-4">
              <TrendingUp className="w-16 h-16 text-[var(--border)]" />
              <div className="space-y-2">
                <h3 className="font-sans font-semibold text-xl text-[var(--foreground)]">No Benchmark Results</h3>
                <p className="text-[var(--muted-foreground)] max-w-sm">
                  Upload a demand dataset and run the benchmark to compare forecasting models across rolling origins.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
