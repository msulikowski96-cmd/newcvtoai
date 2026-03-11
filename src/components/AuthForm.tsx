import React from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Lock, Loader2 } from 'lucide-react';

interface AuthFormProps {
  view: 'login' | 'register';
  setView: (view: 'login' | 'register' | 'app') => void;
  isLoading: boolean;
  authName: string;
  setAuthName: (name: string) => void;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPassword: string;
  setAuthPassword: (password: string) => void;
  authError: string;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
  handleGoogleLogin: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  view,
  setView,
  isLoading,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  handleLogin,
  handleRegister,
  handleGoogleLogin
}) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-200 p-8 space-y-6"
      >
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-zinc-900">
              {view === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-zinc-600 text-sm max-w-sm mx-auto">
              {view === 'login' 
                ? 'Sign in to access your saved CV analyses, generated cover letters, and personalized interview questions. Continue optimizing your career path.' 
                : 'Join CvToAI to unlock advanced AI tools for your career. Optimize your resume, generate tailored cover letters, and prepare for interviews with precision.'}
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

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 font-bold">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
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
};
