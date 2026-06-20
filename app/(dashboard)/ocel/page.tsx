'use client';

import React, { useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, FileSpreadsheet, Play, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import FileUpload from '@/components/shared/FileUpload';
import StatCard from '@/components/shared/StatCard';
import { mockOcelNodes, mockOcelEdges, mockOcelMetadata } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

export default function OcelPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsAnalyzed(false); // reset state on new file
  };

  const handleRunAnalysis = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnalyzed(true);
    }, 1500); // simulate 1.5s analysis
  };

  const loadDemoData = () => {
    const file = new File([''], 'louis_india_q3_sc.csv', { type: 'text/csv' });
    setSelectedFile(file);
    setIsAnalyzed(true);
  };

  // Map nodes and edges for React Flow
  const reactFlowNodes = mockOcelNodes.map((node, index) => {
    // Basic linear horizontal flow layout
    const xCoord = 50 + index * 200;
    const yCoord = 100 + (index % 2) * 90;

    return {
      id: node.id,
      data: {
        label: (
          <div className="p-1">
            <div className="font-sans font-medium text-[12px] text-[#1A1917]">{node.label}</div>
            <div className="font-mono text-[10px] text-[#6B6963] mt-0.5">Freq: {node.frequency}</div>
            <div className="font-mono text-[9px] text-[#9B9891]">Duration: {node.avgDuration}</div>
          </div>
        )
      },
      position: { x: xCoord, y: yCoord },
      style: {
        background: '#FAFAF8',
        border: '1px solid #E2E0D8',
        borderRadius: '6px',
        color: '#1A1917',
        width: 170,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    };
  });

  const reactFlowEdges = mockOcelEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: `${edge.frequency}x (${edge.avgDelay})`,
    labelStyle: { fill: '#6B6963', fontSize: 10, fontFamily: 'monospace', fontWeight: 500 },
    labelBgPadding: [4, 2],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#F3F2EE', color: '#6B6963' },
    style: { stroke: '#9B9891', strokeWidth: 1.5 },
    animated: true
  }));

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="OCEL 2.0 Process Mining"
        subtitle="Upload Object-Centric Event Logs to map process paths, throughput, and carbon footprints."
        action={
          !isAnalyzed && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoData}
              className="h-[32px] text-[12px] text-[#2D6A4F] border-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] rounded-md"
            >
              Load Demo Event Log
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 flex-1 items-start">
        {/* Left Column: Upload Panel */}
        <div className="space-y-4">
          <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-5 rounded-md shadow-sm">
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider mb-3">
              Event Log Upload
            </h3>
            
            <FileUpload onFileSelect={handleFileSelect} placeholder="Drop OCEL 2.0 CSV/XML" />

            {selectedFile && (
              <div className="mt-4 border-t border-[#E2E0D8] pt-4 space-y-3.5">
                <div className="flex items-start gap-2.5 p-2 bg-[#F3F2EE] rounded-md border border-[#E2E0D8]">
                  <FileSpreadsheet className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-[12px] font-sans font-medium text-[#1A1917] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-[#6B6963] font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {isAnalyzed ? (
                  <div className="space-y-2 p-2.5 border border-[#E2E0D8] bg-[#E8F0EB] text-[#2D6A4F] rounded-md text-[12px] font-sans">
                    <div className="flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Analysis Completed</span>
                    </div>
                    <div className="mt-2 space-y-1 text-[#6B6963] font-mono text-[11px] leading-relaxed">
                      <div>File: {mockOcelMetadata.filename}</div>
                      <div>Events: {mockOcelMetadata.totalEvents.toLocaleString()}</div>
                      <div>Cases: {mockOcelMetadata.caseCount}</div>
                      <div>Activities: {mockOcelMetadata.activityCount}</div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="w-full h-[36px] bg-[#2D6A4F] hover:bg-[#166534] disabled:bg-[#2D6A4F]/60 text-white font-sans text-[13px] font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Analyzing Event Log...' : 'Run Analysis'}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Process Graph Area */}
        <div className="flex flex-col gap-6">
          <div className="border border-[#E2E0D8] rounded-md bg-[#FAFAF8] h-[480px] w-full relative flex items-center justify-center overflow-hidden shadow-sm">
            {isAnalyzed ? (
              <ReactFlow
                nodes={reactFlowNodes}
                edges={reactFlowEdges}
                fitView
                className="w-full h-full"
              >
                <Background color="#E2E0D8" gap={16} />
                <Controls className="react-flow__controls bg-[#FAFAF8] border border-[#E2E0D8] rounded-md shadow-sm" />
              </ReactFlow>
            ) : (
              <div className="text-center p-8">
                <Database className="w-16 h-16 text-[#E2E0D8] mx-auto mb-4" strokeWidth={1.5} />
                <h4 className="text-[14px] font-sans font-medium text-[#1A1917] mb-1">
                  Visualize Process Graph
                </h4>
                <p className="text-[13px] text-[#6B6963] max-w-xs leading-normal">
                  Upload an event log on the left or load demo data to view the interactive process map.
                </p>
              </div>
            )}
          </div>

          {/* Stats Row */}
          {isAnalyzed && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Cases" value={89} />
              <StatCard label="Unique Activities" value={12} />
              <StatCard label="Process Variants" value={18} />
              <StatCard label="Avg Case Duration" value="14.8" unit="h" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
