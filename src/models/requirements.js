import mongoose from "mongoose";

// Define a nested schema for internationalized fields
const i18nStringSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    zh: { type: String, required: false },
    ko: { type: String, required: false },
    ja: { type: String, required: false },
    es: { type: String, required: false },
    ru: { type: String, required: false },
    fr: { type: String, required: false },
    de: { type: String, required: false },
    pt: { type: String, required: false },
    ar: { type: String, required: false },
  },
  { _id: false }
);

const requirementsSchema = new mongoose.Schema({
  heading: {
    type: i18nStringSchema,
    required: true,
  },
  images: {
    type: String, // Store as an array of strings
    required: false,
  },
  icon_name: {
    type: String,
    required: false,
  },
  description: {
    type: i18nStringSchema,
    required: true,
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Achievement",
    required: true,
  },
});

const Requirement = mongoose.model(
  "Requirement",
  requirementsSchema,
  "Requirements"
);

export default Requirement;
