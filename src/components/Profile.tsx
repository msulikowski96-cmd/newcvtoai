import React from 'react';
import { ChevronRight, User as UserIcon, Camera, History, Trash2, RefreshCw, Settings, LogOut, Loader2 } from 'lucide-react';
import { User, CVHistoryItem } from '../types';

interface ProfileProps {
  user: User;
  theme: 'light' | 'dark';
  setView: (view: 'app') => void;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  history: CVHistoryItem[];
  deleteHistoryItem: (id: number) => void;
  setCvText: (text: string) => void;
  setJobDescription: (text: string) => void;
  setAnalysis: (analysis: any) => void;
  setActiveTab: (tab: any) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  profileName: string;
  setProfileName: (name: string) => void;
  profileTargetRole: string;
  setProfileTargetRole: (role: string) => void;
  profileExperienceLevel: string;
  setProfileExperienceLevel: (level: string) => void;
  profileLinkedinUrl: string;
  setProfileLinkedinUrl: (url: string) => void;
  profileGithubUrl: string;
  setProfileGithubUrl: (url: string) => void;
  profileBio: string;
  setProfileBio: (bio: string) => void;
  profileIncludeProjects: boolean;
  setProfileIncludeProjects: (include: boolean) => void;
  profileEmphasizedKeywords: string;
  setProfileEmphasizedKeywords: (keywords: string) => void;
  profilePreferredSections: string;
  setProfilePreferredSections: (sections: string) => void;
  profileSummaryTone: 'professional' | 'creative' | 'minimalist' | 'bold';
  setProfileSummaryTone: (tone: 'professional' | 'creative' | 'minimalist' | 'bold') => void;
  isLoading: boolean;
  handleLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  theme,
  setView,
  avatarInputRef,
  handleAvatarUpload,
  history,
  deleteHistoryItem,
  setCvText,
  setJobDescription,
  setAnalysis,
  setActiveTab,
  handleUpdateProfile,
  profileName,
  setProfileName,
  profileTargetRole,
  setProfileTargetRole,
  profileExperienceLevel,
  setProfileExperienceLevel,
  profileLinkedinUrl,
  setProfileLinkedinUrl,
  profileGithubUrl,
  setProfileGithubUrl,
  profileBio,
  setProfileBio,
  profileIncludeProjects,
  setProfileIncludeProjects,
  profileEmphasizedKeywords,
  setProfileEmphasizedKeywords,
  profilePreferredSections,
  setProfilePreferredSections,
  profileSummaryTone,
  setProfileSummaryTone,
  isLoading,
  handleLogout
}) => {
  return (
    <div className={`min-h-screen p-6 flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className="max-w-4xl mx-auto w-full mb-8 flex items-center justify-between">
        <button onClick={() => setView('app')} className={`flex items-center gap-2 font-semibold transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}>
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
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{user.email}</p>
            </div>
          </div>

          <div className={`rounded-3xl shadow-sm border p-6 space-y-4 transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{history.length}</p>
                <p className={`text-[10px] uppercase font-bold ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Optimizations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{history.length > 0 ? Math.round(history.reduce((acc, h) => acc + h.analysis.score, 0) / history.length) : 0}%</p>
                <p className={`text-[10px] uppercase font-bold ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Avg. Match</p>
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
              <div className={`text-center py-10 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
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
                          <p className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
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
                  <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Display Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Target Role</label>
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
                  <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Experience Level</label>
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
                  <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>LinkedIn URL</label>
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
                <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>GitHub / Portfolio URL</label>
                <input
                  type="url"
                  value={profileGithubUrl}
                  onChange={(e) => setProfileGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Bio</label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all h-32 resize-none ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className={`pt-4 border-t space-y-4 ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-100'}`}>
                <h4 className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>CV Generation Preferences</h4>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includeProjects"
                    checked={profileIncludeProjects}
                    onChange={(e) => setProfileIncludeProjects(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <label htmlFor="includeProjects" className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>Include 'Projects' section in CV</label>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Keywords to Emphasize</label>
                  <input
                    type="text"
                    value={profileEmphasizedKeywords}
                    onChange={(e) => setProfileEmphasizedKeywords(e.target.value)}
                    placeholder="e.g. React, Node.js, AWS (comma separated)"
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Preferred Sections</label>
                  <input
                    type="text"
                    value={profilePreferredSections}
                    onChange={(e) => setProfilePreferredSections(e.target.value)}
                    placeholder="e.g. Summary, Experience, Education (comma separated)"
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 focus:ring-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:ring-zinc-900'}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Summary Tone</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['professional', 'creative', 'minimalist', 'bold'] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setProfileSummaryTone(tone)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                          profileSummaryTone === tone 
                            ? (theme === 'dark' ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-zinc-900 text-white border-zinc-900')
                            : (theme === 'dark' ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400')
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
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Logging out will end your current session.</p>
            <button 
              onClick={handleLogout}
              className={`px-6 py-2 border border-red-200 text-red-600 rounded-xl font-semibold transition-colors flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};
