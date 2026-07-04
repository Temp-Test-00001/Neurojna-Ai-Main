import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Terminal, Cpu, ShieldAlert, Zap, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';

export default function JanaLLMPlayground() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'System status: ONLINE. Node secure. Welcome to the **JanaLLM v2.5 Enterprise Sandbox**.\n\nI am compiled to run entirely on localized **NeuroCore Edge** accelerators inside your physical security perimeter. I do not connect to external clouds, ensuring absolute protection against corporate espionage and regulatory infractions.\n\nHow can I help you architect your secure localized AI strategy today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedMetrics, setSimulatedMetrics] = useState({
    latency: '0.0 ms',
    powerDraw: '0 Watts',
    egress: '0.00 KB',
    coresActive: 0
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompts
  const suggestions = [
    'How does NeuroCore run offline?',
    'What are the specs of the PCIe cards?',
    'Explain the Indian DPDP compliance.',
    'Is the training data secure?'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle suggested chip click
  const handleSuggestionClick = (prompt: string) => {
    if (isLoading) return;
    setInputValue(prompt);
  };

  // Submit message to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Dynamic telemetry effect
    setSimulatedMetrics({
      latency: 'Calculating...',
      powerDraw: '42.5 W',
      egress: '0.00 KB (AIR-GAPPED)',
      coresActive: 64
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            role: 'assistant',
            content: data.text,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        setSimulatedMetrics({
          latency: '4.1 ms/token',
          powerDraw: '41.2 Watts',
          egress: '0.00 KB',
          coresActive: 96
        });
      } else {
        throw new Error(data.error || 'Server nodes failed.');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **System Error:** Failed to interface with JanaLLM server nodes. Please ensure your backend is compiled. Technical detail: ${err.message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setSimulatedMetrics({
        latency: 'FAIL',
        powerDraw: '2.5 W',
        egress: '0.00 KB',
        coresActive: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'System reboot complete. All localized caches cleared. I am ready to process your secure offline queries.',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setInputValue('');
    setSimulatedMetrics({
      latency: '0.0 ms',
      powerDraw: '0 Watts',
      egress: '0.00 KB',
      coresActive: 0
    });
  };

  return (
    <div id="janallm-playground" className="relative grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6">
      {/* Background neon grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
      
      {/* Sidebar: Telemetry & Specs (1/4 Column) */}
      <div className="lg:col-span-1 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-sm uppercase tracking-wider mb-4">
            <Terminal size={16} className="animate-pulse" />
            <span>Node Monitor</span>
          </div>
          
          <h3 className="text-xl font-sans font-semibold text-slate-100 tracking-tight">
            JanaLLM Cluster
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Running secure, localized execution nodes with customized deep-weights compilation.
          </p>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 mt-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Latency Rate</span>
              <span className="text-sm font-mono font-medium text-slate-200 block mt-1">
                {simulatedMetrics.latency === '0.0 ms' ? 'Standby (0.0 ms)' : simulatedMetrics.latency}
              </span>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Power Draw</span>
                <Zap size={10} className="text-amber-400 animate-pulse" />
              </div>
              <span className="text-sm font-mono font-medium text-slate-200 block mt-1">
                {simulatedMetrics.powerDraw === '0 Watts' ? 'Idle (4.5 W)' : simulatedMetrics.powerDraw}
              </span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Cloud Egress</span>
                <ShieldAlert size={10} className="text-emerald-400" />
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400 block mt-1">
                {simulatedMetrics.egress}
              </span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Neural Cores</span>
              <span className="text-sm font-mono font-medium text-slate-200 block mt-1">
                {simulatedMetrics.coresActive === 0 ? '96 Standby' : `${simulatedMetrics.coresActive} Cores Active`}
              </span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] text-emerald-500 font-mono uppercase">Node Secured</span>
          </div>
          <button
            onClick={handleReset}
            title="Reset sandbox memory cache"
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-300 font-mono text-[10px] transition"
          >
            <RefreshCw size={12} />
            <span>Flush Cache</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area (3/4 Column) */}
      <div className="lg:col-span-3 flex flex-col h-[450px] justify-between space-y-4">
        {/* Chat log */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              {/* Message bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600/95 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800/80 text-slate-200 rounded-bl-none whitespace-pre-wrap'
                }`}
              >
                {/* Parse simple markdown headers and bolding manually or cleanly */}
                {msg.content.split('\n\n').map((paragraph, index) => {
                  let cleaned = paragraph;
                  // Handle bolding e.g. **Text**
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  const hasBolds = boldRegex.test(paragraph);
                  
                  if (hasBolds) {
                    const parts = paragraph.split(/\*\*(.*?)\*\*/g);
                    return (
                      <p key={index} className={index > 0 ? "mt-2" : ""}>
                        {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-emerald-300 font-semibold">{p}</strong> : p)}
                      </p>
                    );
                  }
                  
                  return (
                    <p key={index} className={index > 0 ? "mt-2" : ""}>
                      {cleaned}
                    </p>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">
                {msg.role === 'user' ? 'Local User' : 'JanaLLM'} • {msg.timestamp}
              </span>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex flex-col items-start max-w-[85%]">
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs font-mono text-slate-500 pl-1">Compiling weights...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Interactive suggestions chips */}
        {messages.length === 1 && !isLoading && (
          <div className="space-y-2">
            <span className="text-[11px] text-slate-500 font-mono block uppercase">Quick Security Queries:</span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(sug)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-sans transition text-left cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 border border-slate-800 bg-slate-900/50 rounded-xl p-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition duration-200">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isLoading ? "JanaLLM is processing..." : "Query sovereign knowledge..."}
            disabled={isLoading}
            className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm py-2 px-3 focus:outline-none focus:ring-0"
            id="jana-query-input"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-semibold rounded-lg p-2 transition cursor-pointer flex items-center justify-center"
            id="jana-query-send-btn"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
