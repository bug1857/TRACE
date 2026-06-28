'use client';

import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import SectionDivider from '@/components/shared/SectionDivider';
import { useAnalysis } from '@/lib/AnalysisContext';
import { mockForecastingData, mockCarbonBudgetMonths } from '@/lib/mockData';
import { ForecastingBaseline } from '@/lib/types';
import { Info, AlertTriangle } from 'lucide-react';

export default function ForecastingPage() {
  const { analysis } = useAnalysis();

  const hasAnalysis = !!analysis;
  const isReal = !!(analysis && analysis.forecasting);

  if (!hasAnalysis) {
    return <div>Loading...</div>;
  }

  // Derive forecasting data
  const forecasting = (analysis?.forecasting) || mockForecastingData;

  // Derive historical data for the chart
  const historicalBudget = (analysis && analysis.carbonBudget && analysis.carbonBudget.length > 0)
    ? analysis.carbonBudget
    : mockCarbonBudgetMonths;

  // Only plot months that have actual values
  const actualMonths = historicalBudget.filter(m => m.actual > 0);

  // Layout variables for the chart
  const hasData = actualMonths.length > 0;
  const bestBaseline = forecasting.bestBaseline;
  const forecastVal = forecasting.forecastNextMonth?.predictedActualKg ?? 0;

  const actuals = actualMonths.map(m => m.actual);
  const allValues = [...actuals];
  if (forecasting.dataAvailable && forecastVal > 0) {
    allValues.push(forecastVal);
  }

  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 10000;
  const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;
  const valRange = maxVal - minVal || 1;

  // Margins & dimensions for SVG viewBox="0 0 600 220"
  // Width: 600. Height: 220. Plot area: X [50 to 550], Y [20 to 180]
  const totalPointsCount = actualMonths.length + (forecasting.dataAvailable && forecastVal > 0 ? 1 : 0);

  const chartPoints = actualMonths.map((m, index) => {
    const x = 50 + (index / Math.max(1, totalPointsCount - 1)) * 500;
    const y = 180 - ((m.actual - minVal) / valRange) * 160;
    return { x, y, label: m.month, actual: m.actual };
  });

  const pathD = chartPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Next-month forecast coordinates
  const lastPt = chartPoints[chartPoints.length - 1];
  const forecastX = 50 + ((totalPointsCount - 1) / Math.max(1, totalPointsCount - 1)) * 500;
  const forecastY = 180 - ((forecastVal - minVal) / valRange) * 160;
  const forecastPathD = lastPt && forecasting.dataAvailable && forecastVal > 0
    ? `M ${lastPt.x} ${lastPt.y} L ${forecastX} ${forecastY}`
    : '';

  // Table columns definition
  const columns: Column<ForecastingBaseline>[] = [
    {
      header: 'Baseline Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="font-mono font-medium flex items-center gap-2">
          <span>{row.name}</span>
          {row.name === bestBaseline && (
            <span className="text-[9px] bg-trace-success-light text-[#2a7b56] px-1.5 py-0.5 rounded-[3px] font-sans font-bold uppercase tracking-wider">
              Best Fit
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Applicable',
      accessorKey: 'applicable',
      sortable: true,
      cell: (row) => (
        <span className={`text-[12px] font-sans ${row.applicable ? 'text-[#2a7b56] font-medium' : 'text-[#5e5750]'}`}>
          {row.applicable ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'MAE (kg CO2e)',
      accessorKey: 'mae',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className="font-mono">
          {row.applicable && row.mae !== null ? row.mae.toFixed(1) : '—'}
        </span>
      )
    },
    {
      header: 'MAPE (%)',
      accessorKey: 'mape',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className="font-mono">
          {row.applicable && row.mape !== null ? `${row.mape.toFixed(1)}%` : '—'}
        </span>
      )
    },
    {
      header: 'Model Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        if (!row.applicable) {
          return <StatusBadge status="warning" label="Not enough data" />;
        }
        if (row.name === bestBaseline) {
          return <StatusBadge status="pass" label="Best Fit Model" />;
        }
        return <StatusBadge status="info" label="Benchmarked" />;
      }
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <DemoDataBanner show={!isReal} />
      <PageHeader
        title="Demand & Emissions Forecasting"
        subtitle="Multi-baseline benchmarking to forecast next month's carbon emissions from historical trends."
      />

      {!forecasting.dataAvailable ? (
        /* Insufficient data view (intentional, clean state) */
        <div className="border border-border bg-background p-8 rounded-md shadow-sm max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-trace-warning-light text-trace-warning p-3 rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-3 font-sans">
              <h3 className="text-[16px] font-medium text-foreground">
                Insufficient Historical Baseline Data
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {forecasting.insufficientDataNote || 
                  'The uploaded dataset does not contain enough chronological monthly intervals to compute reliable statistical forecasts.'}
              </p>
              <div className="text-[12px] text-[#5e5750] bg-card p-3 rounded-[3px] border border-border font-mono leading-normal">
                Requirements: Minimum of {forecasting.holdoutMonths + 3} months of active ledger history needed to configure the training & backtest holdout split correctly.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Rich Forecasting Dashboard View */
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Best Baseline"
              value={bestBaseline || 'N/A'}
            />
            <StatCard
              label="Next Month Forecast"
              value={forecastVal ? Math.round(forecastVal).toLocaleString() : '0'}
              unit="kg CO₂e"
            />
            <StatCard
              label="Training History"
              value={forecasting.trainMonths}
              unit="months"
            />
            <StatCard
              label="Backtest Holdout"
              value={forecasting.holdoutMonths}
              unit="months"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6 items-start">
            {/* Left: Model Benchmarking Table */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-sans font-medium text-foreground uppercase tracking-wider">
                Baseline Model Comparisons
              </h3>
              <DataTable
                columns={columns}
                data={forecasting.baselines.map((b, i) => ({ ...b, id: `model-${i}` }))}
              />
            </div>

            {/* Right: SVG Trend Line Chart */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-sans font-medium text-foreground uppercase tracking-wider">
                Emissions Forecast Trend
              </h3>
              <div className="border border-border bg-background p-5 rounded-md shadow-sm">
                <div className="h-[220px] w-full relative select-none">
                  {hasData ? (
                    <svg className="w-full h-full font-sans" viewBox="0 0 600 220" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="50" y1="20" x2="550" y2="20" stroke="#2E2A2A" strokeDasharray="3" />
                      <line x1="50" y1="60" x2="550" y2="60" stroke="#2E2A2A" strokeDasharray="3" />
                      <line x1="50" y1="100" x2="550" y2="100" stroke="#2E2A2A" strokeDasharray="3" />
                      <line x1="50" y1="140" x2="550" y2="140" stroke="#2E2A2A" strokeDasharray="3" />
                      <line x1="50" y1="180" x2="550" y2="180" stroke="#2E2A2A" strokeWidth="1" />

                      {/* Historical actual emissions line */}
                      {pathD && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#D37A53"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Forecast projection line */}
                      {forecastPathD && (
                        <path
                          d={forecastPathD}
                          fill="none"
                          stroke='var(--color-trace-warning, #F59E0B)'
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Historical points */}
                      {chartPoints.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="4.5" fill="#D37A53" stroke="var(--background)" strokeWidth="1.5" />
                          {/* Label X-axis for every 2nd month or if it's the last month to prevent clutter */}
                          {(i % 2 === 0 || i === chartPoints.length - 1) && (
                            <text
                              x={pt.x}
                              y="202"
                              fill="#9A9188"
                              className="text-[9px] font-mono font-medium"
                              textAnchor="middle"
                            >
                              {pt.label}
                            </text>
                          )}
                        </g>
                      ))}

                      {/* Forecasted Point */}
                      {forecasting.dataAvailable && forecastVal > 0 && (
                        <g>
                          <circle cx={forecastX} cy={forecastY} r="6.5" fill="var(--color-trace-warning, #F59E0B)" stroke="var(--background)" strokeWidth="2" />
                          <text
                            x={forecastX}
                            y="202"
                            fill="var(--color-trace-warning, #F59E0B)"
                            className="text-[9px] font-mono font-bold"
                            textAnchor="middle"
                          >
                            Forecast
                          </text>
                          {/* Highlight forecasted value text above the point */}
                          <text
                            x={forecastX}
                            y={forecastY - 12}
                            fill="var(--color-trace-warning, #F59E0B)"
                            className="text-[9.5px] font-mono font-bold"
                            textAnchor="middle"
                          >
                            {Math.round(forecastVal)} kg
                          </text>
                        </g>
                      )}
                    </svg>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[#5e5750] font-sans">
                      No chart data available
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground font-sans justify-center select-none border-t border-border pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-primary rounded-full inline-block"></span>
                    <span>Historical Actuals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 border-t-2 border-dashed border-trace-warning inline-block"></span>
                    <span>Forecast Projection ({bestBaseline})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SectionDivider />

          {/* Model info card footer */}
          <div className="border border-border bg-background p-4 rounded-md flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-[13px] text-muted-foreground leading-relaxed font-sans">
              <span className="font-semibold text-foreground">How forecasting works:</span> The engine automatically splits historical carbon ledger entries into a training set and a 3-month holdout set. Four standard models are benchmarked (Naive, Moving Average, Linear Trend, and Seasonal Naive) using Mean Absolute Error (MAE) and Mean Absolute Percentage Error (MAPE). The model with the lowest MAE is selected as the Best Fit Model to forecast next month&apos;s emissions.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
