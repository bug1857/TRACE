'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopilotMessage } from '@/lib/types';
import { mockCopilotMessages } from '@/lib/mockData';
import Link from 'next/link';
import { useAnalysis } from '@/lib/AnalysisContext';
import api from '@/lib/api';

export default function CopilotPage() {
  const { analysis } = useAnalysis();
  const [messages, setMessages] = useState<CopilotMessage[]>(mockCopilotMessages);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<{ online: boolean; availableModels: string[] }>({
    online: false,
    availableModels: [],
  });
  const [selectedModel, setSelectedModel] = useState('gemma3:4b');
  const [selectedStyle, setSelectedStyle] = useState('balanced');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/api/copilot/status');
        setStatus(res.data);
      } catch (err) {
        setStatus({ online: false, availableModels: [] });
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status.availableModels && status.availableModels.length > 0) {
      if (status.availableModels.includes('gemma3:4b')) {
        setSelectedModel('gemma3:4b');
      } else {
        setSelectedModel(status.availableModels[0]);
      }
    } else {
      setSelectedModel('gemma3:4b');
    }
  }, [status.availableModels]);

  const isDemoMode = !analysis;
  const filename = analysis?.metadata?.filename || 'louis_india_q3_sc.csv';
  const totalCarbon = analysis?.totalCarbonKg !== undefined 
    ? `${analysis.totalCarbonKg.toLocaleString()} kg` 
    : '78,430 kg (Demo)';

  let cfsDisplay = '72 / 100 (Demo)';
  if (analysis && analysis.cfsScores) {
    const scores = analysis.cfsScores.map(s => s.cfsScore);
    if (scores.length > 0) {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      let statusStr = 'Good';
      if (avg < 50) statusStr = 'Critical';
      else if (avg < 80) statusStr = 'Warning';
      cfsDisplay = `${avg} / 100 (${statusStr})`;
    } else {
      cfsDisplay = 'N/A';
    }
  }

  let violationsDisplay = '23 issues (Demo)';
  if (analysis && analysis.violations) {
    const totalViolations = analysis.violations.length;
    const criticalViolations = analysis.violations.filter(
      v => v.severity?.toLowerCase() === 'critical'
    ).length;
    violationsDisplay = `${totalViolations} issues (${criticalViolations} critical)`;
  }

  const suggestedChips = [
    "Which variant is most carbon-efficient?",
    "Days until budget breach?",
    "Worst performing supplier?",
    "Biggest Scope 3 source?",
    "Top conformance violations?",
    "Recommended rerouting plan?",
    "Explain our CFS score",
    "How to improve BRSR score?"
  ];

  const handleSend = async (textToSend?: string) => {
    const finalQuery = textToSend || inputVal;
    if (!finalQuery.trim()) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: finalQuery,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const response = await api.post('/api/copilot/query', {
        query: finalQuery,
        model: selectedModel,
        style: selectedStyle,
        context: analysis,
      });

      const result = response.data;
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        structured: {
          answer: result.answer,
        },
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to get response from local LLM.';
      const assistantErrorMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Error: ${errMsg}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setMessages(prev => [...prev, assistantErrorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    setInputVal(chipText);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-100px)]">
      <PageHeader
        title="TRACE. Copilot Engine"
        subtitle="Natural language process auditor querying logistics event sequences, budget burns, and carbon deviations."
      />

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-[12px] font-sans flex items-center gap-2">
        <span>⚠️</span>
        <span>
          Copilot requires local Ollama setup and cannot run on the cloud.{" "}
          
            href="https://github.com/bug1857/TRACE"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            Download from GitHub
          </a>{" "}
          and run locally to use this feature.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 flex-1 items-stretch min-h-0">
        
        {/* Left Column: Context Panel */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm flex flex-col justify-between select-none">
          <div className="space-y-4">
            <h3 className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block border-b border-[var(--border)] pb-2">
              Current Context
            </h3>

            {isDemoMode && (
              <div className="bg-[var(--trace-warning-light)] border border-[#FCD34D] text-[#D97706] text-[10px] p-2 rounded text-center font-medium font-sans">
                Demo Baseline Mode
              </div>
            )}

            <div className="space-y-3 text-[12px] font-sans">
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Active Project</span>
                <span className="font-medium text-[var(--foreground)]">
                  {isDemoMode ? 'Q3 Supply Chain Audit 2024' : 'Active Project Context'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Loaded Log file</span>
                <span className="font-mono text-[11px] text-[var(--foreground)] truncate block">{filename}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Carbon Budget Used</span>
                <span className={`font-mono font-semibold ${isDemoMode ? 'text-[var(--destructive)]' : 'text-[var(--primary)]'}`}>
                  {totalCarbon}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Combined CFS Index</span>
                <span className="font-mono text-[var(--trace-warning)] font-semibold">{cfsDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Active Violations</span>
                <span className="font-mono text-[var(--destructive)] font-semibold">{violationsDisplay}</span>
              </div>
              {analysis && analysis.violations && analysis.violations.length === 0 && (
                <div className="text-[10px] text-[var(--muted-foreground)] leading-relaxed bg-[var(--card)] border border-[var(--border)] p-2 rounded text-left mt-2">
                  <strong>Note:</strong> Conformance checking is limited to:{" "}
                  <span className="font-semibold text-[var(--primary)]">
                    {analysis?.conformanceRuleScope
                      ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                      : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
                  </span>.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
              <Cpu className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Local Context Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
              <span className={`w-2 h-2 rounded-full ${status.online ? 'bg-[var(--primary)]' : 'bg-red-500 animate-pulse'}`} />
              <span className="font-sans font-medium text-[var(--foreground)]">
                {status.online ? 'Ollama Online' : 'Ollama Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Main Chat Window */}
        <div className="border border-[var(--border)] bg-[var(--background)] rounded-md shadow-sm flex flex-col justify-between overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4 max-w-[760px] mx-auto">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`p-3.5 rounded-md text-[13px] leading-relaxed max-w-[580px] border ${
                      isUser
                        ? 'bg-[var(--accent)] border-[var(--primary)]/10 text-[var(--foreground)]'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]'
                    }`}>
                      {msg.content && (
                        <p className="font-sans whitespace-pre-line">{msg.content}</p>
                      )}

                      {!isUser && msg.structured && (
                        <div className={`${msg.content ? 'mt-4 border-t border-[var(--border)] pt-4' : ''} space-y-3`}>
                          <div className="p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[3px]">
                            <span className="text-[9px] text-[var(--trace-subtle)] font-sans uppercase tracking-wider font-semibold block">ANSWER</span>
                            <p className="text-[12px] font-sans font-medium text-[var(--foreground)] mt-0.5">{msg.structured.answer}</p>
                          </div>

                          {msg.structured.why && (
                            <div>
                              <span className="text-[9px] text-[var(--trace-subtle)] font-sans uppercase tracking-wider font-semibold block">WHY</span>
                              <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5 leading-relaxed">{msg.structured.why}</p>
                            </div>
                          )}

                          {msg.structured.evidence && msg.structured.evidence.length > 0 && (
                            <div>
                              <span className="text-[9px] text-[var(--trace-subtle)] font-sans uppercase tracking-wider font-semibold block">EVIDENCE</span>
                              <div className="grid grid-cols-3 gap-2 mt-1 select-all">
                                {msg.structured.evidence.map((ev, evIdx) => (
                                  <div key={evIdx} className="bg-[var(--background)] border border-[var(--border)] p-2 rounded-[3px] text-center">
                                    <span className="text-[9px] text-[var(--muted-foreground)] block truncate">{ev.label}</span>
                                    <span className="font-mono text-[13px] font-bold text-[var(--foreground)] mt-0.5 block">{ev.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.structured.action && (
                            <div className="pt-2">
                              <Link href={msg.structured.action.actionId}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-[28px] text-[11px] font-sans border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
                                >
                                  <span>{msg.structured.action.label}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <span className="text-[9px] text-[var(--trace-subtle)] font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-md text-[13px] text-[var(--muted-foreground)] font-sans">
                    Copilot is calculating ESG indicators with {selectedModel}...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="border-t border-[var(--border)] p-3 bg-[var(--background)]">
            <div className="flex gap-2 max-w-[760px] mx-auto overflow-x-auto pb-2.5 select-none no-scrollbar">
              {suggestedChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  disabled={!status.online || isTyping}
                  className="h-[28px] px-3 border border-[var(--border)] bg-[var(--card)] hover:bg-[#ECEAE4] disabled:opacity-50 text-[var(--foreground)] text-[11px] font-sans rounded-full whitespace-nowrap transition-colors shrink-0 focus:outline-none"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex gap-4 max-w-[760px] mx-auto mb-2.5 text-[11px] font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!status.online}
                  className="h-[26px] px-2 py-0.5 border border-[var(--border)] bg-[var(--card)] disabled:opacity-50 disabled:bg-gray-100 rounded text-[11px] font-medium text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                >
                  {status.availableModels.length > 0 ? (
                    status.availableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  ) : (
                    <option value="gemma3:4b">gemma3:4b (Offline)</option>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">Style:</span>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  disabled={!status.online}
                  className="h-[26px] px-2 py-0.5 border border-[var(--border)] bg-[var(--card)] disabled:opacity-50 disabled:bg-gray-100 rounded text-[11px] font-medium text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="balanced">Balanced</option>
                  <option value="numerical">Numerical</option>
                  <option value="executive">Executive</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 max-w-[760px] mx-auto"
            >
              <Input
                placeholder={status.online ? "Ask about emissions forecasts, supplier performance, or process paths..." : "Ollama is currently offline. Connect local Ollama to begin."}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={!status.online || isTyping}
                className="h-[36px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
              <Button
                type="submit"
                disabled={!status.online || !inputVal.trim() || isTyping}
                className="h-[36px] w-[36px] p-0 bg-[var(--primary)] hover:bg-[var(--trace-success)] disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-md shrink-0 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center text-[10px] text-[var(--trace-subtle)] font-mono mt-2 select-none">
              Powered by Ollama (local)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
