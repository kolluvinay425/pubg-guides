import { Sequelize } from "sequelize";

const sequelize = new Sequelize("pubg guides", "postgres", "superuser", {
  host: "localhost",
  dialect: "postgres",
  logging: false, // Disable logging; default: console.log
});

export default sequelize;
