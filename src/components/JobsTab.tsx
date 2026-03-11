import React from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight } from 'lucide-react';
import { JobOffer } from '../services/gemini';

interface JobsTabProps {
  theme: 'light' | 'dark';
  jobOffers: JobOffer[] | null;
}

export const JobsTab: React.FC<JobsTabProps> = ({ theme, jobOffers }) => {
  return (
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
  );
};
