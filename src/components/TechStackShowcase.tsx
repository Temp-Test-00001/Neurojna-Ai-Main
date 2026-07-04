import React, { useState } from 'react';
import { Code, Server, Database, Cpu, CheckCircle2, Copy, Check } from 'lucide-react';

interface TechStackCategory {
  id: 'frontend' | 'backend' | 'database' | 'ai';
  title: string;
  subtitle: string;
  icon: any;
  techs: { name: string; tag: string; desc: string }[];
  codeSnippet: string;
}

const TECH_DATA: TechStackCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend & UI Core',
    subtitle: 'Lightning-fast, accessible, and reactive web component architecture',
    icon: Code,
    techs: [
      { name: 'React 19 Core', tag: 'UI Library', desc: 'Concurrent rendering, server actions ready, ultra-smooth component trees.' },
      { name: 'Vite 6 Bundler', tag: 'Build Engine', desc: 'Instant hot module replacement (HMR) and optimized ESM bundling.' },
      { name: 'Tailwind CSS v4', tag: 'Styling', desc: 'Utility-first engine with zero runtime overhead and modern design tokens.' },
      { name: 'Motion', tag: 'Animations', desc: 'Hardware-accelerated fluid UI transitions and spring micro-interactions.' }
    ],
    codeSnippet: `// Modern Glassmorphic Component in React 19
export function TelemetryCard({ latency, cores }: TelemetryProps) {
  return (
    <div className="glass-card hover:glow-border-blue p-6 rounded-2xl">
      <div className="flex justify-between items-center font-mono">
        <span className="text-slate-400 text-xs">Latency SLA</span>
        <span className="text-emerald-400 font-bold">{latency} ms</span>
      </div>
      <p className="text-2xl font-bold font-mono text-white mt-2">{cores} CORES</p>
    </div>
  );
}`
  },
  {
    id: 'backend',
    title: 'Enterprise Backend Engine',
    subtitle: 'High-throughput Node.js microservices with AES-256 state protection',
    icon: Server,
    techs: [
      { name: 'Node.js & Express', tag: 'API Server', desc: 'Battle-tested async I/O server layer with robust route middleware.' },
      { name: 'TypeScript 5.8', tag: 'Type Safety', desc: 'Strict type enforcement across client-server RPC boundary interfaces.' },
      { name: 'esbuild Pipeline', tag: 'Compiler', desc: 'Blazing fast CJS bundle output to dist/server.cjs for production.' },
      { name: 'tsx Runtime', tag: 'Dev Executor', desc: 'Zero-configuration TypeScript execution in dev mode.' }
    ],
    codeSnippet: `// Production Node.js Server Entry Point (server.ts)
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

app.post('/api/janallm/chat', async (req, res) => {
  const { prompt } = req.body;
  // Local air-gapped sovereign execution or Gemini fallback
  const response = await aiEngine.generate({ prompt });
  res.json({ status: 'OK', text: response });
});`
  },
  {
    id: 'database',
    title: 'Database & Security Vault',
    subtitle: 'Strict relational schemas with immutable audit tracking',
    icon: Database,
    techs: [
      { name: 'PostgreSQL Core', tag: 'RDBMS', desc: 'ACID-compliant transactional storage engineered for high write throughput.' },
      { name: 'Drizzle ORM', tag: 'Database ORM', desc: 'Zero-overhead type-safe SQL queries with auto-generated migration scripts.' },
      { name: 'AES-256 Encryption', tag: 'Security', desc: 'At-rest and in-transit data protection complying with Indian DPDP Act.' },
      { name: 'Immutable Audit Logs', tag: 'Compliance', desc: 'Trigger-based log registry tracking all admin schema mutations.' }
    ],
    codeSnippet: `// Schema Definition & Security Guard (schema.ts)
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const subscribers = pgTable('subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  emailEncrypted: text('email_encrypted').notNull(),
  securityGrade: text('security_grade').default('SOC2_AUDITED'),
  timestamp: timestamp('timestamp').defaultNow(),
});`
  },
  {
    id: 'ai',
    title: 'Local Sovereign AI Engine',
    subtitle: 'On-premise LLM inference with zero data leakage to cloud networks',
    icon: Cpu,
    techs: [
      { name: 'JanaLLM 8B / 32B', tag: 'LLM Runtimes', desc: 'Domain-specific enterprise models fine-tuned on corporate workflows.' },
      { name: 'WebGPU & C++ Core', tag: 'Accelerators', desc: 'Hardware-level tensor acceleration on consumer and server GPUs.' },
      { name: 'Air-Gapped Sandbox', tag: 'Isolation', desc: 'Executes without external network calls or cloud token billing.' },
      { name: 'Gemini 3.5 Native', tag: 'Hybrid Cloud', desc: 'Optional fallback to state-of-the-art Google GenAI models.' }
    ],
    codeSnippet: `// Sovereign Inference Sandbox Integration
const janaEngine = new SovereignLLM({
  weights: './models/JanaLLM-8B-Q4.bin',
  airGapped: true,
  maxTokens: 2048,
});

const result = await janaEngine.predict({
  context: 'Enterprise ERP Financial Telemetry',
  query: 'Summarize quarterly operational efficiency',
});`
  }
];

export default function TechStackShowcase() {
  const [activeId, setActiveId] = useState<'frontend' | 'backend' | 'database' | 'ai'>('frontend');
  const [copied, setCopied] = useState(false);

  const activeCategory = TECH_DATA.find(t => t.id === activeId)!;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCategory.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {TECH_DATA.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = cat.id === activeId;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveId(cat.id)}
              className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2.5 border ${
                isActive
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <IconComponent size={18} className={isActive ? 'text-white' : 'text-blue-400'} />
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Category Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column Features List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
              Architectural Layer
            </span>
            <h3 className="text-2xl font-bold text-white">{activeCategory.title}</h3>
            <p className="text-xs text-slate-400">{activeCategory.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {activeCategory.techs.map((tech, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-2 hover:border-blue-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100">{tech.name}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {tech.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Interactive Code Snippet Box */}
        <div className="lg:col-span-6 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between font-mono text-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-slate-400 text-[11px] ml-2">{activeCategory.id}.spec.ts</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed font-mono py-2 text-left">
            <code>{activeCategory.codeSnippet}</code>
          </pre>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Verified Production Pattern</span>
            </span>
            <span>Nagpur Engineering Core</span>
          </div>
        </div>

      </div>
    </div>
  );
}
