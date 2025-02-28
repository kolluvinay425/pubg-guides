import {
  updateAchievement,
  postAchievement,
  getAchievementByName,
  getAchievements,
  deleteInvalidAchievements,
  getAchievementsByCategory,
  deleteAchievementById,
  deleteAchievementsByCategory,
} from "../controllers/achievement/achievement.js";
import express from "express";
import {
  automateAchievementsCreation,
  updateAchievementTranslationsName,
  updateBulkAchievements,
} from "../controllers/achievement/createAchievement.js";
const achievementsRouter = express.Router();

achievementsRouter.put("/bulk-update", updateBulkAchievements);
achievementsRouter.put("/name-update", updateAchievementTranslationsName);

achievementsRouter.post("/automate", automateAchievementsCreation);

achievementsRouter.post("/", postAchievement);
achievementsRouter.delete("/:id", deleteAchievementById);

achievementsRouter.put("/", updateAchievement);
achievementsRouter.get("/all", getAchievements);
achievementsRouter.get("/", getAchievementByName);
achievementsRouter.get("/category", getAchievementsByCategory);

achievementsRouter.delete("/all", deleteInvalidAchievements);
achievementsRouter.delete("/category/:category", deleteAchievementsByCategory);

export default achievementsRouter;
