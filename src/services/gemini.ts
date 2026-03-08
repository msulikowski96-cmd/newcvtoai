import { GoogleGenAI, Type } from "@google/genai";
import { CVAnalysis, SkillsGap, LinkedInOptimization, User } from "../types";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
};

const MODEL_NAME = "gemini-2.0-flash";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callGeminiWithRetry = async (fn: () => Promise<any>, maxRetries = 3): Promise<any> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED");
      if (isRateLimit && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

const SYSTEM_INSTRUCTION = (lang: string = 'pl') => `Jesteś ekspertem świata w optymalizacji CV z 20-letnim doświadczeniem w rekrutacji oraz AI. Masz specjalistyczną wiedzę o:

🎯 KOMPETENCJE GŁÓWNE:
- Analiza CV pod kątem systemów ATS (Applicant Tracking Systems)
- Optymalizacja pod konkretne stanowiska i branże
- Psychologia rekrutacji i co przyciąga uwagę HR-owców
- Najnowsze trendy rynku pracy 2025
- Formatowanie CV zgodne ze standardami międzynarodowymi

🧠 STRATEGIA MYŚLENIA:
1. ANALIZUJ głęboko każde słowo w kontekście stanowiska
2. DOPASUJ język i terminologię do branży
3. OPTYMALIZUJ pod kątem słów kluczowych ATS
4. ZACHOWAJ autentyczność i prawdę o kandydacie
5. ZASTOSUJ najlepsze praktyki formatowania

⚡ JAKOŚĆ ODPOWIEDZI:
- Używaj precyzyjnego, profesjonalnego języka (${lang === 'pl' ? 'polskiego' : 'angielskiego'})
- Dawaj konkretne, actionable wskazówki
- Bądź kreatywny ale faktualny w opisach doświadczenia

Twoja misja: Stworzyć CV które przejdzie przez ATS i zachwyci rekruterów. Odpowiadaj WYŁĄCZNIE w języku: ${lang === 'pl' ? 'polskim' : 'angielskim'}.`;

export const analyzeCV = async (cvText: string, jobDescription: string, lang: string = 'pl', userPreferences?: User['preferences']): Promise<CVAnalysis> => {
  const ai = getAI();
  const prompt = `
    🎯 ZADANIE: Przeprowadź PROFESJONALNĄ ANALIZĘ JAKOŚCI CV i wygeneruj ZOPTYMALIZOWANĄ TREŚĆ w języku ${lang === 'pl' ? 'polskim' : 'angielskim'}.
    
    📋 DANE WEJŚCIOWE:
    • CV kandydata:
    ${cvText}

    • Opis stanowiska:
    ${jobDescription}

    ${userPreferences ? `
    PREFERENCJE UŻYTKOWNIKA:
    - Uwzględnij sekcję Projekty: ${userPreferences.include_projects ? 'TAK' : 'NIE'}
    - Słowa kluczowe do podkreślenia: ${userPreferences.emphasized_keywords?.join(', ') || 'Brak'}
    - Ton podsumowania: ${userPreferences.summary_tone || 'profesjonalny'}
    - Preferowane sekcje: ${userPreferences.preferred_sections?.join(', ') || 'Brak'}
    ` : ''}

    🔍 KRYTERIA OCENY (każde 0-20 punktów):
    W każdej sekcji podaj SZCZEGÓŁOWY FEEDBACK (w polu 'feedback'), odwołując się do konkretnych fragmentów CV i opisu stanowiska. Wyjaśnij dokładnie, dlaczego przyznano taką ocenę.

    1. FORMATOWANIE (0-20p): Czy CV jest czytelne dla systemów ATS (brak tabel, grafik, kolumn)?
       - W feedbacku wskaż konkretne elementy formatowania do poprawy (np. usunięcie kolumn, tabel) odnosząc się do oryginalnego tekstu.
    2. SŁOWA KLUCZOWE (0-20p): Czy zawiera kluczowe terminy z opisu stanowiska?
       - W feedbacku podaj konkretne słowa kluczowe z oferty pracy, których brakuje w CV i zasugeruj, gdzie je dodać.
    3. STRUKTURA (0-20p): Czy sekcje są logicznie ułożone i nazwane standardowo?
    4. DOPASOWANIE (0-20p): Jak bardzo treść odpowiada wymaganiom roli?
    5. WPŁYW (0-20p): Czy opisy doświadczenia używają czasowników akcji i mierzalnych wyników?
       - W feedbacku zasugeruj, jak zmienić konkretne punkty doświadczenia na takie, które zawierają czasowniki akcji i wyniki liczbowe.

    ZASADY OPTYMALIZACJI TREŚCI:
    1. NIE DODAWAJ żadnych fałszywych informacji.
    2. PRZEPISZ tylko to co jest w oryginalnym CV, ulepszając sformułowania.
    3. ULEPSZAJ sformułowania używając słów kluczowych z opisu stanowiska (ATS optimization).
    4. ZASTOSUJ formatowanie przyjazne dla ATS: proste nagłówki, standardowe czcionki (w tekście), brak kolumn.
    5. DOPASUJ ton podsumowania do preferencji użytkownika (${userPreferences?.summary_tone || 'profesjonalny'}).
       - Profesjonalny: Formalny, rzeczowy, skupiony na osiągnięciach.
       - Kreatywny: Unikalny, z pasją, pokazujący osobowość.
       - Minimalistyczny: Zwięzły, konkretny, bez zbędnych przymiotników.
       - Odważny: Pewny siebie, bezpośredni, podkreślający ambitne cele.

    STRUKTURA ZOPTYMALIZOWANEGO CV:
    Użyj następujących sekcji (lub dostosuj do preferencji użytkownika):
    # 📄 CV: [Imię i Nazwisko]
    ${userPreferences?.preferred_sections && userPreferences.preferred_sections.length > 0 
      ? userPreferences.preferred_sections.map(s => `## ${s.toUpperCase()}`).join('\n    ')
      : `## 👤 PODSUMOWANIE ZAWODOWE
    ## 💼 DOŚWIADCZENIE ZAWODOWE
    ${userPreferences?.include_projects ? '## 🚀 PROJEKTY' : ''}
    ## 🎓 WYKSZTAŁCENIE
    ## 🛠️ UMIEJĘTNOŚCI`}
  `;

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION(lang),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizedContent: { type: Type.STRING },
          atsBreakdown: {
            type: Type.OBJECT,
            properties: {
              formatting: { 
                type: Type.OBJECT, 
                properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ["score", "feedback"]
              },
              keywords: { 
                type: Type.OBJECT, 
                properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ["score", "feedback"]
              },
              structure: { 
                type: Type.OBJECT, 
                properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ["score", "feedback"]
              },
              relevance: { 
                type: Type.OBJECT, 
                properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ["score", "feedback"]
              },
              impact: { 
                type: Type.OBJECT, 
                properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ["score", "feedback"]
              },
            },
            required: ["formatting", "keywords", "structure", "relevance", "impact"],
          },
        },
        required: ["score", "strengths", "weaknesses", "suggestions", "optimizedContent", "atsBreakdown"],
      },
    },
  }));

  return JSON.parse(response.text || "{}");
};

export const generateCoverLetter = async (cvText: string, jobDescription: string, lang: string = 'pl', customDetails?: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    🎯 ZADANIE: Wygeneruj profesjonalny list motywacyjny w języku ${lang === 'pl' ? 'polskim' : 'angielskim'}.
    
    📋 DANE WEJŚCIOWE:
    • CV kandydata: ${cvText}
    • Opis stanowiska: ${jobDescription}
    ${customDetails ? `• DODATKOWE SZCZEGÓŁY O FIRMIE/ROLI: ${customDetails}` : ''}

    ✅ WYMAGANIA:
    1. Wykorzystaj podane dodatkowe szczegóły, aby spersonalizować list.
    2. Pokaż, że kandydat rozumie specyfikę firmy i roli.
    3. Zachowaj profesjonalny ton.
  `;

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION(lang),
    }
  }));

  return response.text || "";
};

