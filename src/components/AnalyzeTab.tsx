import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, AlertCircle, FileText, Key, Briefcase, Lightbulb, ChevronRight, Copy } from 'lucide-react';
import Markdown from 'react-markdown';
import { CVAnalysis } from '../types';

interface AnalyzeTabProps {
  analysis: CVAnalysis | null;
  theme: 'light' | 'dark';
  copyToClipboard: (text: string) => void;
}

export const AnalyzeTab: React.FC<AnalyzeTabProps> = ({ analysis, theme, copyToClipboard }) => {
  if (!analysis) {
    return (
      <motion.div
        key="analyze"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400"
      >
        <Sparkles size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">No analysis yet</p>
        <p className="text-sm">Enter your CV and job description to get started</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="analyze"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-8 rounded-3xl border flex flex-col justify-between relative overflow-hidden group ${
          theme === 'dark' 
            ? 'bg-zinc-900 border-zinc-800' 
            : 'bg-white border-zinc-200'
        }`}>
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700`} />
          
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Overall Match</h3>
            <div className="flex items-baseline gap-1">
              <span className={`text-6xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                {analysis.score}
              </span>
              <span className="text-2xl font-bold text-zinc-400">%</span>
            </div>
          </div>

          <div className="mt-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              analysis.score >= 80 ? 'bg-emerald-500/10 text-emerald-500' :
              analysis.score >= 60 ? 'bg-amber-500/10 text-amber-500' :
              'bg-rose-500/10 text-rose-500'
            }`}>
              {analysis.score >= 80 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {analysis.score >= 80 ? 'Excellent Match' : analysis.score >= 60 ? 'Good Potential' : 'Needs Improvement'}
            </div>
          </div>
        </div>

        {/* ATS Breakdown */}
        <div className={`p-6 rounded-3xl border lg:col-span-2 ${
          theme === 'dark' 
            ? 'bg-zinc-900 border-zinc-800' 
            : 'bg-white border-zinc-200'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-widest mb-6 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>ATS Analysis</h4>
          <div className="grid grid-cols-1 gap-5">
            {[
              { label: 'Formatting', data: analysis.atsBreakdown?.formatting, icon: <FileText size={14} /> },
              { label: 'Keywords', data: analysis.atsBreakdown?.keywords, icon: <Key size={14} /> },
              { label: 'Structure', data: analysis.atsBreakdown?.structure, icon: <Briefcase size={14} /> },
              { label: 'Relevance', data: analysis.atsBreakdown?.relevance, icon: <CheckCircle2 size={14} /> },
              { label: 'Impact', data: analysis.atsBreakdown?.impact, icon: <Sparkles size={14} /> },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${
                    (item.data?.score || 0) > 15 ? 'text-emerald-500' : 
                    (item.data?.score || 0) > 10 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {item.data?.score || 0}/20
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((item.data?.score || 0) / 20) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      (item.data?.score || 0) > 15 ? 'bg-emerald-500' : 
                      (item.data?.score || 0) > 10 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
                {item.data?.feedback && (
                  <p className={`text-xs leading-relaxed pl-9 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {item.data.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-lg">
            <CheckCircle2 size={20} />
            <h4>Strengths</h4>
          </div>
          <ul className="space-y-3">
            {analysis.strengths.map((s, i) => (
              <li key={i} className={`text-sm p-4 rounded-2xl border flex gap-3 ${
                theme === 'dark' 
                  ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-200' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
              }`}>
                <div className="shrink-0 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                </div>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
            <AlertCircle size={20} />
            <h4>Areas for Improvement</h4>
          </div>
          <ul className="space-y-3">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className={`text-sm p-4 rounded-2xl border flex gap-3 ${
                theme === 'dark' 
                  ? 'bg-amber-500/5 border-amber-500/10 text-amber-200' 
                  : 'bg-amber-50 border-amber-100 text-amber-800'
              }`}>
                <div className="shrink-0 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-amber-400' : 'bg-amber-500'}`} />
                </div>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
            <Lightbulb size={20} />
          </div>
          <h4 className={theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}>Actionable Suggestions</h4>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {analysis.suggestions.map((s, i) => (
            <div key={i} className={`flex gap-4 text-sm p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
              theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300' 
                : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 shadow-sm'
            }`}>
              <div className={`shrink-0 mt-0.5 p-1 rounded-full ${theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                <ChevronRight size={14} />
              </div>
              <span className="leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Sparkles size={20} />
            </div>
            <h4 className={theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}>Optimized CV Content</h4>
          </div>
          <button 
            onClick={() => copyToClipboard(analysis.optimizedContent)}
            className={`p-2 rounded-xl transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' 
                : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Copy size={20} />
          </button>
        </div>
        <div className="p-8 sm:p-16 bg-white text-zinc-900 border border-zinc-200 rounded-sm shadow-2xl min-h-[1056px] max-w-[816px] mx-auto font-sans relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
          <Markdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 border-b-4 border-zinc-900 pb-6 mb-8 uppercase tracking-widest text-center" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-zinc-900 mt-12 mb-6 uppercase tracking-widest border-b-2 border-zinc-200 pb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold text-zinc-900 mt-8 mb-2 flex items-center gap-2" {...props} />,
              p: ({node, ...props}) => <p className="text-zinc-700 leading-relaxed mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="space-y-3 mb-8" {...props} />,
              li: ({node, ...props}) => <li className="text-zinc-700 leading-relaxed pl-2" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-zinc-900" {...props} />,
              em: ({node, ...props}) => <em className="text-zinc-500 not-italic text-sm font-medium ml-2" {...props} />,
            }}
          >
            {analysis.optimizedContent}
          </Markdown>
        </div>
      </div>
    </motion.div>
  );
};
