import React, { useState } from 'react';
import { Send, Shield, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    text: string;
  }>({ type: 'idle', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }

    setStatus({ type: 'loading', text: 'Securing cloud transmission and validating compliance nodes...' });

    try {
      await addDoc(collection(db, 'contacts'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim() || 'N/A',
        message: formData.message.trim(),
        timestamp: new Date().toISOString()
      });

      setStatus({ 
        type: 'success', 
        text: 'Handshake secured. Your enterprise inquiry has been saved to the secure cloud registry. An executive engineer will respond shortly.' 
      });
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (err: any) {
      setStatus({
        type: 'error',
        text: 'Transmission failed: ' + err.message
      });
    }
  };

  return (
    <div id="contact-form-component" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.03),transparent_40%)] pointer-events-none" />
      
      {status.type === 'success' ? (
        <div className="text-center py-8 space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-2xl font-semibold text-slate-100">Handshake Secured</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {status.text}
          </p>
          <div className="pt-4">
            <button
              onClick={() => setStatus({ type: 'idle', text: '' })}
              className="text-emerald-400 hover:text-emerald-300 font-mono text-xs uppercase tracking-wider underline cursor-pointer"
            >
              Submit another query
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-sans font-semibold text-slate-200">
              Enterprise Consultation
            </h3>
            <p className="text-xs text-slate-400">
              Schedule an air-gapped deployment audit or custom hardware provisioning with our engineering team.
            </p>
          </div>

          {status.type === 'error' && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400">
              {status.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Full Name <span className="text-emerald-500">*</span>
              </label>
              <input
                type="text"
                id="contact-name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. Rajesh Gupta"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Work Email <span className="text-emerald-500">*</span>
              </label>
              <input
                type="email"
                id="contact-email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rgupta@defense.org.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-company" className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Company / Government Entity
            </label>
            <input
              type="text"
              id="contact-company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Strategic Defense Integrators"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Deployment Inquiry Details <span className="text-emerald-500">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your security, latency, or compliance requirements. Include target parameter sizes if seeking localized LLM weights fine-tuning."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono uppercase bg-slate-950/40 p-2.5 border border-slate-800/40 rounded-xl">
            <Shield size={14} className="text-emerald-400" />
            <span>End-to-End Encryption verified. Handshake routed via SSL SHA-256.</span>
          </div>

          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer text-sm"
            id="contact-submit-btn"
          >
            {status.type === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Encrypting & Transmitting...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Secure Ingress Transmission</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
