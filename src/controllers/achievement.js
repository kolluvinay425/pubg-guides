const express = require("express");
const { google } = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
import app from "../app";
const app = express();

const KEYFILEPATH = "path/to/your-service-account-file.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

const upload = multer({ dest: "uploads/" });

app.post(
  "/api/achievements",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "requirements[image][]", maxCount: 10 },
    { name: "tipsTricks[image][]", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const data = {
        name: req.body.name,
        description: req.body.description,
        points: req.body.points,
        hardness: req.body.hardness,
        category: req.body.category,
        image: null, // This will be updated after uploading to Google Drive
        requirements: [],
        tipsTricks: [],
      };

      // Function to upload file to Google Drive
      const uploadToDrive = async (file) => {
        const filePath = path.join(__dirname, file.path);
        const fileMetadata = {
          name: file.originalname,
          parents: ["your-google-drive-folder-id"],
        };
        const media = {
          mimeType: file.mimetype,
          body: fs.createReadStream(filePath),
        };
        const driveResponse = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: "id",
        });
        fs.unlinkSync(filePath); // Remove the file from the server after upload
        return `https://drive.google.com/uc?id=${driveResponse.data.id}`;
      };

      // Upload main image to Google Drive
      if (req.files["image"]) {
        data.image = await uploadToDrive(req.files["image"][0]);
      }

      // Extract nested fields for requirements and upload images to Google Drive
      const requirementsHeadings = req.body.requirements.heading;
      const requirementsImages = req.files["requirements[image][]"];
      const requirementsIconImages = req.body.requirements.icon_image;
      const requirementsDescriptions = req.body.requirements.description;

      for (let i = 0; i < requirementsHeadings.length; i++) {
        const imageUrl = requirementsImages[i]
          ? await uploadToDrive(requirementsImages[i])
          : null;
        data.requirements.push({
          heading: requirementsHeadings[i],
          image: imageUrl,
          icon_image: requirementsIconImages[i] || "",
          description: requirementsDescriptions[i] || "",
        });
      }

      // Extract nested fields for tipsTricks and upload images to Google Drive
      const tipsTricksHeadings = req.body.tipsTricks.heading;
      const tipsTricksDescriptions = req.body.tipsTricks.description;
      const tipsTricksImages = req.files["tipsTricks[image][]"];

      for (let i = 0; i < tipsTricksHeadings.length; i++) {
        const imageUrl = tipsTricksImages[i]
          ? await uploadToDrive(tipsTricksImages[i])
          : null;
        data.tipsTricks.push({
          heading: tipsTricksHeadings[i],
          image: imageUrl,
          description: tipsTricksDescriptions[i] || "",
        });
      }

      const achievement = new Achievement(data);
      await achievement.save();
      res.status(201).json(achievement);
    } catch (error) {
      console.error("Error saving achievement: ", error);
      res.status(500).json({ error: error.message });
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
