import React, { useState, useRef, useEffect } from 'react';
import { Incident, Resource, Hospital } from '../types';
import { queryAIAssistant } from '../services/aiEngine';
import { Bot, X, Send, Sparkles, User, ShieldCheck } from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  resources: Resource[];
  hospitals: Hospital[];
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  incidents,
  resources,
  hospitals
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: '🤖 DisasterX AI Operational Copilot active. I have full context of all active incidents, trauma hospital bed loads, and fleet positions. How can I assist you?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    if (!textToSend) setQuery('');
    setIsLoading(true);

    try {
      const responseText = await queryAIAssistant(q, { incidents, resources, hospitals });
      setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Error querying AI assistant engine.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Which incident requires immediate attention?",
    "Which hospital has the most available capacity?",
    "Where should we send the next ambulance?",
    "What areas are most at risk?",
    "Give me an EOC summary report"
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-[2500] w-full sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between font-sans animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">EOC AI Copilot Assistant</h3>
            <p className="text-[10px] text-slate-500 font-mono">Live RAG Operational Context</p>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg bg-white border border-slate-200 shadow-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
              m.sender === 'user'
                ? 'bg-teal-600 text-white font-medium rounded-tr-none shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none font-sans shadow-sm'
            }`}>
              {m.text.split('**').map((chunk, idx) => 
                idx % 2 === 1 ? <strong key={idx} className="font-bold text-slate-900">{chunk}</strong> : chunk
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-xs text-teal-600 flex items-center space-x-2 font-mono shadow-sm">
              <span className="w-3 h-3 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></span>
              <span>Synthesizing live operational telemetry...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-1.5">
        <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Suggested Operator Queries</div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-600 hover:text-teal-700 transition-colors text-left shadow-sm"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Copilot about incidents, hospitals, fleet..."
          className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-500 font-bold shadow-md transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
