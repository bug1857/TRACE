'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopilotMessage } from '@/lib/types';
import { mockCopilotMessages } from '@/lib/mockData';
import Link from 'next/link';

export default function CopilotPage() {
  const [messages, setMessages] = useState<CopilotMessage[]>(mockCopilotMessages);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedChips = [
    ["Which variant is most carbon-efficient?", "Days until budget breach?"],
    ["Worst performing supplier?", "Biggest Scope 3 source?"],
    ["Top conformance violations?", "Recommended rerouting plan?"],
    ["Explain our CFS score", "How to improve BRSR score?"]
  ];

  // Pre-coded structured responses for demo prompts
  const getPreCodedResponse = (query: string): NonNullable<CopilotMessage['structured']> => {
    const q = query.toLowerCase();
    
    if (q.includes('variant') && q.includes('carbon')) {
      return {
        answer: 'Variant 3 (Recv → Pick → Road → Last Mile) is the most carbon-efficient pathway.',
        why: 'It bypasses the Customs Clearance refrigeration holding yard entirely, reducing waiting-related cooling fuel emissions.',
        evidence: [
          { label: 'Emissions per Case', value: '780.0 kg' },
          { label: 'CFS Score', value: 89 },
          { label: 'Active Volume', value: '11 cases' }
        ],
        action: { label: 'Analyze Variants', actionId: '/carbon-fitness' }
      };
    }
    
    if (q.includes('breach') || q.includes('days')) {
      return {
        answer: 'Annual Carbon Budget breach predicted in 42 days.',
        why: 'Current logistics operations burn an average of 14,850 kg CO2e/month, exceeding the 10,000 kg baseline target.',
        evidence: [
          { label: 'Total Used', value: '78,430 kg' },
          { label: 'Remaining Credits', value: '41,570 kg' },
          { label: 'Breach Forecast Date', value: 'Aug 28, 2024' }
        ],
        action: { label: 'View Ledger', actionId: '/carbon-budget' }
      };
    }

    if (q.includes('supplier') || q.includes('worst')) {
      return {
        answer: 'Supplier B — FastCargo Ltd. is the worst-performing carrier.',
        why: 'Their vehicle fleet utilizes non-certified diesel trucks, violating environmental transport agreements.',
        evidence: [
          { label: 'CFS Index', value: '34 / 100' },
          { label: 'Scope 3 Factor', value: '0.84 kg/$' },
          { label: 'Seq. Fit Ratio', value: '42%' }
        ],
        action: { label: 'Audit Carrier', actionId: '/supplier-fitness' }
      };
    }

    if (q.includes('scope 3') || q.includes('biggest')) {
      return {
        answer: 'Outsourced Air Freight dispatch is the largest Scope 3 emission source.',
        why: 'Air transport emissions are calculated at 2.62 kg CO2e/t-km, which is 200%+ higher than express rail paths.',
        evidence: [
          { label: 'Air Freight Emissions', value: '4,890.5 kg' },
          { label: 'Activity CFS', value: 34 },
          { label: 'Usage Freq', value: '32 dispatches' }
        ],
        action: { label: 'View Emission Factors', actionId: '/settings' }
      };
    }

    if (q.includes('conformance') || q.includes('violations')) {
      return {
        answer: 'The top conformance issue is "Bypassed Rail Logistics Policy" in air cargo dispatches.',
        why: 'Contracted logistics centers choose air transport for non-expedited orders to meet short-term lead times.',
        evidence: [
          { label: 'Active Violations', value: 23 },
          { label: 'Critical Breaches', value: 8 },
          { label: 'Estimated Excess CO2', value: '6,230.5 kg' }
        ],
        action: { label: 'Inspect Violations', actionId: '/conformance' }
      };
    }

    if (q.includes('rerouting') || q.includes('route')) {
      return {
        answer: 'Rerouting Mumbai to Delhi NCR cargo from Air to Express Electric Rail is recommended.',
        why: 'Electric rail routes save 18,200 kg CO2e per season with a net cost reduction of $450.',
        evidence: [
          { label: 'Emissions Saved', value: '18,200 kg' },
          { label: 'Cost Delta', value: '-$450' },
          { label: 'Confidence Score', value: '95%' }
        ],
        action: { label: 'View Green Routes', actionId: '/green-routes' }
      };
    }

    if (q.includes('cfs') || q.includes('explain')) {
      return {
        answer: 'The project CFS is 72/100, placing operations in the Warning (amber) category.',
        why: 'High-volume road transport and warehouse packing rework cycles are dragging down the score.',
        evidence: [
          { label: 'Combined CFS', value: 72 },
          { label: 'Rework Loops', value: '24 events' },
          { label: 'Sequence Fit Ratio', value: '84%' }
        ],
        action: { label: 'Score Breakdown', actionId: '/carbon-fitness' }
      };
    }

    if (q.includes('brsr') || q.includes('improve')) {
      return {
        answer: 'Transitioning Scope 3 truck carriers to green fleets will lift BRSR environmental scores.',
        why: 'Supplier Scope 3 emissions factors contribute to over 70% of the calculated environmental footprint in Principle 6.',
        evidence: [
          { label: 'BRSR Completion', value: '85%' },
          { label: 'Auto-filled Fields', value: 12 },
          { label: 'Remaining Manual Inputs', value: 4 }
        ],
        action: { label: 'Open BRSR Sheet', actionId: '/brsr-report' }
      };
    }

    // Default custom response structure
    return {
      answer: `Analyzing carbon process log regarding "${query}".`,
      why: 'Simulated copilot search query parsing actual logistics parameters.',
      evidence: [
        { label: 'Active Project', value: 'Q3 SC Audit' },
        { label: 'Log Size', value: '1,247 events' },
        { label: 'Calculated CFS', value: 72 }
      ]
    };
  };

  const handleSend = (textToSend?: string) => {
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

    // Simulate response
    setTimeout(() => {
      const structuredAns = getPreCodedResponse(finalQuery);
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: structuredAns.answer,
        structured: structuredAns,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
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

            <div className="space-y-3 text-[12px] font-sans">
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Active Project</span>
                <span className="font-medium text-[#1A1917]">Q3 Supply Chain Audit 2024</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Loaded Log file</span>
                <span className="font-mono text-[11px] text-[#1A1917] truncate block">louis_india_q3_sc.csv</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Carbon Budget Used</span>
                <span className="font-mono text-[#C0392B] font-semibold">78,430 kg (65%)</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Combined CFS Index</span>
                <span className="font-mono text-[#B45309] font-semibold">72 / 100 (Warning)</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9B9891] uppercase block">Active Violations</span>
                <span className="font-mono text-[#C0392B] font-semibold">23 issues (8 critical)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E0D8] flex items-center gap-1.5 text-[11px] text-[#6B6963]">
            <Cpu className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Local Context Active</span>
          </div>
        </div>

        {/* Right Column: Main Chat Window */}
        <div className="border border-[#E2E0D8] bg-[#FAFAF8] rounded-md shadow-sm flex flex-col justify-between overflow-hidden">
          
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Show prompt chips ONLY at top if there are no user messages yet */}
            {messages.length === 1 && (
              <div className="space-y-2.5 max-w-[620px] mx-auto py-4 select-none">
                <span className="text-[11px] font-sans font-medium text-[#9B9891] uppercase tracking-wider block text-center mb-1">
                  Suggested Audits & Queries
                </span>
                
                <div className="space-y-2">
                  {suggestedChips.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-2 gap-2">
                      {row.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleChipClick(chip)}
                          className="h-[34px] px-3 border border-[#E2E0D8] bg-[#F3F2EE] hover:bg-[#ECEAE4] text-[#1A1917] text-[12px] font-sans rounded-md text-left transition-colors truncate focus:outline-none"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                      <p className="font-sans whitespace-pre-line">{msg.content}</p>

                      {/* Structured Card Section (Assistant ONLY) */}
                      {!isUser && msg.structured && (
                        <div className="mt-4 border-t border-[#E2E0D8] pt-4 space-y-3">
                          {/* ANSWER section (slightly darker card) */}
                          <div className="p-2.5 bg-[#FAFAF8] border border-[#E2E0D8] rounded-[3px]">
                            <span className="text-[9px] text-[#9B9891] font-sans uppercase tracking-wider font-semibold block">ANSWER</span>
                            <p className="text-[12px] font-sans font-medium text-[#1A1917] mt-0.5">{msg.structured.answer}</p>
                          </div>

                          {/* WHY section */}
                          <div>
                            <span className="text-[9px] text-[#9B9891] font-sans uppercase tracking-wider font-semibold block">WHY</span>
                            <p className="text-[12px] text-[#6B6963] font-sans mt-0.5 leading-relaxed">{msg.structured.why}</p>
                          </div>

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
                <div className="flex flex-col items-start">
                  <div className="p-3 bg-[#F3F2EE] border border-[#E2E0D8] rounded-md text-[13px] text-[#6B6963] font-sans">
                    Copilot is calculating ESG indicators...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom input area */}
          <div className="border-t border-[#E2E0D8] p-3 bg-[#FAFAF8]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 max-w-[760px] mx-auto"
            >
              <Input
                placeholder="Ask about emissions forecasts, supplier performance, or process paths..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="h-[36px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
              />
              <Button
                type="submit"
                className="h-[36px] w-[36px] p-0 bg-[#2D6A4F] hover:bg-[#166534] text-white rounded-md shrink-0 flex items-center justify-center transition-colors"
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
