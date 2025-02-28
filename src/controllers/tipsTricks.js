import { TipsTricks } from "../models/index.js";

import { Op, Sequelize } from "sequelize";
import { deleteFromCloudinary, uploadToCloud } from "./helpers/cloudinary.js";
import cloudinary from "./helpers/cloudinaryConfig.js";

const getTipsTricksByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }

    const tip = await TipsTricks.findAll({
      where: Sequelize.where(
        Sequelize.json("heading.en"),
        { [Op.regexp]: `(?i)${name}` } // Adding (?i) for case-insensitive regex
      ),
    });
    console.log("tips.------------->", tip[0].image);
    if (tip) {
      res.json({ count: tip.length, tip });
    } else {
      res.status(404).json({ message: "Tip not found" });
    }
  } catch (error) {
    console.error("Error fetching tip:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload multiple images to a tip
const uploadTipsTrickImages = async (req, res) => {
  const { id } = req.params;
  const images = req.files; // New uploaded images (from Multer)

  console.log("Uploaded Files:", images);

  try {
    // Find the existing tip
    const tip = await TipsTricks.findByPk(id);
    if (!tip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    // Parse the existing image array (if it's a string in the database)
    let existingImages = Array.isArray(tip.image)
      ? tip.image
      : JSON.parse(tip.image || "[]");

    // Upload new images to Cloudinary (if any)
    let newImageLinks = [];
    if (images && images.length > 0) {
      newImageLinks = await uploadToCloud(images.map((file) => file.path));
    }

    // Combine existing and new images
    const updatedImages = [...existingImages, ...newImageLinks];

    // Update the database
    const updatedTip = await tip.update({
      image: updatedImages,
    });

    res.json({ message: "Tip updated successfully", updatedTip });
  } catch (error) {
    console.error("Error updating tip:", error);
    res.status(500).json({ error: error.message });
  }
};

//delete and update tip image
const deleteAndUpdateTipTrickImage = async (req, res) => {
  const { id } = req.params;
  const { oldImageUrl } = req.body; // The URL of the image to replace (old image)
  const newImage = req.file; // New image file to upload

  if (!newImage) {
    return res.status(400).json({ message: "No new image provided" });
  }

  try {
    const tip = await TipsTricks.findByPk(id);
    if (!tip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    // Delete the old image from Cloudinary
    if (oldImageUrl && tip.image.includes(oldImageUrl)) {
      await deleteFromCloudinary(oldImageUrl);
    } else {
      return res
        .status(400)
        .json({ message: "Old image not found in tip's images" });
    }

    // Upload the new image to Cloudinary
    const newImageUrl = await uploadToCloud([newImage.path]);

    // Update the images array (replace the old image URL with the new one)
    const updatedImages = tip.image.map((img) =>
      img === oldImageUrl ? newImageUrl[0] : img
    );

    // Update the tip with the new images array
    const updatedTip = await tip.update({ image: updatedImages });

    res.json({ message: "Tip image updated successfully", updatedTip });
  } catch (error) {
    console.error("Error updating tip image:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific image from a tip
const deleteTipTrickImage = async (req, res) => {
  console.log("-------->", req.params.id);
  {
    const { id } = req.params;
    const { imageUrl } = req.body; // The URL of the image to delete

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    try {
      // Find the tip by its ID
      const tip = await TipsTricks.findByPk(id);
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }

      // Check if the image exists in tip.images
      const imageIndex = tip.image.findIndex((img) => img === imageUrl);
      if (imageIndex === -1) {
        return res.status(404).json({ message: "Image not found in tip" });
      }

      // Delete the image from Cloudinary
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract the public ID from the URL
      await cloudinary.uploader.destroy(publicId);

      // Remove the image URL from tip.images
      tip.image = tip.image.filter((img) => img !== imageUrl);

      // Update the tip in the database
      await tip.save();

      res.json({
        message: "Image deleted successfully",
        updatedImages: tip.images,
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete a tip by its ID
const deleteTipTrickById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ message: "Id param is required Field" });
    }
    const deletedCount = await TipsTricks.destroy({
      where: { id: req.params.id }, // Correct usage
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Tip not found" });
    }

    res
      .status(200)
      .json({ message: "Tip deleted successfully!", deletedCount });
  } catch (error) {
    console.error("Error deleting Tip:", error);
    res.status(500).json({ error: error.message });
  }
};

const getTipTrickById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ message: "Id param is required Field" });
    }
    const tip = await TipsTricks.findByPk(id);

    if (!tip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    res.status(200).json(tip);
  } catch (error) {
    console.error("Error deleting Tip:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllAchievementTipsTricks = async (req, res) => {
  const { achievementId } = req.params;

  try {
    if (!achievementId) {
      return res.status(400).json({ message: "Achievement Id is required" });
    }
    const tipsTricks = await TipsTricks.findAll({
      where: { achievementId: achievementId },
    });

    res.json({ count: tipsTricks.length, tipsTricks });
  } catch (error) {
    console.error("Error fetching tips & tricks:", error);
    res.status(500).json({ error: error.message });
  }
};

const clearTipsImageString = async (req, res) => {
  try {
    // Fetch all the tips with the 'image' field
    const tips = await TipsTricks.findAll();

    // Iterate through each tip
    for (const tip of tips) {
      if (tip.image && Array.isArray(tip.image)) {
        // Clean up each image URL in the array
        const cleanedImages = tip.image.map((imageUrl) => {
          // Fix the broken link
          let cleanedUrl = imageUrl
            .replace("https:////", "https://") // Add missing 'https://'
            .replace("drive.google.comuc", "drive.google.com/uc") // Add '/' after 'google.com'
            .trim();

          // Further cleanup: remove extra slashes and trim spaces from the image URL
          //   cleanedUrl = cleanedUrl.replace(/\//g, "").trim();

          return cleanedUrl;
        });
        console.log("dscdscs---------->", cleanedImages);
        // Update the image field with the cleaned array of image URLs
        // await tip.update({
        //   image: cleanedImages,
        // });
      }
    }

    res
      .status(200)
      .json({ message: "Requirement images cleaned successfully" });
  } catch (error) {
    console.error("Error cleaning images:", error);
    res.status(500).json({ error: "Failed to clean requirement images" });
  }
};
export {
  getTipsTricksByName,
  uploadTipsTrickImages,
  deleteTipTrickById,
  clearTipsImageString,
  deleteAndUpdateTipTrickImage,
  deleteTipTrickImage,
  getTipTrickById,
  getAllAchievementTipsTricks,
};
