import { DataTypes } from "sequelize";
import sequelize from "../sequalize.js";
import iconv from "iconv-lite";

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

function validateAndSanitizeUtf8(value) {
  if (typeof value === "object" && value !== null) {
    for (const key in value) {
      if (typeof value[key] === "string") {
        // Step 2: Ensure UTF-8 encoding
        if (!iconv.encodingExists("utf8")) {
          throw new Error(`Invalid encoding for language: ${key}`);
        }
        const buffer = iconv.encode(value[key], "utf8");
        const utf8String = iconv.decode(buffer, "utf8");

        if (utf8String !== value[key]) {
          throw new Error(`Invalid UTF-8 string detected for language: ${key}`);
        }

        // Step 3: Assign sanitized value
        value[key] = utf8String;
      }
    }
  }
}

const Requirement = sequelize.define("Requirement", {
  heading: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: i18nDefaultValue,
    validate: {
      isUtf8: validateAndSanitizeUtf8,
    },
  },
  image: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Changed from STRING to ARRAY
    allowNull: true,
    defaultValue: [], // Ensuring it defaults to an empty array
  },
  icon_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: i18nDefaultValue,
    validate: {
      isUtf8: validateAndSanitizeUtf8,
    },
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
