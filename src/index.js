import mongoose from "mongoose";
import app from "./app.js";
import listEndpoints from "express-list-endpoints";

if (!process.env.MONGO_URI) {
  throw new Error("No mongo url provided");
}
const port = process.env.PORT || 8081;

const mongoConnection = mongoose.connect(process.env.MONGO_URI);

mongoose.createConnection(process.env.MONGO_URI).asPromise();
mongoConnection.then(() => {
  app.listen(port, () => {
    console.log(`Connected with mongoDB at ${process.env.MONGO_URI}`);
    console.table(listEndpoints(app));
    console.log(`server running on port ${port}`);
  });
});
