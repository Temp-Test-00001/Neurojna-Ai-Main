import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Cpu,
  Brain,
  Shield,
  Layers,
  ArrowRight,
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Terminal,
  Zap,
  Globe,
  Sparkles,
  ChevronRight,
  Check,
  Lock,
  ArrowUpRight,
  Award,
  Users,
  Building,
  Info,
  CheckCircle,
  FileText,
  Settings
} from 'lucide-react';

import { SOLUTIONS, CASE_STUDIES, BLOGS, CAREER_OPENINGS } from './data';
import { ActiveTab, Solution, CaseStudy, BlogPost, CareerOpening } from './types';
import JanaLLMPlayground from './components/JanaLLMPlayground';
import ContactForm from './components/ContactForm';
import AdminConsole from './components/AdminConsole';
import SystemConfigurator from './components/SystemConfigurator';
import TechStackShowcase from './components/TechStackShowcase';
import ROICalculator from './components/ROICalculator';
import FAQAccordion from './components/FAQAccordion';
import { db } from './firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
const logoSrc = '/logo.png';

// ── Typewriter Component ──
function Typewriter({ texts, speed = 60, deleteSpeed = 30, pauseMs = 2200 }: {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseMs?: number;
}) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[textIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentFullText.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);

        if (charIndex + 1 >= currentFullText.length) {
          setTimeout(() => setIsDeleting(true), pauseMs);
        }
      } else {
        setDisplayText(currentFullText.slice(0, charIndex - 1));
        setCharIndex(prev => prev - 1);

        if (charIndex <= 1) {
          setIsDeleting(false);
          setTextIndex(prev => (prev + 1) % texts.length);
          setCharIndex(0);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, deleteSpeed, pauseMs]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 animate-gradient-shift">
      {displayText}
      <span className="typewriter-cursor" />
    </span>
  );
}

