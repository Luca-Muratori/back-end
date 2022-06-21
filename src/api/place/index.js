import express from "express";
import PlaceSchema from "./model.js";

const placeRouter = express.Router();

//create a Place (city, particular place)
placeRouter.post("/", async (req, res, next) => {
  try {
    const place = new PlaceSchema(req.body);
    const { _id } = await place.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

//modify the information of a place
placeRouter.put("/:placeId", async (req, res, next) => {
  try {
    const place = await PlaceSchema.findByIdAndUpdate(
      req.params.placeId,
      req.body,
      { new: true }
    );
    if (place) {
      res.status(201).send(place);
    }
  } catch (error) {
    next(error);
  }
});

export default placeRouter;
