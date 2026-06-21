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

  // Status and configuration states
  const [status, setStatus] = useState<{ online: boolean; availableModels: string[] }>({
    online: false,
    availableModels: [],
  });
  const [selectedModel, setSelectedModel] = useState('gemma3:4b');
  const [selectedStyle, setSelectedStyle] = useState('balanced');

  // Load status and poll every 30s
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

  // Update default model selection based on availability
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

  // Context data extraction for sidebar (using real data or honest demo state fallback)
  const isDemoMode = !analysis;
  const filename = analysis?.metadata?.filename || 'louis_india_q3_sc.csv';
  const totalCarbon = analysis?.totalCarbonKg !== undefined 
    ? `${analysis.totalCarbonKg.toLocaleString()} kg` 
    : '78,430 kg (Demo)';

  // Combined CFS Score: average of case CFS scores
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

  // Violations
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
        context: analysis, // Passes the full real context or null
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

  // Scroll chat to bottom when message list changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-100px)]">
      <PageHeader
        title="TRACE. Copilot Engine"
        subtitle="Natural language process auditor querying logistics event sequences, budget burns, and carbon deviations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 flex-1 items-stretch min-h-0">
        
        {/* Left Column: Context Panel */}
        <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-5 rounded-md shadow-sm flex flex-col justify-between select-none">
          <div className="space-y-4">
            <h3 className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block border-b border-[#E2E0D8] pb-2">
              Current Context
            </h3>

            {isDemoMode && (
              <div className="bg-[#FEF3C7] border border-[#FCD34D] text-[#D97706] text-[10px] p-2 rounded text-center font-medium font-sans">
                Demo Baseline Mode
              </div>
            )}

            <div className="space-y-3 text-[12px] font-sans">
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Active Project</span>
                <span className="font-medium text-[#1A1917]">
                  {isDemoMode ? 'Q3 Supply Chain Audit 2024' : 'Active Project Context'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Loaded Log file</span>
                <span className="font-mono text-[11px] text-[#1A1917] truncate block">{filename}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Carbon Budget Used</span>
                <span className={`font-mono font-semibold ${isDemoMode ? 'text-[#C0392B]' : 'text-[#2D6A4F]'}`}>
                  {totalCarbon}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Combined CFS Index</span>
                <span className="font-mono text-[#B45309] font-semibold">{cfsDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Active Violations</span>
                <span className="font-mono text-[#C0392B] font-semibold">{violationsDisplay}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E0D8] flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B6963]">
              <Cpu className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Local Context Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B6963]">
              <span className={`w-2 h-2 rounded-full ${status.online ? 'bg-[#2D6A4F]' : 'bg-red-500 animate-pulse'}`} />
              <span className="font-sans font-medium text-[#1A1917]">
                {status.online ? 'Ollama Online' : 'Ollama Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Main Chat Window */}
        <div className="border border-[#E2E0D8] bg-[#FAFAF8] rounded-md shadow-sm flex flex-col justify-between overflow-hidden">
          
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Render message bubbles */}
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
                        ? 'bg-[#E8F0EB] border-[#2D6A4F]/10 text-[#1A1917]'
                        : 'bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917]'
                    }`}>
                      {/* Standard text content */}
                      {msg.content && (
                        <p className="font-sans whitespace-pre-line">{msg.content}</p>
                      )}

                      {/* Structured Card Section (Assistant ONLY) */}
                      {!isUser && msg.structured && (
                        <div className={`${msg.content ? 'mt-4 border-t border-[#E2E0D8] pt-4' : ''} space-y-3`}>
                          {/* ANSWER section (slightly darker card) */}
                          <div className="p-2.5 bg-[#FAFAF8] border border-[#E2E0D8] rounded-[3px]">
                            <span className="text-[9px] text-[#9B9891] font-sans uppercase tracking-wider font-semibold block">ANSWER</span>
                            <p className="text-[12px] font-sans font-medium text-[#1A1917] mt-0.5">{msg.structured.answer}</p>
                          </div>

                          {/* WHY section */}
                          {msg.structured.why && (
                            <div>
                              <span className="text-[9px] text-[#9B9891] font-sans uppercase tracking-wider font-semibold block">WHY</span>
                              <p className="text-[12px] text-[#6B6963] font-sans mt-0.5 leading-relaxed">{msg.structured.why}</p>
                            </div>
                          )}

                          {/* EVIDENCE section */}
                          {msg.structured.evidence && msg.structured.evidence.length > 0 && (
                            <div>
                              <span className="text-[9px] text-[#9B9891] font-sans uppercase tracking-wider font-semibold block">EVIDENCE</span>
                              <div className="grid grid-cols-3 gap-2 mt-1 select-all">
                                {msg.structured.evidence.map((ev, evIdx) => (
                                  <div key={evIdx} className="bg-[#FAFAF8] border border-[#E2E0D8] p-2 rounded-[3px] text-center">
                                    <span className="text-[9px] text-[#6B6963] block truncate">{ev.label}</span>
                                    <span className="font-mono text-[13px] font-bold text-[#1A1917] mt-0.5 block">{ev.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ACTION section */}
                          {msg.structured.action && (
                            <div className="pt-2">
                              <Link href={msg.structured.action.actionId}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-[28px] text-[11px] font-sans border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1 rounded-md"
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
                    
                    <span className="text-[9px] text-[#9B9891] font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="p-3 bg-[#F3F2EE] border border-[#E2E0D8] rounded-md text-[13px] text-[#6B6963] font-sans">
                    Copilot is calculating ESG indicators with {selectedModel}...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Bottom input area */}
          <div className="border-t border-[#E2E0D8] p-3 bg-[#FAFAF8]">
            
            {/* Suggested Chips (Horizontal Scrollable Pill Buttons) */}
            <div className="flex gap-2 max-w-[760px] mx-auto overflow-x-auto pb-2.5 select-none no-scrollbar">
              {suggestedChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  disabled={!status.online || isTyping}
                  className="h-[28px] px-3 border border-[#E2E0D8] bg-[#F3F2EE] hover:bg-[#ECEAE4] disabled:opacity-50 text-[#1A1917] text-[11px] font-sans rounded-full whitespace-nowrap transition-colors shrink-0 focus:outline-none"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Model & Style Selectors */}
            <div className="flex gap-4 max-w-[760px] mx-auto mb-2.5 text-[11px] font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-[#6B6963] font-semibold uppercase tracking-wider">Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!status.online}
                  className="h-[26px] px-2 py-0.5 border border-[#E2E0D8] bg-[#F3F2EE] disabled:opacity-50 disabled:bg-gray-100 rounded text-[11px] font-medium text-[#1A1917] focus:outline-none focus:border-[#2D6A4F]"
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
                <span className="text-[#6B6963] font-semibold uppercase tracking-wider">Style:</span>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  disabled={!status.online}
                  className="h-[26px] px-2 py-0.5 border border-[#E2E0D8] bg-[#F3F2EE] disabled:opacity-50 disabled:bg-gray-100 rounded text-[11px] font-medium text-[#1A1917] focus:outline-none focus:border-[#2D6A4F]"
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
                className="h-[36px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
              />
              <Button
                type="submit"
                disabled={!status.online || !inputVal.trim() || isTyping}
                className="h-[36px] w-[36px] p-0 bg-[#2D6A4F] hover:bg-[#166534] disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-md shrink-0 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center text-[10px] text-[#9B9891] font-mono mt-2 select-none">
              Powered by Ollama (local)
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