// ── Count-Up Animation Hook ──
function useCountUp(target: number, duration: number = 1800, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const startTime = performance.now();
    const step = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

// ── IntersectionObserver fade-in hook ──
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ── Count-Up Ticker Display Component ──
function CountUpTicker({ target, suffix = '', label, color }: {
  target: number;
  suffix?: string;
  label: string;
  color: string;
}) {
  const { count, ref } = useCountUp(target, 1800);
  return (
    <div className="flex flex-col text-left" ref={ref}>
      <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-mono">
        {count}{suffix}
      </span>
      <span className={`text-[11px] ${color} uppercase tracking-widest font-mono font-bold mt-1`}>
        {label}
      </span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroTab, setHeroTab] = useState<'telemetry' | 'ai' | 'security'>('telemetry');

  // Dynamic Customizable Content State
  const [solutions, setSolutions] = useState<Solution[]>(SOLUTIONS);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(CASE_STUDIES);
  const [blogs, setBlogs] = useState<BlogPost[]>(BLOGS);
  const [careers, setCareers] = useState<CareerOpening[]>(CAREER_OPENINGS);

  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [selectedJob, setSelectedJob] = useState<CareerOpening | null>(null);
  const [jobApplied, setJobApplied] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(true);

  // Sync Content with server state / Firestore
  const fetchContent = async () => {
    try {
      // 1. Solutions
      const solSnap = await getDocs(collection(db, 'solutions'));
      if (!solSnap.empty) {
        setSolutions(solSnap.docs.map(doc => doc.data() as Solution));
      } else {
        setSolutions(SOLUTIONS);
      }

      // 2. Case Studies
      const csSnap = await getDocs(collection(db, 'caseStudies'));
      if (!csSnap.empty) {
        setCaseStudies(csSnap.docs.map(doc => doc.data() as CaseStudy));
      } else {
        setCaseStudies(CASE_STUDIES);
      }

      // 3. Blogs
      const blogSnap = await getDocs(collection(db, 'blogs'));
      if (!blogSnap.empty) {
        setBlogs(blogSnap.docs.map(doc => doc.data() as BlogPost));
      } else {
        setBlogs(BLOGS);
      }

      // 4. Careers
      const careerSnap = await getDocs(collection(db, 'careers'));
      if (!careerSnap.empty) {
        setCareers(careerSnap.docs.map(doc => doc.data() as CareerOpening));
      } else {
        setCareers(CAREER_OPENINGS);
      }

    } catch (err) {
      console.warn("Cloud Firestore content offline or uninitialized, using static defaults:", err);
      // Ensure defaults are loaded
      setSolutions(SOLUTIONS);
      setCaseStudies(CASE_STUDIES);
      setBlogs(BLOGS);
      setCareers(CAREER_OPENINGS);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Newsletter Footer State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  // Bespoke System Builder Sandbox State
  const [systemArchetype, setSystemArchetype] = useState('enterprise-erp');
  const [includeAI, setIncludeAI] = useState<'NONE' | 'JanaLLM-8B' | 'JanaLLM-32B'>('JanaLLM-8B');
  const [systemStatus, setSystemStatus] = useState<'idle' | 'compiling' | 'ready'>('idle');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [estBuildTime, setEstBuildTime] = useState('4-5 Weeks');
  const [estSecurityGrade, setEstSecurityGrade] = useState('SOC 2 & DPDP Compliant');
  const [estDeployment, setEstDeployment] = useState('On-Premise Private Server');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus({ type: 'error', message: 'Please provide a valid email.' });
      return;
    }
    setNewsletterStatus({ type: 'loading', message: 'Securing cloud registry Handshake...' });
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: newsletterEmail.trim(),
        timestamp: new Date().toISOString()
      });
      
      setNewsletterStatus({ 
        type: 'success', 
        message: 'Your email registry is secure. Welcome to the Neurojna AI Briefing.' 
      });
      setNewsletterEmail('');
    } catch (err: any) {
      setNewsletterStatus({ 
        type: 'error', 
        message: 'Registration transmission failed: ' + err.message 
      });
    }
  };

  const runSystemArchitectureSimulation = () => {
    setSystemStatus('compiling');
    setSystemLogs([
      `[Architect] Ingesting requirements for: ${systemArchetype === 'enterprise-erp' ? 'Enterprise ERP & Operations Suite' : systemArchetype === 'custom-web-portal' ? 'Secured Customer Web Portal' : 'Clinical Management System'}`,
      `[Architect] Creating clean React 18 / Vite / Tailwind UI component trees...`,
      `[Architect] Mapping database schemas (PostgreSQL via type-safe Drizzle ORM)...`,
    ]);

    setTimeout(() => {
      setSystemLogs(prev => [
        ...prev,
        includeAI !== 'NONE' ? `[Architect] Bundling local ${includeAI} neural weights inside application sandbox...` : `[Architect] Skipping AI integration. Deforming database pipeline...`,
        `[Architect] Implementing AES-256 state encryption and role-based access tokens...`,
        `[Architect] Generating server-side routes and compiling entry point to dist/server.cjs...`,
      ]);
    }, 800);

    setTimeout(() => {
      let buildTime = '4-5 Weeks';
      let securityGrade = 'SOC 2 & DPDP Compliant';
      let deployment = 'On-Premise Private Server';

      if (systemArchetype === 'custom-web-portal') {
        buildTime = '3-4 Weeks';
        securityGrade = 'High-Threat Audited (OWASP)';
        deployment = 'Secure Private VPC (GCP/AWS)';
      } else if (systemArchetype === 'clinical-portal') {
        buildTime = '5-6 Weeks';
        securityGrade = 'HIPAA & ISO 27001 Certified';
        deployment = 'Physical Air-Gapped Network';
      }

      setEstBuildTime(buildTime);
      setEstSecurityGrade(securityGrade);
      setEstDeployment(deployment);
      setSystemStatus('ready');
      setSystemLogs(prev => [
        ...prev,
        `[Architect] Architecture blueprint compiled successfully!`,
        `[Architect] Ready for engineering handoff. Timeline: ${buildTime} | Security Grade: ${securityGrade}`,
        `[Architect] Contact our Bengaluru team to initiate active development.`
      ]);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-600 selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-15%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[50%] right-[-10%] w-[450px] h-[450px] bg-emerald-600/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="sticky top-0 w-full bg-[#020617]/85 backdrop-blur-md border-b border-slate-900 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          
          {/* Logo Brand */}
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 cursor-pointer text-left focus:outline-none group"
            id="nav-logo-btn"
          >
            <img
              src={logoSrc}
              alt="Neurojna AI Logo"
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('solutions')}
              className={`hover:text-blue-400 transition-colors cursor-pointer ${activeTab === 'solutions' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Solutions
            </button>
            <button
              onClick={() => setActiveTab('technology')}
              className={`hover:text-blue-400 transition-colors cursor-pointer ${activeTab === 'technology' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Technology
            </button>
            <button
              onClick={() => setActiveTab('case-studies')}
              className={`hover:text-blue-400 transition-colors cursor-pointer ${activeTab === 'case-studies' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Case Studies
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`hover:text-blue-400 transition-colors cursor-pointer ${activeTab === 'about' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Company
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`hover:text-blue-400 transition-colors cursor-pointer ${activeTab === 'blog' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('careers')}
              className={`hover:text-blue-400 transition-colors cursor-pointer ${activeTab === 'careers' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Careers
            </button>
            

            <button
              onClick={() => setActiveTab('contact')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              id="cta-nav-demo"
            >
              Talk to Sales
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden gap-3">
            <button
              onClick={() => setActiveTab('contact')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full text-xs transition cursor-pointer"
            >
              Talk to Sales
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white transition focus:outline-none p-1"
              aria-label="Toggle navigation menu"
              id="nav-mobile-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#020617] border-b border-slate-900 px-6 py-6 space-y-4 animate-fade-in z-40 relative">
            <div className="flex flex-col gap-4 text-slate-300">
              <button
                onClick={() => { setActiveTab('solutions'); setMobileMenuOpen(false); }}
                className={`text-left text-base py-1.5 border-b border-slate-900 ${activeTab === 'solutions' ? 'text-blue-400 font-medium' : ''}`}
              >
                Solutions
              </button>
              <button
                onClick={() => { setActiveTab('technology'); setMobileMenuOpen(false); }}
                className={`text-left text-base py-1.5 border-b border-slate-900 ${activeTab === 'technology' ? 'text-blue-400 font-medium' : ''}`}
              >
                Technology
              </button>
              <button
                onClick={() => { setActiveTab('case-studies'); setMobileMenuOpen(false); }}
                className={`text-left text-base py-1.5 border-b border-slate-900 ${activeTab === 'case-studies' ? 'text-blue-400 font-medium' : ''}`}
              >
                Case Studies
              </button>
              <button
                onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
                className={`text-left text-base py-1.5 border-b border-slate-900 ${activeTab === 'about' ? 'text-blue-400 font-medium' : ''}`}
              >
                Company
              </button>
              <button
                onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false); }}
                className={`text-left text-base py-1.5 border-b border-slate-900 ${activeTab === 'blog' ? 'text-blue-400 font-medium' : ''}`}
              >
                Insights
              </button>
              <button
                onClick={() => { setActiveTab('careers'); setMobileMenuOpen(false); }}
                className={`text-left text-base py-1.5 border-b border-slate-900 ${activeTab === 'careers' ? 'text-blue-400 font-medium' : ''}`}
              >
                Careers
              </button>

              <button
                onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
                className={`text-left text-base py-1.5 border-b border-slate-900 ${activeTab === 'contact' ? 'text-blue-400 font-medium' : ''}`}
              >
                Contact & Audit
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container / View Router */}
      <main className="flex-1 z-10">
        
        {/* ================= HOME VIEW ================= */}
        {activeTab === 'home' && (
          <div className="space-y-24 md:space-y-36 animate-fade-in relative">
            
            {/* Ambient Neural Grid Background Layer */}
            <div className="absolute inset-0 bg-neural-grid pointer-events-none opacity-40 z-0" />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              
              {/* Left Column Copy */}
              <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                
                {/* Live Status Pill */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-slate-900/90 border border-blue-500/30 rounded-full w-fit backdrop-blur-md shadow-lg shadow-blue-500/10 animate-fade-in-up animate-pulse-glow">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">
                    NAGPUR CORE ACTIVE <span className="text-blue-400">|</span> GEMINI 3.5 NATIVE
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white tracking-tight animate-fade-in-up">
                  Custom Enterprise Software, <br className="hidden sm:block"/>
                  <Typewriter
                    texts={['Bespoke ERPs', 'Sovereign AI Models', 'Air-Gapped Security', 'Custom Web Portals', 'Tailored ERP Systems']}
                    speed={70}
                    deleteSpeed={35}
                    pauseMs={2500}
                  />
                  <br className="hidden sm:block" />
                  & Total Code Ownership.
                </h1>
                
                <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal animate-fade-in-up delay-200">
                  Neurojana AI Pvt. Ltd. builds robust custom web applications, advanced internal management portals, and tailor-made ERP systems. Engineered with zero multi-tenant licensing bloat, total code ownership, and DPDP Act 2023 compliance.
                </p>
                
                <div className="flex flex-wrap items-center gap-4 pt-4 animate-fade-in-up delay-300">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition cursor-pointer text-sm font-sans flex items-center gap-2.5 shadow-xl shadow-blue-500/25 scale-105 hover:scale-108"
                    id="hero-cta-briefing"
                  >
                    <span>Initiate Systems Briefing</span>
                    <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('system-configurator-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 text-slate-200 hover:text-white font-semibold rounded-2xl transition cursor-pointer text-sm flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-blue-400" />
                    <span>Configure System Blueprint</span>
                  </button>
                </div>

                {/* Micro Guarantee Tags */}
                <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-slate-400 animate-fade-in-up delay-400">
                  <span className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>100% IP Code Ownership</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>DPDP Act 2023 Certified</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>Air-Gapped Local LLM</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Interactive 3D Telemetry & Sandbox Widget */}
              <div className="lg:col-span-5 relative flex items-center justify-center animate-fade-in-right delay-300">
                
                <div className="w-full bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                  
                  {/* Ambient Glow Header */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-3xl pointer-events-none" />

                  {/* Widget Interactive Tabs */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setHeroTab('telemetry')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          heroTab === 'telemetry'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Cpu size={14} />
                        <span>Telemetry</span>
                      </button>
                      <button
                        onClick={() => setHeroTab('ai')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          heroTab === 'ai'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Brain size={14} />
                        <span>AI Engine</span>
                      </button>
                      <button
                        onClick={() => setHeroTab('security')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          heroTab === 'security'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Shield size={14} />
                        <span>Security</span>
                      </button>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Live" />
                  </div>

                  {/* Tab Content Display */}
                  {heroTab === 'telemetry' && (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="bg-black/50 border border-slate-900 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>API Latency SLA</span>
                          <span className="text-emerald-400 font-bold text-sm">0.042 ms</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full w-[94%]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                          <span className="text-slate-500 text-[10px] uppercase block">Database Engine</span>
                          <span className="text-slate-200 font-bold">PostgreSQL Drizzle</span>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                          <span className="text-slate-500 text-[10px] uppercase block">Active Cores</span>
                          <span className="text-blue-400 font-bold">96 Compute Cores</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300">
                        ● Zero multi-tenant cloud bottlenecks. 100% custom database index speed.
                      </div>
                    </div>
                  )}

                  {heroTab === 'ai' && (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="bg-black/50 border border-slate-900 rounded-2xl p-4 space-y-2">
                        <span className="text-emerald-400 font-bold block">JanaLLM-8B Sovereign Inference</span>
                        <p className="text-[11px] text-slate-400 font-sans">
                          Local offline execution bounds. 0 data bytes emitted outside enterprise network perimeter.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                          <span className="text-slate-500 text-[10px] uppercase block">Tokens / Sec</span>
                          <span className="text-emerald-400 font-bold">128 t/s Local</span>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                          <span className="text-slate-500 text-[10px] uppercase block">Cloud Billing</span>
                          <span className="text-slate-200 font-bold">$0 / Month</span>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300">
                        ● Native WebGPU acceleration + optional Gemini 3.5 hybrid cloud fallback.
                      </div>
                    </div>
                  )}

                  {heroTab === 'security' && (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="bg-black/50 border border-slate-900 rounded-2xl p-4 space-y-2">
                        <span className="text-indigo-400 font-bold block">DPDP Act 2023 Compliance Guard</span>
                        <p className="text-[11px] text-slate-400 font-sans">
                          AES-256 state encryption with immutable trigger-based audit trail logging.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                          <span className="text-slate-500 text-[10px] uppercase block">Security Grade</span>
                          <span className="text-indigo-400 font-bold">SOC 2 Type II</span>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                          <span className="text-slate-500 text-[10px] uppercase block">Air-Gap Vault</span>
                          <span className="text-emerald-400 font-bold">VERIFIED</span>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300">
                        ● Custom software hardened against OWASP Top 10 vulnerabilities.
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>STATUS: ALL NODES OPTIMAL</span>
                    <span>NAGPUR CORE REGISTRY</span>
                  </div>

                </div>
              </div>

            </section>

            {/* Core Metrics Ticker */}
            <section className="bg-slate-950/80 border-y border-slate-800/80 py-10 relative z-10 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-12 flex-wrap justify-center md:justify-start">
                  <div className="flex flex-col text-left">
                    <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-mono">100%</span>
                    <span className="text-[11px] text-blue-400 uppercase tracking-widest font-mono font-bold mt-1">Data Sovereignty</span>
                  </div>
                  <CountUpTicker target={40} suffix="+" label="Bespoke Enterprise Systems" color="text-indigo-400" />
                  <CountUpTicker target={0} suffix="" label="Cloud Exposure Risk" color="text-emerald-400" />
                </div>
                <div className="flex flex-wrap items-center gap-5 text-xs font-mono tracking-widest font-bold uppercase text-slate-400 opacity-60">
                  <span className="hover:text-blue-400 transition">DEFENSE</span>
                  <span className="hover:text-blue-400 transition">HEALTHCARE</span>
                  <span className="hover:text-blue-400 transition">BANKING</span>
                  <span className="hover:text-blue-400 transition">CRITICAL GRID</span>
                  <span className="hover:text-blue-400 transition">AVIATION</span>
                </div>
              </div>
            </section>

            {/* Why Sovereignty Matters Spotlight Grid */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
              <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                <h2 className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold">Systems Engineering</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Why Bespoke Enterprise Management?</h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Off-the-shelf software and multi-tenant SaaS tools force your team into rigid templates while charging expensive per-seat recurring fees. Custom enterprise software adapts perfectly to your exact business logic.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card glass-card-hover rounded-3xl p-8 transition duration-300 text-left space-y-4 animate-fade-in-up delay-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Shield size={22} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-100">100% Proprietary Codebases</h4>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    Bespoke web applications, native portals, and custom ERP systems built to match your operational workflows. You hold complete intellectual property rights to all code and schemas.
                  </p>
                </div>

                <div className="glass-card glass-card-hover rounded-3xl p-8 transition duration-300 text-left space-y-4 animate-fade-in-up delay-300">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Zap size={22} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-100">Tailored Operational Speed</h4>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    Bypass generic bloatware. Experience lightning-fast query execution, real-time telemetry dashboards, and micro-animations designed for maximum internal productivity.
                  </p>
                </div>

                <div className="glass-card glass-card-hover rounded-3xl p-8 transition duration-300 text-left space-y-4 animate-fade-in-up delay-500">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Globe size={22} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-100">DPDP Act & Vault Security</h4>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    Custom databases and API pipelines engineered strictly under the Indian Data Protection Act of 2023, HIPAA certifications, and air-gapped offline sandbox execution bounds.
                  </p>
                </div>
              </div>
            </section>

            {/* Interactive Tech Stack Showcase */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
              <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                <h2 className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold">Technology Stack</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Built on Modern Open-Source Standards</h3>
                <p className="text-slate-400 text-sm">
                  Explore our battle-tested technical stack powering high-concurrency enterprise portals and local AI runtimes.
                </p>
              </div>
              <TechStackShowcase />
            </section>

            {/* Interactive System Blueprint Configurator Section */}
            <section id="system-configurator-section" className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
              <SystemConfigurator onInitiateBriefing={(details) => setActiveTab('contact')} />
            </section>

            {/* Interactive Live Playground Widget (Sovereign Demonstration) */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
              <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-10 text-left">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold uppercase">
                      Live Technical Sandbox
                    </div>
                    <h3 className="text-2xl md:text-3.5xl font-bold text-white tracking-tight">
                      Experience JanaLLM v2.5 Online
                    </h3>
                    <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                      Test live queries against our embedded intelligence suite. Understand how custom AI models operate within isolated enterprise security zones.
                    </p>
                  </div>
                  <div className="lg:col-span-1 flex lg:justify-end">
                    <div className="text-xs font-mono text-slate-400 bg-black/60 border border-slate-800 rounded-2xl px-5 py-3">
                      <span className="text-emerald-400 font-bold block mb-1">● SANDBOX ACTIVE</span>
                      Engine: Sovereign Gemini 3.5 Hybrid <br/>
                      Latency: Real-Time Stream
                    </div>
                  </div>
                </div>

                {/* Playground component */}
                <JanaLLMPlayground />
              </div>
            </section>

            {/* Interactive ROI Calculator Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
              <ROICalculator onInquire={() => setActiveTab('contact')} />
            </section>

            {/* Testimonials Core / Social Proof */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
              <div className="bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-indigo-950/30 border border-slate-800 rounded-3xl p-8 md:p-12 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div className="space-y-4">
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold">Client Validation</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Endorsed by Technical Directors</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      See how enterprise compliance managers and technical directors deploy our custom systems for operational excellence.
                    </p>
                  </div>
                  
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Testimonial 1 */}
                    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
                      <p className="text-xs md:text-sm text-slate-300 italic leading-relaxed">
                        "National security mandates strictly prohibited us from using off-the-shelf SaaS platforms. Neurojana delivered a custom operations system with integrated offline LLM layers. Outstanding work."
                      </p>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">Col. S. Vardhan (Retd.)</h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Systems Inspector, Power Infrastructure Core</p>
                      </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
                      <p className="text-xs md:text-sm text-slate-300 italic leading-relaxed">
                        "The database throughput of our custom financial portal is incredible. By embedding localized AI purely on our secure database nodes, our forensic audit team can extract transaction insights securely."
                      </p>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">Meera Sen, PhD</h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Chief Security Officer, Himalaya Credit Bank</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive FAQ Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
              <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                <h2 className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold">Frequently Asked Questions</h2>
                <h3 className="text-3xl font-bold text-white tracking-tight">Everything You Need to Know</h3>
                <p className="text-slate-400 text-sm">
                  Clear answers about custom ERP software development, local AI model execution, data sovereignty, and IP ownership.
                </p>
              </div>
              <FAQAccordion />
            </section>

            {/* Final Conversion CTA Banner */}
            <section className="max-w-5xl mx-auto px-6 md:px-12 text-center space-y-6 pb-12 relative z-10">
              <div className="glass-card rounded-3xl p-10 md:p-14 border border-blue-500/30 relative overflow-hidden space-y-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 blur-[100px] pointer-events-none" />
                
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Ready to Build Your Custom <br className="hidden md:block"/>
                  Enterprise Infrastructure?
                </h2>
                <p className="text-slate-300 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                  Schedule a direct technical briefing with our Systems Architects in Nagpur. We will review your operational requirements and deliver a complete software blueprint.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="px-9 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition shadow-xl shadow-blue-500/25 cursor-pointer text-sm font-sans flex items-center gap-2"
                  >
                    <span>Initiate Systems Consultation</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ================= SOLUTIONS VIEW ================= */}
        {activeTab === 'solutions' && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24 animate-fade-in text-left">
            
            {/* Header copy */}
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-mono uppercase">
                Enterprise Suite
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Sovereign Hardware & Private Weights
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                We develop both custom neural accelerator silicon (NeuroCore Edge) and domain-specific enterprise models (JanaLLM) configured to execute seamlessly without an internet connection.
              </p>
            </div>

            {/* Solutions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {solutions.map((sol) => (
                <div
                  key={sol.id}
                  className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-8 relative hover:border-slate-800 transition duration-300"
                >
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      {sol.iconName === 'Cpu' ? <Cpu size={24} /> : sol.iconName === 'BrainCircuit' ? <Brain size={24} /> : <Layers size={24} />}
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold block">
                        {sol.type === 'product' ? 'Hardware/Software Product' : 'SLA Integration Service'}
                      </span>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{sol.title}</h3>
                      <p className="text-xs text-blue-300 font-semibold italic">{sol.tagline}</p>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">{sol.description}</p>
                    
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Key Capabilities:</span>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {sol.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check size={10} />
                            </span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => { setSelectedSolution(sol); }}
                      className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl tracking-wide transition cursor-pointer"
                    >
                      Technical Specs Sheet
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Spec Sheet Modal (Selected Solution) */}
            {selectedSolution && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setSelectedSolution(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1"
                  >
                    <X size={20} />
                  </button>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block">Detailed Specs</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{selectedSolution.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{selectedSolution.subtitle}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-900">
                    {selectedSolution.specs.map((sp, i) => (
                      <div key={i} className="flex justify-between text-xs py-2 border-b border-slate-900/60 font-mono">
                        <span className="text-slate-500 uppercase tracking-wider">{sp.label}</span>
                        <span className="text-slate-200 font-semibold text-right">{sp.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={() => { setSelectedSolution(null); setActiveTab('contact'); }}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tracking-wider transition cursor-pointer text-center"
                    >
                      Inquire Custom Order
                    </button>
                    <button
                      onClick={() => setSelectedSolution(null)}
                      className="px-5 py-3 bg-transparent border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison / Deployment Model Table */}
            <section className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-12 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2.5xl font-bold text-white">Compare Architecture Models</h3>
                <p className="text-sm text-slate-400">Comparing standard cloud infrastructure against Neurojana sovereign hardware setups.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest font-mono text-[10px]">
                      <th className="py-4 px-3">Parameters</th>
                      <th className="py-4 px-3">Public Hyperscale (APIs)</th>
                      <th className="py-4 px-3 text-blue-400">Neurojana Sovereign Cluster</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    <tr>
                      <td className="py-4 px-3 font-semibold text-slate-200">Data Transfer Safety</td>
                      <td className="py-4 px-3">Transmitted over public routers</td>
                      <td className="py-4 px-3 text-emerald-400 font-medium">100% Air-gapped (No data egress)</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-slate-200">Inference Latency</td>
                      <td className="py-4 px-3">Variable (120ms to 2400ms queue)</td>
                      <td className="py-4 px-3 text-emerald-400 font-medium">Sub-millisecond static priority</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-slate-200">Operational Independence</td>
                      <td className="py-4 px-3">Requires continuous internet access</td>
                      <td className="py-4 px-3 text-emerald-400 font-medium">Independent offline execution</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-slate-200">Legal Compliance (DPDP Act)</td>
                      <td className="py-4 px-3">Risk of foreign cloud audits</td>
                      <td className="py-4 px-3 text-emerald-400 font-medium">Fully certified local sovereignty</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-3 font-semibold text-slate-200">Energy Consumption cost</td>
                      <td className="py-4 px-3">Priced per million cloud tokens</td>
                      <td className="py-4 px-3 text-emerald-400 font-medium">Low power 45W per node hardware</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        )}

        {/* ================= TECHNOLOGY VIEW ================= */}
        {activeTab === 'technology' && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24 animate-fade-in text-left">
            
            {/* Header section */}
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block">Systems Architecture & Design</span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                How We Build: Hardened Software & Sovereign Data
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                By designing bespoke full-stack applications and private databases, we avoid the overhead of bloated generic software while embedding high-security offline AI tools directly within your firewalls.
              </p>
            </div>

            {/* Core architecture visual layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Interactive Architect Simulator Widget */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />
                
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Interactive Architect Sandbox</span>
                  <h3 className="text-xl font-bold text-slate-200">Bespoke System Builder</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select a target system archetype and desired local AI features to simulate how our systems architects map out your corporate infrastructure.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-900">
                  {/* Model Input Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">System Archetype</label>
                      <select
                        value={systemArchetype}
                        onChange={(e) => setSystemArchetype(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="enterprise-erp">Enterprise ERP & Operations</option>
                        <option value="custom-web-portal">Custom Secured Web Portal</option>
                        <option value="clinical-portal">Clinical Management System</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">Secure AI Layer</label>
                      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
                        {([
                          { key: 'NONE', label: 'None' },
                          { key: 'JanaLLM-8B', label: '8B' },
                          { key: 'JanaLLM-32B', label: '32B' }
                        ] as const).map((pr) => (
                          <button
                            key={pr.key}
                            type="button"
                            onClick={() => setIncludeAI(pr.key)}
                            className={`flex-1 py-1 text-[10px] font-mono rounded-lg transition cursor-pointer ${
                              includeAI === pr.key ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {pr.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={runSystemArchitectureSimulation}
                    disabled={systemStatus === 'compiling'}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {systemStatus === 'compiling' ? 'Compiling Architecture Build...' : 'Generate Architecture Blueprint'}
                  </button>
                </div>

                {/* Simulator output console logs */}
                <div className="bg-black/80 border border-slate-900 rounded-xl p-4 font-mono text-[10px] text-slate-400 space-y-1.5 min-h-[120px] max-h-[160px] overflow-y-auto">
                  <div className="text-emerald-400 font-bold uppercase pb-1 border-b border-slate-900">Console Log Output:</div>
                  {systemLogs.length === 0 ? (
                    <div className="text-slate-600 italic mt-2">Initialize simulation to map operational dependencies...</div>
                  ) : (
                    systemLogs.map((log, index) => (
                      <div key={index} className="animate-fade-in">{log}</div>
                    ))
                  )}
                </div>

                {/* Simulated board parameters */}
                <div className="grid grid-cols-3 gap-3 border-t border-slate-900 pt-4 text-center">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase">Est. Build Time</span>
                    <span className="text-sm font-mono font-bold text-slate-200 block mt-0.5">{estBuildTime}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase">Security Compliance</span>
                    <span className="text-sm font-mono font-bold text-emerald-400 block mt-0.5">{estSecurityGrade}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase">Host Target</span>
                    <span className="text-sm font-mono font-bold text-blue-300 block mt-0.5">{estDeployment}</span>
                  </div>
                </div>
              </div>

              {/* Explanatory notes */}
              <div className="space-y-6">
                <h3 className="text-2.5xl font-bold text-white tracking-tight">Hardened Software Engineering</h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Most off-the-shelf management systems bundle thousands of heavy external libraries, introducing critical injection paths. We build from the ground up, guaranteeing a lightweight codebase and secure database.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Layers size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-200">1. Full-Stack Application Design</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        Your custom systems are crafted with type-safe React frontend clients and robust Node.js/Python servers to ensure secure cookies, SSO validation, and flawless role access.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-200">2. Custom ERP Database Modules</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        Whether tracking multi-warehouse physical stock, healthcare indices, or financial journals, database schemas are fully customized and relational for efficient SQL query loads.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Lock size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-200">3. Sovereign AI Integration</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        Instead of sending customer records to external API endpoints, we embed private JanaLLM instances directly into your secure app, maintaining 100% data control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Industrial Deployment Spec list */}
            <section className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 md:p-12">
              <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
                <h3 className="text-2xl font-bold text-white">System Compliance & Security Layer</h3>
                <p className="text-sm text-slate-400">Our codebases undergo exhaustive security validation and are optimized for strict regulatory standards.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div className="bg-slate-950 border border-slate-900 p-6 rounded-xl space-y-2">
                  <Shield size={24} className="text-blue-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-100">Type-Safe Queries</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Using type-safe schemas to prevent standard SQL injection vulnerabilities completely.</p>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-6 rounded-xl space-y-2">
                  <Zap size={24} className="text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-100">Zero-Egress Mode</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Offline synchronization pathways for remote facilities operating without internet access.</p>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-6 rounded-xl space-y-2">
                  <Terminal size={24} className="text-indigo-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-100">Role Audit Logs</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Automated database auditing triggers for complete transparency over internal admin actions.</p>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-6 rounded-xl space-y-2">
                  <Lock size={24} className="text-blue-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-100">DPDP Safeguards</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Data sanitization and local encryption modules to fully respect Indian DPDP requirements.</p>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ================= CASE STUDIES VIEW ================= */}
        {activeTab === 'case-studies' && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24 animate-fade-in text-left">
            
            {/* Header */}
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block">Proven Handshakes</span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Sovereign AI in the Field
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Explore real industrial studies of companies and national authorities deploying JanaLLM and NeuroCore systems inside high-security perimeters.
              </p>
            </div>

            {/* Case Studies grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {caseStudies.map((cs) => (
                <div
                  key={cs.id}
                  className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-8 hover:border-slate-800 transition duration-300"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs font-mono border-b border-slate-900/80 pb-3">
                      <span className="text-slate-500 uppercase">{cs.industry}</span>
                      <span className="text-blue-400 font-bold">{cs.client}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-100 leading-snug">{cs.title}</h3>
                    
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{cs.challenge}</p>

                    {/* Metrics preview */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                      {cs.metrics.map((me, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-900 rounded-xl p-2.5">
                          <span className="text-sm font-mono font-bold text-emerald-400 block">{me.value}</span>
                          <span className="text-[8px] text-slate-500 font-mono uppercase block leading-tight mt-0.5">{me.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedCaseStudy(cs); }}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs tracking-wider rounded-xl transition cursor-pointer"
                  >
                    View Forensic Case Audit
                  </button>
                </div>
              ))}
            </div>

            {/* Detail Modal Case Study */}
            {selectedCaseStudy && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setSelectedCaseStudy(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1"
                  >
                    <X size={20} />
                  </button>

                  <div className="border-b border-slate-900 pb-4">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{selectedCaseStudy.industry} Case Study</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight mt-1">{selectedCaseStudy.title}</h3>
                    <p className="text-xs font-mono text-blue-300 mt-1">Client: {selectedCaseStudy.client}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">The Physical Challenge:</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedCaseStudy.challenge}</p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">The Sovereign Solution:</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedCaseStudy.solution}</p>
                    </div>

                    <div className="space-y-2 border-t border-slate-900 pt-4">
                      <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Quantifiable Results:</h4>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {selectedCaseStudy.results.map((res, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check size={10} />
                            </span>
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={() => { setSelectedCaseStudy(null); setActiveTab('contact'); }}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tracking-wider transition cursor-pointer text-center"
                    >
                      Audit Your Facility
                    </button>
                    <button
                      onClick={() => setSelectedCaseStudy(null)}
                      className="px-5 py-3 bg-transparent border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition cursor-pointer"
                    >
                      Dismiss Case
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= ABOUT US VIEW ================= */}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24 animate-fade-in text-left">
            
            {/* Mission Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block">Sovereign Mission</span>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                  Securing India's Cognitive Borders.
                </h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Founded in Nagpur, Neurojna AI Pvt. Ltd. was built by senior hardware engineers and cybersecurity scientists who recognized a massive flaw in modern machine learning: cloud dependence.
                </p>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Our mission is to engineer high-performance silicon accelerators and localized intelligence frameworks that grant organizations complete data sovereignty, absolute air-gapping protection, and zero network overhead.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="border-l-2 border-blue-500 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Core Location</span>
                    <span className="text-sm font-semibold text-slate-200 mt-0.5 block">Nagpur, India</span>
                  </div>
                  <div className="border-l-2 border-emerald-500 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Compliance Core</span>
                    <span className="text-sm font-semibold text-slate-200 mt-0.5 block">DPDP Act Compliant</span>
                  </div>
                </div>
              </div>

              {/* Photo representation / graphics mock */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 rounded-2xl p-8 relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Building size={18} className="text-blue-400" />
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Corporate Profile</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs text-slate-400">
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span>Entity Name</span>
                      <span className="text-slate-200">Neurojna AI Pvt. Ltd.</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span>Corporate ID</span>
                      <span className="text-slate-200">CIN: U72900MH2026PTC189012</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span>GST Registry</span>
                      <span className="text-slate-200">27AAHCN3829L1Z2</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span>Headquarters</span>
                      <span className="text-slate-200">VIP Road, Shankar Nagar, Nagpur</span>
                    </div>
                  </div>

                  <div className="p-4 bg-black/40 border border-slate-900 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">Our Core Guarantee</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "We guarantee complete physical separation of neural model files and customer transactions. We do not maintain telemetry bridges to outer networks."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leadership Core */}
            <section className="space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h3 className="text-3xl font-bold text-white tracking-tight">The Engineering Core</h3>
                <p className="text-slate-400 text-sm">Pioneers in localized silicon design and classified network architecture.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Member 1 */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 text-xl font-bold font-mono">
                    RN
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-200">Dr. Ramesh Nair</h4>
                    <span className="text-xs text-slate-500 font-mono block">Co-Founder & Chief Technology Officer</span>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                      Former Lead Hardware Architect at national scientific agencies. Specialist in MLIR compilers and ultra-low power silicon micro-architectures.
                    </p>
                  </div>
                </div>

                {/* Member 2 */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 text-xl font-bold font-mono">
                    SD
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-200">Siddharth Deshmukh</h4>
                    <span className="text-xs text-slate-500 font-mono block">Co-Founder & VP of Compliance</span>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                      Decade of cybersecurity audits across top-tier international banking clusters. Expert in the Indian DPDP Act and localized cryptographic key networks.
                    </p>
                  </div>
                </div>

                {/* Member 3 */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 text-xl font-bold font-mono">
                    AS
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-200">Amit Sen</h4>
                    <span className="text-xs text-slate-500 font-mono block">Lead Silicon Architect</span>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                      Specialist in high-density VRAM mapping and customized compiler kernels. Over 15 published designs in non-volatile memory controller chips.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ================= BLOG / INSIGHTS VIEW ================= */}
        {activeTab === 'blog' && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24 animate-fade-in text-left">
            
            {/* Header */}
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block">Sovereign Insights</span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                The Sovereign Intelligence Journal
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Critical updates and forensic deep-dives on hardware co-design, compliance audits, and data privacy in the era of automated intelligence.
              </p>
            </div>

            {/* Blogs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-slate-800 transition duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{post.category}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-200 leading-snug">{post.title}</h3>
                    
                    <p className="text-xs text-slate-400 leading-relaxed">{post.excerpt}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">{post.date}</span>
                    <button
                      onClick={() => { setSelectedBlog(post); }}
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Read Essay</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Modal Blog */}
            {selectedBlog && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setSelectedBlog(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1"
                  >
                    <X size={20} />
                  </button>

                  <div className="border-b border-slate-900 pb-4 space-y-2">
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                      <span>{selectedBlog.category}</span>
                      <span>{selectedBlog.date}</span>
                      <span>{selectedBlog.readTime}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{selectedBlog.title}</h3>
                    <p className="text-xs text-blue-400 font-mono font-medium">By {selectedBlog.author}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedBlog.content}</p>
                    
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 mt-6">
                      <span className="text-xs font-mono text-emerald-400 font-bold uppercase block">Compliance Note:</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Essays published in our journal represent academic and technical reviews by Neurojana scientists. No customer credentials or classified specs are ever shared publicly.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedBlog(null)}
                      className="px-6 py-2.5 bg-transparent border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition cursor-pointer font-semibold"
                    >
                      Close Journal Entry
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= CAREERS VIEW ================= */}
        {activeTab === 'careers' && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-24 animate-fade-in text-left">
            
            {/* Header */}
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block">Join our Core</span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Architect the Local Intelligence Frontier
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                We are looking for specialized engineers who want to build real silicon mappings, compile models down to physical gates, and secure national assets from outer cloud network exploits.
              </p>
            </div>

            {/* Careers List */}
            <div className="space-y-6">
              {careers.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-800 transition duration-300"
                >
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase">
                        {job.department}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {job.location} • {job.type} • Exp: {job.experience}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-100">{job.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{job.description}</p>
                  </div>

                  <button
                    onClick={() => { setSelectedJob(job); setJobApplied(false); }}
                    className="w-full md:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white font-semibold text-xs tracking-wider rounded-xl transition cursor-pointer"
                  >
                    View Specifications & Apply
                  </button>
                </div>
              ))}
            </div>

            {/* Detail Job / Application Modal */}
            {selectedJob && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1"
                  >
                    <X size={20} />
                  </button>

                  <div className="border-b border-slate-900 pb-4 space-y-2">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">{selectedJob.department} Core</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{selectedJob.title}</h3>
                    <p className="text-xs text-slate-500 font-mono">Location: {selectedJob.location} | Commitment: {selectedJob.type} | Experience: {selectedJob.experience}</p>
                  </div>

                  {jobApplied ? (
                    <div className="text-center py-8 space-y-4 animate-fade-in">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400">
                        <Check size={24} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-200">Application secured under cryptokey</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Your application hash has been cataloged. Our systems engineering HR core in Bengaluru will contact you via secure mail within 48 hours.
                      </p>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="text-xs text-blue-400 underline cursor-pointer mt-4"
                      >
                        Dismiss dialog
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">Role Description:</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{selectedJob.description}</p>
                      </div>

                      <div className="space-y-2 border-t border-slate-900 pt-4">
                        <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Qualifications required:</h4>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {selectedJob.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check size={10} />
                              </span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <form
                        onSubmit={(e) => { e.preventDefault(); setJobApplied(true); }}
                        className="space-y-4 border-t border-slate-900 pt-6"
                      >
                        <h4 className="text-xs font-mono text-slate-200 uppercase tracking-wider">Submit credentials securely:</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="email"
                            required
                            placeholder="Primary Email"
                            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <input
                          type="text"
                          required
                          placeholder="GitHub Profile or secure portfolio Link"
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />

                        <button
                          type="submit"
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                          Submit Handshake Application
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= CONTACT VIEW ================= */}
        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-16 animate-fade-in text-left">
            
            {/* Header copy */}
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block">Secure Ingress desk</span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Talk to our Systems Architects
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Connect directly with our engineering core to plan your physical facility audit, request customized compilation setups, or schedule localized rack installations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form container */}
              <ContactForm />

              {/* Office directions & legal */}
              <div className="space-y-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-slate-200">Nagpur Headquarters</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Our facility contains active silicon testing slots, compiler verification clusters, and secure server cages for classified military and financial data tests.
                    </p>

                    <div className="space-y-3 text-xs text-slate-300 font-sans">
                      <div className="flex items-start gap-2.5">
                        <MapPin size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Neurojna AI Pvt. Ltd., VIP Road, Shankar Nagar, Nagpur, Maharashtra, 440010</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Mail size={16} className="text-blue-400 flex-shrink-0" />
                        <span>neurojnaai@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone size={16} className="text-blue-400 flex-shrink-0" />
                        <span>+91 712 4912 3890</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-slate-200">Regulatory Registry</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Fully registered corporate entity operating under Indian IT guidelines and DPDP guidelines.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-mono text-slate-500">
                      <div>
                        <span className="block font-bold text-slate-400">GST REGISTRY</span>
                        <span>27AAHCN3829L1Z2</span>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400">CORPORATE ID</span>
                        <span>CIN: U72900MH2026PTC189012</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 bg-black/40 border border-slate-900 rounded-xl p-4 leading-relaxed">
                  <span className="text-blue-400 font-bold block mb-1">DATA PROCESSING SLA:</span>
                  All forms submitted through our public website undergo zero external routing. Secure transmission locks prevent unauthorized intercept tags.
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= ADMIN CONSOLE VIEW ================= */}
        {activeTab === 'admin' && (
          <AdminConsole onContentUpdated={fetchContent} />
        )}

        {/* ================= PRIVACY POLICY VIEW ================= */}
        {activeTab === 'privacy' && (
          <div className="max-w-4xl mx-auto px-6 py-16 space-y-8 animate-fade-in text-left">
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronRight size={14} className="rotate-180" />
              <span>Return Home</span>
            </button>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
            <p className="text-xs font-mono text-slate-500">Effective Date: July 04, 2026</p>

            <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
              <p>
                Neurojana AI Pvt. Ltd. ("Neurojana", "we", "us") values your data privacy. Because our core business is built on data sovereignty, air-gapping, and physical isolation, our data retention philosophy is strictly minimal.
              </p>

              <h3 className="text-lg font-bold text-slate-200 mt-6">1. Information We Collect</h3>
              <p>
                We only collect data that you actively submit to us via our online consultation forms or newsletter registration fields. This includes your name, corporate email address, organizational entity, and specific technical specifications regarding your physical racks. We do not place hidden tracking cookies, telemetry beacons, or external behavioral analytic scripts on this website.
              </p>

              <h3 className="text-lg font-bold text-slate-200 mt-6">2. Zero Telemetry & Air-Gapping</h3>
              <p>
                Neurojna hardware products (NeuroCore Edge cards) and localized fine-tuned weights (JanaLLM) do not maintain telemetry channels. All analytical models compile and execute entirely within your physical server setups with zero cloud outbound transfers. Your local database queries are fully secured under your hardware key locks.
              </p>

              <h3 className="text-lg font-bold text-slate-200 mt-6">3. Compliance Guidelines</h3>
              <p>
                Our collection and storage pipelines are fully aligned with the requirements of India’s Digital Personal Data Protection (DPDP) Act of 2023, the Health Insurance Portability and Accountability Act (HIPAA), and international zero-trust specifications.
              </p>

              <p className="pt-4 text-xs text-slate-500">
                For complete privacy inquiries or to request immediate deletion of cataloged form contacts, please reach out to our Nagpur operations desk: neurojnaai@gmail.com.
              </p>
            </div>
          </div>
        )}

        {/* ================= TERMS OF SERVICE VIEW ================= */}
        {activeTab === 'terms' && (
          <div className="max-w-4xl mx-auto px-6 py-16 space-y-8 animate-fade-in text-left">
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronRight size={14} className="rotate-180" />
              <span>Return Home</span>
            </button>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
            <p className="text-xs font-mono text-slate-500">Effective Date: July 04, 2026</p>

            <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
              <p>
                Welcome to the official public website of Neurojna AI Pvt. Ltd. By accessing this portal, testing our interactive compiler simulator, or submitting consultation specifications, you agree to comply with the terms of service outlined below.
              </p>

              <h3 className="text-lg font-bold text-slate-200 mt-6">1. Usage Rights & Interactive Sandbox</h3>
              <p>
                This website provides information regarding our high-density neural hardware systems. The interactive JanaLLM playground and neural compiler simulator are provided strictly for educational and pre-audit visualization purposes. Simulated values (latency speeds, TDP electrical loads, VRAM compression metrics) represent typical technical outputs under laboratory test perimeters and may vary inside physical server environments.
              </p>

              <h3 className="text-lg font-bold text-slate-200 mt-6">2. Export Restrictions & Sovereign Safeguards</h3>
              <p>
                Our NeuroCore hardware cards, compilers, and model weight weights represent critical national computational intellectual assets. You are strictly forbidden from reverse-engineering, unpacking, or copying any firmware files, compiler machine code, or model structures obtained during facility handovers without explicit legal agreements.
              </p>

              <h3 className="text-lg font-bold text-slate-200 mt-6">3. Jurisdiction</h3>
              <p>
                Any legal actions, disputes, or compliance concerns regarding our public website services shall be governed exclusively by the courts of Nagpur, Maharashtra, India.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-24 py-16 z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Logo & Slogan Column */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full opacity-90" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                NEUROJNA <span className="text-blue-400 font-normal">AI</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Sovereign, air-gapped computational architectures for defense, medical, and banking infrastructures. Decoupled from the public cloud.
            </p>

            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest pt-2">
              Corporate Office: Nagpur, India
            </p>
          </div>

          {/* Sitemaps Quicklinks */}
          <div className="grid grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">Sitemap</span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('home')} className="hover:text-blue-400 transition cursor-pointer">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('solutions')} className="hover:text-blue-400 transition cursor-pointer">
                    Solutions
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('technology')} className="hover:text-blue-400 transition cursor-pointer">
                    Technology
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('case-studies')} className="hover:text-blue-400 transition cursor-pointer">
                    Case Studies
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">Company</span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('about')} className="hover:text-blue-400 transition cursor-pointer">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('blog')} className="hover:text-blue-400 transition cursor-pointer">
                    Insights Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('careers')} className="hover:text-blue-400 transition cursor-pointer">
                    Careers
                  </button>
                </li>

              </ul>
            </div>
          </div>

          {/* Legal Pages Column */}
          <div className="space-y-3 text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">Compliance Specs</span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveTab('privacy')} className="hover:text-blue-400 transition cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('terms')} className="hover:text-blue-400 transition cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li className="text-slate-600 font-mono text-[10px] uppercase">
                DPDP COMPLIANT: YES
              </li>
              <li className="text-slate-600 font-mono text-[10px] uppercase">
                EXPORT CLASSIFICATION: CLASS-A
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4 text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">Sovereign Brief</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive confidential briefings regarding hardware updates, secure compiling mechanics, and international data regulations.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
              <div className="flex border border-slate-900 bg-slate-950 rounded-xl p-1 focus-within:border-blue-500 transition">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="rgupta@defense.org.in"
                  className="flex-1 bg-transparent border-0 text-xs text-slate-200 placeholder-slate-600 px-3 py-2 focus:outline-none"
                  id="newsletter-input"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus.type === 'loading'}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg px-3 transition cursor-pointer"
                  id="newsletter-submit-btn"
                >
                  Join
                </button>
              </div>

              {newsletterStatus.type === 'error' && (
                <span className="text-[10px] text-rose-400 block">{newsletterStatus.message}</span>
              )}
              {newsletterStatus.type === 'success' && (
                <span className="text-[10px] text-emerald-400 block">{newsletterStatus.message}</span>
              )}
            </form>
          </div>

        </div>

        {/* Outer Credit / Regulatory Footnote */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600">
          <button onClick={() => setActiveTab('admin')} className="hover:text-slate-400 transition cursor-pointer">© 2026 Neurojna AI Pvt. Ltd. Nagpur, India. All Rights Reserved.</button>
          <div className="flex gap-4">
            <span>CIN: U72900MH2026PTC189012</span>
            <span>•</span>
            <span>GST: 27AAHCN3829L1Z2</span>
          </div>
        </div>
      </footer>

      {/* Floating Cookie & Sovereign Safe banner */}
      {cookieConsent && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 animate-slide-up flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Lock size={14} />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-200">Local Sandbox Connection Safeguarded</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              We do not track session parameters. All interaction weights reside safely in local browser memory context.
            </p>
            <button
              onClick={() => setCookieConsent(false)}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono uppercase font-bold tracking-wider cursor-pointer"
            >
              Secure Handshake Complete
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
