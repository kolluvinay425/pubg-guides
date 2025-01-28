import stream from "stream";
import sequelize from "../sequalize.js";

import { Achievement, TipsTricks, Requirement } from "../models/index.js";
import fs from "fs";
import { drive } from "googleapis/build/src/apis/drive/index.js";
const postAchievement = async (req, res) => {
  console.log(req.body);
  console.log(req.files); // Log the entire req.files object to inspect its structure

  try {
    const data = {
      name: req.body.name,
      description: req.body.description,
      points: req.body.points,
      hardness: req.body.hardness,
      category: req.body.category,
      rewards: {
        title: req.body.rewardTitle,
        titleImage: null,
        extra: req.body.rewardExtra,
      },
      image: null, // This will be updated after uploading to Google Drive
      requirements: [],
      tipsTricks: [],
    };

    const uploadToDrive = async (file) => {
      // Read the file from the disk
      const fileBuffer = fs.readFileSync(file.path);
      console.log(
        `Uploading file: ${file.originalname}, size: ${fileBuffer.length} bytes`
      );

      if (fileBuffer.length === 0) {
        throw new Error("File buffer is empty.");
      }

      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      const fileMetadata = {
        name: file.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };
      const media = {
        mimeType: file.mimetype,
        body: bufferStream,
      };

      try {
        const driveResponse = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: "id",
        });

        const fileId = driveResponse.data.id;

        // Set the file permissions to make it publicly accessible
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });

        fs.unlinkSync(file.path); // Delete the file from the disk
        console.log(`File uploaded successfully. File ID: ${fileId}`);

        return `https://drive.google.com/uc?id=${fileId}`;
      } catch (error) {
        console.error("Error uploading file to Google Drive:", error);
        throw new Error("Failed to upload file to Google Drive.");
      }
    };

    if (req.files && req.files["image"]) {
      data.image = await uploadToDrive(req.files["image"][0]);
    }

    if (req.files && req.files["rewardTitleImage"]) {
      data.rewards.titleImage = await uploadToDrive(
        req.files["rewardTitleImage"][0]
      );
    }

    if (req.body.requirements) {
      const requirementsHeadings = req.body.requirements.heading;
      const requirementsImages = req.files["requirements[image][]"];
      const requirementsIconImages = req.body.requirements.icon_image;
      const requirementsDescriptions = req.body.requirements.description;

      for (let i = 0; i < requirementsHeadings.length; i++) {
        const imageUrl =
          requirementsImages && requirementsImages[i]
            ? await uploadToDrive(requirementsImages[i])
            : null;
        data.requirements.push({
          heading: requirementsHeadings[i],
          image: imageUrl,
          icon_image: requirementsIconImages[i] || "",
          description: requirementsDescriptions[i] || "",
        });
      }
    }

    if (req.body.tipsTricks) {
      const tipsTricksHeadings = req.body.tipsTricks.heading;
      const tipsTricksDescriptions = req.body.tipsTricks.description;
      const tipsTricksImages = req.files["tipsTricks[image][]"];

      for (let i = 0; i < tipsTricksHeadings.length; i++) {
        const imageUrl =
          tipsTricksImages && tipsTricksImages[i]
            ? await uploadToDrive(tipsTricksImages[i])
            : null;
        data.tipsTricks.push({
          heading: tipsTricksHeadings[i],
          image: imageUrl,
          description: tipsTricksDescriptions[i] || "",
        });
      }
    }

    const achievement = new Achievement(data);
    await achievement.save();
    res.status(201).json(achievement);
  } catch (error) {
    console.error("Error saving achievement:", error);
    res.status(500).json({ error: error.message });
  }
};
const updateAchievement = async (req, res) => {
  try {
    // Find all achievements in the "Achievements" category
    const achievements = await Achievement.findAll({
      where: { category: "Achievements" },
    });

    for (const achievement of achievements) {
      // Update the category to "glorious_moments"
      await achievement.update({ category: "glorious_moments" });

      console.log(`${achievement.category} updated to glorious_moments`);
    }

    res.status(200).json({ message: "Achievements updated successfully!" });
  } catch (error) {
    console.error("Error updating achievements:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      include: [
        {
          model: Requirement, // Model name here
          as: "requirements", // Alias should match the association alias
        },
        {
          model: TipsTricks, // Model name here
          as: "tipsTricks", // Alias should match the association alias
        },
      ],
    });

    if (achievements) {
      res.json({ count: achievements.length, achievements: achievements });
    } else {
      res.status(404).json({ message: "No achievements found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAchievementByName = async (req, res) => {
  console.log("first------>", req.query.name);
  try {
    const achievement = await Achievement.findOne({
      where: sequelize.where(sequelize.json("name.en"), req.query.name),
      include: [
        {
          model: Requirement, // Model name here
          as: "requirements", // Alias should match the association alias
        },
        {
          model: TipsTricks, // Model name here
          as: "tipsTricks", // Alias should match the association alias
        },
      ],
    });
    if (achievement) {
      res.json(achievement);
    } else {
      res.status(404).json({ message: "Achievement not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteInvalidAchievements = async (req, res) => {
  try {
    // Fetch all achievements
    const achievements = await Achievement.findAll();

    // Filter achievements where `name` is not an object or missing required language keys
    const invalidAchievements = achievements.filter((achievement) => {
      const name = achievement.name;
      if (typeof name !== "object" || name === null) {
        return true; // Mark as invalid if `name` is not an object
      }

      // List of required languages
      const requiredLanguages = [
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
      // Check if all required languages are present in the object
      return !requiredLanguages.every((lang) => lang in name);
    });

    // Log invalid achievements for reference
    console.log("Invalid achievements to be deleted:", invalidAchievements);

    // Delete invalid achievements
    for (const achievement of invalidAchievements) {
      await Achievement.destroy({
        where: { id: achievement.id },
      });
    }

    res.status(200).json({
      message: "Invalid achievements deleted successfully.",
      deletedCount: invalidAchievements.length,
    });
  } catch (error) {
    console.error("Error deleting invalid achievements:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  updateAchievement,
  postAchievement,
  getAchievements,
  getAchievementByName,
  deleteInvalidAchievements,
};
