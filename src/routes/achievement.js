import {
  updateAchievement,
  postAchievement,
  getAchievementByName,
  getAchievements,
} from "../controllers/achievement.js";
import express from "express";
import {
  automateAchievements,
  updateBulkAchievements,
} from "../controllers/automate.js";
const achievementsRouter = express.Router();

achievementsRouter.put("/bulk-update", updateBulkAchievements);
achievementsRouter.post("/automate", automateAchievements);

achievementsRouter.post("/", postAchievement);
achievementsRouter.put("/", updateAchievement);
achievementsRouter.get("/all", getAchievements);
achievementsRouter.get("/", getAchievementByName);

export default achievementsRouter;
