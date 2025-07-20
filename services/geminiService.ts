
import { GoogleGenAI, Chat, GroundingChunk, GenerateContentResponse } from "@google/genai";
import type { GroundedInsight } from '../types';

const STORAGE_KEY = 'gemini_api_key';
let ai: GoogleGenAI | null = null;

// Get API key from localStorage or environment
const getApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) || process.env.API_KEY || null;
  }
  return process.env.API_KEY || null;
};

// Initialize AI client with current API key
const initializeAI = () => {
  const apiKey = getApiKey();
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
    return true;
  }
  ai = null;
  return false;
};

// Initialize on module load
initializeAI();

export const isGeminiAvailable = () => !!getApiKey() && !!ai;

// Set user API key and reinitialize
export const setUserApiKey = (key: string): boolean => {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
      return initializeAI();
    } else {
      localStorage.removeItem(STORAGE_KEY);
      ai = null;
      return false;
    }
  }
  return false;
};

// Clear user API key
export const clearUserApiKey = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    ai = null;
  }
};

// Get current API key status
export const getApiKeyStatus = () => {
  const key = getApiKey();
  return {
    hasKey: !!key,
    isUserProvided: typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEY),
    isEnvironmentProvided: !!process.env.API_KEY
  };
};

const generalSystemInstruction = "You are a senior digital forensics expert and educator. Provide clear, concise, and professional explanations. Focus on the 'why' and the real-world implications for investigations and legal proceedings. Use markdown for formatting.";

export const startChatSession = async (): Promise<Chat> => {
  if (!ai && !initializeAI()) {
    throw new Error("Gemini AI not initialized. Please provide a valid API key.");
  }
  const chat = ai!.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: generalSystemInstruction,
      temperature: 0.5,
    },
  });
  return chat;
};

export const getGroundedInsights = async (prompt: string): Promise<GroundedInsight> => {
  if (!ai && !initializeAI()) {
    return { text: "Gemini insights are unavailable. Please provide a valid API key to enable AI features." };
  }

  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text: response.text,
      chunks: groundingChunks
    };
  } catch (error) {
    console.error("Grounded Gemini API Error:", error);
    return { text: "An error occurred while fetching grounded insights from the Gemini API. Please check your API key." };
  }
};


export const getSimpleInsight = async (prompt: string): Promise<string> => {
    if (!ai && !initializeAI()) {
        return "Gemini insights are unavailable. Please provide a valid API key to enable AI features.";
    }
    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: generalSystemInstruction,
                temperature: 0.5,
            }
        });
        return response.text;
    } catch(error) {
        console.error("Simple Gemini API Error:", error);
        return "An error occurred while fetching insights from the Gemini API. Please check your API key.";
    }
};

export const getStrategyFeedback = async (prompt: string): Promise<string> => {
    if (!ai && !initializeAI()) {
        return "Gemini feedback is unavailable. Please provide a valid API key to enable AI features.";
    }
    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a seasoned law professor specializing in litigation strategy and digital evidence. Evaluate the user's chosen legal strategy based on the provided scenario. Be direct, insightful, and explain the likely consequences, citing relevant legal principles.",
                temperature: 0.6,
            }
        });
        return response.text;
    } catch(error) {
        console.error("Strategy Feedback Gemini API Error:", error);
        return "An error occurred while fetching feedback from the Gemini API. Please check your API key.";
    }
};
