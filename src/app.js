import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import achievementsRouter from "./routes/achievement.js";

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
export default app;
