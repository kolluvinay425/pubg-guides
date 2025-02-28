import { Sequelize } from "sequelize";

// Define your connection options
const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // For self-signed certificates (if applicable)
    },
  },
  logging: false, // Optional: Set to true to log SQL queries
});

export default sequelize;
