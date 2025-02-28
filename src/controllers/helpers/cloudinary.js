import cloudinary from "./cloudinaryConfig.js";
import fs from "fs/promises"; // Use promises for async file deletion

/**
 * Upload multiple images to Cloudinary and delete local files after upload.
 * @param {Array} images - Array of image file paths (local) or URLs (Cloudinary)
 * @returns {Promise<Array>} - Array of Cloudinary URLs
 */
export const uploadToCloud = async (images) => {
  try {
    const uploadPromises = images.map(async (image) => {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(image, {
        folder: process.env.CLOUDINARY_FOLDER_NAME || "uploads",
        resource_type: "auto",
      });

      // Delete the local file after successful upload
      await fs.unlink(image);

      return result.secure_url;
    });

    // Wait for all uploads to complete
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images:", error);
    throw new Error("Failed to upload images to Cloudinary");
  }
};

export const deleteFromCloudinary = async (imageUrl) => {
  try {
    const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract publicId from Cloudinary URL
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};
