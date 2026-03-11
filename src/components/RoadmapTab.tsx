import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, AlertCircle, Lightbulb } from 'lucide-react';
import { SkillsGap } from '../types';

interface RoadmapTabProps {
  theme: 'light' | 'dark';
  skillsGap: SkillsGap | null;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ theme, skillsGap }) => {
  return (
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
  );
};
