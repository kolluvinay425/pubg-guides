import { DataTypes } from "sequelize";
import iconv from "iconv-lite";
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

// Function to validate UTF-8 encoding and sanitize input
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

const Achievement = sequelize.define("Achievement", {
  name: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: i18nDefaultValue,
    validate: {
      isUtf8: validateAndSanitizeUtf8,
    },
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: i18nDefaultValue,
    validate: {
      isUtf8: validateAndSanitizeUtf8,
    },
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hardness: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: i18nDefaultValue,
    validate: {
      isUtf8: validateAndSanitizeUtf8,
    },
  },
  rewards: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      title: i18nDefaultValue,
      titleImage: "",
      extra: i18nDefaultValue,
    },
    validate: {
      isUtf8(value) {
        validateAndSanitizeUtf8(value.title);
        validateAndSanitizeUtf8(value.extra);
      },
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Achievement;
