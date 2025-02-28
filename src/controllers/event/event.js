import { en } from "@faker-js/faker";
import Event from "../../models/event.js";
import { jsonData } from "../helpers/helper.js";
import { Op, Sequelize } from "sequelize";

const CreateEvent = async (req, res) => {
  console.log(JSON.parse(jsonData));

  try {
    const {
      event_period,
      tips_and_tricks,
      features,
      description,
      event,
      version,
    } = JSON.parse(jsonData);
    const eventCreation = await Event.create({
      name: event,
      description: description,
      // event_images: data.image,
      start_date: event_period.start_date,
      end_date: event_period.end_date,
      version: version,
      features: features,
      tips_and_tricks: tips_and_tricks.general_tips,
    });
    console.log(eventCreation);
    res.status(201).json(eventCreation);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: error.message });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ message: "Id param is required Field" });
    }
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ message: "event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: error.message });
  }
};

export { CreateEvent, getEventById };
