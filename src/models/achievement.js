import mongoose from "mongoose";

const requirementsSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  image: {
    type: Buffer, // Store as Buffer
    required: true,
  },
  icon_image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const tipsTricksSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  image: {
    type: Buffer, // Store as Buffer
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: Buffer, // Store as Buffer
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  hardness: {
    type: String,
    required: true,
  },
  rewards: {
    title: {
      type: String,
      required: false,
    },
    titleImage: {
      type: String,
      required: false,
    },
    extra: {
      type: String,
      required: false,
    },
  },
  tipsTricks: [tipsTricksSchema],
  category: {
    type: String,
    required: true,
  },
  requirements: [requirementsSchema],
});

const Achievement = mongoose.model(
  "Achievement",
  achievementSchema,
  "Achievements"
);

export default Achievement;
