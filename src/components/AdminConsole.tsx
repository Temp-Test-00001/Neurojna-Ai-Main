import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Cpu,
  Brain,
  Layers,
  Briefcase,
  FileText,
  Mail,
  Users,
  Trash2,
  Edit,
  Plus,
  Check,
  X,
  RefreshCw,
  LogOut,
  LayoutDashboard,
  Calendar,
  MapPin,
  Tag,
  PlusCircle,
  Save,
  Clock,
  Sparkles,
  Phone,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Solution, CaseStudy, BlogPost, CareerOpening } from '../types';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { SOLUTIONS, CASE_STUDIES, BLOGS, CAREER_OPENINGS } from '../data';

interface AdminConsoleProps {
  onContentUpdated: () => void;
}

type SubTab = 'dashboard' | 'leads' | 'subscribers' | 'solutions' | 'cases' | 'blogs' | 'careers';

// Elegant Typewriter component for Immersive welcome and logs
function Typewriter({ text, speed = 25, className = "" }: { text: string; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let index = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <span className={className}>{displayed}</span>;
}

export default function AdminConsole({ onContentUpdated }: AdminConsoleProps) {
  // Authentication & Session State
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<any | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Onboarding profile inputs
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Content Data State
  const [leads, setLeads] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [subscribersRaw, setSubscribersRaw] = useState<any[]>([]); // To manage deletion easily
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [careers, setCareers] = useState<CareerOpening[]>([]);

  // Active Admin SubTab
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');

  // Editing state
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);
  const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        const ALLOWED_ADMINS = [
          'bhushanmallick2006@gmail.co',
          'bhushanmallick2006@gmail.com',
          'infoneurojnaai@gmail.com'
        ];
        
        const userEmail = currentUser.email?.toLowerCase();
        const isAllowed = userEmail && ALLOWED_ADMINS.some(email => userEmail === email);

        if (!isAllowed) {
          setAuthError(`Access Denied: ${currentUser.email} is not registered as an administrator of Neurojna AI.`);
          await signOut(auth);
          setUser(null);
          setAdminProfile(null);
          setShowOnboarding(false);
          setLoading(false);
          return;
        }

        setUser(currentUser);
        setAuthError('');

        try {
          // Check if admin document exists in database
          const docRef = doc(db, 'admins', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setAdminProfile(docSnap.data());
            setShowOnboarding(false);
          } else {
            // First login onboarding!
            setShowOnboarding(true);
          }
        } catch (err) {
          setAuthError('Failed to query administrative access profile.');
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setAdminProfile(null);
        setShowOnboarding(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch admin dashboard data from Firestore
  const fetchAdminData = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      // 1. Fetch Solutions
      const solSnap = await getDocs(collection(db, "solutions"));
      const solList = solSnap.docs.map(doc => ({ ...doc.data() })) as Solution[];
      setSolutions(solList);

      // 2. Fetch Case Studies
      const csSnap = await getDocs(collection(db, "caseStudies"));
      const csList = csSnap.docs.map(doc => ({ ...doc.data() })) as CaseStudy[];
      setCaseStudies(csList);

      // 3. Fetch Blogs
      const blogSnap = await getDocs(collection(db, "blogs"));
      const blogList = blogSnap.docs.map(doc => ({ ...doc.data() })) as BlogPost[];
      setBlogs(blogList);

      // 4. Fetch Careers
      const careerSnap = await getDocs(collection(db, "careers"));
      const careerList = careerSnap.docs.map(doc => ({ ...doc.data() })) as CareerOpening[];
      setCareers(careerList);

      // 5. Fetch Contact Leads
      const contactSnap = await getDocs(collection(db, "contacts"));
      const contactList = contactSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(contactList);

      // 6. Fetch Newsletter Subscribers
      const subSnap = await getDocs(collection(db, "subscribers"));
      const subObjs = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscribersRaw(subObjs);
      setSubscribers(subObjs.map((s: any) => s.email));

    } catch (err) {
      console.error("Failed to load admin data from Firestore:", err);
      handleFirestoreError(err, OperationType.LIST, "all-collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && adminProfile) {
      fetchAdminData();
    }
  }, [user, adminProfile]);

  const handleGoogleLogin = async () => {
    setAuthError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError('Failed to establish secure SSO connection: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!regName.trim() || !regPhone.trim()) {
      setAuthError('All profile fields are required to register.');
      return;
    }

    setLoading(true);
    setAuthError('');
    try {
      const profile = {
        uid: user.uid,
        email: user.email || '',
        name: regName,
        phone: regPhone,
        createdAt: new Date().toISOString()
      };

      const docRef = doc(db, 'admins', user.uid);
      await setDoc(docRef, profile).catch(e => handleFirestoreError(e, OperationType.CREATE, `admins/${user.uid}`));
      setAdminProfile(profile);
      setShowOnboarding(false);
      showNotice('success', 'Profile created. System access granted.');
    } catch (err: any) {
      setAuthError('Profile sync failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLeads([]);
      setSubscribers([]);
      setSolutions([]);
      setCaseStudies([]);
      setBlogs([]);
      setCareers([]);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Helper to trigger alert notices
  const showNotice = (type: 'success' | 'error', text: string) => {
    setApiMessage({ type, text });
    setTimeout(() => setApiMessage(null), 4000);
  };

  // Seeding the cloud database with initial default data if it's empty
  const handleSeedDatabase = async () => {
    if (!user || !adminProfile) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);

      SOLUTIONS.forEach(sol => {
        const docRef = doc(db, 'solutions', sol.id);
        batch.set(docRef, sol);
      });

      CASE_STUDIES.forEach(cs => {
        const docRef = doc(db, 'caseStudies', cs.id);
        batch.set(docRef, cs);
      });

      BLOGS.forEach(blog => {
        const docRef = doc(db, 'blogs', blog.id);
        batch.set(docRef, blog);
      });

      CAREER_OPENINGS.forEach(career => {
        const docRef = doc(db, 'careers', career.id);
        batch.set(docRef, career);
      });

      await batch.commit().catch(e => handleFirestoreError(e, OperationType.WRITE, "bulk-seed"));
      showNotice('success', 'Production node data successfully seeded into Cloud Firestore.');
      fetchAdminData();
      onContentUpdated();
    } catch (err: any) {
      showNotice('error', 'Seeding failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generic Save Handler for CRUD
  const saveContentItem = async (type: 'solutions' | 'case-studies' | 'blogs' | 'careers', action: 'create' | 'update' | 'delete', payload: any) => {
    setLoading(true);
    try {
      const collectionName = type === 'case-studies' ? 'caseStudies' : type;
      const docId = payload.id;

      if (action === 'delete') {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef).catch(e => handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${docId}`));
      } else {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, payload).catch(e => handleFirestoreError(e, OperationType.WRITE, `${collectionName}/${docId}`));
      }

      showNotice('success', `Item ${action}d successfully in cloud database.`);
      setEditingItem(null);
      await fetchAdminData();
      onContentUpdated(); // notifies App to refetch
    } catch (err: any) {
      showNotice('error', 'Firestore Save Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Inquiry Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm("Are you sure you want to resolve and delete this lead record?")) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'contacts', leadId);
      await deleteDoc(docRef).catch(e => handleFirestoreError(e, OperationType.DELETE, `contacts/${leadId}`));
      showNotice('success', 'Lead record cleared from Cloud Firestore.');
      await fetchAdminData();
    } catch (err: any) {
      showNotice('error', 'Failed to delete lead: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async (email: string) => {
    if (!window.confirm(`Unsubscribe and remove ${email}?`)) return;
    setLoading(true);
    try {
      const subObj = subscribersRaw.find(s => s.email === email);
      if (!subObj) {
        throw new Error("Subscriber record not found in cache.");
      }
      const docRef = doc(db, 'subscribers', subObj.id);
      await deleteDoc(docRef).catch(e => handleFirestoreError(e, OperationType.DELETE, `subscribers/${subObj.id}`));
      showNotice('success', 'Subscriber removed from Cloud database.');
      await fetchAdminData();
    } catch (err: any) {
      showNotice('error', 'Failed to unsubscribe: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render Onboarding Form for First-Time login
  if (user && showOnboarding) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl relative overflow-hidden text-left">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 to-transparent pointer-events-none" />
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Onboard Administrator</h1>
              <p className="text-xs text-emerald-400 font-mono">First-Time Handshake Registry</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
            <Typewriter 
              text="Access credentials authorized. We detected this is your first secure session as an administrator. Please complete your system profile to register your node in the database." 
              speed={20}
              className="font-mono block"
            />
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-mono">
              ❌ {authError}
            </div>
          )}

          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Bhushan Mallick"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition"
                />
                <UserCheck size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Contact Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition"
                />
                <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? 'Registering...' : <>
                <Save size={12} />
                <span>Synchronize Admin Profile</span>
              </>}
            </button>
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs rounded-xl transition font-mono cursor-pointer"
          >
            Cancel Handshake
          </button>
        </div>
      </div>
    );
  }

  // Render Login Layout using Google auth
  if (!user || !adminProfile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl relative overflow-hidden text-left">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent pointer-events-none" />
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Neurojna Admin Access</h1>
              <p className="text-xs text-slate-500 font-mono">Secured Google SSO Gate</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Please log in using your authorized administrator Google account to access dynamic database catalogs, custom ERP parameters, and subscriber metrics.
          </p>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-mono">
              ❌ {authError}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-blue-500"
            >
              {loading ? 'Connecting node...' : <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.74 0 3.32.64 4.56 1.7l2.425-2.425C17.22 1.48 14.88 1 12.24 1 6.57 1 2 5.57 2 11.24s4.57 10.24 10.24 10.24c5.79 0 10.24-4.06 10.24-10.24 0-.69-.06-1.35-.18-1.95H12.24z"/>
                </svg>
                <span>Authorize with Google</span>
              </>}
            </button>
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8 text-left animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-1">
            <Shield size={14} />
            <span>Sovereign Control Hub</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Neurojna System Admin Console</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Primary Location Nagpur Node • Authorized Personnel Session</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh State</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <LogOut size={12} />
            <span>Terminate Handshake</span>
          </button>
        </div>
      </div>

      {/* Notifications Notice */}
      {apiMessage && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-3 animate-fade-in ${
          apiMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {apiMessage.type === 'success' ? <Check size={16} /> : <X size={16} />}
          <span>{apiMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Navigation Rails & Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Rail */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => { setActiveSubTab('dashboard'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-wide transition cursor-pointer ${
              activeSubTab === 'dashboard' ? 'bg-blue-600 text-white font-semibold' : 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard Metrics</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('leads'); setEditingItem(null); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium tracking-wide transition cursor-pointer ${
              activeSubTab === 'leads' ? 'bg-blue-600 text-white font-semibold' : 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail size={14} />
              <span>Inquiries & Leads</span>
            </div>
            {leads.length > 0 && (
              <span className="bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {leads.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveSubTab('subscribers'); setEditingItem(null); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium tracking-wide transition cursor-pointer ${
              activeSubTab === 'subscribers' ? 'bg-blue-600 text-white font-semibold' : 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={14} />
              <span>Newsletter List</span>
            </div>
            {subscribers.length > 0 && (
              <span className="bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {subscribers.length}
              </span>
            )}
          </button>

          <div className="pt-4 pb-2 border-t border-slate-900">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest block px-4 mb-2">Configure Site Content</span>
          </div>

          <button
            onClick={() => { setActiveSubTab('solutions'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-wide transition cursor-pointer ${
              activeSubTab === 'solutions' ? 'bg-blue-600 text-white font-semibold' : 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Cpu size={14} />
            <span>Manage Solutions</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('cases'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-wide transition cursor-pointer ${
              activeSubTab === 'cases' ? 'bg-blue-600 text-white font-semibold' : 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Layers size={14} />
            <span>Manage Case Studies</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('blogs'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-wide transition cursor-pointer ${
              activeSubTab === 'blogs' ? 'bg-blue-600 text-white font-semibold' : 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>Manage Blog Entries</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('careers'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-wide transition cursor-pointer ${
              activeSubTab === 'careers' ? 'bg-blue-600 text-white font-semibold' : 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Briefcase size={14} />
            <span>Manage Job Openings</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-2xl p-6 md:p-8 relative min-h-[500px]">
          
          {/* ================= SUBTAB: DASHBOARD ================= */}
          {activeSubTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-100">Executive Performance Dashboard</h2>
                <p className="text-xs text-slate-400">Real-time indicators from Nagpur server metrics, Firestore collections, and site engagement.</p>
              </div>

              {/* Seeding Notification Trigger */}
              {solutions.length === 0 && caseStudies.length === 0 && blogs.length === 0 && careers.length === 0 && (
                <div className="p-6 bg-blue-950/20 border border-blue-900/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-dashed">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block font-bold">☁️ Cloud Firestore Node Empty</span>
                    <h3 className="text-sm font-bold text-slate-100">Initialize Production Content Database</h3>
                    <p className="text-xs text-slate-400 max-w-md">Your Firestore collections are empty. Click to automatically seed them with default Nagpur software engineering catalogs, blogs, and job career openings.</p>
                  </div>
                  <button
                    onClick={handleSeedDatabase}
                    disabled={loading}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-lg"
                  >
                    <Sparkles size={12} />
                    <span>{loading ? 'Seeding Nodes...' : 'Seed Cloud Nodes'}</span>
                  </button>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Active Inquiries</span>
                  <span className="text-3xl font-bold text-white block font-mono">{leads.length}</span>
                  <span className="text-[10px] text-emerald-400 font-mono block">● Online Secure Store</span>
                </div>

                <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Newsletter Briefs</span>
                  <span className="text-3xl font-bold text-white block font-mono">{subscribers.length}</span>
                  <span className="text-[10px] text-blue-400 font-mono block">Sovereign Subscribers</span>
                </div>

                <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Managed Site Modules</span>
                  <span className="text-3xl font-bold text-white block font-mono">
                    {solutions.length + caseStudies.length + blogs.length + careers.length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">Solutions, Cases, Blogs & Jobs</span>
                </div>
              </div>

              {/* Grid: Server Logs representation & stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Active Leads Summary Ticker */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-200">Recent Inquiries Received</span>
                    <button onClick={() => setActiveSubTab('leads')} className="text-[10px] text-blue-400 hover:underline uppercase tracking-wider font-mono">View All</button>
                  </div>

                  <div className="space-y-3">
                    {leads.length === 0 ? (
                      <p className="text-xs text-slate-500 font-mono py-4">No active inquiries submitted.</p>
                    ) : (
                      leads.slice(-2).map((lead, idx) => (
                        <div key={idx} className="bg-black/30 border border-slate-900 p-3 rounded-lg space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-300 font-semibold">{lead.name}</span>
                            <span className="text-slate-500">{lead.company}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 italic">"{lead.message}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Secure Handshake Monitor */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-200">System Parameters Guard</span>
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-black">● Live Secure</span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Server Subsystem:</span>
                      <span className="text-slate-200">Node-Express-Vite-Cluster</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sovereign ID:</span>
                      <span className="text-slate-200">NEUROJNA-NGP-3000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Encryption Core:</span>
                      <span className="text-slate-200">SSL SHA-256 AES-GCM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Telemetry Path:</span>
                      <span className="text-rose-400">DECOUPLED / AIR-GAPPED</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= SUBTAB: INQUIRIES / LEADS ================= */}
          {activeSubTab === 'leads' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-100">Enterprise Inquiries Log</h2>
                <p className="text-xs text-slate-400">Confidential incoming client proposals routed natively. These exist in server memory space.</p>
              </div>

              <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-900 rounded-xl">
                    <Mail size={32} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-mono">Zero leads on record. Test submission on the Contact page.</p>
                  </div>
                ) : (
                  leads.map((lead) => (
                    <div key={lead.id} className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4 relative overflow-hidden">
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-900 pb-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Full Name & Entity</span>
                          <span className="text-slate-200 font-semibold block">{lead.name}</span>
                          <span className="text-slate-400 block">{lead.company}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Contact Information</span>
                          <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline block font-mono">{lead.email}</a>
                          <span className="text-slate-500 font-mono text-[10px] block">
                            {lead.timestamp ? new Date(lead.timestamp).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Inquiry Details</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-black/30 p-3 border border-slate-900 rounded-lg whitespace-pre-wrap">
                          {lead.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= SUBTAB: SUBSCRIBERS ================= */}
          {activeSubTab === 'subscribers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-100">Newsletter Subscription Brief</h2>
                <p className="text-xs text-slate-400">Sovereign audience database logs compiled internally.</p>
              </div>

              {subscribers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-900 rounded-xl">
                  <Users size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-mono">No active subscribers registered.</p>
                </div>
              ) : (
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px] bg-slate-900/40">
                          <th className="py-3 px-4">Index</th>
                          <th className="py-3 px-4">Subscriber Email Address</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {subscribers.map((email, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/20">
                            <td className="py-3.5 px-4 text-slate-500">#{idx + 1}</td>
                            <td className="py-3.5 px-4 text-slate-200">{email}</td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteSubscriber(email)}
                                className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                                title="Remove subscriber"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= SUBTAB: SOLUTIONS CRUD ================= */}
          {activeSubTab === 'solutions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-100">Solutions Registry</h2>
                  <p className="text-xs text-slate-400">Configure corporate hardware & SLA service specifications catalogued online.</p>
                </div>
                {!editingItem && (
                  <button
                    onClick={() => setEditingItem({
                      type: 'solution',
                      data: { id: `sol-${Date.now()}`, type: 'product', title: '', subtitle: '', tagline: '', description: '', features: [], specs: [], iconName: 'Cpu' }
                    })}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Register Solution</span>
                  </button>
                )}
              </div>

              {editingItem && editingItem.type === 'solution' ? (
                /* Solution editor form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveContentItem('solutions', solutions.some(s => s.id === editingItem.data.id) ? 'update' : 'create', editingItem.data);
                  }}
                  className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900">
                    {solutions.some(s => s.id === editingItem.data.id) ? 'Edit Registered Solution' : 'Add Solution Item'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">ID (Unique URL slug)</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.id}
                        disabled={solutions.some(s => s.id === editingItem.data.id)}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, id: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Solution Type</label>
                      <select
                        value={editingItem.data.type}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, type: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      >
                        <option value="product">Hardware/Software Product</option>
                        <option value="service">SLA Integration Service</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Solution Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.title}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Subtitle</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.subtitle}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, subtitle: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Tagline</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.tagline}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, tagline: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={editingItem.data.description}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition resize-none"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Key Capabilities / Features (one per line)</label>
                      <textarea
                        rows={3}
                        value={(editingItem.data.features || []).join('\n')}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, features: e.target.value.split('\n').filter(Boolean) } })}
                        placeholder="Secure isolated VRAM caching&#10;Bespoke container scaling"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-transparent border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save size={12} />
                      <span>Save Solution</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Solutions List Grid */
                <div className="space-y-3">
                  {solutions.map((sol) => (
                    <div key={sol.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{sol.type}</span>
                        <h4 className="text-sm font-bold text-slate-200">{sol.title}</h4>
                        <p className="text-xs text-slate-500 font-mono italic">{sol.tagline}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem({ type: 'solution', data: sol })}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-blue-400 hover:text-blue-300 rounded-lg transition cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${sol.title}?`)) {
                              saveContentItem('solutions', 'delete', sol);
                            }
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-855 text-rose-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= SUBTAB: CASE STUDIES CRUD ================= */}
          {activeSubTab === 'cases' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-100">Case Studies Registry</h2>
                  <p className="text-xs text-slate-400">Configure historic customer deployment success narratives and security reviews.</p>
                </div>
                {!editingItem && (
                  <button
                    onClick={() => setEditingItem({
                      type: 'case-study',
                      data: { id: `case-${Date.now()}`, client: '', industry: '', title: '', challenge: '', solution: '', results: [], metrics: [] }
                    })}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Register Case Study</span>
                  </button>
                )}
              </div>

              {editingItem && editingItem.type === 'case-study' ? (
                /* Case Study editor form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveContentItem('case-studies', caseStudies.some(c => c.id === editingItem.data.id) ? 'update' : 'create', editingItem.data);
                  }}
                  className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900">
                    {caseStudies.some(c => c.id === editingItem.data.id) ? 'Edit Case Study' : 'Add Case Study'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">ID slug</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.id}
                        disabled={caseStudies.some(c => c.id === editingItem.data.id)}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, id: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Industry</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.industry}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, industry: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Client Name</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.client}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, client: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Case Study Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.title}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">The Challenge</label>
                      <textarea
                        required
                        rows={3}
                        value={editingItem.data.challenge}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, challenge: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition resize-none"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">The Solution Deployed</label>
                      <textarea
                        required
                        rows={3}
                        value={editingItem.data.solution}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, solution: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition resize-none"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Accomplished Results (one per line)</label>
                      <textarea
                        rows={3}
                        value={(editingItem.data.results || []).join('\n')}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, results: e.target.value.split('\n').filter(Boolean) } })}
                        placeholder="Reduced query lookup to 12ms&#10;Completed DPDP compliant physical sandbox handover"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-transparent border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save size={12} />
                      <span>Save Case Study</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Case Studies list grid */
                <div className="space-y-3">
                  {caseStudies.map((cs) => (
                    <div key={cs.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">{cs.industry}</span>
                        <h4 className="text-sm font-bold text-slate-200">{cs.client}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 italic">"{cs.title}"</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem({ type: 'case-study', data: cs })}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-blue-400 hover:text-blue-300 rounded-lg transition cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${cs.client} study?`)) {
                              saveContentItem('case-studies', 'delete', cs);
                            }
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-855 text-rose-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= SUBTAB: BLOGS CRUD ================= */}
          {activeSubTab === 'blogs' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-100">Journal & Blog Config</h2>
                  <p className="text-xs text-slate-400">Manage deep-dives and technical briefings compiled under the Sovereign Journal.</p>
                </div>
                {!editingItem && (
                  <button
                    onClick={() => setEditingItem({
                      type: 'blog',
                      data: { id: `blog-${Date.now()}`, title: '', excerpt: '', content: '', category: 'Enterprise Technology', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), readTime: '5 min read', author: 'Neurojna Engineering Core' }
                    })}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Blog Post</span>
                  </button>
                )}
              </div>

              {editingItem && editingItem.type === 'blog' ? (
                /* Blog editor form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveContentItem('blogs', blogs.some(b => b.id === editingItem.data.id) ? 'update' : 'create', editingItem.data);
                  }}
                  className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900">
                    {blogs.some(b => b.id === editingItem.data.id) ? 'Edit Journal Entry' : 'Publish Blog Post'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">ID Slug</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.id}
                        disabled={blogs.some(b => b.id === editingItem.data.id)}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, id: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Category</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.category}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Blog Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.title}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 col-span-2">
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Author</label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.author}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, author: e.target.value } })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Date</label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.date}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, date: e.target.value } })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Read Time</label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.readTime}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, readTime: e.target.value } })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Short Excerpt</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.excerpt}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, excerpt: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Complete Content Text</label>
                      <textarea
                        required
                        rows={6}
                        value={editingItem.data.content}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 resize-y"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-transparent border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save size={12} />
                      <span>Publish Blog</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Blogs list grid */
                <div className="space-y-3">
                  {blogs.map((b) => (
                    <div key={b.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase">{b.category}</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">{b.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono block">By {b.author} • {b.date}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem({ type: 'blog', data: b })}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-blue-400 hover:text-blue-300 rounded-lg transition cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${b.title}?`)) {
                              saveContentItem('blogs', 'delete', b);
                            }
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-855 text-rose-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= SUBTAB: CAREERS CRUD ================= */}
          {activeSubTab === 'careers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-100">Hiring & Careers Core</h2>
                  <p className="text-xs text-slate-400">Configure engineering roles open at the Nagpur headquarters or remote locations.</p>
                </div>
                {!editingItem && (
                  <button
                    onClick={() => setEditingItem({
                      type: 'career',
                      data: { id: `job-${Date.now()}`, title: '', department: 'Software Engineering Core', location: 'Nagpur (Hybrid)', type: 'Full-time', experience: '3+ Years', description: '', requirements: [] }
                    })}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Job Role</span>
                  </button>
                )}
              </div>

              {editingItem && editingItem.type === 'career' ? (
                /* Career editor form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveContentItem('careers', careers.some(c => c.id === editingItem.data.id) ? 'update' : 'create', editingItem.data);
                  }}
                  className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900">
                    {careers.some(c => c.id === editingItem.data.id) ? 'Edit Career Role' : 'Publish Job opening'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">ID Slug</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.id}
                        disabled={careers.some(c => c.id === editingItem.data.id)}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, id: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Location (Nagpur / Remote)</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.location}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, location: e.target.value } })}
                        placeholder="Nagpur (Hybrid)"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Job Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.title}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Department</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.department}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, department: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 col-span-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Employment Type</label>
                        <select
                          value={editingItem.data.type}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, type: e.target.value } })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Experience Required</label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.experience}
                          onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, experience: e.target.value } })}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Description Summary</label>
                      <textarea
                        required
                        rows={3}
                        value={editingItem.data.description}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 resize-none"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Specific Requirements (one per line)</label>
                      <textarea
                        rows={3}
                        value={(editingItem.data.requirements || []).join('\n')}
                        onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, requirements: e.target.value.split('\n').filter(Boolean) } })}
                        placeholder="TypeScript / React expertise&#10;5+ years building relational DB architectures"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-lg px-3 py-2.5 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-transparent border border-slate-855 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save size={12} />
                      <span>Save Job</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Careers list grid */
                <div className="space-y-3">
                  {careers.map((job) => (
                    <div key={job.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">{job.department}</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">{job.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono block">{job.location} • {job.experience}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem({ type: 'career', data: job })}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-blue-400 hover:text-blue-300 rounded-lg transition cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${job.title} listing?`)) {
                              saveContentItem('careers', 'delete', job);
                            }
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-855 text-rose-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
