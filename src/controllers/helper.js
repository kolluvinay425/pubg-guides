import { google } from "googleapis";
import { cwd } from "process";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";
import { readFile } from "fs/promises";
const KEYFILEPATH = cwd() + "/pubg-guides-key.json";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

export const drive = google.drive({ version: "v3", auth });

// Initialize the Translator
const translate = new Translate({
  keyFilename: KEYFILEPATH,
});

// Function to translate text
export async function translateText(text, targetLanguage) {
  const [translation] = await translate.translate(text, targetLanguage);
  return translation;
}

export const jsonAchievements = await readFile(
  new URL("../achieveents.json", import.meta.url)
);
