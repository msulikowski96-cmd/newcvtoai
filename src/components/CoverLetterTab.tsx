import React from 'react';
import { motion } from 'motion/react';
import { FileEdit, Sparkles, Loader2, Copy } from 'lucide-react';
import Markdown from 'react-markdown';

interface CoverLetterTabProps {
  theme: 'light' | 'dark';
  customCoverLetterDetails: string;
  setCustomCoverLetterDetails: (details: string) => void;
  handleGenerateCoverLetter: () => void;
  isLoading: boolean;
  cvText: string;
  jobDescription: string;
  coverLetter: string | null;
  copyToClipboard: (text: string) => void;
}

export const CoverLetterTab: React.FC<CoverLetterTabProps> = ({
  theme,
  customCoverLetterDetails,
  setCustomCoverLetterDetails,
  handleGenerateCoverLetter,
  isLoading,
  cvText,
  jobDescription,
  coverLetter,
  copyToClipboard
}) => {
  return (
    <motion.div
      key="cover-letter"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className={`p-6 rounded-3xl border space-y-4 ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <FileEdit size={20} />
          </div>
          <h3 className={`font-bold uppercase tracking-widest text-xs ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-500'}`}>Tailor Your Cover Letter</h3>
        </div>
        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Add specific details about the company culture, a recent project they completed, or why you're a perfect fit for this specific team.
        </p>
        <textarea
          value={customCoverLetterDetails}
          onChange={(e) => setCustomCoverLetterDetails(e.target.value)}
          placeholder="e.g. I know the company is focusing on expanding their cloud infrastructure and I have 3 years of experience with AWS migrations..."
          className={`w-full px-5 py-4 rounded-2xl outline-none transition-all h-32 resize-none text-sm leading-relaxed ${
            theme === 'dark'
              ? 'bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 placeholder:text-zinc-600 text-zinc-100'
              : 'bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-zinc-400 text-zinc-900'
          }`}
        />
        <button
          onClick={handleGenerateCoverLetter}
          disabled={isLoading || !cvText || !jobDescription}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              <Sparkles size={20} />
              {coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
            </>
          )}
        </button>
      </div>

      {!coverLetter ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-10 text-zinc-400">
          <FileEdit size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No cover letter generated yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>Generated Cover Letter</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => copyToClipboard(coverLetter)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                  theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Copy size={16} /> Copy
              </button>
            </div>
          </div>
          <div className="p-8 sm:p-16 bg-white border border-zinc-200 rounded-sm shadow-2xl min-h-[1056px] max-w-[816px] mx-auto font-serif text-zinc-900">
            <Markdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-zinc-900 mb-6" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-zinc-800 mt-8 mb-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-zinc-900 mt-6 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-zinc-800 leading-relaxed mb-6 text-justify" {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-2 mb-6 ml-4" {...props} />,
                li: ({node, ...props}) => <li className="text-zinc-800 leading-relaxed list-disc" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-zinc-900" {...props} />,
                em: ({node, ...props}) => <em className="text-zinc-600 italic" {...props} />,
              }}
            >
              {coverLetter}
            </Markdown>
          </div>
        </div>
      )}
    </motion.div>
  );
};
