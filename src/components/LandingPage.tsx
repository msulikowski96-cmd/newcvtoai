import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  Moon,
  Sun
} from 'lucide-react';

interface LandingPageProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  onGetStarted: () => void;
  onLogin: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ theme = 'light', toggleTheme, onGetStarted, onLogin, onPrivacy, onTerms }) => {
  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30' : 'bg-zinc-50 text-zinc-900 selection:bg-indigo-100'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950/80 border-zinc-800/50' : 'bg-white/80 border-zinc-200/50'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">CvToAI</span>
          </div>
          <div className="flex items-center gap-4">
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-100' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <button 
              onClick={onLogin}
              className={`text-sm font-bold transition-colors hidden sm:block ${theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}
          >
            <Sparkles size={14} />
            AI-Powered Career Assistant
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            Optimize Your CV for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
              Maximum Impact
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-xl max-w-2xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
          >
            Stop getting rejected by ATS bots. Our AI analyzes your resume against job descriptions to help you land more interviews.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group"
            >
              Analyze My CV Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onLogin}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] border ${
                theme === 'dark' 
                  ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
                  : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-sm'
              }`}
            >
              View Demo
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-12 flex items-center justify-center gap-8 text-zinc-400 grayscale opacity-60"
          >
            {/* Placeholder logos for social proof */}
            <div className="flex items-center gap-2 font-bold text-xl"><Shield size={24} /> Secure</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Zap size={24} /> Fast</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Users size={24} /> Trusted</div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={`py-24 border-t transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950/50 border-zinc-800/50' : 'bg-zinc-50 border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to get hired</h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Comprehensive tools to optimize every stage of your job application process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "ATS Analysis",
                desc: "Get a detailed score and breakdown of how well your CV parses in Applicant Tracking Systems."
              },
              {
                icon: FileText,
                title: "Smart Optimization",
                desc: "Receive actionable suggestions to improve keywords, formatting, and impact statements."
              },
              {
                icon: FileText,
                title: "Cover Letters",
                desc: "Generate tailored cover letters that match your tone and the specific job requirements."
              },
              {
                icon: Users,
                title: "Interview Prep",
                desc: "Practice with AI-generated interview questions specific to the role you're applying for."
              },
              {
                icon: Zap,
                title: "LinkedIn Audit",
                desc: "Optimize your LinkedIn profile to attract recruiters and align with your resume."
              },
              {
                icon: Shield,
                title: "Data Privacy",
                desc: "Your data is secure. We don't share your personal information with third parties."
              }
            ].map((feature, i) => (
              <div key={i} className={`p-8 rounded-3xl border transition-all hover:scale-[1.02] ${
                theme === 'dark' 
                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-md'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className={`leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                How CvToAI works
              </h2>
              <div className="space-y-10">
                {[
                  {
                    step: "01",
                    title: "Upload your CV",
                    desc: "Upload your existing resume in PDF format or paste the text directly."
                  },
                  {
                    step: "02",
                    title: "Add Job Description",
                    desc: "Paste the job description of the role you're targeting for precise matching."
                  },
                  {
                    step: "03",
                    title: "Get Instant Feedback",
                    desc: "Our AI analyzes gaps, keywords, and formatting issues in seconds."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className={`text-2xl font-bold font-mono transition-colors ${
                      theme === 'dark' ? 'text-indigo-500/30 group-hover:text-indigo-400' : 'text-indigo-200 group-hover:text-indigo-500'
                    }`}>{item.step}</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className={`leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-[2.5rem] p-8 aspect-square flex items-center justify-center relative overflow-hidden border ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
              {/* Abstract UI representation */}
              <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 relative z-10 border ${
                theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'
              }`}>
                <div className={`h-4 w-1/3 rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
                <div className="space-y-2">
                  <div className={`h-2 w-full rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
                  <div className={`h-2 w-5/6 rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
                  <div className={`h-2 w-4/6 rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
                </div>
                <div className="flex gap-2 pt-4">
                  <div className="h-8 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg" />
                  <div className={`h-8 w-20 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
                </div>
                
                {/* Floating badge */}
                <div className={`absolute -right-4 -bottom-4 p-4 rounded-2xl shadow-xl border flex items-center gap-3 ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800 shadow-black/50' : 'bg-white border-zinc-100'
                }`}>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className={`text-xs uppercase font-bold tracking-wider ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Match Score</div>
                    <div className="text-xl font-black">92%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content for AdSense (SEO Text) */}
      <section className={`py-24 border-t transition-colors duration-300 ${
        theme === 'dark' ? 'bg-zinc-950 border-zinc-800/50' : 'bg-white border-zinc-100'
      }`}>
        <div className={`max-w-4xl mx-auto px-6 prose prose-lg ${
          theme === 'dark' ? 'prose-invert prose-zinc' : 'prose-zinc'
        }`}>
          <h2 className={theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}>Why CV Optimization Matters</h2>
          <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
            In today's competitive job market, most companies use Applicant Tracking Systems (ATS) to filter resumes before they ever reach a human recruiter. 
            If your CV isn't optimized for these systems, you risk rejection regardless of your qualifications.
          </p>
          <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
            CvToAI helps you bridge the gap between your skills and the recruiter's requirements. By analyzing your resume against specific job descriptions, 
            we identify missing keywords, formatting errors, and structural issues that could be holding you back.
          </p>
          <h3 className={theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}>Key Benefits of Using an AI Resume Builder</h3>
          <ul className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>Keyword Matching:</strong> Ensure your resume speaks the same language as the job description.</li>
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>Format Compliance:</strong> Avoid parsing errors with ATS-friendly layouts.</li>
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>Time Saving:</strong> Generate tailored cover letters and suggestions in seconds, not hours.</li>
            <li><strong className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>Objective Feedback:</strong> Get unbiased scoring on your resume's impact and relevance.</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-16 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles size={16} />
              </div>
              <span className="font-bold text-xl tracking-tight">CvToAI</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
              Empowering job seekers with AI-driven tools to land their dream jobs. 
              Optimize your CV, prepare for interviews, and succeed.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Product</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><button onClick={onGetStarted} className="hover:text-indigo-400 transition-colors">CV Analysis</button></li>
              <li><button onClick={onGetStarted} className="hover:text-indigo-400 transition-colors">Cover Letter Generator</button></li>
              <li><button onClick={onGetStarted} className="hover:text-indigo-400 transition-colors">Interview Prep</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><button onClick={onPrivacy} className="hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
              <li><button onClick={onTerms} className="hover:text-indigo-400 transition-colors">Terms of Service</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 text-xs font-medium text-center md:text-left text-zinc-600">
          &copy; {new Date().getFullYear()} CvToAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
