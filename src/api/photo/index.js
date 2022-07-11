import express from "express";
import createError from "http-errors";
import PhotoSchema from "./model.js";

const photoRouter = express.Router();

photoRouter.get("/", async (req, res, next) => {
  try {
    console.log("hello from photo");
    const photos = await PhotoSchema.find().populate("userId");
    res.status(200).send(photos);
  } catch (error) {
    next(error);
  }
});

export default photoRouter;
