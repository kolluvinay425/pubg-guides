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

const TipsTricks = sequelize.define("TipsTricks", {
  heading: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: i18nDefaultValue,
  },
  image: {
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

export default TipsTricks;
