import { useState, useEffect } from 'react';
import { User } from '../types';

export type View = 'app' | 'login' | 'register' | 'profile' | 'landing' | 'privacy' | 'terms';

export function useAuth(onAuthSuccess?: (user: User) => void) {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('landing');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setView('app');
        if (onAuthSuccess) onAuthSuccess(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (e) {
      console.error("Auth check failed", e);
      return null;
    }
  };

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
        if (onAuthSuccess) onAuthSuccess(userData);
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
        setView('app');
        if (onAuthSuccess) onAuthSuccess(userData);
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

  return {
    user,
    setUser,
    view,
    setView,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authName,
    setAuthName,
    authError,
    setAuthError,
    isLoading,
    setIsLoading,
    checkAuth,
    handleGoogleLogin,
    handleRegister,
    handleLogin,
    handleLogout
  };
}
