import { readFile } from "fs/promises";

import * as deepl from "deepl-node";

// Initialize DeepL Translator with your API key
const translator = new deepl.Translator(process.env.DEEPL_API_KEY);
// const translator = new deepl.Translator(authKey);
// Function to translate text using DeepL
export const translateText = async (text, targetLanguage) => {
  const language =
    targetLanguage === "en"
      ? "en-US"
      : targetLanguage === "pt"
      ? "pt-PT"
      : targetLanguage;

  try {
    const result = await translator.translateText(text, null, language);
    console.log(`Translated (${language}): ${result.text}`);
    return result.text;
  } catch (error) {
    console.error("DeepL Translation Error:", error);
    throw error;
  }
};

export const jsonData = await readFile(
  new URL("../../honor.json", import.meta.url)
);
