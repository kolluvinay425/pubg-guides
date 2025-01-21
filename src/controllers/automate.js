import { Translate } from "@google-cloud/translate/build/src/v2/index.js";
import { jsonAchievements } from "../app.js";
import { KEYFILEPATH } from "./achievement.js";
import Achievement from "../models/Achievement.js";
import Requirement from "../models/requirements.js"; // Fixed capitalization
import TipsTricks from "../models/tipsTricks.js"; // Fixed capitalization
import iconv from "iconv-lite";

// Initialize the Translator
const translate = new Translate({
  keyFilename: KEYFILEPATH,
});

// Function to sanitize text: remove unwanted characters, HTML, and normalize UTF-8
function sanitizeText(text) {
  try {
    const buffer = Buffer.from(text, "latin1");
    return iconv.decode(buffer, "utf-8");
  } catch (e) {
    console.error(`Encoding fix failed for value: ${text} error: ${e}`);
    return value;
  }
}

// Function to translate text
async function translateText(text, targetLanguage) {
  const sanitizedText = sanitizeText(text); // Sanitize the text before translating
  const [translation] = await translate.translate(
    sanitizedText,
    targetLanguage
  );
  return translation;
}

// Function to create and translate achievement
async function createAchievement(achievementData) {
  const {
    name,
    description,
    rewards,
    points,
    category,
    hardness,
    tipsTricks,
    requirements,
  } = achievementData;

  // Initialize the achievement object with an empty structure
  let achievement = {
    name: {},
    image: "",
    description: {},
    points: points,
    category: category,
    hardness: {},
    rewards: {
      title: {},
      titleImage: "",
      extra: {},
    },
    tipsTricks: [], // Initialize with empty array
    requirements: [], // Initialize with empty array
  };

  // Check if an achievement with the same name already exists
  try {
    const existingAchievement = await Achievement.findOne({ "name.en": name });
    if (existingAchievement) {
      console.log(`Achievement "${name}" already exists. Skipping creation.`);
      return;
    }
  } catch (error) {
    console.error(
      `Error checking existing achievement: ${name} - ${error.message}`
    );
    return;
  }

  // Translate fields for the achievement
  const languages = [
    "en",
    "zh",
    "ko",
    "ja",
    "es",
    "ru",
    "fr",
    "de",
    "pt",
    "ar",
  ];
  console.log("first------------->", name);

  for (let lang of languages) {
    achievement.name[lang] = await translateText(name, lang);
    achievement.description[lang] = await translateText(description, lang);
    achievement.hardness[lang] = await translateText(hardness, lang);
    achievement.rewards.title[lang] = await translateText(rewards.title, lang);
    achievement.rewards.extra[lang] = await translateText(rewards.extra, lang);
  }

  // Save the achievement first (before adding requirements and tips)
  const newAchievement = new Achievement(achievement);
  await newAchievement.save();
  console.log(`Achievement created successfully!`);

  // Create and save translated requirements
  if (requirements && requirements.length > 0) {
    for (let requirement of requirements) {
      let translatedRequirement = {
        heading: {},
        images: requirement.image,
        icon_image: requirement.icon_image, // Corrected key to match input
        description: {},
        achievementId: newAchievement._id, // Attach the achievementId
      };

      for (let lang of languages) {
        translatedRequirement.heading[lang] = await translateText(
          requirement.heading,
          lang
        );
        translatedRequirement.description[lang] = await translateText(
          requirement.description,
          lang
        );
      }

      const requirementDoc = new Requirement(translatedRequirement);
      await requirementDoc.save();
      newAchievement.requirements.push(requirementDoc._id);
    }
  }

  // Create and save translated tipsTricks
  if (tipsTricks && tipsTricks.length > 0) {
    for (let tipsTrick of tipsTricks) {
      let translatedTipsTrick = {
        heading: {},
        image: tipsTrick.image,
        description: {},
        achievementId: newAchievement._id, // Attach the achievementId
      };

      for (let lang of languages) {
        translatedTipsTrick.heading[lang] = await translateText(
          tipsTrick.heading,
          lang
        );
        translatedTipsTrick.description[lang] = await translateText(
          tipsTrick.description,
          lang
        );
      }

      const tipTrickDoc = new TipsTricks(translatedTipsTrick);
      await tipTrickDoc.save();
      newAchievement.tipsTricks.push(tipTrickDoc._id);
    }
  }

  await newAchievement.save();
  console.log(`Achievement updated with requirements and tipsTricks!`);
}

// Express route to handle achievement data from JSON file
const automateAchievements = async (req, res) => {
  const achievementsData = JSON.parse(jsonAchievements);
  try {
    for (let achievementData of achievementsData) {
      await createAchievement(achievementData);
    }
    res.status(200).send("Achievements created successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating achievements");
  }
};

export default automateAchievements;
