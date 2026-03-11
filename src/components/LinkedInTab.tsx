import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Copy, ChevronRight } from 'lucide-react';
import { LinkedInOptimization } from '../types';

interface LinkedInTabProps {
  theme: 'light' | 'dark';
  linkedIn: LinkedInOptimization | null;
  copyToClipboard: (text: string) => void;
}

export const LinkedInTab: React.FC<LinkedInTabProps> = ({ theme, linkedIn, copyToClipboard }) => {
  return (
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
  );
};
