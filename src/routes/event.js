import express from "express";

import { upload } from "../controllers/helpers/storage.js";
import { CreateEvent, getEventById } from "../controllers/event/event.js";

const eventRouter = express.Router();

eventRouter.get("/:id", getEventById);
eventRouter.post("/", CreateEvent);

export default eventRouter;
