import Achievement from "./achievement.js";
import TipsTricks from "./tipsTricks.js";
import Requirement from "./requirements.js";

// Associations with Aliases
Achievement.hasMany(TipsTricks, {
  foreignKey: "achievementId",
  as: "tipsTricks",
});
TipsTricks.belongsTo(Achievement, { foreignKey: "achievementId" });

Achievement.hasMany(Requirement, {
  foreignKey: "achievementId",
  as: "requirements",
});
Requirement.belongsTo(Achievement, { foreignKey: "achievementId" });

export { Achievement, TipsTricks, Requirement };
