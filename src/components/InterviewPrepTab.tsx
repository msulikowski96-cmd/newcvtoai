import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Copy } from 'lucide-react';

interface InterviewPrepTabProps {
  theme: 'light' | 'dark';
  interviewQuestions: string[] | null;
  copyToClipboard: (text: string) => void;
}

export const InterviewPrepTab: React.FC<InterviewPrepTabProps> = ({
  theme,
  interviewQuestions,
  copyToClipboard
}) => {
  return (
    <motion.div
      key="interview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {!interviewQuestions ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No interview questions yet</p>
          <p className="text-sm">Click "Interview Prep" to generate tailored questions</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>Tailored Interview Questions</h3>
            <button 
              onClick={() => copyToClipboard(interviewQuestions.join('\n\n'))}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Copy size={16} /> Copy
            </button>
          </div>
          <div className="space-y-4">
            {interviewQuestions.map((q, i) => (
              <div key={i} className={`p-6 rounded-2xl border transition-all group hover:scale-[1.01] ${
                theme === 'dark' 
                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
              }`}>
                <div className="flex gap-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${
                    theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="space-y-2">
                    <p className={`font-medium leading-relaxed ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>{q}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};
