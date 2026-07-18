import { ApiError, GoogleGenAI } from "@google/genai";
import pRetry from "p-retry";

import { GEMINI_API_KEY, GEMINI_TEXT_MODEL } from "@/env";

const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function executePrompt<T>(prompt: string): Promise<T> {
  return pRetry(
    async () => {
      const response = await geminiClient.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
          seed: 42,
          maxOutputTokens: 65536,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from model");
      }
      return JSON.parse(text) as T;
    },
    {
      retries: 5,
      minTimeout: 2000,
      factor: 2,
      shouldRetry: ({ error }) =>
        error instanceof SyntaxError ||
        (error instanceof ApiError && [429, 500, 503].includes(error.status)),
    },
  );
}
