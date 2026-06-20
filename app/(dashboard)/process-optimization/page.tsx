'use client';

import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import { mockBottlenecks, mockReworks } from '@/lib/mockData';
import { BottleneckActivity, ReworkActivity } from '@/lib/types';
import SectionDivider from '@/components/shared/SectionDivider';

export default function ProcessOptimizationPage() {
  
  // Custom cell coloring for average wait times
  const getWaitTimeStyle = (row: BottleneckActivity) => {
    if (row.status === 'critical') {
      return {
        bg: 'bg-[#FDECEA]',
        text: 'text-[#C0392B]'
      };
    }
    if (row.status === 'warning') {
      return {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#B45309]'
      };
    }
    return {
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]'
    };
  };

  const bottleneckColumns: Column<BottleneckActivity>[] = [
    {
      header: 'Activity',
      accessorKey: 'activity',
      sortable: true
    },
    {
      header: 'Average Wait Time',
      accessorKey: 'avgWaitTime',
      isNumeric: true,
      sortable: true,
      cell: (row) => {
        const style = getWaitTimeStyle(row);
        return (
          <div className={`py-1.5 px-3 -mx-4 -my-2 font-mono font-medium rounded-sm text-center ${style.bg} ${style.text}`}>
            {row.avgWaitTime.toFixed(1)} h
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        const statusMap: Record<string, string> = {
          critical: 'Critical Queue',
          warning: 'Moderate Delay',
          pass: 'Optimized Workflow'
        };
        const style = getWaitTimeStyle(row);
        return (
          <span className={`text-[12px] font-sans font-medium ${style.text}`}>
            {statusMap[row.status]}
          </span>
        );
      }
    }
  ];

  const reworkColumns: Column<ReworkActivity>[] = [
    {
      header: 'Activity',
      accessorKey: 'activity',
      sortable: true
    },
    {
      header: 'Rework Count',
      accessorKey: 'reworkCount',
      isNumeric: true,
      sortable: true
    },
    {
      header: 'Rework Percentage',
      accessorKey: 'reworkPercent',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.reworkPercent.toFixed(1)}%</span>
    },
    {
      header: 'Carbon Impact',
      accessorKey: 'carbonImpact',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span className="text-[#C0392B]">+{row.carbonImpact.toLocaleString()} kg CO₂e</span>
    }
  ];

  // Simulated data for duration distribution chart (Observable Plot style bar chart)
  const durationBuckets = [
    { range: '0-4 hours', count: 18, percentage: 20 },
    { range: '4-8 hours', count: 32, percentage: 36 },
    { range: '8-12 hours', count: 24, percentage: 27 },
    { range: '12-24 hours', count: 11, percentage: 12 },
    { range: '24+ hours', count: 4, percentage: 5 }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Process Optimization"
        subtitle="Identify operational bottlenecks, rework loops, and analyze their direct carbon emissions overhead."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Bottleneck Heatmap */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
            Bottleneck Queue Heatmap
          </h3>
          <DataTable columns={bottleneckColumns} data={mockBottlenecks} />
        </div>

        {/* Right Column: Rework Rate */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
            Rework Rates & Carbon Overhead
          </h3>
          <DataTable columns={reworkColumns} data={mockReworks} />
        </div>
      </div>

      <SectionDivider />

      {/* Bottom Section: Duration Distribution Chart */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
            Case Duration Distribution
          </h3>
          <p className="text-[12px] text-[#6B6963] font-sans">
            Distribution showing the elapsed duration range across all 89 analyzed cases.
          </p>
        </div>

        <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-6 rounded-md shadow-sm">
          {/* Observable Plot Mock Chart */}
          <div className="space-y-4 max-w-[700px] select-none">
            {durationBuckets.map((bucket) => (
              <div key={bucket.range} className="flex items-center gap-4 text-[13px]">
                {/* Bucket label */}
                <div className="w-[100px] text-right text-[#6B6963] font-sans shrink-0 font-medium">
                  {bucket.range}
                </div>
                
                {/* Horizontal Bar */}
                <div className="flex-1 bg-[#F3F2EE] h-[22px] border border-[#E2E0D8] rounded-[3px] overflow-hidden flex items-center">
                  <div
                    style={{ width: `${bucket.percentage}%` }}
                    className="bg-[#2D6A4F] h-full flex items-center justify-end px-2 text-[10px] font-mono font-medium text-white transition-all"
                  >
                    {bucket.percentage}%
                  </div>
                </div>
                
                {/* Numeric value */}
                <div className="w-[80px] font-mono text-[#1A1917] text-left shrink-0">
                  {bucket.count} cases
                </div>
              </div>
            ))}

            {/* X-Axis labels */}
            <div className="flex justify-between text-[10px] text-[#9B9891] border-t border-[#E2E0D8] pt-1.5 pl-[116px] font-mono">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
