/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  FileEdit, 
  MessageSquare, 
  ChevronRight,
  Loader2,
  Trash2,
  Copy,
  Download,
  Upload,
  FileUp,
  Key,
  User as UserIcon,
  LogOut,
  Settings,
  Mail,
  Lock,
  Camera,
  History,
  Moon,
  Sun,
  Languages,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import * as pdfjs from 'pdfjs-dist';
import { 
  analyzeCV, 
  generateCoverLetter, 
  generateInterviewQuestions, 
  analyzeSkillsGap,
  optimizeLinkedIn,
  findJobOffers,
  JobOffer
} from './services/gemini';
import { User, CVAnalysis, SkillsGap, LinkedInOptimization, CVHistoryItem } from './types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type Tab = 'analyze' | 'cover-letter' | 'interview' | 'roadmap' | 'linkedin' | 'jobs';
type View = 'app' | 'login' | 'register' | 'profile';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('analyze');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('app');
  const [history, setHistory] = useState<CVHistoryItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[] | null>(null);
  const [skillsGap, setSkillsGap] = useState<SkillsGap | null>(null);
  const [linkedIn, setLinkedIn] = useState<LinkedInOptimization | null>(null);
  const [jobOffers, setJobOffers] = useState<JobOffer[] | null>(null);
  const [language, setLanguage] = useState<'pl' | 'en'>('pl');

  // Auth State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Profile State
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileTargetRole, setProfileTargetRole] = useState('');
  const [profileExperienceLevel, setProfileExperienceLevel] = useState('');
  const [profileLinkedinUrl, setProfileLinkedinUrl] = useState('');
  const [profileGithubUrl, setProfileGithubUrl] = useState('');
  const [profileIncludeProjects, setProfileIncludeProjects] = useState(false);
  const [profileEmphasizedKeywords, setProfileEmphasizedKeywords] = useState('');
  const [profileSummaryTone, setProfileSummaryTone] = useState<'professional' | 'creative' | 'minimalist' | 'bold'>('professional');
  const [profilePreferredSections, setProfilePreferredSections] = useState('');
  const [customCoverLetterDetails, setCustomCoverLetterDetails] = useState('');

  useEffect(() => {
    const init = async () => {
      // Check API Key
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }

      // Check Auth
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setProfileName(userData.name);
          setProfileBio(userData.bio || '');
          setProfileTargetRole(userData.target_role || '');
          setProfileExperienceLevel(userData.experience_level || '');
          setProfileLinkedinUrl(userData.linkedin_url || '');
          setProfileGithubUrl(userData.github_url || '');
          setProfileIncludeProjects(userData.preferences?.include_projects || false);
          setProfileEmphasizedKeywords(userData.preferences?.emphasized_keywords?.join(', ') || '');
          setProfilePreferredSections(userData.preferences?.preferred_sections?.join(', ') || '');
          setProfileSummaryTone(userData.preferences?.summary_tone || 'professional');
          setTheme(userData.theme || 'light');
          fetchHistory();
        }
      } catch (e) {
        console.error("Auth check failed", e);
      }
    };
    init();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const saveToHistory = async (currentAnalysis: CVAnalysis) => {
    if (!user) return;
    try {
      const res = await fetch('/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText,
          jobDescription,
          analysis: currentAnalysis
        }),
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const deleteHistoryItem = async (id: number) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete history item", e);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (user) {
      await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, bio: profileBio, theme: newTheme }),
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword, name: authName }),
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setView('app');
      } else {
        const data = await res.json();
        setAuthError(data.error || 'Registration failed');
      }
    } catch (e) {
      setAuthError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setProfileName(userData.name);
        setProfileBio(userData.bio || '');
        setView('app');
      } else {
        const data = await res.json();
        setAuthError(data.error || 'Login failed');
      }
    } catch (e) {
      setAuthError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setView('app');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: profileName, 
          bio: profileBio,
          target_role: profileTargetRole,
          experience_level: profileExperienceLevel,
          linkedin_url: profileLinkedinUrl,
          github_url: profileGithubUrl,
          preferences: {
            include_projects: profileIncludeProjects,
            emphasized_keywords: profileEmphasizedKeywords.split(',').map(k => k.trim()).filter(k => k),
            preferred_sections: profilePreferredSections.split(',').map(k => k.trim()).filter(k => k),
            summary_tone: profileSummaryTone
          }
        }),
      });
      if (res.ok) {
        setUser(prev => prev ? { 
          ...prev, 
          name: profileName, 
          bio: profileBio,
          target_role: profileTargetRole,
          experience_level: profileExperienceLevel,
          linkedin_url: profileLinkedinUrl,
          github_url: profileGithubUrl,
          preferences: {
            include_projects: profileIncludeProjects,
            emphasized_keywords: profileEmphasizedKeywords.split(',').map(k => k.trim()).filter(k => k),
            preferred_sections: profilePreferredSections.split(',').map(k => k.trim()).filter(k => k),
            summary_tone: profileSummaryTone
          }
        } : null);
        alert('Profile updated!');
      }
    } catch (e) {
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const { avatar } = await res.json();
        setUser(prev => prev ? { ...prev, avatar } : null);
      }
    } catch (e) {
      alert('Avatar upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success as per guidelines
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setIsExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      setCvText(fullText.trim());
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      alert('Failed to extract text from PDF. Please try pasting the text manually.');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!cvText) {
      alert(language === 'pl' ? 'Proszę najpierw wgrać CV lub wkleić tekst.' : 'Please upload a CV or paste text first.');
      return;
    }
    if (!jobDescription) {
      alert(language === 'pl' ? 'Proszę wkleić opis stanowiska.' : 'Please paste a job description.');
      return;
    }
    if (!hasKey) {
      alert(language === 'pl' ? 'Brak klucza API.' : 'API Key is missing.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeCV(cvText, jobDescription, language, user?.preferences);
      setAnalysis(result);
      setActiveTab('analyze');
      if (user) saveToHistory(result);
    } catch (error) {
      console.error('Analysis error:', error);
      const isQuotaExceeded = error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
      
      if (isQuotaExceeded) {
        alert(language === 'pl' 
          ? 'Przekroczono limit zapytań (Quota Exceeded). Proszę spróbować ponownie za chwilę lub wybrać własny klucz API.' 
          : 'Rate limit exceeded (Quota Exceeded). Please try again in a moment or select your own API key.');
        setHasKey(false);
      } else {
        alert(language === 'pl' ? 'Wystąpił błąd podczas analizy. Sprawdź konsolę lub klucz API.' : 'An error occurred during analysis. Check console or API key.');
      }

      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!cvText || !jobDescription || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await generateCoverLetter(cvText, jobDescription, language, customCoverLetterDetails);
      setCoverLetter(result);
      setActiveTab('cover-letter');
    } catch (error) {
      console.error(error);
      const isQuotaExceeded = error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
      if (isQuotaExceeded) setHasKey(false);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInterview = async () => {
    if (!cvText || !jobDescription || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await generateInterviewQuestions(cvText, jobDescription, language);
      setInterviewQuestions(result);
      setActiveTab('interview');
    } catch (error) {
      console.error(error);
      const isQuotaExceeded = error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
      if (isQuotaExceeded) setHasKey(false);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!cvText || !jobDescription || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await analyzeSkillsGap(cvText, jobDescription, language);
      setSkillsGap(result);
      setActiveTab('roadmap');
    } catch (error) {
      console.error(error);
      const isQuotaExceeded = error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
      if (isQuotaExceeded) setHasKey(false);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeLinkedIn = async () => {
    if (!cvText || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await optimizeLinkedIn(cvText, language);
      setLinkedIn(result);
      setActiveTab('linkedin');
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindJobs = async () => {
    if (!cvText || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await findJobOffers(cvText, language);
      setJobOffers(result);
      setActiveTab('jobs');
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-200 p-8 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mx-auto">
            <Key size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900">Connect Gemini API Key</h1>
            <p className="text-zinc-500 text-sm">
              To use the advanced Gemini 3.1 Pro model, you need to connect your own API key from a paid Google Cloud project.
            </p>
          </div>
          <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-600 text-left space-y-2">
            <p className="font-semibold text-zinc-900">Why is this needed?</p>
            <p>Advanced models require billing to be enabled. You can manage your keys and billing in the Google AI Studio dashboard.</p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-900 underline font-medium block"
            >
              Learn more about billing &rarr;
            </a>
          </div>
          <button
            onClick={handleSelectKey}
            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Select API Key
          </button>
        </motion.div>
      </div>
    );
  }

  if (hasKey === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={40} />
      </div>
    );
  }

  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-200 p-8 space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900">
              {view === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-zinc-500 text-sm">
              {view === 'login' ? 'Sign in to access your saved CVs' : 'Join CvToAI to optimize your career'}
            </p>
          </div>

          <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {view === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && <p className="text-red-500 text-xs font-medium">{authError}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (view === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setView(view === 'login' ? 'register' : 'login')}
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {view === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          
          <button 
            onClick={() => setView('app')}
            className="w-full text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Continue as Guest
          </button>
        </motion.div>
      </div>
    );
  }

  if (view === 'profile' && user) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 flex flex-col">
        <header className="max-w-4xl mx-auto w-full mb-8 flex items-center justify-between">
          <button onClick={() => setView('app')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-semibold">
            <ChevronRight className="rotate-180" size={20} />
            Back to App
          </button>
          <h1 className="text-xl font-bold">Your Profile</h1>
          <div className="w-20" /> {/* Spacer */}
        </header>

        <main className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          <div className="md:col-span-1 space-y-6">
            <div className={`rounded-3xl shadow-sm border p-8 text-center space-y-4 transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <div className="relative inline-block">
                <div className={`w-32 h-32 rounded-full border-4 shadow-md overflow-hidden flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-white'}`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={48} className="text-zinc-300" />
                  )}
                </div>
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center border-4 shadow-lg hover:scale-110 transition-all ${theme === 'dark' ? 'bg-zinc-100 text-zinc-900 border-zinc-900' : 'bg-zinc-900 text-white border-white'}`}
                >
                  <Camera size={16} />
                </button>
                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user.name}</h2>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
            </div>

            <div className={`rounded-3xl shadow-sm border p-6 space-y-4 transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{history.length}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Optimizations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{history.length > 0 ? Math.round(history.reduce((acc, h) => acc + h.analysis.score, 0) / history.length) : 0}%</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Avg. Match</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <section className={`rounded-3xl shadow-sm border p-8 space-y-6 transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History size={20} />
                Optimization History
              </h3>
              {history.length === 0 ? (
                <div className="text-center py-10 text-zinc-400">
                  <History size={40} className="mx-auto mb-2 opacity-20" />
                  <p>No history yet. Start optimizing!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((h) => (
                    <div key={h.id} className={`p-5 rounded-3xl border flex flex-col gap-4 transition-colors ${theme === 'dark' ? 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold ${h.analysis.score >= 80 ? 'bg-emerald-100 text-emerald-700' : h.analysis.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            <span className="text-xl leading-none">{h.analysis.score}</span>
                            <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">Score</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-500 mb-1">
                              {new Date(h.created_at).toLocaleDateString()} at {new Date(h.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <p className="font-semibold line-clamp-1 text-base">
                              {h.job_description ? h.job_description.split('\n')[0].substring(0, 60) : 'No job description provided'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(h.id);
                          }}
                          className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'text-zinc-500 hover:text-red-400 hover:bg-red-900/20' : 'text-zinc-400 hover:text-red-500 hover:bg-red-50'}`}
                          title="Delete history entry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {h.job_description && (
                        <div className={`text-sm line-clamp-2 pl-[72px] ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {h.job_description}
                        </div>
                      )}

                      <div className="pl-[72px] mt-2">
                        <button 
                          onClick={() => {
                            setCvText(h.cv_text);
                            setJobDescription(h.job_description);
                            setAnalysis(h.analysis);
                            setView('app');
                            setActiveTab('analyze');
                          }}
                          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
                        >
                          <RefreshCw size={16} />
                          Load Analysis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={`rounded-3xl shadow-sm border p-8 space-y-6 transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Settings size={20} />
                Profile Settings
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Display Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Target Role</label>
                    <input
                      type="text"
                      value={profileTargetRole}
                      onChange={(e) => setProfileTargetRole(e.target.value)}
                      placeholder="e.g. Frontend Developer"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Experience Level</label>
                    <select
                      value={profileExperienceLevel}
                      onChange={(e) => setProfileExperienceLevel(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all appearance-none ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                    >
                      <option value="">Select Level</option>
                      <option value="Junior">Junior (0-2 years)</option>
                      <option value="Mid">Mid-Level (2-5 years)</option>
                      <option value="Senior">Senior (5+ years)</option>
                      <option value="Lead">Lead / Manager</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profileLinkedinUrl}
                      onChange={(e) => setProfileLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">GitHub / Portfolio URL</label>
                  <input
                    type="url"
                    value={profileGithubUrl}
                    onChange={(e) => setProfileGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Bio</label>
                  <textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all h-32 resize-none ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-4">
                  <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">CV Generation Preferences</h4>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeProjects"
                      checked={profileIncludeProjects}
                      onChange={(e) => setProfileIncludeProjects(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <label htmlFor="includeProjects" className="text-sm font-medium text-zinc-700">Include 'Projects' section in CV</label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Keywords to Emphasize</label>
                    <input
                      type="text"
                      value={profileEmphasizedKeywords}
                      onChange={(e) => setProfileEmphasizedKeywords(e.target.value)}
                      placeholder="e.g. React, Node.js, AWS (comma separated)"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Preferred Sections</label>
                    <input
                      type="text"
                      value={profilePreferredSections}
                      onChange={(e) => setProfilePreferredSections(e.target.value)}
                      placeholder="e.g. Summary, Experience, Education (comma separated)"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Summary Tone</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['professional', 'creative', 'minimalist', 'bold'] as const).map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setProfileSummaryTone(tone)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                            profileSummaryTone === tone 
                              ? 'bg-zinc-900 text-white border-zinc-900' 
                              : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </button>
              </form>
            </section>

            <section className={`rounded-3xl shadow-sm border p-8 space-y-4 transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
              <p className="text-sm text-zinc-500">Logging out will end your current session.</p>
              <button 
                onClick={handleLogout}
                className="px-6 py-2 border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-[#f5f5f5] text-zinc-900'}`}>
      {/* Header */}
      <header className={`border-b px-6 py-4 sticky top-0 z-10 transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'}`}>
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CvToAI</h1>
              <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>AI-Powered Career Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center p-1 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
              <button 
                onClick={() => setLanguage('pl')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${language === 'pl' ? (theme === 'dark' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white') : 'text-zinc-500'}`}
              >
                PL
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${language === 'en' ? (theme === 'dark' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white') : 'text-zinc-500'}`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setView('profile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} className="text-zinc-400" />
                    )}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:inline ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>{user.name}</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setView('login')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${theme === 'dark' ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
              >
                Sign In
              </button>
            )}
            
            <div className={`w-px h-6 mx-2 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

            <button 
              onClick={() => { setCvText(''); setJobDescription(''); setAnalysis(null); setCoverLetter(null); setInterviewQuestions(null); setSkillsGap(null); setLinkedIn(null); }}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              title="Clear All"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <FileText size={18} />
                <h2>Your CV Content</h2>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-all"
              >
                {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
                {isExtracting ? 'Extracting...' : 'Upload PDF'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
            </div>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text here or upload a PDF..."
              className="w-full h-64 p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none text-sm font-sans"
            />
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold mb-2">
              <Briefcase size={18} />
              <h2>Job Description</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none text-sm font-sans"
            />
          </section>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !cvText || !jobDescription}
              className="w-full py-4 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isLoading && activeTab === 'analyze' ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Analyze & Optimize CV
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isLoading || !cvText || !jobDescription}
                className="py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isLoading && activeTab === 'cover-letter' ? <Loader2 className="animate-spin" size={18} /> : <FileEdit size={18} />}
                Cover Letter
              </button>
              <button
                onClick={handleGenerateInterview}
                disabled={isLoading || !cvText || !jobDescription}
                className="py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isLoading && activeTab === 'interview' ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
                Interview Prep
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGenerateRoadmap}
                disabled={isLoading || !cvText || !jobDescription}
                className="py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isLoading && activeTab === 'roadmap' ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} />}
                Career Roadmap
              </button>
              <button
                onClick={handleOptimizeLinkedIn}
                disabled={isLoading || !cvText}
                className="py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isLoading && activeTab === 'linkedin' ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                LinkedIn Optimizer
              </button>
            </div>
            <button
              onClick={handleFindJobs}
              disabled={isLoading || !cvText}
              className="w-full py-4 bg-zinc-100 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isLoading && activeTab === 'jobs' ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              Find Matching Jobs
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 h-full flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200 overflow-x-auto no-scrollbar">
              {(['analyze', 'cover-letter', 'interview', 'roadmap', 'linkedin', 'jobs'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-none px-6 py-4 text-sm font-semibold capitalize transition-all relative ${
                    activeTab === tab ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {tab.replace('-', ' ')}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'analyze' && (
                  <motion.div
                    key="analyze"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {!analysis ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
                        <Sparkles size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No analysis yet</p>
                        <p className="text-sm">Enter your CV and job description to get started</p>
                      </div>
                    ) : (
                      <>
                        {/* Score Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="flex items-center justify-between bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 lg:col-span-1">
                            <div>
                              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overall Match</h3>
                              <p className="text-5xl font-bold">{analysis.score}%</p>
                            </div>
                            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                              <div className="text-[10px] font-bold text-emerald-500">ATS OK</div>
                            </div>
                          </div>

                          {/* ATS Breakdown */}
                          <div className="bg-white p-6 rounded-2xl border border-zinc-200 lg:col-span-2">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">ATS Detailed Breakdown</h4>
                            <div className="grid grid-cols-1 gap-4">
                              {[
                                { label: 'Formatting', data: analysis.atsBreakdown?.formatting },
                                { label: 'Keywords', data: analysis.atsBreakdown?.keywords },
                                { label: 'Structure', data: analysis.atsBreakdown?.structure },
                                { label: 'Relevance', data: analysis.atsBreakdown?.relevance },
                                { label: 'Impact', data: analysis.atsBreakdown?.impact },
                              ].map((item) => (
                                <div key={item.label} className="space-y-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-tighter">{item.label}</span>
                                    <span className={`text-xs font-bold ${
                                      (item.data?.score || 0) > 15 ? 'text-emerald-600' : 
                                      (item.data?.score || 0) > 10 ? 'text-amber-600' : 'text-rose-600'
                                    }`}>
                                      {item.data?.score || 0}/20
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${((item.data?.score || 0) / 20) * 100}%` }}
                                      className={`h-full rounded-full ${
                                        (item.data?.score || 0) > 15 ? 'bg-emerald-500' : 
                                        (item.data?.score || 0) > 10 ? 'bg-amber-500' : 'bg-rose-500'
                                      }`}
                                    />
                                  </div>
                                  {item.data?.feedback && (
                                    <p className="text-[11px] text-zinc-500 leading-tight italic">
                                      {item.data.feedback}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                              <CheckCircle2 size={18} />
                              <h4>Strengths</h4>
                            </div>
                            <ul className="space-y-2">
                              {analysis.strengths.map((s, i) => (
                                <li key={i} className="text-sm bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-600 font-semibold">
                              <AlertCircle size={18} />
                              <h4>Areas for Improvement</h4>
                            </div>
                            <ul className="space-y-2">
                              {analysis.weaknesses.map((w, i) => (
                                <li key={i} className="text-sm bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-100">
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                            <Lightbulb size={18} />
                            <h4>Actionable Suggestions</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {analysis.suggestions.map((s, i) => (
                              <div key={i} className="flex gap-3 text-sm p-4 bg-white border border-zinc-200 rounded-xl">
                                <ChevronRight size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Optimized Content */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                              <Sparkles size={18} />
                              <h4>Optimized CV Content</h4>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(analysis.optimizedContent)}
                              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <div className="p-8 sm:p-16 bg-white border border-zinc-200 rounded-sm shadow-2xl min-h-[1056px] max-w-[816px] mx-auto font-sans">
                            <Markdown
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 border-b-4 border-zinc-900 pb-6 mb-8 uppercase tracking-widest text-center" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-zinc-900 mt-12 mb-6 uppercase tracking-widest border-b-2 border-zinc-200 pb-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-zinc-900 mt-8 mb-2 flex items-center gap-2" {...props} />,
                                p: ({node, ...props}) => <p className="text-zinc-700 leading-relaxed mb-4" {...props} />,
                                ul: ({node, ...props}) => <ul className="space-y-3 mb-8" {...props} />,
                                li: ({node, ...props}) => <li className="text-zinc-700 leading-relaxed pl-2" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-zinc-900" {...props} />,
                                em: ({node, ...props}) => <em className="text-zinc-500 not-italic text-sm font-medium ml-2" {...props} />,
                              }}
                            >
                              {analysis.optimizedContent}
                            </Markdown>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'cover-letter' && (
                  <motion.div
                    key="cover-letter"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="bg-zinc-900 text-white p-6 rounded-3xl border border-zinc-800 space-y-4">
                      <div className="flex items-center gap-2">
                        <FileEdit size={20} className="text-emerald-400" />
                        <h3 className="font-bold uppercase tracking-widest text-xs">Tailor Your Cover Letter</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Add specific details about the company culture, a recent project they completed, or why you're a perfect fit for this specific team.
                      </p>
                      <textarea
                        value={customCoverLetterDetails}
                        onChange={(e) => setCustomCoverLetterDetails(e.target.value)}
                        placeholder="e.g. I know the company is focusing on expanding their cloud infrastructure and I have 3 years of experience with AWS migrations..."
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl outline-none transition-all h-24 resize-none text-sm focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={handleGenerateCoverLetter}
                        disabled={isLoading || !cvText || !jobDescription}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                          <>
                            <Sparkles size={18} />
                            {coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
                          </>
                        )}
                      </button>
                    </div>

                    {!coverLetter ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-10 text-zinc-400">
                        <FileEdit size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No cover letter generated yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-zinc-900">Generated Cover Letter</h3>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => copyToClipboard(coverLetter)}
                              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 flex items-center gap-2 text-sm"
                            >
                              <Copy size={16} /> Copy
                            </button>
                          </div>
                        </div>
                        <div className="p-8 sm:p-16 bg-white border border-zinc-200 rounded-sm shadow-2xl min-h-[1056px] max-w-[816px] mx-auto font-serif">
                          <Markdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-zinc-900 mb-6" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-zinc-800 mt-8 mb-4" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold text-zinc-900 mt-6 mb-2" {...props} />,
                              p: ({node, ...props}) => <p className="text-zinc-800 leading-relaxed mb-6 text-justify" {...props} />,
                              ul: ({node, ...props}) => <ul className="space-y-2 mb-6 ml-4" {...props} />,
                              li: ({node, ...props}) => <li className="text-zinc-800 leading-relaxed list-disc" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-zinc-900" {...props} />,
                              em: ({node, ...props}) => <em className="text-zinc-600 italic" {...props} />,
                            }}
                          >
                            {coverLetter}
                          </Markdown>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'interview' && (
                  <motion.div
                    key="interview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {!interviewQuestions ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No interview questions yet</p>
                        <p className="text-sm">Click "Interview Prep" to generate tailored questions</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-zinc-900">Tailored Interview Questions</h3>
                          <button 
                            onClick={() => copyToClipboard(interviewQuestions.join('\n\n'))}
                            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <div className="space-y-4">
                          {interviewQuestions.map((q, i) => (
                            <div key={i} className="p-5 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-400 transition-all group">
                              <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
                                  {i + 1}
                                </div>
                                <div className="space-y-2">
                                  <p className="text-zinc-900 font-medium leading-relaxed">{q}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'roadmap' && (
                  <motion.div
                    key="roadmap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {!skillsGap ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
                        <ChevronRight size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No roadmap yet</p>
                        <p className="text-sm">Identify skill gaps and get a learning path</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Overall Match</h3>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-3 bg-zinc-200 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${skillsGap.matchPercentage}%` }}
                                className="h-full bg-zinc-900"
                              />
                            </div>
                            <span className="text-2xl font-bold">{skillsGap.matchPercentage}%</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-zinc-900 flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" />
                            Missing Skills & Gaps
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {skillsGap.missingSkills.map((s, i) => (
                              <div key={i} className="p-4 bg-white border border-zinc-200 rounded-xl flex items-start gap-3">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                                  s.importance === 'high' ? 'bg-red-100 text-red-700' :
                                  s.importance === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {s.importance}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{s.skill}</p>
                                  <p className="text-xs text-zinc-500">{s.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-zinc-900 flex items-center gap-2">
                            <Lightbulb size={18} className="text-emerald-500" />
                            Recommended Learning Path
                          </h4>
                          <div className="space-y-3">
                            {skillsGap.learningPath.map((step, i) => (
                              <div key={i} className="flex gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                                  {i + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-emerald-900">{step.step}</p>
                                  <div className="flex gap-3 mt-1">
                                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded uppercase">{step.resourceType}</span>
                                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded uppercase">{step.duration}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 bg-zinc-900 text-zinc-100 rounded-2xl">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Career Advice</h4>
                          <p className="text-sm leading-relaxed italic">"{skillsGap.careerAdvice}"</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'linkedin' && (
                  <motion.div
                    key="linkedin"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {!linkedIn ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
                        <Sparkles size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">LinkedIn Optimizer</p>
                        <p className="text-sm">Optimize your profile to attract recruiters</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-zinc-900">Headline</h4>
                            <button onClick={() => copyToClipboard(linkedIn.headline)} className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400"><Copy size={14} /></button>
                          </div>
                          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium">
                            {linkedIn.headline}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-zinc-900">About Section</h4>
                            <button onClick={() => copyToClipboard(linkedIn.about)} className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400"><Copy size={14} /></button>
                          </div>
                          <div className="p-6 bg-white border border-zinc-200 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                            {linkedIn.about}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-zinc-900">Experience Highlights</h4>
                          <div className="space-y-2">
                            {linkedIn.experienceBulletPoints.map((point, i) => (
                              <div key={i} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm flex gap-3">
                                <ChevronRight size={14} className="text-zinc-400 shrink-0 mt-1" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-zinc-900">Skills to Highlight</h4>
                          <div className="flex flex-wrap gap-2">
                            {linkedIn.skillsToHighlight.map((skill, i) => (
                              <span key={i} className="px-3 py-1 bg-zinc-900 text-white text-xs font-medium rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'jobs' && (
                  <motion.div
                    key="jobs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {!jobOffers ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">Find Job Offers</p>
                        <p className="text-sm">Search for real job offers matching your profile</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {jobOffers.map((job, i) => (
                          <a 
                            key={i} 
                            href={job.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`p-6 rounded-2xl border transition-all group block ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-lg group-hover:text-zinc-500 transition-colors">{job.title}</h4>
                                <p className="text-sm font-medium text-zinc-500">
                                  {job.company} • {job.location}
                                  {job.date_posted && <span className="ml-2 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs">{job.date_posted}</span>}
                                </p>
                              </div>
                              <ChevronRight size={20} className="text-zinc-300 group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
                            </div>
                            <p className="text-sm text-zinc-500 mt-3">{job.snippet}</p>
                          </a>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            &copy; 2026 CvToAI. Inspired by msulikowski96-cmd/CvToai.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
