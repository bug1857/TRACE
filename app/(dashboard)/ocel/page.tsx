'use client';

import React, { useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, FileSpreadsheet, Play, CheckCircle, FlaskConical } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import FileUpload from '@/components/shared/FileUpload';
import StatCard from '@/components/shared/StatCard';
import { mockOcelNodes, mockOcelEdges, mockOcelMetadata } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { uploadOcelFile } from '@/lib/api';
import { useAnalysis, UploadResponse } from '@/lib/AnalysisContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { ColumnMapping, MappingField } from '@/lib/types';
import { AxiosError } from 'axios';

export default function OcelPage() {
  const { analysis, setAnalysis } = useAnalysis();
  const { activeWorkspaceId } = useWorkspace();

  // Real backend states / Derived states
  const [isDemo, setIsDemo] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(() => {
    if (analysis?.metadata) {
      return new File([''], analysis.metadata.filename || 'uploaded_log.csv', { type: 'text/csv' });
    }
    return null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [errorType, setErrorType] = useState<'422' | '500' | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    missingFields: string[];
    availableColumns: string[];
    detectedMapping?: ColumnMapping;
  } | null>(null);

  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedWater, setSelectedWater] = useState<string>('');
  const [selectedElectricity, setSelectedElectricity] = useState<string>('');
  const [selectedCost, setSelectedCost] = useState<string>('');

  const [isAdjustingMapping, setIsAdjustingMapping] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);

  const isAnalyzed = isDemo || !!analysis?.metadata;

  const displayedFileName = isDemo 
    ? mockOcelMetadata.filename 
    : (analysis?.metadata?.filename || selectedFile?.name || null);

  const displayedFileSizeStr = isDemo 
    ? 'Demo dataset' 
    : (analysis?.metadata 
        ? 'Active log' 
        : (selectedFile 
            ? `${(selectedFile.size / 1024).toFixed(1)} KB` 
            : ''));

  const [prevWorkspaceId, setPrevWorkspaceId] = useState<number | null>(null);
  if (activeWorkspaceId !== prevWorkspaceId) {
    setPrevWorkspaceId(activeWorkspaceId);
    setSelectedFile(null);
    setErrorType(null);
    setErrorDetails(null);
    setIsAdjustingMapping(false);
  }

  const [prevAnalysis, setPrevAnalysis] = useState<UploadResponse | null>(null);
  if (analysis !== prevAnalysis) {
    setPrevAnalysis(analysis);
    if (analysis?.metadata) {
      setSelectedFile(new File([''], analysis.metadata.filename || 'uploaded_log.csv', { type: 'text/csv' }));
      setErrorType(null);
      setErrorDetails(null);
      setIsAdjustingMapping(false);
    }
  }

  // Helper to read headers from selected file
  const getHeadersFromFile = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      if (file.size === 0) {
        resolve([]);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split('\n')[0];
        const headers = firstLine
          .split(',')
          .map((h) => h.trim().replace(/^["']|["']$/g, ''))
          .filter((h) => h.length > 0);
        resolve(headers);
      };
      reader.onerror = () => resolve([]);
      reader.readAsText(file.slice(0, 10000));
    });
  };

  // Derived state directly from analysis or demo data
  const nodes = isDemo ? mockOcelNodes : (analysis?.nodes || []);
  const edges = isDemo ? mockOcelEdges : (analysis?.edges || []);
  const metadata = isDemo ? mockOcelMetadata : (analysis?.metadata || null);

  const isFieldMissing = (field: string) => {
    return errorDetails?.missingFields?.includes(field) || false;
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setAnalysis(null);
    setIsDemo(false);
    setErrorType(null);
    setErrorDetails(null);
    setIsAdjustingMapping(false);
    try {
      const headers = await getHeadersFromFile(file);
      setParsedHeaders(headers);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAnalysis = async (isManualOverride = false) => {
    if (!selectedFile) return;
    setIsAnalyzing(true);

    let overrideStr: string | undefined = undefined;
    if (isManualOverride) {
      const overrideObj = {
        case_id: selectedCaseId || null,
        activity: selectedActivity || null,
        timestamp: selectedTimestamp || null,
        resource: selectedResource === '— None —' || !selectedResource ? null : selectedResource,
        supplier: selectedSupplier === '— None —' || !selectedSupplier ? null : selectedSupplier,
        water: selectedWater === '— None —' || !selectedWater ? null : selectedWater,
        electricity: selectedElectricity === '— None —' || !selectedElectricity ? null : selectedElectricity,
        cost: selectedCost === '— None —' || !selectedCost ? null : selectedCost
      };
      overrideStr = JSON.stringify(overrideObj);
    } else {
      setErrorType(null);
      setErrorDetails(null);
    }

    try {
      const result = await uploadOcelFile(selectedFile, overrideStr, activeWorkspaceId || undefined);
      setAnalysis(result);
      setIsDemo(false);
      setErrorType(null);
      setErrorDetails(null);
      setIsAdjustingMapping(false);
    } catch (error) {
      console.error(error);
      const err = error as AxiosError<{
        detail?: {
          available_columns?: string[];
          detected_mapping?: ColumnMapping;
          missing_fields?: string[];
        };
        available_columns?: string[];
        detected_mapping?: ColumnMapping;
        missing_fields?: string[];
      }>;
      const status = err.response?.status;
      if (status === 422) {
        const errData = err.response?.data?.detail || err.response?.data;
        setErrorType('422');
        const availableCols = errData?.available_columns || [];
        const detectedMap = (errData?.detected_mapping || {}) as ColumnMapping;

        setErrorDetails({
          missingFields: errData?.missing_fields || [],
          availableColumns: availableCols,
          detectedMapping: detectedMap
        });

        // Pre-populate dropdown states from detected mapping
        setSelectedCaseId(detectedMap.case_id?.column || '');
        setSelectedActivity(detectedMap.activity?.column || '');
        setSelectedTimestamp(detectedMap.timestamp?.column || '');
        setSelectedResource(detectedMap.resource?.column || '— None —');
        setSelectedSupplier(detectedMap.supplier?.column || '— None —');
        setSelectedWater(detectedMap.water?.column || '— None —');
        setSelectedElectricity(detectedMap.electricity?.column || '— None —');
        setSelectedCost(detectedMap.cost?.column || '— None —');
        setIsAdjustingMapping(false);
      } else {
        setErrorType('500');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdjustMappingClick = () => {
    if (!analysis?.columnMapping) return;
    const mapping = analysis.columnMapping;
    
    setSelectedCaseId(mapping.case_id?.column || '');
    setSelectedActivity(mapping.activity?.column || '');
    setSelectedTimestamp(mapping.timestamp?.column || '');
    setSelectedResource(mapping.resource?.column || '— None —');
    setSelectedSupplier(mapping.supplier?.column || '— None —');
    setSelectedWater(mapping.water?.column || '— None —');
    setSelectedElectricity(mapping.electricity?.column || '— None —');
    setSelectedCost(mapping.cost?.column || '— None —');
    
    setIsAdjustingMapping(true);
  };


  const loadDemoData = () => {
    setErrorType(null);
    setErrorDetails(null);
    setAnalysis(null);
    const file = new File([''], 'louis_india_q3_sc.csv', { type: 'text/csv' });
    setSelectedFile(file);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsDemo(true);
      setIsAnalyzing(false);
    }, 1200);
  };

  const reactFlowNodes = (isDemo ? mockOcelNodes : (nodes || [])).map((node, index) => {
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

  const reactFlowEdges = (isDemo ? mockOcelEdges : (edges || [])).map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: `${edge.frequency}x (${edge.avgDelay})`,
    labelStyle: { fill: '#6B6963', fontSize: 10, fontFamily: 'monospace', fontWeight: 500 },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#F3F2EE', color: '#6B6963' },
    style: { stroke: '#9B9891', strokeWidth: 1.5 },
    animated: true
  }));

  // Get all columns for dropdowns
  const getDropdownColumns = () => {
    if (parsedHeaders && parsedHeaders.length > 0) return parsedHeaders;
    if (errorDetails?.availableColumns && errorDetails.availableColumns.length > 0) {
      return errorDetails.availableColumns;
    }
    if (analysis?.columnMapping) {
      const cols: string[] = [];
      const mapping = analysis.columnMapping;
      const fields: (keyof Omit<ColumnMapping, 'mappingSource'>)[] = ['case_id', 'activity', 'timestamp', 'resource', 'supplier', 'water', 'electricity', 'cost'];
      for (const field of fields) {
        const col = (mapping[field] as MappingField)?.column;
        if (col && !cols.includes(col)) {
          cols.push(col);
        }
      }
      return cols;
    }
    return [];
  };
  const availableColumns = getDropdownColumns();

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="OCEL 2.0 Process Mining"
        subtitle="Upload Object-Centric Event Logs to map process paths, throughput, and carbon footprints."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={loadDemoData}
            className="h-[32px] text-[12px] text-[#2D6A4F] border-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] rounded-md"
          >
            <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
            Load Demo Event Log
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 flex-1 items-start">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-5 rounded-md shadow-sm">
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider mb-3">
              Event Log Upload
            </h3>

            <FileUpload onFileSelect={handleFileSelect} placeholder="Drop OCEL 2.0 CSV/XML" />

            {(selectedFile || displayedFileName) && (
              <div className="mt-4 border-t border-[#E2E0D8] pt-4 space-y-3.5">
                <div className="flex items-start gap-2.5 p-2 bg-[#F3F2EE] rounded-md border border-[#E2E0D8]">
                  <FileSpreadsheet className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-[12px] font-sans font-medium text-[#1A1917] truncate">
                      {displayedFileName}
                    </p>
                    <p className="text-[10px] text-[#6B6963] font-mono">
                      {displayedFileSizeStr}
                    </p>
                  </div>
                </div>

                {(((errorType === '422' && errorDetails) || isAdjustingMapping)) && (
                  <div className={`p-3.5 border ${isAdjustingMapping ? 'border-[#E2E0D8]' : 'border-[#C0392B]/30'} bg-[#FAFAF8] rounded-md text-[12px] font-sans space-y-4`}>
                    <div className="space-y-1">
                      <p className={`font-medium ${isAdjustingMapping ? 'text-[#1A1917]' : 'text-[#C0392B]'}`}>
                        {isAdjustingMapping ? 'Adjust Column Mapping' : 'Column Mapping Required'}
                      </p>
                      <p className="text-[11px] text-[#6B6963] leading-relaxed">
                        {isAdjustingMapping 
                          ? 'Review and adjust your column mappings below.' 
                          : "We couldn't confidently detect your columns — please confirm them below."}
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      {/* Case ID */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('case_id') ? 'text-red-600' : 'text-[#1A1917]'}`}>
                          Case ID (Required)
                        </label>
                        <select
                          value={selectedCaseId}
                          onChange={(e) => setSelectedCaseId(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] ${
                            isFieldMissing('case_id') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[#E2E0D8] text-[#1A1917]'
                          }`}
                        >
                          <option value="">-- Select Column --</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Activity */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('activity') ? 'text-red-600' : 'text-[#1A1917]'}`}>
                          Activity (Required)
                        </label>
                        <select
                          value={selectedActivity}
                          onChange={(e) => setSelectedActivity(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] ${
                            isFieldMissing('activity') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[#E2E0D8] text-[#1A1917]'
                          }`}
                        >
                          <option value="">-- Select Column --</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Timestamp */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('timestamp') ? 'text-red-600' : 'text-[#1A1917]'}`}>
                          Timestamp (Required)
                        </label>
                        <select
                          value={selectedTimestamp}
                          onChange={(e) => setSelectedTimestamp(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] ${
                            isFieldMissing('timestamp') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[#E2E0D8] text-[#1A1917]'
                          }`}
                        >
                          <option value="">-- Select Column --</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Resource */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('resource') ? 'text-red-600' : 'text-[#1A1917]'}`}>
                          Resource (Optional)
                        </label>
                        <select
                          value={selectedResource}
                          onChange={(e) => setSelectedResource(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] ${
                            isFieldMissing('resource') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[#E2E0D8] text-[#1A1917]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Supplier */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('supplier') ? 'text-red-600' : 'text-[#1A1917]'}`}>
                          Supplier (Optional)
                        </label>
                        <select
                          value={selectedSupplier}
                          onChange={(e) => setSelectedSupplier(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] ${
                            isFieldMissing('supplier') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[#E2E0D8] text-[#1A1917]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Water */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('water') ? 'text-red-600' : 'text-[#1A1917]'}`}>
                          Water (Optional)
                        </label>
                        <select
                          value={selectedWater}
                          onChange={(e) => setSelectedWater(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] ${
                            isFieldMissing('water') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[#E2E0D8] text-[#1A1917]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Electricity */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('electricity') ? 'text-red-600' : 'text-[#1A1917]'}`}>
                          Electricity (Optional)
                        </label>
                        <select
                          value={selectedElectricity}
                          onChange={(e) => setSelectedElectricity(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] ${
                            isFieldMissing('electricity') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[#E2E0D8] text-[#1A1917]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Cost */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('cost') ? 'text-red-600' : 'text-[#1A1917]'}`}>
                          Cost (Optional)
                        </label>
                        <select
                          value={selectedCost}
                          onChange={(e) => setSelectedCost(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] ${
                            isFieldMissing('cost') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[#E2E0D8] text-[#1A1917]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        onClick={() => handleRunAnalysis(true)}
                        disabled={isAnalyzing || !selectedCaseId || !selectedActivity || !selectedTimestamp}
                        className="flex-1 h-[36px] bg-[#2D6A4F] hover:bg-[#166534] disabled:bg-[#2D6A4F]/60 text-white font-sans text-[13px] font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Confirm & Upload'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (isAdjustingMapping) {
                            setIsAdjustingMapping(false);
                          } else {
                            setErrorType(null);
                            setErrorDetails(null);
                          }
                        }}
                        className="h-[36px] px-3 text-[12px] text-[#6B6963] border-[#E2E0D8] hover:bg-[#F3F2EE] rounded-md"
                      >
                        {isAdjustingMapping ? 'Cancel' : 'Reset'}
                      </Button>
                    </div>
                  </div>
                )}

                {errorType === '500' && (
                  <div className="p-3 border border-[#C0392B] bg-[#FDECEA] rounded-md text-[12px] font-sans space-y-3">
                    <div className="flex items-center gap-1.5 font-medium text-[#C0392B]">
                      <span>Analysis Failed</span>
                    </div>
                    <p className="text-[#6B6963] leading-relaxed">
                      A network error or internal server error occurred while processing the file.
                    </p>
                    <Button
                      onClick={() => handleRunAnalysis()}
                      className="w-full h-[32px] bg-[#C0392B] hover:bg-[#a82f24] text-white font-sans text-[12px] font-medium rounded-md"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {isAnalyzed && !errorType && !isAdjustingMapping && (
                  <div className="space-y-2 p-2.5 border border-[#E2E0D8] bg-[#E8F0EB] text-[#2D6A4F] rounded-md text-[12px] font-sans">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Analysis Completed</span>
                      </div>
                      {!isDemo && (
                        <button
                          onClick={handleAdjustMappingClick}
                          className="text-[11px] font-medium text-[#2D6A4F] underline hover:text-[#166534] transition-colors focus:outline-none"
                        >
                          Adjust Column Mapping
                        </button>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-[#166534] font-mono text-[11px] leading-relaxed">
                      <div>File: {isDemo ? mockOcelMetadata.filename : metadata?.filename}</div>
                      <div>Events: {isDemo ? mockOcelMetadata.totalEvents.toLocaleString() : metadata?.totalEvents?.toLocaleString()}</div>
                      <div>Cases: {isDemo ? mockOcelMetadata.caseCount : metadata?.caseCount}</div>
                      <div>Activities: {isDemo ? mockOcelMetadata.activityCount : metadata?.activityCount}</div>
                    </div>
                  </div>
                )}

                {!isAnalyzed && !errorType && (
                  <Button
                    onClick={() => handleRunAnalysis()}
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

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="border border-[#E2E0D8] rounded-md bg-[#FAFAF8] h-[480px] w-full relative flex items-center justify-center overflow-hidden shadow-sm">
            {isAnalyzing ? (
              <div className="text-center p-8">
                <div className="w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[13px] text-[#6B6963] font-mono">Processing event log...</p>
              </div>
            ) : isAnalyzed ? (
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
                <p className="text-[13px] text-[#6B6963] max-w-xs leading-normal mb-4">
                  Upload an event log on the left or load demo data to view the interactive process map.
                </p>
                <Button
                  onClick={loadDemoData}
                  variant="outline"
                  className="h-[32px] text-[12px] text-[#2D6A4F] border-[#2D6A4F] hover:bg-[#E8F0EB] rounded-md"
                >
                  <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                  Load Demo Data
                </Button>
              </div>
            )}
          </div>

          {isAnalyzed && (
            <div className={`grid grid-cols-2 ${(!isDemo && analysis?.totalOperationalCostUSD !== undefined && analysis?.totalOperationalCostUSD !== null) ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
              <StatCard label="Total Cases" value={isDemo ? mockOcelMetadata.caseCount : (metadata?.caseCount ?? '—')} />
              <StatCard label="Unique Activities" value={isDemo ? mockOcelMetadata.activityCount : (metadata?.activityCount ?? '—')} />
              <StatCard label="Process Variants" value={isDemo ? 18 : '—'} />
              <StatCard label="Avg Case Duration" value={isDemo ? '14.8' : '—'} unit={isDemo ? 'h' : undefined} />
              {!isDemo && analysis?.totalOperationalCostUSD !== undefined && analysis?.totalOperationalCostUSD !== null && (
                <StatCard label="Operational Cost" value={`$${analysis.totalOperationalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}