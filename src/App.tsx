/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react'
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
import { PromoAnimation } from './components/PromoAnimation';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { AuthForm } from './components/AuthForm';
import { Profile } from './components/Profile';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type Tab = 'analyze' | 'cover-letter' | 'interview' | 'roadmap' | 'linkedin' | 'jobs';
type View = 'app' | 'login' | 'register' | 'profile' | 'landing' | 'privacy' | 'terms';

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
  const [view, setView] = useState<View>('landing');
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
  const [showPromo, setShowPromo] = useState(false);

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

  const checkAuth = async () => {
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
        setView('app');
        fetchHistory();
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Auth check failed", e);
    }
  };

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
      await checkAuth();
    };
    init();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkAuth();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const response = await fetch(`/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const authWindow = window.open(url, 'google_oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setAuthError('Failed to initiate Google login');
    }
  };

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
    setView('landing');
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

  if (view === 'landing') {
    return (
      <LandingPage 
        theme={theme}
        toggleTheme={toggleTheme}
        onGetStarted={() => setView('app')}
        onLogin={() => setView('login')}
        onPrivacy={() => setView('privacy')}
        onTerms={() => setView('terms')}
      />
    );
  }

  if (view === 'privacy') {
    return <PrivacyPolicy theme={theme} toggleTheme={toggleTheme} onBack={() => setView('landing')} />;
  }

  if (view === 'terms') {
    return <TermsOfService theme={theme} toggleTheme={toggleTheme} onBack={() => setView('landing')} />;
  }

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
      <AuthForm
        view={view}
        setView={setView}
        isLoading={isLoading}
        authName={authName}
        setAuthName={setAuthName}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authError={authError}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleGoogleLogin={handleGoogleLogin}
      />
    );
  }

  if (view === 'profile' && user) {
    return (
      <Profile
        user={user}
        theme={theme}
        setView={setView}
        avatarInputRef={avatarInputRef}
        handleAvatarUpload={handleAvatarUpload}
        history={history}
        deleteHistoryItem={deleteHistoryItem}
        setCvText={setCvText}
        setJobDescription={setJobDescription}
        setAnalysis={setAnalysis}
        setActiveTab={setActiveTab}
        handleUpdateProfile={handleUpdateProfile}
        profileName={profileName}
        setProfileName={setProfileName}
        profileTargetRole={profileTargetRole}
        setProfileTargetRole={setProfileTargetRole}
        profileExperienceLevel={profileExperienceLevel}
        setProfileExperienceLevel={setProfileExperienceLevel}
        profileLinkedinUrl={profileLinkedinUrl}
        setProfileLinkedinUrl={setProfileLinkedinUrl}
        profileGithubUrl={profileGithubUrl}
        setProfileGithubUrl={setProfileGithubUrl}
        profileBio={profileBio}
        setProfileBio={setProfileBio}
        profileIncludeProjects={profileIncludeProjects}
        setProfileIncludeProjects={setProfileIncludeProjects}
        profileEmphasizedKeywords={profileEmphasizedKeywords}
        setProfileEmphasizedKeywords={setProfileEmphasizedKeywords}
        profilePreferredSections={profilePreferredSections}
        setProfilePreferredSections={setProfilePreferredSections}
        profileSummaryTone={profileSummaryTone}
        setProfileSummaryTone={setProfileSummaryTone}
        isLoading={isLoading}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      {showPromo && <PromoAnimation onClose={() => setShowPromo(false)} />}
      {/* Header */}
      <header className={`border-b px-6 py-4 sticky top-0 z-20 backdrop-blur-xl transition-colors ${theme === 'dark' ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-lg ${theme === 'dark' ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}>
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CvToAI</h1>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>Career Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center p-1 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
              <button 
                onClick={() => setShowPromo(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
                title="Watch Demo"
              >
                <Sparkles size={12} />
                Demo
              </button>
              <div className={`w-px h-4 mx-1 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
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
          <section className={`rounded-3xl shadow-sm border p-6 space-y-4 transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-lg">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <FileText size={20} />
                </div>
                <h2>CV Content</h2>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  theme === 'dark' 
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
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
            <div className="relative group">
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                disabled={isLoading}
                placeholder="Paste your CV text here or upload a PDF..."
                className={`w-full h-64 p-5 rounded-2xl border outline-none transition-all resize-none text-sm font-sans leading-relaxed ${
                  theme === 'dark'
                    ? 'bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-zinc-600'
                    : 'bg-zinc-50 border-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 placeholder:text-zinc-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {!cvText && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`px-4 py-2 rounded-lg text-xs font-medium ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-white shadow-sm text-zinc-500'}`}>
                    Drag & drop or paste text
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-3xl shadow-sm border p-6 space-y-4 transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center gap-2 font-bold text-lg mb-2">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <Briefcase size={20} />
              </div>
              <h2>Job Description</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isLoading}
              placeholder="Paste the job description here..."
              className={`w-full h-64 p-5 rounded-2xl border outline-none transition-all resize-none text-sm font-sans leading-relaxed ${
                theme === 'dark'
                  ? 'bg-zinc-900/50 border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 placeholder:text-zinc-600'
                  : 'bg-zinc-50 border-zinc-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 placeholder:text-zinc-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </section>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !cvText || !jobDescription}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-3 transition-all duration-300"
            >
              {isLoading && activeTab === 'analyze' ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
              {isLoading && activeTab === 'analyze' ? 'Analyzing...' : 'Analyze & Optimize'}
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isLoading || !cvText || !jobDescription}
                className={`py-4 rounded-2xl font-semibold border flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 shadow-sm hover:shadow-md'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isLoading && activeTab === 'cover-letter' ? <Loader2 className="animate-spin" size={18} /> : <FileEdit size={18} className="text-emerald-500" />}
                Cover Letter
              </button>
              <button
                onClick={handleGenerateInterview}
                disabled={isLoading || !cvText || !jobDescription}
                className={`py-4 rounded-2xl font-semibold border flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 shadow-sm hover:shadow-md'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isLoading && activeTab === 'interview' ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} className="text-blue-500" />}
                Interview Prep
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGenerateRoadmap}
                disabled={isLoading || !cvText || !jobDescription}
                className={`py-4 rounded-2xl font-semibold border flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 shadow-sm hover:shadow-md'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isLoading && activeTab === 'roadmap' ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} className="text-amber-500" />}
                Career Roadmap
              </button>
              <button
                onClick={handleOptimizeLinkedIn}
                disabled={isLoading || !cvText}
                className={`py-4 rounded-2xl font-semibold border flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 shadow-sm hover:shadow-md'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isLoading && activeTab === 'linkedin' ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-sky-500" />}
                LinkedIn
              </button>
            </div>
            
            <button
              onClick={handleFindJobs}
              disabled={isLoading || !cvText}
              className={`w-full py-4 rounded-2xl font-semibold border flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 shadow-sm hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {isLoading && activeTab === 'jobs' ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} className="text-rose-500" />}
              Find Matching Jobs
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <div className={`rounded-3xl shadow-sm border h-full flex flex-col overflow-hidden transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            {/* Tabs */}
            <div className="p-2 overflow-x-auto no-scrollbar">
              <div className={`flex p-1 rounded-2xl ${theme === 'dark' ? 'bg-zinc-950/50' : 'bg-zinc-100/80'}`}>
                {(['analyze', 'cover-letter', 'interview', 'roadmap', 'linkedin', 'jobs'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-none px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition-all relative z-10 ${
                      activeTab === tab 
                        ? (theme === 'dark' ? 'text-white' : 'text-zinc-900') 
                        : (theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700')
                    }`}
                  >
                    {tab.replace('-', ' ')}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 rounded-xl shadow-sm -z-10 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
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
                          <div className={`p-8 rounded-3xl border flex flex-col justify-between relative overflow-hidden group ${
                            theme === 'dark' 
                              ? 'bg-zinc-900 border-zinc-800' 
                              : 'bg-white border-zinc-200'
                          }`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700`} />
                            
                            <div>
                              <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Overall Match</h3>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-6xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                                  {analysis.score}
                                </span>
                                <span className="text-2xl font-bold text-zinc-400">%</span>
                              </div>
                            </div>

                            <div className="mt-6">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                analysis.score >= 80 ? 'bg-emerald-500/10 text-emerald-500' :
                                analysis.score >= 60 ? 'bg-amber-500/10 text-amber-500' :
                                'bg-rose-500/10 text-rose-500'
                              }`}>
                                {analysis.score >= 80 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {analysis.score >= 80 ? 'Excellent Match' : analysis.score >= 60 ? 'Good Potential' : 'Needs Improvement'}
                              </div>
                            </div>
                          </div>

                          {/* ATS Breakdown */}
                          <div className={`p-6 rounded-3xl border lg:col-span-2 ${
                            theme === 'dark' 
                              ? 'bg-zinc-900 border-zinc-800' 
                              : 'bg-white border-zinc-200'
                          }`}>
                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-6 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>ATS Analysis</h4>
                            <div className="grid grid-cols-1 gap-5">
                              {[
                                { label: 'Formatting', data: analysis.atsBreakdown?.formatting, icon: <FileText size={14} /> },
                                { label: 'Keywords', data: analysis.atsBreakdown?.keywords, icon: <Key size={14} /> },
                                { label: 'Structure', data: analysis.atsBreakdown?.structure, icon: <Briefcase size={14} /> },
                                { label: 'Relevance', data: analysis.atsBreakdown?.relevance, icon: <CheckCircle2 size={14} /> },
                                { label: 'Impact', data: analysis.atsBreakdown?.impact, icon: <Sparkles size={14} /> },
                              ].map((item) => (
                                <div key={item.label} className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                                        {item.icon}
                                      </div>
                                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.label}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${
                                      (item.data?.score || 0) > 15 ? 'text-emerald-500' : 
                                      (item.data?.score || 0) > 10 ? 'text-amber-500' : 'text-rose-500'
                                    }`}>
                                      {item.data?.score || 0}/20
                                    </span>
                                  </div>
                                  <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${((item.data?.score || 0) / 20) * 100}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                      className={`h-full rounded-full ${
                                        (item.data?.score || 0) > 15 ? 'bg-emerald-500' : 
                                        (item.data?.score || 0) > 10 ? 'bg-amber-500' : 'bg-rose-500'
                                      }`}
                                    />
                                  </div>
                                  {item.data?.feedback && (
                                    <p className={`text-xs leading-relaxed pl-9 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
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
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-lg">
                              <CheckCircle2 size={20} />
                              <h4>Strengths</h4>
                            </div>
                            <ul className="space-y-3">
                              {analysis.strengths.map((s, i) => (
                                <li key={i} className={`text-sm p-4 rounded-2xl border flex gap-3 ${
                                  theme === 'dark' 
                                    ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-200' 
                                    : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                }`}>
                                  <div className="shrink-0 mt-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                                  </div>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
                              <AlertCircle size={20} />
                              <h4>Areas for Improvement</h4>
                            </div>
                            <ul className="space-y-3">
                              {analysis.weaknesses.map((w, i) => (
                                <li key={i} className={`text-sm p-4 rounded-2xl border flex gap-3 ${
                                  theme === 'dark' 
                                    ? 'bg-amber-500/5 border-amber-500/10 text-amber-200' 
                                    : 'bg-amber-50 border-amber-100 text-amber-800'
                                }`}>
                                  <div className="shrink-0 mt-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-amber-400' : 'bg-amber-500'}`} />
                                  </div>
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                              <Lightbulb size={20} />
                            </div>
                            <h4 className={theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}>Actionable Suggestions</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {analysis.suggestions.map((s, i) => (
                              <div key={i} className={`flex gap-4 text-sm p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                                theme === 'dark' 
                                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300' 
                                  : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 shadow-sm'
                              }`}>
                                <div className={`shrink-0 mt-0.5 p-1 rounded-full ${theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                                  <ChevronRight size={14} />
                                </div>
                                <span className="leading-relaxed">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Optimized Content */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
                              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <Sparkles size={20} />
                              </div>
                              <h4 className={theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}>Optimized CV Content</h4>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(analysis.optimizedContent)}
                              className={`p-2 rounded-xl transition-colors ${
                                theme === 'dark' 
                                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' 
                                  : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                              }`}
                            >
                              <Copy size={20} />
                            </button>
                          </div>
                          <div className="p-8 sm:p-16 bg-white text-zinc-900 border border-zinc-200 rounded-sm shadow-2xl min-h-[1056px] max-w-[816px] mx-auto font-sans relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
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
                    <div className={`p-6 rounded-3xl border space-y-4 ${
                      theme === 'dark' 
                        ? 'bg-zinc-900 border-zinc-800' 
                        : 'bg-white border-zinc-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          <FileEdit size={20} />
                        </div>
                        <h3 className={`font-bold uppercase tracking-widest text-xs ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-500'}`}>Tailor Your Cover Letter</h3>
                      </div>
                      <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Add specific details about the company culture, a recent project they completed, or why you're a perfect fit for this specific team.
                      </p>
                      <textarea
                        value={customCoverLetterDetails}
                        onChange={(e) => setCustomCoverLetterDetails(e.target.value)}
                        placeholder="e.g. I know the company is focusing on expanding their cloud infrastructure and I have 3 years of experience with AWS migrations..."
                        className={`w-full px-5 py-4 rounded-2xl outline-none transition-all h-32 resize-none text-sm leading-relaxed ${
                          theme === 'dark'
                            ? 'bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 placeholder:text-zinc-600'
                            : 'bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-zinc-400'
                        }`}
                      />
                      <button
                        onClick={handleGenerateCoverLetter}
                        disabled={isLoading || !cvText || !jobDescription}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                          <>
                            <Sparkles size={20} />
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
                            <div key={i} className={`p-6 rounded-2xl border transition-all group hover:scale-[1.01] ${
                              theme === 'dark' 
                                ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                            }`}>
                              <div className="flex gap-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${
                                  theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                  {i + 1}
                                </div>
                                <div className="space-y-2">
                                  <p className={`font-medium leading-relaxed ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>{q}</p>
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
                        <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                          <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Overall Match</h3>
                          <div className="flex items-center gap-6">
                            <div className={`flex-1 h-4 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${skillsGap.matchPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  skillsGap.matchPercentage >= 80 ? 'bg-emerald-500' :
                                  skillsGap.matchPercentage >= 60 ? 'bg-amber-500' :
                                  'bg-rose-500'
                                }`}
                              />
                            </div>
                            <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{skillsGap.matchPercentage}%</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className={`font-bold text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                            <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                              <AlertCircle size={18} />
                            </div>
                            Missing Skills & Gaps
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {skillsGap.missingSkills.map((s, i) => (
                              <div key={i} className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                                theme === 'dark' 
                                  ? 'bg-zinc-900 border-zinc-800' 
                                  : 'bg-white border-zinc-200 shadow-sm'
                              }`}>
                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase mt-1 tracking-wide ${
                                  s.importance === 'high' ? 'bg-rose-500/10 text-rose-600' :
                                  s.importance === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                                  'bg-blue-500/10 text-blue-600'
                                }`}>
                                  {s.importance}
                                </div>
                                <div>
                                  <p className={`font-bold text-sm mb-1 ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>{s.skill}</p>
                                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>{s.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className={`font-bold text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                            <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                              <Lightbulb size={18} />
                            </div>
                            Recommended Learning Path
                          </h4>
                          <div className="space-y-3">
                            {skillsGap.learningPath.map((step, i) => (
                              <div key={i} className={`flex gap-5 p-5 rounded-2xl border transition-all ${
                                theme === 'dark' 
                                  ? 'bg-zinc-900/50 border-zinc-800' 
                                  : 'bg-emerald-50/30 border-emerald-100'
                              }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {i + 1}
                                </div>
                                <div>
                                  <p className={`text-sm font-bold mb-2 ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>{step.step}</p>
                                  <div className="flex gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${
                                      theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-zinc-500 border border-zinc-200'
                                    }`}>{step.resourceType}</span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${
                                      theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-zinc-500 border border-zinc-200'
                                    }`}>{step.duration}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`p-8 rounded-3xl ${theme === 'dark' ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-900 text-zinc-400'}`}>
                          <h4 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">Career Advice</h4>
                          <p className="text-sm leading-relaxed italic text-zinc-300">"{skillsGap.careerAdvice}"</p>
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
                            <h4 className={`font-bold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>Headline</h4>
                            <button onClick={() => copyToClipboard(linkedIn.headline)} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}><Copy size={16} /></button>
                          </div>
                          <div className={`p-5 rounded-2xl border text-sm font-medium transition-all ${
                            theme === 'dark' 
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-300' 
                              : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                          }`}>
                            {linkedIn.headline}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-bold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>About Section</h4>
                            <button onClick={() => copyToClipboard(linkedIn.about)} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}><Copy size={16} /></button>
                          </div>
                          <div className={`p-6 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap transition-all ${
                            theme === 'dark' 
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-300' 
                              : 'bg-white border-zinc-200 text-zinc-700'
                          }`}>
                            {linkedIn.about}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className={`font-bold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>Experience Highlights</h4>
                          <div className="space-y-2">
                            {linkedIn.experienceBulletPoints.map((point, i) => (
                              <div key={i} className={`p-4 rounded-2xl border text-sm flex gap-3 transition-all ${
                                theme === 'dark' 
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300' 
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                              }`}>
                                <ChevronRight size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className={`font-bold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>Skills to Highlight</h4>
                          <div className="flex flex-wrap gap-2">
                            {linkedIn.skillsToHighlight.map((skill, i) => (
                              <span key={i} className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                                theme === 'dark' 
                                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' 
                                  : 'bg-zinc-900 text-white shadow-sm'
                              }`}>
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
                            className={`p-6 rounded-3xl border transition-all group block hover:scale-[1.01] ${
                              theme === 'dark' 
                                ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-md'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className={`font-bold text-lg transition-colors ${
                                  theme === 'dark' ? 'text-zinc-100 group-hover:text-indigo-400' : 'text-zinc-900 group-hover:text-indigo-600'
                                }`}>{job.title}</h4>
                                <p className={`text-sm font-medium mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                  {job.company} • {job.location}
                                  {job.date_posted && <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                                    theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                                  }`}>{job.date_posted}</span>}
                                </p>
                              </div>
                              <div className={`p-2 rounded-full transition-all ${
                                theme === 'dark' ? 'bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400' : 'bg-zinc-100 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                              }`}>
                                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{job.snippet}</p>
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
