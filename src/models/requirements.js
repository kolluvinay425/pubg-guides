import { DataTypes } from "sequelize";
import sequelize from "../sequalize.js";

const i18nDefaultValue = {
  en: "",
  zh: "",
  ko: "",
  ja: "",
  es: "",
  ru: "",
  fr: "",
  de: "",
  pt: "",
  ar: "",
};

const Requirement = sequelize.define("Requirement", {
  heading: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: i18nDefaultValue,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  icon_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: i18nDefaultValue,
  },
  achievementId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Achievements",
      key: "id",
    },
  },
});

export default Requirement;
