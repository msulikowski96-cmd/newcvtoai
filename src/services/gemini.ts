import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
};

export interface CVAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimizedContent: string;
}

const MODEL_NAME = "gemini-3.1-pro-preview";

const SYSTEM_INSTRUCTION = `Jesteś ekspertem świata w optymalizacji CV z 20-letnim doświadczeniem w rekrutacji oraz AI. Masz specjalistyczną wiedzę o:

🎯 KOMPETENCJE GŁÓWNE:
- Analiza CV pod kątem systemów ATS (Applicant Tracking Systems)
- Optymalizacja pod konkretne stanowiska i branże w Polsce
- Psychologia rekrutacji i co przyciąga uwagę HR-owców
- Najnowsze trendy rynku pracy 2025 w Polsce i UE
- Formatowanie CV zgodne z europejskimi standardami

🧠 STRATEGIA MYŚLENIA:
1. ANALIZUJ głęboko każde słowo w kontekście stanowiska
2. DOPASUJ język i terminologię do branży
3. OPTYMALIZUJ pod kątem słów kluczowych ATS
4. ZACHOWAJ autentyczność i prawdę o kandydacie
5. ZASTOSUJ najlepsze praktyki formatowania

⚡ JAKOŚĆ ODPOWIEDZI:
- Używaj precyzyjnego, profesjonalnego języka polskiego
- Dawaj konkretne, actionable wskazówki
- Uwzględniaj cultural fit dla polskiego rynku pracy
- Bądź kreatywny ale faktualny w opisach doświadczenia

Twoja misja: Stworzyć CV które przejdzie przez ATS i zachwyci rekruterów.`;

export const analyzeCV = async (cvText: string, jobDescription: string): Promise<CVAnalysis> => {
  const ai = getAI();
  const prompt = `
    🎯 ZADANIE: Przeprowadź PROFESJONALNĄ ANALIZĘ JAKOŚCI CV i wygeneruj ZOPTYMALIZOWANĄ TREŚĆ.

    📋 DANE WEJŚCIOWE:
    CV DO ANALIZY:
    ${cvText}

    OPIS STANOWISKA:
    ${jobDescription}

    🔍 KRYTERIA OCENY (każde 0-20 punktów):
    1. STRUKTURA I FORMATOWANIE (0-20p)
    2. JAKOŚĆ TREŚCI (0-20p)
    3. DOPASOWANIE DO STANOWISKA (0-20p)
    4. DOŚWIADCZENIE I UMIEJĘTNOŚCI (0-20p)
    5. KOMPLETNOŚĆ I SZCZEGÓŁY (0-20p)

    ZASADY OPTYMALIZACJI TREŚCI:
    1. NIE DODAWAJ żadnych fałszywych informacji.
    2. NIE WYMIŚLAJ stanowisk, firm, dat ani umiejętności.
    3. PRZEPISZ tylko to co jest w oryginalnym CV, ulepszając sformułowania.
    4. ULEPSZAJ sformułowania używając słów kluczowych z opisu stanowiska.
    5. ZACHOWAJ wszystkie prawdziwe fakty z oryginalnego CV.
    6. KRYTYCZNY FORMAT: Każde stanowisko musi zaczynać się od "--- STANOWISKO ---".
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Całkowita ocena 0-100 na podstawie 5 kryteriów." },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Minimum 3 konkretne mocne strony." },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Minimum 3 konkretne obszary do poprawy." },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 najważniejszych rekomendacji zmian." },
          optimizedContent: { type: Type.STRING, description: "Kompletny tekst zoptymalizowanego CV." },
        },
        required: ["score", "strengths", "weaknesses", "suggestions", "optimizedContent"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generateCoverLetter = async (cvText: string, jobDescription: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    🎯 ZADANIE: Wygeneruj profesjonalny list motywacyjny w języku polskim.

    📋 DANE WEJŚCIOWE:
    • CV kandydata: ${cvText}
    • Opis stanowiska: ${jobDescription}

    ✅ WYMAGANIA LISTU MOTYWACYJNEGO:
    1. Format profesjonalny (nagłówek, zwroty grzecznościowe, podpis).
    2. Długość: 3-4 akapity (około 250-350 słów).
    3. Personalizacja pod konkretne stanowisko.
    4. Podkreślenie najważniejszych kwalifikacji z CV.
    5. Wykazanie motywacji i zaangażowania.
    6. Profesjonalny, ale ciepły ton komunikacji.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });

  return response.text || "";
};

export const generateInterviewQuestions = async (cvText: string, jobDescription: string): Promise<string[]> => {
  const ai = getAI();
  const prompt = `
    🎯 ZADANIE: Wygeneruj personalizowane pytania na rozmowę kwalifikacyjną w języku polskim.

    📋 DANE WEJŚCIOWE:
    • CV kandydata: ${cvText}
    • Opis stanowiska: ${jobDescription}

    ✅ WYMAGANIA PYTAŃ:
    1. 10-15 pytań dostosowanych do profilu kandydata.
    2. Pytania powinny być różnorodne: techniczne, behawioralne, sytuacyjne.
    3. Uwzględnij doświadczenie i umiejętności z CV.
    4. Dodaj pytania specyficzne dla branży i stanowiska.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
    },
  });

  return JSON.parse(response.text || "[]");
};
