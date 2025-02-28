import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import achievementsRouter from "./routes/achievement.js";
import tipsTricksRouter from "./routes/tipsTricks.js";
import requirementRouter from "./routes/requirement.js";
import eventRouter from "./routes/event.js";

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

const corsOptions = {
  credentials: true,
  origin: "*",
};

app.use(cors(corsOptions));

// Serve the form.html file
app.get("/crete", (req, res) => {
  res.sendFile(__dirname + "/create.html");
});

app.get("/update", (req, res) => {
  res.sendFile(path.join(__dirname, "update.html"));
});

app.use("/api/achievements", achievementsRouter);
app.use("/api/tips-tricks", tipsTricksRouter);
app.use("/api/requirements", requirementRouter);
app.use("/api/events", eventRouter);

import axios from "axios";
// Serve the HTML form
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-2", // Use "dall-e-3" for better results
        prompt,
        n: 1,
        size: "1024x1024", // Adjust size if needed
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imageUrl = response.data.data[0].url;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error.response?.data || error);
    res.status(500).json({
      error: error.response?.data?.error?.message || "Failed to generate image",
    });
  }
});

export default app;

//show full image on clicking the image
