import sequelize from "./sequalize.js"; // Your Sequelize configuration file
import app from "./app.js";
import listEndpoints from "express-list-endpoints";

if (!process.env.POSTGRES_URI) {
  throw new Error("No PostgreSQL URL provided");
}
const PORT = process.env.PORT || 8081;

// Connect to PostgreSQL
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected with PostgreSQL at", process.env.POSTGRES_URI);
    return sequelize.sync({ alter: true }); // Sync all models
  })
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.table(listEndpoints(app));
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
