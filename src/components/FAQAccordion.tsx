import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Shield, Code, Server, Lock } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'sovereignty' | 'erp' | 'ai' | 'ip';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    category: 'sovereignty',
    question: 'How does Neurojana AI ensure full compliance with the Indian DPDP Act of 2023?',
    answer: 'All data pipelines, databases, and microservices built by Neurojana AI enforce strict end-to-end encryption (AES-256) and store raw transaction data locally within your designated infrastructure (on-premise or private Indian VPC). We do not send your internal communications or customer records to third-party multi-tenant AI models.'
  },
  {
    id: '2',
    category: 'erp',
    question: 'Why build custom ERP software instead of using SAP, Salesforce, or Zoho?',
    answer: 'Off-the-shelf platforms lock enterprise clients into expensive per-seat recurring subscription models that increase every year. Furthermore, generic platforms force your business logic into pre-baked templates. Bespoke ERP software built with JanaCore gives you 100% intellectual property ownership, zero subscription bloat, and custom workflow automation tailored exactly to your operations.'
  },
  {
    id: '3',
    category: 'ai',
    question: 'Can the sovereign JanaLLM models run completely offline without internet?',
    answer: 'Yes. JanaLLM 8B and 32B models are engineered to execute on local hardware accelerators (on-premise servers or workstation GPUs) without sending a single byte over the public internet. This makes it ideal for defense contractors, financial institutions, and healthcare providers handling air-gapped workloads.'
  },
  {
    id: '4',
    category: 'ip',
    question: 'Who owns the source code and database schemas upon delivery?',
    answer: 'You do. Unlike SaaS vendors, upon delivery and contract completion, full ownership of the React 19 frontend, Node.js backend server code (`dist/server.cjs`), PostgreSQL database schemas, and custom API integrations is transferred completely to your enterprise.'
  },
  {
    id: '5',
    category: 'erp',
    question: 'What is the typical timeline for developing a bespoke enterprise portal?',
    answer: 'Standard bespoke applications and operational management portals take between 3 to 6 weeks from initial architecture specification to production launch. We work in rapid 1-week iterative sprints from our engineering hub in Nagpur.'
  },
  {
    id: '6',
    category: 'sovereignty',
    question: 'Can we deploy the completed application inside our own private cloud or physical servers?',
    answer: 'Absolutely. We support deployment to bare-metal physical servers, local Kubernetes clusters, or air-gapped private VPCs on AWS, Google Cloud, or Azure India regions.'
  }
];

export default function FAQAccordion() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openId, setOpenId] = useState<string | null>('1');

  const filteredFaqs = FAQ_ITEMS.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Category filters & search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'sovereignty', label: 'DPDP & Sovereignty' },
            { id: 'erp', label: 'Custom ERP vs SaaS' },
            { id: 'ai', label: 'Local Sovereign AI' },
            { id: 'ip', label: 'IP & Delivery' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 border-blue-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm font-mono border border-slate-900 rounded-2xl">
            No matching questions found for "{searchQuery}".
          </div>
        ) : (
          filteredFaqs.map(faq => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-slate-200 flex items-center gap-3">
                    <HelpCircle size={16} className="text-blue-400 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-900/60 font-sans pl-13">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
