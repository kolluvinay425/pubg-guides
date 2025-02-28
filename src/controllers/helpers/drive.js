import { google } from "googleapis";
import fs from "fs";
import path from "path";
import stream from "stream";
import dotenv from "dotenv";
import { cwd } from "process";

dotenv.config(); // Load environment variables
const KEYFILEPATH = cwd() + "/pubg-guides-key.json";
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH, // Path to your service account JSON
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

export const uploadToDrive = async (file) => {
  const tempPath = `${cwd()}/uploads/${file.originalname}`;

  try {
    // Write file to disk
    fs.writeFileSync(tempPath, file.buffer);

    // Read the file from disk
    const fileBuffer = fs.readFileSync(tempPath);
    console.log(
      `Uploading file: ${file.originalname}, size: ${fileBuffer.length} bytes`
    );

    if (fileBuffer.length === 0) {
      throw new Error("File buffer is empty.");
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const fileMetadata = {
      name: file.originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Folder ID in Google Drive
    };

    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };

    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    const fileId = driveResponse.data.id;

    // Set the file permissions to make it publicly accessible
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Remove the temporary file from disk after upload
    fs.unlinkSync(tempPath);
    console.log(`File uploaded successfully. File ID: ${fileId}`);

    return `https://drive.google.com/uc?id=${fileId}`;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);

    // Ensure the temp file is deleted in case of an error
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    throw new Error("Failed to upload file to Google Drive.");
  }
};
