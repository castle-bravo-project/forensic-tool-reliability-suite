
import { GoogleGenAI, Chat, GroundingChunk, GenerateContentResponse } from "@google/genai";
import type { GroundedInsight } from '../types';

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const isGeminiAvailable = () => !!API_KEY && !!ai;

const generalSystemInstruction = "You are a senior digital forensics expert and educator. Provide clear, concise, and professional explanations. Focus on the 'why' and the real-world implications for investigations and legal proceedings. Use markdown for formatting.";

export const startChatSession = async (): Promise<Chat> => {
  if (!ai) {
    throw new Error("Gemini AI not initialized.");
  }
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: generalSystemInstruction,
      temperature: 0.5,
    },
  });
  return chat;
};

export const getGroundedInsights = async (prompt: string): Promise<GroundedInsight> => {
  if (!ai) {
    return { text: "Gemini insights are unavailable. An API key is required." };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
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
    return { text: "An error occurred while fetching grounded insights from the Gemini API." };
  }
};


export const getSimpleInsight = async (prompt: string): Promise<string> => {
    if (!ai) {
        return "Gemini insights are unavailable. An API key is required.";
    }
    try {
        const response = await ai.models.generateContent({
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
        return "An error occurred while fetching insights from the Gemini API.";
    }
};

export const getStrategyFeedback = async (prompt: string): Promise<string> => {
    if (!ai) {
        return "Gemini feedback is unavailable. An API key is required.";
    }
    try {
        const response = await ai.models.generateContent({
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
        return "An error occurred while fetching feedback from the Gemini API.";
    }
};
