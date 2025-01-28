import {
  updateAchievement,
  postAchievement,
  getAchievementByName,
  getAchievements,
  deleteInvalidAchievements,
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
achievementsRouter.delete("/all", deleteInvalidAchievements);

export default achievementsRouter;
