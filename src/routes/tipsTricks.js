import express from "express";
import {
  getTipsTricksByName,
  uploadTipsTrickImages,
  deleteTipTrickById,
  clearTipsImageString,
  deleteAndUpdateTipTrickImage,
  deleteTipTrickImage,
  getTipTrickById,
  getAllAchievementTipsTricks,
} from "../controllers/tipsTricks.js";
import { upload } from "../controllers/helpers/storage.js";

const tipsTricksRouter = express.Router();

tipsTricksRouter.get("/", getTipsTricksByName);

tipsTricksRouter.put("/hello/there", clearTipsImageString); // Static route first
tipsTricksRouter.get("/:id", getTipTrickById);

tipsTricksRouter.put(
  "/:id/images",
  upload.array("images", 5),
  uploadTipsTrickImages
); // Dynamic route last
tipsTricksRouter.put(
  "/:id/image",
  upload.single("image"),
  deleteAndUpdateTipTrickImage
);

tipsTricksRouter.delete("/:id/image", deleteTipTrickImage);
tipsTricksRouter.delete("/:id", deleteTipTrickById);
tipsTricksRouter.get("/:achievementId/all", getAllAchievementTipsTricks);

export default tipsTricksRouter;
