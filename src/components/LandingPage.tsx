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
  BarChart3 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onPrivacy, onTerms }) => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">CvToAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-full hover:bg-zinc-800 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100"
          >
            <Sparkles size={12} />
            AI-Powered Career Assistant
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]"
          >
            Optimize Your CV for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Maximum Impact
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed"
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
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 group"
            >
              Analyze My CV Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onLogin}
              className="px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-full font-bold text-lg hover:bg-zinc-50 transition-all"
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
      <section className="py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Everything you need to get hired</h2>
            <p className="text-zinc-500 text-lg">
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
              <div key={i} className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
                How CvToAI works
              </h2>
              <div className="space-y-8">
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
                  <div key={i} className="flex gap-6">
                    <div className="text-2xl font-bold text-blue-200 font-mono">{item.step}</div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h3>
                      <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-100 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              {/* Abstract UI representation */}
              <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 space-y-4 relative z-10">
                <div className="h-4 w-1/3 bg-zinc-100 rounded" />
                <div className="space-y-2">
                  <div className="h-2 w-full bg-zinc-100 rounded" />
                  <div className="h-2 w-5/6 bg-zinc-100 rounded" />
                  <div className="h-2 w-4/6 bg-zinc-100 rounded" />
                </div>
                <div className="flex gap-2 pt-4">
                  <div className="h-8 w-20 bg-blue-600 rounded-lg" />
                  <div className="h-8 w-20 bg-zinc-100 rounded-lg" />
                </div>
                
                {/* Floating badge */}
                <div className="absolute -right-4 -bottom-4 bg-white p-4 rounded-xl shadow-xl border border-zinc-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase font-bold">Match Score</div>
                    <div className="text-xl font-bold text-zinc-900">92%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content for AdSense (SEO Text) */}
      <section className="py-20 bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 prose prose-zinc prose-lg">
          <h2>Why CV Optimization Matters</h2>
          <p>
            In today's competitive job market, most companies use Applicant Tracking Systems (ATS) to filter resumes before they ever reach a human recruiter. 
            If your CV isn't optimized for these systems, you risk rejection regardless of your qualifications.
          </p>
          <p>
            CvToAI helps you bridge the gap between your skills and the recruiter's requirements. By analyzing your resume against specific job descriptions, 
            we identify missing keywords, formatting errors, and structural issues that could be holding you back.
          </p>
          <h3>Key Benefits of Using an AI Resume Builder</h3>
          <ul>
            <li><strong>Keyword Matching:</strong> Ensure your resume speaks the same language as the job description.</li>
            <li><strong>Format Compliance:</strong> Avoid parsing errors with ATS-friendly layouts.</li>
            <li><strong>Time Saving:</strong> Generate tailored cover letters and suggestions in seconds, not hours.</li>
            <li><strong>Objective Feedback:</strong> Get unbiased scoring on your resume's impact and relevance.</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <Sparkles size={18} />
              <span className="font-bold text-xl">CvToAI</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              Empowering job seekers with AI-driven tools to land their dream jobs. 
              Optimize your CV, prepare for interviews, and succeed.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={onGetStarted} className="hover:text-white transition-colors">CV Analysis</button></li>
              <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Cover Letter Generator</button></li>
              <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Interview Prep</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={onPrivacy} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={onTerms} className="hover:text-white transition-colors">Terms of Service</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-800 text-xs text-center md:text-left">
          &copy; {new Date().getFullYear()} CvToAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
