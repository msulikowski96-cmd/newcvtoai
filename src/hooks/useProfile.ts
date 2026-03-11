import { useState } from 'react';
import { User } from '../types';

export function useProfile(user: User | null, setUser: React.Dispatch<React.SetStateAction<User | null>>) {
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);

  const initProfile = (userData: User) => {
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

  return {
    profileName, setProfileName,
    profileBio, setProfileBio,
    profileTargetRole, setProfileTargetRole,
    profileExperienceLevel, setProfileExperienceLevel,
    profileLinkedinUrl, setProfileLinkedinUrl,
    profileGithubUrl, setProfileGithubUrl,
    profileIncludeProjects, setProfileIncludeProjects,
    profileEmphasizedKeywords, setProfileEmphasizedKeywords,
    profileSummaryTone, setProfileSummaryTone,
    profilePreferredSections, setProfilePreferredSections,
    theme, setTheme,
    isLoading,
    initProfile,
    handleUpdateProfile,
    handleAvatarUpload,
    toggleTheme
  };
}