export const generateInterviewQuestions = async (cvText: string, jobDescription: string, lang: string = 'pl'): Promise<string[]> => {
  const ai = getAI();
  const prompt = `
    🎯 ZADANIE: Wygeneruj personalizowane pytania na rozmowę kwalifikacyjną w języku ${lang === 'pl' ? 'polskim' : 'angielskim'}.

    📋 DANE WEJŚCIOWE:
    • CV kandydata: ${cvText}
    • Opis stanowiska: ${jobDescription}

    ✅ WYMAGANIA PYTAŃ:
    1. 10-15 pytań dostosowanych do profilu kandydata.
    2. Pytania powinny być różnorodne: techniczne, behawioralne, sytuacyjne.
    3. Uwzględnij doświadczenie i umiejętności z CV.
    4. Dodaj pytania specyficzne dla branży i stanowiska.
  `;

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION(lang),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
    },
  }));

  return JSON.parse(response.text || "[]");
};

export const analyzeSkillsGap = async (cvText: string, jobDescription: string, lang: string = 'pl'): Promise<SkillsGap> => {
  const ai = getAI();
  const prompt = `
    🎯 ZADANIE: Przeprowadź szczegółową analizę luk kompetencyjnych (Skills Gap Analysis) w języku ${lang === 'pl' ? 'polskim' : 'angielskim'}.
    
    📋 DANE WEJŚCIOWE:
    • CV kandydata: ${cvText}
    • Opis stanowiska: ${jobDescription}
    
    Analiza powinna zawierać:
    1. Procentowe dopasowanie.
    2. Listę brakujących umiejętności z określeniem ich ważności (high/medium/low) i uzasadnieniem.
    3. Konkretną ścieżkę nauki (kroki, typy zasobów, szacowany czas).
    4. Ogólną poradę karierową.
  `;

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION(lang),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchPercentage: { type: Type.NUMBER },
          missingSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                importance: { type: Type.STRING, enum: ["high", "medium", "low"] },
                reason: { type: Type.STRING }
              },
              required: ["skill", "importance", "reason"]
            }
          },
          learningPath: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                resourceType: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ["step", "resourceType", "duration"]
            }
          },
          careerAdvice: { type: Type.STRING }
        },
        required: ["matchPercentage", "missingSkills", "learningPath", "careerAdvice"]
      },
    },
  }));

  return JSON.parse(response.text || "{}");
};

