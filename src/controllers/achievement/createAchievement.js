import { jsonData } from "../helpers/helper.js";
import { Achievement, Requirement, TipsTricks } from "../../models/index.js";
import sequelize from "../../sequalize.js";
import { translateText } from "../helpers/helper.js";
import { createAchievement } from "../helpers/achievementHelper.js";
// Express route to handle achievement data from JSON file

// Function to update achievement translations
async function updateAchievementTranslations(achievementData, options) {
  let { name, description, hardness } = achievementData;

  const existingAchievement = await Achievement.findOne({
    where: sequelize.where(sequelize.json("name.en"), name),
  });

  if (!existingAchievement) {
    console.error(`Achievement "${name}" not found`);
    return;
  }
  const languagesToUpdate = ["ko", "zh", "ru", "ja", "ar"];

  for (let lang of languagesToUpdate) {
    try {
      console.log(
        `Translating "${name}" to "${lang}": ${await translateText(name, lang)}`
      );
      const translatedName = await translateText(name, lang);
      const translatedDescription = await translateText(description, lang);
      const translatedHardness = await translateText(hardness, lang);

      existingAchievement.name = {
        ...existingAchievement.name, // Keep existing translations
        [lang]: translatedName, // Update the specific language
      };
      existingAchievement.description = {
        ...existingAchievement.description,
        [lang]: translatedDescription,
      };
      existingAchievement.hardness = {
        ...existingAchievement.hardness, // Keep existing translations
        [lang]: translatedHardness, // Update the specific language
      };
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      throw error;
    }
  }

  // Save the updated achievement
  await existingAchievement.save({
    transaction: options.transaction,
  });
  console.log("After Save:", existingAchievement);
}

async function updateAchievementTranslationsName(req, res) {
  let { name, nameUpdate } = req.body;
  console.log(name, nameUpdate);
  const existingAchievement = await Achievement.findOne({
    where: sequelize.where(sequelize.json("name.en"), name),
  });

  if (!existingAchievement) {
    console.error(`Achievement "${name}" not found`);
    return;
  }
  const languagesToUpdate = [
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

  for (let lang of languagesToUpdate) {
    try {
      console.log(
        `Translating "${name}" to "${lang}": ${await translateText(
          nameUpdate,
          lang
        )}`
      );
      const translatedName = await translateText(nameUpdate, lang);
      console.log("------>", translatedName);
      existingAchievement.name = {
        ...existingAchievement.name, // Keep existing translations
        [lang]: translatedName, // Update the specific language
      };
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      throw error;
    }
  }

  // Save the updated achievement

  await sequelize.transaction(async (t) => {
    await existingAchievement.save({
      transaction: t,
    });
  });
  console.log("After Save:", existingAchievement);
  res.status(200).send(existingAchievement);
}

const updateBulkAchievements = async (req, res) => {
  const achievementsData = JSON.parse(jsonData);
  try {
    await sequelize.transaction(async (t) => {
      for (let achievementData of achievementsData) {
        await updateAchievementTranslations(achievementData, {
          transaction: t,
        });
      }
    });
    res.status(200).send("Achievements updated successfully!");
  } catch (error) {
    console.error("Error during transaction:", error);
    res.status(500).send("Error updating achievements");
  }
};

const automateAchievementsCreation = async (req, res) => {
  const achievementsData = JSON.parse(jsonData);
  const { isUpdate = false } = req.body;
  console.log("length", achievementsData.length);
  try {
    // Start a transaction to ensure atomicity
    await sequelize.transaction(async (t) => {
      for (let achievementData of achievementsData) {
        await createAchievement(achievementData, { transaction: t }, isUpdate);
      }
    });
    res.status(200).send("Achievements created successfully!");
  } catch (error) {
    console.error("Error during transaction:", error); // Log error for debugging
    res.status(500).send("Error creating achievements");
  }
};
export {
  automateAchievementsCreation,
  updateBulkAchievements,
  updateAchievementTranslationsName,
};
