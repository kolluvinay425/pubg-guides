import express from "express";
import {
  deleteAndUpdateRequirementImage,
  deleteRequirementImage,
  getAllAchievementRequirements,
  getRequirementById,
  getRequirementByName,
  updateImagesToArray,
  updateRequirementIcon,
  updateRequirementImage,
  uploadRequirementImages,
} from "../controllers/requirement.js";

import { upload } from "../controllers/helpers/storage.js";

const requirementRouter = express.Router();

requirementRouter.get("/", getRequirementByName);
requirementRouter.put("/update-image-field", updateImagesToArray);

requirementRouter.put("/:id", upload.single("image"), updateRequirementImage);
requirementRouter.get("/:id", getRequirementById);

requirementRouter.put("/icon-image/:id", updateRequirementIcon);
requirementRouter.put(
  "/:id/image",
  upload.single("image"),
  deleteAndUpdateRequirementImage
);

requirementRouter.delete("/:id/image", deleteRequirementImage);

requirementRouter.put(
  "/:id/images",
  upload.array("images", 5),
  uploadRequirementImages
); // Dynamic route last

requirementRouter.get("/:achievementId/all", getAllAchievementRequirements);

export default requirementRouter;
