import React, { useState } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, Zap, Users, ShieldAlert, ArrowRight } from 'lucide-react';

interface ROICalculatorProps {
  onInquire?: () => void;
}

export default function ROICalculator({ onInquire }: ROICalculatorProps) {
  const [teamSize, setTeamSize] = useState<number>(50);
  const [annualSaaS, setAnnualSaaS] = useState<number>(45000); // USD
  const [dataSensitivity, setDataSensitivity] = useState<'standard' | 'high' | 'defense'>('high');

  // Calculation Logic
  // Per seat SaaS cost estimated: annualSaaS / teamSize
  // Bespoke ERP typical amortized cost savings over 3 years: eliminate 70% of subscription bloat
  const calculate3YrSavings = () => {
    const total3YrSaaS = annualSaaS * 3;
    const estimatedCustomCost = 25000 + teamSize * 150; // One-time build + lightweight maintenance
    const savings = total3YrSaaS - estimatedCustomCost;
    return Math.max(savings, 12000);
  };

  const calculatePaybackMonths = () => {
    const customCost = 25000 + teamSize * 150;
    const monthlySaaS = annualSaaS / 12;
    const months = customCost / monthlySaaS;
    return Math.max(months, 2.5).toFixed(1);
  };

  const savings3Yr = calculate3YrSavings();
  const paybackMonths = calculatePaybackMonths();

  return (
    <div className="glass-card rounded-3xl p-6 md:p-10 border border-slate-800/80 relative overflow-hidden text-left shadow-2xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      
      {/* Title */}
      <div className="max-w-2xl space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-semibold uppercase tracking-wider">
          <TrendingUp size={14} />
          <span>Interactive Enterprise ROI Calculator</span>
        </div>
        <h3 className="text-2xl md:text-3.5xl font-bold text-white tracking-tight">
          Calculate Your Bespoke Software Savings
        </h3>
        <p className="text-slate-400 text-sm">
          Multi-tenant SaaS software charges aggressive per-seat licensing fees that scale forever. Bespoke enterprise systems yield 100% code ownership and flatten software spend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Sliders Input Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Team Seats Slider */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                <span>Active Internal Users / Seats</span>
              </label>
              <span className="text-lg font-bold font-mono text-white bg-blue-600/20 px-3 py-0.5 rounded-lg border border-blue-500/40">
                {teamSize} Seats
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10 Seats</span>
              <span>250 Seats</span>
              <span>500 Seats</span>
            </div>
          </div>

          {/* Current Annual Spend Slider */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" />
                <span>Current Annual SaaS & License Spend</span>
              </label>
              <span className="text-lg font-bold font-mono text-emerald-400 bg-emerald-600/20 px-3 py-0.5 rounded-lg border border-emerald-500/40">
                ${annualSaaS.toLocaleString()} / yr
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={annualSaaS}
              onChange={(e) => setAnnualSaaS(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>$10,000/yr</span>
              <span>$100,000/yr</span>
              <span>$200,000/yr</span>
            </div>
          </div>

          {/* Data Sensitivity Radio */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider block">
              Data Privacy & Security Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'standard', label: 'Commercial Standard', desc: 'Encrypted Cloud' },
                { id: 'high', label: 'DPDP Act Sovereign', desc: 'Indian Data Guard' },
                { id: 'defense', label: 'Air-Gapped Vault', desc: 'Zero Cloud Exposure' },
              ].map(level => (
                <button
                  key={level.id}
                  onClick={() => setDataSensitivity(level.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    dataSensitivity === level.id
                      ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs block font-bold text-slate-200">{level.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{level.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Output Metrics Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold block border-b border-slate-800 pb-3">
              3-Year Enterprise Financial Projection
            </span>

            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                Projected 3-Year Net Savings
              </span>
              <div className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-tight mt-1">
                ${savings3Yr.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Compared to multi-tenant per-seat SaaS subscription renewal inflation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Payback Period</span>
                <span className="text-xl font-bold font-mono text-blue-400">{paybackMonths} Months</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Data Ownership</span>
                <span className="text-xl font-bold font-mono text-emerald-400">100% Proprietary</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={onInquire}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs font-mono tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Request Detailed ROI Audit</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
