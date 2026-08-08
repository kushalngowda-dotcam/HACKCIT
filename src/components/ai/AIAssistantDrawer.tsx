import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { queryAIAssistant } from '../../services/aiAssistant';
import { HospitalCapacity, Incident, Resource } from '../../types/database';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  resources: Resource[];
  hospitals: HospitalCapacity[];
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  incidents,
  resources,
  hospitals,
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'DisasterX AI Copilot is active. I can summarize current incidents, priority risks, hospital capacity, and resource readiness using the live project data.',
    },
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
    const q = (textToSend || query || '').trim();
    if (!q) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!textToSend) setQuery('');
    setIsLoading(true);

    try {
      const responseText = await queryAIAssistant(q, { incidents, resources, hospitals });
      setMessages((prev) => [...prev, { sender: 'ai', text: responseText }]);
    } catch (error) {
      console.warn('[AI Assistant] Request failed:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'AI assistant could not process the request. Please try again with a different question.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Which incident requires immediate attention?',
    'Which hospital has the most available capacity?',
    'Which resource is best for dispatch?',
    'Give me a command-center summary',
    'What is the current risk status?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-[2500] w-full sm:w-[430px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between font-sans">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">DisasterX AI Copilot</h3>
            <p className="text-[10px] text-slate-400 font-mono">Project-aware operational assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                message.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-cyan-300 flex items-center gap-2 font-mono">
              <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>
              <span>Analyzing current project telemetry...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
        <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Suggested queries</div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSend(prompt)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-600 hover:text-cyan-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          placeholder="Ask about incidents, hospitals, resources..."
          className="flex-1 bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-600"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-all shadow-md shadow-cyan-950/50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
