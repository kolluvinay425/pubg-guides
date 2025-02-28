// import { Sequelize } from "sequelize";

// const sequelize = new Sequelize("pubg guides", "postgres", "superuser", {
//   host: "localhost",
//   dialect: "postgres",
//   logging: false, // Disable logging; default: console.log
// });

// export default sequelize;

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
