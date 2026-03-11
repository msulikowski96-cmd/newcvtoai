import { useState, useRef } from 'react';
import { CVAnalysis, SkillsGap, LinkedInOptimization, User } from '../types';
import { analyzeCV, generateCoverLetter, generateInterviewQuestions, analyzeSkillsGap, optimizeLinkedIn, findJobOffers, JobOffer } from '../services/gemini';
import * as pdfjs from 'pdfjs-dist';

export type Tab = 'analyze' | 'cover-letter' | 'interview' | 'roadmap' | 'linkedin' | 'jobs';

export function useCV(user: User | null, hasKey: boolean | null, setHasKey: React.Dispatch<React.SetStateAction<boolean | null>>, language: 'pl' | 'en') {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('analyze');
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

  const handleAnalyze = async (saveToHistory: (analysis: CVAnalysis) => void) => {
    if (!cvText) {
      alert(language === 'pl' ? 'Proszę najpierw wgrać CV lub wkleić tekst.' : 'Please upload a CV or paste text first.');
      return;
    }
    if (!jobDescription) {
      alert(language === 'pl' ? 'Proszę wkleić opis stanowiska.' : 'Please paste a job description.');
      return;
    }
    if (!hasKey) {
      alert(language === 'pl' ? 'Brak klucza API.' : 'API Key is missing.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeCV(cvText, jobDescription, language, user?.preferences);
      setAnalysis(result);
      setActiveTab('analyze');
      if (user) saveToHistory(result);
    } catch (error) {
      console.error('Analysis error:', error);
      const isQuotaExceeded = error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
      
      if (isQuotaExceeded) {
        alert(language === 'pl' 
          ? 'Przekroczono limit zapytań (Quota Exceeded). Proszę spróbować ponownie za chwilę lub wybrać własny klucz API.' 
          : 'Rate limit exceeded (Quota Exceeded). Please try again in a moment or select your own API key.');
        setHasKey(false);
      } else {
        alert(language === 'pl' ? 'Wystąpił błąd podczas analizy. Sprawdź konsolę lub klucz API.' : 'An error occurred during analysis. Check console or API key.');
      }

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
      const result = await generateCoverLetter(cvText, jobDescription, language, customCoverLetterDetails);
      setCoverLetter(result);
      setActiveTab('cover-letter');
    } catch (error) {
      console.error(error);
      const isQuotaExceeded = error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
      if (isQuotaExceeded) setHasKey(false);
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
      const result = await generateInterviewQuestions(cvText, jobDescription, language);
      setInterviewQuestions(result);
      setActiveTab('interview');
    } catch (error) {
      console.error(error);
      const isQuotaExceeded = error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
      if (isQuotaExceeded) setHasKey(false);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!cvText || !jobDescription || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await analyzeSkillsGap(cvText, jobDescription, language);
      setSkillsGap(result);
      setActiveTab('roadmap');
    } catch (error) {
      console.error(error);
      const isQuotaExceeded = error instanceof Error && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
      if (isQuotaExceeded) setHasKey(false);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeLinkedIn = async () => {
    if (!cvText || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await optimizeLinkedIn(cvText, language);
      setLinkedIn(result);
      setActiveTab('linkedin');
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindJobs = async () => {
    if (!cvText || !hasKey) return;
    setIsLoading(true);
    try {
      const result = await findJobOffers(cvText, language);
      setJobOffers(result);
      setActiveTab('jobs');
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
