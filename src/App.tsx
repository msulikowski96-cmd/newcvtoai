/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  FileEdit, 
  MessageSquare, 
  ChevronRight,
  Loader2,
  Trash2,
  Copy,
  Download,
  Upload,
  FileUp,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import * as pdfjs from 'pdfjs-dist';
import { analyzeCV, generateCoverLetter, generateInterviewQuestions, CVAnalysis } from './services/gemini';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type Tab = 'analyze' | 'cover-letter' | 'interview';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('analyze');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[] | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true); // Fallback for local dev or if not in AI Studio
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success as per guidelines
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setIsExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      setCvText(fullText.trim());
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      alert('Failed to extract text from PDF. Please try pasting the text manually.');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!cvText || !jobDescription || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await analyzeCV(cvText, jobDescription);
      setAnalysis(result);
      setActiveTab('analyze');
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!cvText || !jobDescription || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await generateCoverLetter(cvText, jobDescription);
      setCoverLetter(result);
      setActiveTab('cover-letter');
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInterview = async () => {
    if (!cvText || !jobDescription || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await generateInterviewQuestions(cvText, jobDescription);
      setInterviewQuestions(result);
      setActiveTab('interview');
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-200 p-8 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mx-auto">
            <Key size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900">Connect Gemini API Key</h1>
            <p className="text-zinc-500 text-sm">
              To use the advanced Gemini 3.1 Pro model, you need to connect your own API key from a paid Google Cloud project.
            </p>
          </div>
          <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-600 text-left space-y-2">
            <p className="font-semibold text-zinc-900">Why is this needed?</p>
            <p>Advanced models require billing to be enabled. You can manage your keys and billing in the Google AI Studio dashboard.</p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-900 underline font-medium block"
            >
              Learn more about billing &rarr;
            </a>
          </div>
          <button
            onClick={handleSelectKey}
            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Select API Key
          </button>
        </motion.div>
      </div>
    );
  }

  if (hasKey === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CvToAI</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">AI-Powered Career Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setCvText(''); setJobDescription(''); setAnalysis(null); setCoverLetter(null); setInterviewQuestions(null); }}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              title="Clear All"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <FileText size={18} />
                <h2>Your CV Content</h2>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-all"
              >
                {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
                {isExtracting ? 'Extracting...' : 'Upload PDF'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
            </div>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text here or upload a PDF..."
              className="w-full h-64 p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none text-sm font-sans"
            />
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold mb-2">
              <Briefcase size={18} />
              <h2>Job Description</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none text-sm font-sans"
            />
          </section>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !cvText || !jobDescription}
              className="w-full py-4 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isLoading && activeTab === 'analyze' ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Analyze & Optimize CV
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isLoading || !cvText || !jobDescription}
                className="py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isLoading && activeTab === 'cover-letter' ? <Loader2 className="animate-spin" size={18} /> : <FileEdit size={18} />}
                Cover Letter
              </button>
              <button
                onClick={handleGenerateInterview}
                disabled={isLoading || !cvText || !jobDescription}
                className="py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isLoading && activeTab === 'interview' ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
                Interview Prep
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 h-full flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              {(['analyze', 'cover-letter', 'interview'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-semibold capitalize transition-all relative ${
                    activeTab === tab ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {tab.replace('-', ' ')}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'analyze' && (
                  <motion.div
                    key="analyze"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {!analysis ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
                        <Sparkles size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No analysis yet</p>
                        <p className="text-sm">Enter your CV and job description to get started</p>
                      </div>
                    ) : (
                      <>
                        {/* Score Card */}
                        <div className="flex items-center justify-between bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                          <div>
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Match Score</h3>
                            <p className="text-4xl font-bold text-zinc-900">{analysis.score}%</p>
                          </div>
                          <div className="w-16 h-16 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                            <div className="text-xs font-bold">MATCH</div>
                          </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                              <CheckCircle2 size={18} />
                              <h4>Strengths</h4>
                            </div>
                            <ul className="space-y-2">
                              {analysis.strengths.map((s, i) => (
                                <li key={i} className="text-sm bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-600 font-semibold">
                              <AlertCircle size={18} />
                              <h4>Areas for Improvement</h4>
                            </div>
                            <ul className="space-y-2">
                              {analysis.weaknesses.map((w, i) => (
                                <li key={i} className="text-sm bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-100">
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                            <Lightbulb size={18} />
                            <h4>Actionable Suggestions</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {analysis.suggestions.map((s, i) => (
                              <div key={i} className="flex gap-3 text-sm p-4 bg-white border border-zinc-200 rounded-xl">
                                <ChevronRight size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Optimized Content */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                              <Sparkles size={18} />
                              <h4>Optimized Content</h4>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(analysis.optimizedContent)}
                              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <div className="p-6 bg-zinc-900 text-zinc-100 rounded-2xl font-mono text-sm whitespace-pre-wrap leading-relaxed">
                            {analysis.optimizedContent}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'cover-letter' && (
                  <motion.div
                    key="cover-letter"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                  >
                    {!coverLetter ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-400">
                        <FileEdit size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No cover letter generated</p>
                        <p className="text-sm">Click "Cover Letter" to generate one based on your CV</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-zinc-900">Generated Cover Letter</h3>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => copyToClipboard(coverLetter)}
                              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 flex items-center gap-2 text-sm"
                            >
                              <Copy size={16} /> Copy
                            </button>
                          </div>
                        </div>
                        <div className="p-8 bg-white border border-zinc-200 rounded-2xl shadow-inner min-h-[500px]">
                          <div className="markdown-body">
                            <Markdown>{coverLetter}</Markdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'interview' && (
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
                          <h3 className="font-semibold text-zinc-900">Tailored Interview Questions</h3>
                          <button 
                            onClick={() => copyToClipboard(interviewQuestions.join('\n\n'))}
                            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <div className="space-y-4">
                          {interviewQuestions.map((q, i) => (
                            <div key={i} className="p-5 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-400 transition-all group">
                              <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
                                  {i + 1}
                                </div>
                                <div className="space-y-2">
                                  <p className="text-zinc-900 font-medium leading-relaxed">{q}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            &copy; 2026 CvToAI. Inspired by msulikowski96-cmd/CvToai.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
