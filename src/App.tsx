/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, lazy, Suspense } from 'react'
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
  RefreshCw,
  Shield,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { User, CVAnalysis, SkillsGap, LinkedInOptimization, CVHistoryItem } from './types';
import { AuthForm } from './components/AuthForm';
import { AnalyzeTab } from './components/AnalyzeTab';
import { CoverLetterTab } from './components/CoverLetterTab';
import { InterviewPrepTab } from './components/InterviewPrepTab';
import { RoadmapTab } from './components/RoadmapTab';
import { LinkedInTab } from './components/LinkedInTab';
import { JobsTab } from './components/JobsTab';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useCV, Tab } from './hooks/useCV';

// Code-split views that are not needed on first render.
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./components/TermsOfService').then(m => ({ default: m.TermsOfService })));
const Profile = lazy(() => import('./components/Profile').then(m => ({ default: m.Profile })));
const PromoAnimation = lazy(() => import('./components/PromoAnimation').then(m => ({ default: m.PromoAnimation })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="animate-spin text-zinc-400" size={40} />
  </div>
);

export default function App() {
  const [history, setHistory] = useState<CVHistoryItem[]>([]);
  const [language, setLanguage] = useState<'pl' | 'en'>('pl');
  const [showPromo, setShowPromo] = useState(false);
  
  const {
    user, setUser, view, setView,
    authEmail, setAuthEmail, authPassword, setAuthPassword,
    authName, setAuthName, authError, setAuthError,
    isLoading: isAuthLoading, setIsLoading: setIsAuthLoading,
    checkAuth, handleGoogleLogin, handleRegister, handleLogin, handleLogout
  } = useAuth((userData) => {
    initProfile(userData);
    fetchHistory();
  });

  const {
    profileName, setProfileName, profileBio, setProfileBio,
    profileTargetRole, setProfileTargetRole, profileExperienceLevel, setProfileExperienceLevel,
    profileLinkedinUrl, setProfileLinkedinUrl, profileGithubUrl, setProfileGithubUrl,
    profileIncludeProjects, setProfileIncludeProjects, profileEmphasizedKeywords, setProfileEmphasizedKeywords,
    profileSummaryTone, setProfileSummaryTone, profilePreferredSections, setProfilePreferredSections,
    theme, setTheme, isLoading: isProfileLoading,
    initProfile, handleUpdateProfile, handleAvatarUpload, toggleTheme
  } = useProfile(user, setUser);

  const {
    cvText, setCvText, jobDescription, setJobDescription,
    activeTab, setActiveTab, isExtracting, isLoading: isCVLoading,
    analysis, setAnalysis, coverLetter, setCoverLetter,
    interviewQuestions, setInterviewQuestions, skillsGap, setSkillsGap,
    linkedIn, setLinkedIn, jobOffers, setJobOffers,
    customCoverLetterDetails, setCustomCoverLetterDetails,
    fileInputRef, handleFileUpload, handleAnalyze, handleGenerateCoverLetter,
    handleGenerateInterview, handleGenerateRoadmap, handleOptimizeLinkedIn, handleFindJobs,
    copyToClipboard
  } = useCV(user, language);

  const isLoading = isAuthLoading || isProfileLoading || isCVLoading;
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
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

  if (view === 'landing') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage 
          theme={theme}
          toggleTheme={toggleTheme}
          onGetStarted={() => setView('app')}
          onLogin={() => setView('login')}
          onPrivacy={() => setView('privacy')}
          onTerms={() => setView('terms')}
        />
      </Suspense>
    );
  }

  if (view === 'privacy') {
    return (
      <Suspense fallback={<PageLoader />}>
        <PrivacyPolicy theme={theme} toggleTheme={toggleTheme} onBack={() => setView('landing')} />
      </Suspense>
    );
  }

  if (view === 'terms') {
    return (
      <Suspense fallback={<PageLoader />}>
        <TermsOfService theme={theme} toggleTheme={toggleTheme} onBack={() => setView('landing')} />
      </Suspense>
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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      {showPromo && (
        <Suspense fallback={null}>
          <PromoAnimation onClose={() => setShowPromo(false)} />
        </Suspense>
      )}
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
              onClick={() => handleAnalyze(saveToHistory)}
              disabled={isLoading || !cvText || !jobDescription}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-3 transition-all duration-300"
            >
              {isLoading && activeTab === 'match' ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
              {isLoading && activeTab === 'match' ? 'Analyzing...' : 'Match Analysis'}
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
                {(['match', 'cover-letter', 'interview', 'roadmap', 'linkedin', 'jobs'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-none px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition-all relative z-10 ${
                      activeTab === tab 
                        ? (theme === 'dark' ? 'text-white' : 'text-zinc-900') 
                        : (theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700')
                    }`}
                  >
                    {tab === 'match' ? 'Match Analysis' : tab.replace('-', ' ')}
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
                {activeTab === 'match' && (
                  <AnalyzeTab 
                    analysis={analysis} 
                    theme={theme} 
                    copyToClipboard={copyToClipboard} 
                  />
                )}

                {activeTab === 'cover-letter' && (
                  <CoverLetterTab 
                    theme={theme}
                    customCoverLetterDetails={customCoverLetterDetails}
                    setCustomCoverLetterDetails={setCustomCoverLetterDetails}
                    handleGenerateCoverLetter={handleGenerateCoverLetter}
                    isLoading={isLoading}
                    cvText={cvText}
                    jobDescription={jobDescription}
                    coverLetter={coverLetter}
                    copyToClipboard={copyToClipboard}
                  />
                )}

                {activeTab === 'interview' && (
                  <InterviewPrepTab 
                    theme={theme}
                    interviewQuestions={interviewQuestions}
                    copyToClipboard={copyToClipboard}
                  />
                )}

                {activeTab === 'roadmap' && (
                  <RoadmapTab 
                    theme={theme}
                    skillsGap={skillsGap}
                  />
                )}

                {activeTab === 'linkedin' && (
                  <LinkedInTab 
                    theme={theme}
                    linkedIn={linkedIn}
                    copyToClipboard={copyToClipboard}
                  />
                )}

                {activeTab === 'jobs' && (
                  <JobsTab 
                    theme={theme}
                    jobOffers={jobOffers}
                  />
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
