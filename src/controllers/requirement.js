import { Requirement } from "../models/index.js";
import { deleteFromCloudinary, uploadToCloud } from "./helpers/cloudinary.js";
import cloudinary from "./helpers/cloudinaryConfig.js";
import { uploadToDrive } from "./helpers/drive.js";

import { Op, Sequelize } from "sequelize";

const getRequirementByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }

    const requirement = await Requirement.findAll({
      where: Sequelize.where(
        Sequelize.json("heading.en"),
        { [Op.regexp]: `(?i)${name}` } // Adding (?i) for case-insensitive regex
      ),
    });

    if (requirement) {
      res.json(requirement);
    } else {
      res.status(404).json({ message: "requirement not found" });
    }
  } catch (error) {
    console.error("Error fetching requirement:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateRequirementImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file; // Single file upload
    const { isNoIcon } = req.body;

    console.log("Uploaded File:", image);

    if (!image) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    // Upload to Google Drive
    const link = await uploadToDrive(image); // Ensure uploadToDrive accepts a file path

    // Update the requirement image
    const updatedRequirement = await requirement.update({
      image: link,
      icon_image: isNoIcon === true ? "" : requirement.icon_image,
    });

    res.json({
      message: "Requirement updated successfully",
      updatedRequirement,
    });
  } catch (error) {
    console.error("Error updating requirement:", error);
    res.status(500).json({ error: error.message });
  }
};
const updateRequirementIcon = async (req, res) => {
  const { id } = req.params;
  const { name, isNoImage } = req.body;

  console.log("is no image-------->", isNoImage);
  if (!name) {
    return res.status(400).json({ message: "icon name is not provided" });
  }

  try {
    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return res.status(404).json({ message: "requirement not found" });
    }

    // Upload to Google Drive (modify function if needed)

    const updatedRequirement = await requirement.update({
      icon_image: name,
      image: isNoImage === true ? [] : requirement.image,
    });

    res.json({
      message: "requirement updated successfully",
      updatedRequirement,
    });
  } catch (error) {
    console.error("Error updating requirement:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateImagesToArray = async (req, res) => {
  try {
    // Fetch all the tips with the 'image' field
    const requirements = await TipsTricks.findAll();

    // Iterate through each tip
    for (const requirement of requirements) {
      if (requirement.image && Array.isArray(requirement.image)) {
        // Filter out any image URL that does not start with 'https://'
        const validImages = requirement.image.filter((imageUrl) =>
          imageUrl.startsWith("https://")
        );

        // Update the image field only if changes are made
        if (validImages.length !== requirement.image.length) {
          console.log(validImages);
          // await requirement.update({ image: validImages });
        }
      }
    }

    res
      .status(200)
      .json({ message: "Invalid image URLs removed successfully" });
  } catch (error) {
    console.error("Error cleaning image URLs:", error);
    res.status(500).json({ error: "Failed to clean image URLs" });
  }
};

const deleteAndUpdateRequirementImage = async (req, res) => {
  const { id } = req.params;
  const { oldImageUrl } = req.body; // The URL of the image to replace (old image)
  const newImage = req.file; // New image file to upload

  if (!newImage) {
    return res.status(400).json({ message: "No new image provided" });
  }

  try {
    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return res.status(404).json({ message: "requirement not found" });
    }

    // Delete the old image from Cloudinary
    if (oldImageUrl && requirement.image.includes(oldImageUrl)) {
      await deleteFromCloudinary(oldImageUrl);
    } else {
      return res
        .status(400)
        .json({ message: "Old image not found in requirement's images" });
    }

    // Upload the new image to Cloudinary
    const newImageUrl = await uploadToCloud([newImage.path]);

    // Update the images array (replace the old image URL with the new one)
    const updatedImages = requirement.image.map((img) =>
      img === oldImageUrl ? newImageUrl[0] : img
    );

    // Update the requirement with the new images array
    const updatedRequirement = await requirement.update({
      image: updatedImages,
    });

    res.json({
      message: "requirement image updated successfully",
      updatedRequirement,
    });
  } catch (error) {
    console.error("Error updating requirement image:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific image from a requirement
const deleteRequirementImage = async (req, res) => {
  console.log("-------->", req.params.id);
  {
    const { id } = req.params;
    const { imageUrl } = req.body; // The URL of the image to delete

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    try {
      // Find the requirement by its ID
      const requirement = await Requirement.findByPk(id);
      if (!requirement) {
        return res.status(404).json({ message: "requirement not found" });
      }

      // Check if the image exists in requirement.images
      const imageIndex = requirement.image.findIndex((img) => img === imageUrl);
      if (imageIndex === -1) {
        return res
          .status(404)
          .json({ message: "Image not found in requirement" });
      }

      // Delete the image from Cloudinary
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract the public ID from the URL
      await cloudinary.uploader.destroy(publicId);

      // Remove the image URL from requirement.images
      requirement.image = requirement.image.filter((img) => img !== imageUrl);

      // Update the requirement in the database
      await requirement.save();

      res.json({
        message: "Image deleted successfully",
        updatedImages: requirement.images,
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

// Upload multiple images to a requirement
const uploadRequirementImages = async (req, res) => {
  const { id } = req.params;
  const images = req.files; // New uploaded images (from Multer)

  console.log("Uploaded Files:", images);

  try {
    // Find the existing requirement
    const requirement = await Requirement.findByPk(id);
    if (!requirement) {
      return res.status(404).json({ message: "requirement not found" });
    }

    // Parse the existing image array (if it's a string in the database)
    let existingImages = Array.isArray(requirement.image)
      ? requirement.image
      : JSON.parse(requirement.image || "[]");

    // Upload new images to Cloudinary (if any)
    let newImageLinks = [];
    if (images && images.length > 0) {
      newImageLinks = await uploadToCloud(images.map((file) => file.path));
    }

    // Combine existing and new images
    const updatedImages = [...existingImages, ...newImageLinks];

    // Update the database
    const updatedRequirement = await requirement.update({
      image: updatedImages,
    });

    res.json({
      message: "requirement updated successfully",
      updatedRequirement,
    });
  } catch (error) {
    console.error("Error updating requirement:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllAchievementRequirements = async (req, res) => {
  const { achievementId } = req.params;

  try {
    if (!achievementId) {
      return res.status(400).json({ message: "Achievement Id is required" });
    }
    const requirements = await Requirement.findAll({
      where: { achievementId: achievementId },
    });

    res.json({ count: requirements.length, requirements });
  } catch (error) {
    console.error("Error fetching tips & tricks:", error);
    res.status(500).json({ error: error.message });
  }
};

const getRequirementById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ message: "Id param is required Field" });
    }
    const requirement = await Requirement.findByPk(id);

    if (!requirement) {
      return res.status(404).json({ message: "requirement not found" });
    }

    res.status(200).json(requirement);
  } catch (error) {
    console.error("Error deleting requirement:", error);
    res.status(500).json({ error: error.message });
  }
};
export {
  getRequirementByName,
  updateRequirementImage,
  updateRequirementIcon,
  updateImagesToArray,
  deleteAndUpdateRequirementImage,
  deleteRequirementImage,
  uploadRequirementImages,
  getAllAchievementRequirements,
  getRequirementById,
};
