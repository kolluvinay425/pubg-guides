import { jsonAchievements } from "../app.js";
import { Achievement, Requirement, TipsTricks } from "../models/index.js";
import sequelize from "../sequalize.js";
import { translateText } from "./helper.js";
// Function to create and translate achievement
async function createAchievement(achievementData, options) {
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

  // Check if the achievement already exists in the database
  const existingAchievement = await Achievement.findOne({
    where: { "name.en": name },
  });

  if (existingAchievement) {
    console.log(`Achievement "${name.en}" already exists. Skipping creation.`);
    return;
  }

  console.log("------------------>", name);
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
  };

  // Translate fields for achievement
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
  for (let lang of languages) {
    try {
      achievement.name[lang] = await translateText(name, lang);
      achievement.description[lang] = await translateText(description, lang);
      achievement.hardness[lang] = await translateText(hardness, lang);
      achievement.rewards.title[lang] = await translateText(
        rewards.title,
        lang
      );
      achievement.rewards.extra[lang] = await translateText(
        rewards.extra,
        lang
      );
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
      throw error; // Ensure the transaction is rolled back if translation fails
    }
  }

  // Create and save the achievement
  const newAchievement = await Achievement.create(achievement, options);

  // Create and save translated requirements
  const requirementDocs = [];
  for (let requirement of requirements) {
    let translatedRequirement = {
      heading: {},
      image: requirement.image,
      icon_image: requirement.icon_image,
      description: {},
      achievementId: newAchievement.id, // Add foreign key
    };

    for (let lang of languages) {
      try {
        translatedRequirement.heading[lang] = await translateText(
          requirement.heading,
          lang
        );
        translatedRequirement.description[lang] = await translateText(
          requirement.description,
          lang
        );
      } catch (error) {
        console.error(`Error translating requirement to ${lang}:`, error);
        throw error; // Ensure the transaction is rolled back if translation fails
      }
    }

    const requirementDoc = await Requirement.create(
      translatedRequirement,
      options
    );
    requirementDocs.push(requirementDoc);
  }

  // Associate requirements with the achievement
  await newAchievement.setRequirements(requirementDocs, options);

  // Create and save translated tipsTricks
  const tipsTricksDocs = [];
  for (let tipsTrick of tipsTricks) {
    let translatedTipsTrick = {
      heading: {},
      image: tipsTrick.image,
      description: {},
      achievementId: newAchievement.id, // Add foreign key
    };

    for (let lang of languages) {
      try {
        translatedTipsTrick.heading[lang] = await translateText(
          tipsTrick.heading,
          lang
        );
        translatedTipsTrick.description[lang] = await translateText(
          tipsTrick.description,
          lang
        );
      } catch (error) {
        console.error(`Error translating tipsTrick to ${lang}:`, error);
        throw error; // Ensure the transaction is rolled back if translation fails
      }
    }

    const tipTrickDoc = await TipsTricks.create(translatedTipsTrick, options);
    tipsTricksDocs.push(tipTrickDoc);
  }

  // Associate tipsTricks with the achievement
  await newAchievement.setTipsTricks(tipsTricksDocs, options);

  console.log(`Achievement created successfully!`);
}

// Express route to handle achievement data from JSON file
const automateAchievements = async (req, res) => {
  const achievementsData = JSON.parse(jsonAchievements);
  console.log("length", achievementsData.length);
  try {
    // Start a transaction to ensure atomicity
    await sequelize.transaction(async (t) => {
      for (let achievementData of achievementsData) {
        await createAchievement(achievementData, { transaction: t });
      }
    });
    res.status(200).send("Achievements created successfully!");
  } catch (error) {
    console.error("Error during transaction:", error); // Log error for debugging
    res.status(500).send("Error creating achievements");
  }
};

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

const updateAchievements = async (req, res) => {
  const achievementsData = JSON.parse(jsonAchievements);
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

export { automateAchievements, updateAchievements };