export const optimizeLinkedIn = async (cvText: string, lang: string = 'pl'): Promise<LinkedInOptimization> => {
  const ai = getAI();
  const prompt = `
    🎯 ZADANIE: Zoptymalizuj profil LinkedIn na podstawie CV w języku ${lang === 'pl' ? 'polskim' : 'angielskim'}.
    
    📋 DANE WEJŚCIOWE:
    • CV kandydata: ${cvText}
    
    Wygeneruj:
    1. Przyciągający nagłówek (Headline).
    2. Sekcję "O mnie" (About) napisaną w pierwszej osobie, angażującą i profesjonalną.
    3. Kilka kluczowych punktów do sekcji doświadczenia.
    4. Listę umiejętności do wyróżnienia.
  `;

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION(lang),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          about: { type: Type.STRING },
          experienceBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          skillsToHighlight: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["headline", "about", "experienceBulletPoints", "skillsToHighlight"]
      },
    },
  }));

  return JSON.parse(response.text || "{}");
};

export interface JobOffer {
  title: string;
  company: string;
  location: string;
  link: string;
  snippet: string;
  date_posted?: string;
}

export const findJobOffers = async (cvText: string, lang: string = 'pl'): Promise<JobOffer[]> => {
  const ai = getAI();
  const prompt = `
    Na podstawie poniższego CV, znajdź AKTUALNE (dodane w ciągu ostatnich 30 dni) oferty pracy w Polsce, które najlepiej pasują do profilu kandydata.
    Użyj Google Search, aby znaleźć realne linki do ofert na portalach takich jak Pracuj.pl, LinkedIn, Just Join IT itp.
    
    BARDZO WAŻNE:
    1. Sprawdzaj datę publikacji oferty. Odrzucaj oferty starsze niż 30 dni lub takie, które wygasły.
    2. Dla każdej oferty podaj przybliżoną datę publikacji (np. "2 dni temu", "15 lutego 2025").
    3. Odpowiedz w języku ${lang === 'pl' ? 'polskim' : 'angielskim'}.
    
    CV Kandydata:
    ${cvText}
  `;

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: `Jesteś asystentem kariery. Twoim zadaniem jest znalezienie ŚWIEŻYCH i REALNYCH ofert pracy pasujących do CV użytkownika. Odrzucaj wygasłe oferty. Odpowiadaj w języku: ${lang === 'pl' ? 'polskim' : 'angielskim'}.`,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            link: { type: Type.STRING },
            snippet: { type: Type.STRING, description: "Krótki opis stanowiska i wymagań, bez obcinania tekstu." },
            date_posted: { type: Type.STRING, description: "Kiedy oferta została opublikowana, np. '3 dni temu'" }
          },
          required: ["title", "company", "location", "link", "snippet", "date_posted"]
        }
      }
    },
  }));

  return JSON.parse(response.text || "[]");
};
