import { useState, useRef } from 'react';
import { CVAnalysis, SkillsGap, LinkedInOptimization, User, JobOffer } from '../types';
import { analyzeCV, generateCoverLetter, generateInterviewQuestions, analyzeSkillsGap, optimizeLinkedIn, findJobOffers, ApiError } from '../services/gemini';

export type Tab = 'match' | 'cover-letter' | 'interview' | 'roadmap' | 'linkedin' | 'jobs';

// pdf.js is large: load it (and its worker, bundled locally) only when a PDF is uploaded.
const loadPdfjs = async () => {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist'),
    // @ts-ignore - Vite "?url" import
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
};

export function useCV(user: User | null, language: 'pl' | 'en') {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('match');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[] | null>(null);
  const [skillsGap, setSkillsGap] = useState<SkillsGap | null>(null);
  const [linkedIn, setLinkedIn] = useState<LinkedInOptimization | null>(null);
  const [jobOffers, setJobOffers] = useState<JobOffer[] | null>(null);
  const [customCoverLetterDetails, setCustomCoverLetterDetails] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (pl: string, en: string) => (language === 'pl' ? pl : en);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert(t('Proszę wgrać plik PDF.', 'Please upload a PDF file.'));
      return;
    }

    setIsExtracting(true);
    try {
      const uint8Array = new Uint8Array(await file.arrayBuffer());

      // Basic check for PDF header to catch corruption early
      const header = String.fromCharCode(...uint8Array.slice(0, 5));
      if (header !== '%PDF-') {
        throw new Error(t('Plik nie wygląda na poprawny PDF (brak nagłówka %PDF-).', 'File does not appear to be a valid PDF (missing %PDF- header).'));
      }

      const pdfjs = await loadPdfjs();
      const pdf = await pdfjs.getDocument({
        data: uint8Array,
        // CMaps for better character support in some PDFs
        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
        disableAutoFetch: true,
        disableStream: true,
      }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str ?? '').join(' ') + '\n';
      }

      const trimmed = fullText.trim();
      if (!trimmed) {
        throw new Error(t('Nie znaleziono tekstu w PDF (może to skan?).', 'No text found in the PDF (is it a scan?).'));
      }
      setCvText(trimmed);
    } catch (error: any) {
      console.error('PDF extraction error:', error);
      alert(
        t(
          `Nie udało się odczytać PDF: ${error?.message || 'nieznany błąd'}. Spróbuj wkleić tekst ręcznie.`,
          `Failed to extract text from PDF: ${error?.message || 'Unknown error'}. Please try pasting the text manually.`
        )
      );
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Shared error reporting for all AI actions.
  const reportError = (error: unknown) => {
    console.error('AI request error:', error);
    const status = error instanceof ApiError ? error.status : 0;
    if (status === 429) {
      alert(t(
        'Przekroczono limit zapytań. Spróbuj ponownie za chwilę.',
        'Rate limit exceeded. Please try again in a moment.'
      ));
    } else if (status === 503) {
      alert(t(
        'Usługa AI jest chwilowo niedostępna (brak konfiguracji serwera).',
        'The AI service is temporarily unavailable (server not configured).'
      ));
    } else if (status === 400 || status === 413) {
      alert(t('Nieprawidłowe dane wejściowe: ', 'Invalid input: ') + (error as Error).message);
    } else {
      alert(t(
        'Wystąpił błąd podczas generowania. Spróbuj ponownie.',
        'An error occurred while generating. Please try again.'
      ));
    }
  };

  const requireInputs = (needsJob: boolean) => {
    if (!cvText.trim()) {
      alert(t('Proszę najpierw wgrać CV lub wkleić tekst.', 'Please upload a CV or paste text first.'));
      return false;
    }
    if (needsJob && !jobDescription.trim()) {
      alert(t('Proszę wkleić opis stanowiska.', 'Please paste a job description.'));
      return false;
    }
    return true;
  };

  const run = async <T,>(tab: Tab, needsJob: boolean, fn: () => Promise<T>, onResult: (r: T) => void) => {
    if (isLoading || !requireInputs(needsJob)) return;
    setActiveTab(tab);
    setIsLoading(true);
    try {
      onResult(await fn());
    } catch (error) {
      reportError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = (saveToHistory: (analysis: CVAnalysis) => void) =>
    run('match', true, () => analyzeCV(cvText, jobDescription, language, user?.preferences), (result) => {
      setAnalysis(result);
      if (user) saveToHistory(result);
    });

  const handleGenerateCoverLetter = () =>
    run('cover-letter', true, () => generateCoverLetter(cvText, jobDescription, language, customCoverLetterDetails), setCoverLetter);

  const handleGenerateInterview = () =>
    run('interview', true, () => generateInterviewQuestions(cvText, jobDescription, language), setInterviewQuestions);

  const handleGenerateRoadmap = () =>
    run('roadmap', true, () => analyzeSkillsGap(cvText, jobDescription, language), setSkillsGap);

  const handleOptimizeLinkedIn = () =>
    run('linkedin', false, () => optimizeLinkedIn(cvText, language), setLinkedIn);

  const handleFindJobs = () =>
    run('jobs', false, () => findJobOffers(cvText, language), setJobOffers);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Clipboard error', e);
      alert(t('Nie udało się skopiować do schowka.', 'Could not copy to clipboard.'));
    }
  };

  return {
    cvText, setCvText,
    jobDescription, setJobDescription,
    activeTab, setActiveTab,
    isExtracting,
    isLoading,
    analysis, setAnalysis,
    coverLetter, setCoverLetter,
    interviewQuestions, setInterviewQuestions,
    skillsGap, setSkillsGap,
    linkedIn, setLinkedIn,
    jobOffers, setJobOffers,
    customCoverLetterDetails, setCustomCoverLetterDetails,
    fileInputRef,
    handleFileUpload,
    handleAnalyze,
    handleGenerateCoverLetter,
    handleGenerateInterview,
    handleGenerateRoadmap,
    handleOptimizeLinkedIn,
    handleFindJobs,
    copyToClipboard
  };
}
