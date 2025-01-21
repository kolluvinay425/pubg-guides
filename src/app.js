import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { faker } from "@faker-js/faker";
import morgan from "morgan";
import cors from "cors";
import Achievement from "./models/Achievement.js";
import iconv from "iconv-lite";
const app = express();
app.use(express.json());

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  morgan(
    '[:date[clf]] ":method :url HTTP/:http-version" :req[authorization] :status :req[content-length] req[origin]'
  )
);

// var whitelist = ["http://localhost:8000", "http://localhost:8001"];

// const corsOptions = {
//   credentials: true,
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error(`Origin ${origin} not allowed`));
//     }
//   },
// };

const corsOptions = {
  credentials: true,
  origin: "*",
};

app.use(cors(corsOptions));

// app.use("/api/v1/profiles", routerProfile);

const generateAchievements = async (req, res) => {
  const achievements = [];

  const generateTipsTricks = () => {
    const tips = [];
    for (let i = 0; i < faker.number.int({ min: 7, max: 12 }); i++) {
      tips.push({
        description: faker.lorem.sentences(2),
        image: faker.image.url(),
        heading: faker.lorem.words(2),
      });
    }
    return tips;
  };

  const generateRequirements = () => {
    const requirements = [];
    for (let i = 0; i < faker.number.int({ min: 7, max: 12 }); i++) {
      requirements.push({
        heading: faker.lorem.words(3),
        image: faker.image.url(),
        icon_image: faker.image.url(),
        description: faker.lorem.sentences(2),
      });
    }
    return requirements;
  };

  for (let i = 0; i < 1000; i++) {
    const achievement = {
      name: faker.lorem.words(3),
      image: faker.image.url(),
      description: faker.lorem.sentences(2),
      points: faker.number.int({ min: 10, max: 100 }),
      hardness: faker.helpers.arrayElement([
        "Easy",
        "Medium",
        "Hard",
        "Expert",
      ]),
      rewards: {
        title: faker.company.name(),
        titleImage: faker.image.url(),
        extra: faker.lorem.sentence(),
      },
      tipsTricks: generateTipsTricks(),
      category: faker.helpers.arrayElement([
        "glorious_moments",
        "matches",
        "honor",
        "progress",
        "items",
        "social",
        "general",
      ]),
      requirements: generateRequirements(),
    };

    achievements.push(achievement);
  }

  Achievement.insertMany(achievements)
    .then(() => {
      res.json(achievements);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

import path from "path";
import { fileURLToPath } from "url";

// ES6 way to get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import multer from "multer";
// import { postAchievement } from "./controllers/achievement.js";
const storage = multer.memoryStorage();

import { google } from "googleapis";
import fs from "fs";
import { postAchievement } from "./controllers/achievement.js";

const KEYFILEPATH = "./achieveents.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

const upload = multer({ dest: "uploads/" });

// Route to create multiple achievements from the predefined JSON array
export const jsonAchievements = await readFile(
  new URL("./matches.json", import.meta.url)
);

import { readFile } from "fs/promises";
import automateAchievements from "./controllers/automate.js";
async function loadAchievements() {
  const data = await readFile(new URL("./achieveents.json", import.meta.url));
  return JSON.parse(data);
}
app.post("/create-achievements", async (req, res) => {
  try {
    const achievementsData = await loadAchievements();
    const newAchievements = await Achievement.insertMany(achievementsData);
    res.status(201).json(newAchievements);
  } catch (error) {
    console.error("Error creating achievements:", error);
    res.status(500).json({ error: "Failed to create achievements" });
  }
});

// app.post(
//   "/api/achievements",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "requirements[image][]", maxCount: 10 },
//     { name: "tipsTricks[image][]", maxCount: 10 },
//   ]),
//   async (req, res) => {
//     try {
//       const data = {
//         name: req.body.name,
//         description: req.body.description,
//         points: req.body.points,
//         hardness: req.body.hardness,
//         category: req.body.category,
//         image: req.files["image"] ? req.files["image"][0].buffer : null,
//         requirements: [],
//         tipsTricks: [],
//       };

//       // Extract nested fields for requirements
//       const requirementsHeadings = req.body.requirements.heading;
//       const requirementsImages = req.files["requirements[image][]"];
//       const requirementsIconImages = req.body.requirements.icon_image;
//       const requirementsDescriptions = req.body.requirements.description;

//       for (let i = 0; i < requirementsHeadings.length; i++) {
//         data.requirements.push({
//           heading: requirementsHeadings[i],
//           image: requirementsImages[i] ? requirementsImages[i].buffer : null,
//           icon_image: requirementsIconImages[i] || "",
//           description: requirementsDescriptions[i] || "",
//         });
//       }

//       // Extract nested fields for tipsTricks
//       const tipsTricksHeadings = req.body.tipsTricks.heading;
//       const tipsTricksDescriptions = req.body.tipsTricks.description;
//       const tipsTricksImages = req.files["tipsTricks[image][]"];

//       for (let i = 0; i < tipsTricksHeadings.length; i++) {
//         data.tipsTricks.push({
//           heading: tipsTricksHeadings[i],
//           image: tipsTricksImages[i] ? tipsTricksImages[i].buffer : null,
//           description: tipsTricksDescriptions[i] || "",
//         });
//       }

//       const achievement = new Achievement(data);
//       await achievement.save();
//       res.status(201).json(achievement);
//     } catch (error) {
//       console.error("Error saving achievement: ", error);
//       res.status(500).json({ error: error.message });
//     }
//   }
// );

app.get("/api/achievements", async (req, res) => {
  try {
    const achievement = await Achievement.findOne({ name: req.query.name });
    if (achievement) {
      res.json(achievement);
    } else {
      res.status(404).json({ message: "Achievement not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/achievements/all", async (req, res) => {
  try {
    const achievements = await Achievement.find({}).limit(40);

    if (achievements) {
      res.json(achievements);
    } else {
      res.status(404).json({ message: "Something wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/achievements/:name", async (req, res) => {
  console.log(req.body);
  try {
    const update = { $set: {} };
    for (const key in req.body) {
      if (req.body[key] && (key === "requirements" || key === "tipsTricks")) {
        update.$set[key] = req.body[key];
      } else {
        update.$set[key] = req.body[key];
      }
    }

    const achievement = await Achievement.findOneAndUpdate(
      { name: req.params.name },
      update,
      { new: true }
    );

    if (achievement) {
      res.json(achievement);
    } else {
      res.status(404).json({ message: "Achievement not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the form.html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/create.html");
});

app.get("/update", (req, res) => {
  res.sendFile(path.join(__dirname, "update.html"));
});

app.get("/generate", generateAchievements);

app.post("/api/achievements/automate", automateAchievements);

// Utility function to sanitize and normalize text
function fixEncoding(value) {
  try {
    const buffer = Buffer.from(value, "latin1");
    return iconv.decode(buffer, "utf-8");
  } catch (e) {
    console.error(`Encoding fix failed for value: ${value}`);
    return value;
  }
}
// Function to correct UTF-8 encoding in achievement names
async function correctUTF8Encoding() {
  try {
    const achievements = await Achievement.find({});
    console.log(achievements);
    for (const achievement of achievements) {
      console.log(achievement);
      try {
        if (!isValidUTF8(achievement.name.en)) {
          console.log(achievement);
          const correctedName = fixEncoding(achievement.name.en);
          achievement.name.en = correctedName;
          await achievement.save();
          console.log(
            `Corrected UTF-8 encoding for document ID: ${achievement._id}`
          );
        }
      } catch (error) {
        console.error(
          `Error processing document ID: ${achievement._id} - ${error.message}`
        );
      }
    }
    console.log("UTF-8 encoding correction completed.");
  } catch (error) {
    console.error(`Error correcting UTF-8 encoding: ${error.message}`);
  } finally {
  }
}
app.post("/api/update", correctUTF8Encoding);
// Run the UTF-8 encoding correction

export default app;
