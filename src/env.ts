export const PROXY_URL = Bun.env.PROXY_URL;
export const PROXY_DOMAINS =
  Bun.env.PROXY_DOMAINS?.split(",")
    .map((d) => d.trim())
    .filter(Boolean) ?? [];

export const MISTRAL_API_KEY = Bun.env.MISTRAL_API_KEY;
export const MISTRAL_OCR_MODEL =
  Bun.env.MISTRAL_OCR_MODEL ?? "mistral-ocr-latest";

export const GEMINI_API_KEY = Bun.env.GEMINI_API_KEY;
export const GEMINI_TEXT_MODEL =
  Bun.env.GEMINI_TEXT_MODEL ?? "gemini-3.1-flash-lite";
