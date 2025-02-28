import { DataTypes } from "sequelize";
import iconv from "iconv-lite";
import sequelize from "../sequalize.js";

const Event = sequelize.define("Event", {
  name: { type: DataTypes.STRING, allowNull: false },
  version: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },

  // Event period
  start_date: { type: DataTypes.DATE, allowNull: false },
  end_date: { type: DataTypes.DATE, allowNull: false },
  // event_images: { type: DataTypes.JSON, allowNull: false },

  // Features stored as JSON
  features: { type: DataTypes.JSON, allowNull: false },

  // Tips stored as JSON
  tips_and_tricks: { type: DataTypes.JSON, allowNull: false },

  // Gameplay video
  gameplay_video_title: { type: DataTypes.STRING },
  gameplay_video_url: { type: DataTypes.STRING },
  gameplay_video_thumbnail: { type: DataTypes.STRING },
});

export default Event;
