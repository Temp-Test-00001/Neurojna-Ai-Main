import React, { useState } from 'react';
import { Cpu, Shield, Layers, Server, Clock, CheckCircle2, ArrowRight, Sparkles, Terminal, Code2, Lock } from 'lucide-react';

interface SystemConfiguratorProps {
  onInitiateBriefing?: (details: string) => void;
}

export default function SystemConfigurator({ onInitiateBriefing }: SystemConfiguratorProps) {
  const [archetype, setArchetype] = useState<'erp' | 'clinical' | 'supply' | 'ai-hub' | 'portal'>('erp');
  const [dbTier, setDbTier] = useState<'postgres' | 'vector' | 'airgap'>('postgres');
  const [aiEngine, setAiEngine] = useState<'8b' | '32b' | 'none'>('8b');
  const [compliance, setCompliance] = useState<string[]>(['dpdp', 'soc2']);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiled, setCompiled] = useState(false);

  const toggleCompliance = (item: string) => {
    if (compliance.includes(item)) {
      setCompliance(compliance.filter(c => c !== item));
    } else {
      setCompliance([...compliance, item]);
    }
  };

  // Calculations based on choices
  const getTimeline = () => {
    let weeks = 3;
    if (archetype === 'erp') weeks += 2;
    if (archetype === 'clinical') weeks += 3;
    if (archetype === 'supply') weeks += 2;
    if (archetype === 'ai-hub') weeks += 2;
    if (dbTier === 'vector') weeks += 1;
    if (dbTier === 'airgap') weeks += 2;
    if (aiEngine === '32b') weeks += 1;
    return `${weeks}-${weeks + 2} Weeks`;
  };

  const getSecurityScore = () => {
    let score = 94;
    if (compliance.includes('dpdp')) score += 2;
    if (compliance.includes('hipaa')) score += 2;
    if (compliance.includes('soc2')) score += 1.5;
    if (dbTier === 'airgap') score += 0.4;
    return Math.min(score, 99.9).toFixed(1) + '%';
  };

  const handleCompileBlueprint = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setCompiled(true);
    }, 900);
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-10 border border-slate-800/80 relative overflow-hidden text-left shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive System Architect</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Configure Your Custom System Blueprint
          </h3>
          <p className="text-slate-400 text-sm max-w-xl">
            Select your architectural parameters to calculate deployment timelines, security compliance metrics, and technical specifications in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl px-5 py-3 text-right">
          <Clock className="text-blue-400 flex-shrink-0" size={24} />
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Estimated Delivery</span>
            <span className="text-lg font-bold text-white font-mono">{getTimeline()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        
        {/* Left Column Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: System Archetype */}
          <div className="space-y-3">
            <label className="text-xs font-mono text-blue-400 uppercase tracking-widest block font-semibold">
              1. Select System Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'erp', name: 'Enterprise ERP & Ops Suite', desc: 'Custom resource management, inventory & financial reporting' },
                { id: 'clinical', name: 'Healthcare & Clinical Portal', desc: 'HIPAA compliant patient telemetry & medical workflows' },
                { id: 'supply', name: 'Supply Chain & Logistics Vault', desc: 'Real-time multi-node tracking & telemetry pipeline' },
                { id: 'ai-hub', name: 'Sovereign AI Agent Hub', desc: 'Private local LLM orchestration & document processing' },
                { id: 'portal', name: 'Secured Web Portal & SaaS', desc: 'High-threat audited web application & customer portal' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setArchetype(item.id as any); setCompiled(false); }}
                  className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    archetype === item.id
                      ? 'bg-blue-600/20 border-blue-500/80 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-100 flex items-center justify-between">
                    <span>{item.name}</span>
                    {archetype === item.id && <CheckCircle2 size={14} className="text-blue-400" />}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Database & Vault Storage */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono text-blue-400 uppercase tracking-widest block font-semibold">
              2. Data & Database Architecture
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'postgres', label: 'PostgreSQL + Drizzle', sub: 'High-speed relational' },
                { id: 'vector', label: 'pgvector Hybrid', sub: 'Semantic search ready' },
                { id: 'airgap', label: 'Air-Gapped SQLite', sub: 'Max physical isolation' },
              ].map(tier => (
                <button
                  key={tier.id}
                  onClick={() => { setDbTier(tier.id as any); setCompiled(false); }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    dbTier === tier.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Server size={16} className={`mx-auto mb-1 ${dbTier === tier.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-xs block font-bold text-slate-200">{tier.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{tier.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Sovereign Local AI Engine */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono text-blue-400 uppercase tracking-widest block font-semibold">
              3. Embedded AI Engine Integration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '8b', name: 'JanaLLM 8B', desc: 'Fast local inferencing' },
                { id: '32b', name: 'JanaLLM 32B', desc: 'Deep reasoning sovereign' },
                { id: 'none', name: 'Standard / None', desc: 'Clean rule-based engine' },
              ].map(ai => (
                <button
                  key={ai.id}
                  onClick={() => { setAiEngine(ai.id as any); setCompiled(false); }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    aiEngine === ai.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu size={16} className={`mb-1 ${aiEngine === ai.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-xs block font-bold text-slate-200">{ai.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{ai.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Compliance Badges */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono text-blue-400 uppercase tracking-widest block font-semibold">
              4. Security & Compliance Modules
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'dpdp', label: 'DPDP Act 2023 Compliant' },
                { id: 'hipaa', label: 'HIPAA & ISO 27001' },
                { id: 'soc2', label: 'SOC 2 Type II Certified' },
                { id: 'defense', label: 'Air-Gapped Vault Security' }
              ].map(c => {
                const active = compliance.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => { toggleCompliance(c.id); setCompiled(false); }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Shield size={12} className={active ? 'text-blue-400' : 'text-slate-500'} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column Real-Time Compiled Telemetry */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center gap-2">
                <Terminal size={14} className="text-blue-400" />
                <span>Architecture Spec</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                <Lock size={12} />
                <span>Score: {getSecurityScore()}</span>
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Archetype</span>
                <span className="text-slate-200 font-semibold uppercase">{archetype}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Database</span>
                <span className="text-indigo-300 font-semibold">{dbTier === 'postgres' ? 'PostgreSQL' : dbTier === 'vector' ? 'pgvector' : 'Air-Gapped SQLite'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">AI Engine</span>
                <span className="text-emerald-300 font-semibold">{aiEngine === '8b' ? 'JanaLLM-8B (Local)' : aiEngine === '32b' ? 'JanaLLM-32B (Sovereign)' : 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Compliance</span>
                <span className="text-blue-300 font-semibold">{compliance.length} Modules Active</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Deployment SLA</span>
                <span className="text-slate-200">On-Prem / Private VPC</span>
              </div>
            </div>

            {/* Terminal log snippet */}
            <div className="bg-black/80 rounded-xl p-3 border border-slate-900 font-mono text-[11px] text-slate-400 space-y-1.5 max-h-36 overflow-y-auto">
              <p className="text-blue-400">$ neurojana-architect --compile-spec</p>
              <p className="text-slate-500">[INFO] Mapping React 19 UI component trees...</p>
              <p className="text-slate-500">[INFO] Configuring type-safe Drizzle schemas...</p>
              {aiEngine !== 'none' && (
                <p className="text-emerald-400">[INFO] Binding {aiEngine.toUpperCase()} sovereign model weights...</p>
              )}
              {compiled && (
                <p className="text-emerald-300 font-semibold">[SUCCESS] Specification ready for Nagpur dev sprint!</p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {!compiled ? (
              <button
                onClick={handleCompileBlueprint}
                disabled={isCompiling}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs font-mono tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {isCompiling ? (
                  <>
                    <Sparkles size={16} className="animate-spin" />
                    <span>Compiling Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Code2 size={16} />
                    <span>Generate Blueprint Spec</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => onInitiateBriefing?.(`Blueprint: ${archetype.toUpperCase()} | DB: ${dbTier} | AI: ${aiEngine}`)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs font-mono tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Initiate Engineering Briefing</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
