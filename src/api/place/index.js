import express from "express";
import PlaceSchema from "./model.js";
import PhotoSchema from "./model.js";
import { cloudinaryPhotoUploader } from "../../tools/uploadToCloudinary.js";

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

//get all the PlaceS
placeRouter.get("/", async (req, res, next) => {
  try {
    const place = await PlaceSchema.find();
    res.status(201).send(place);
  } catch (error) {
    next(error);
  }
});

//get a certain place
placeRouter.get("/:userId", async (req, res, next) => {
  try {
    const place = await PlaceSchema.findById(req.params.placeId)
      .populate("photos")
      .populate("toDoList");

    if (place) {
      res.status(200).send(place);
    } else {
      console.log("This place does not exist");
    }
  } catch (error) {
    console.log(error);
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

placeRouter.delete("/:placeId", async (req, res, next) => {
  try {
    const place = await PlaceSchema.findByIdAndDelete(req.params.placeId);
    if (place) {
      res.status(201).send("place deleted");
    }
  } catch (error) {
    next(error);
  }
});

//--------------------------place/photos

//posting a photo
placeRouter.post(
  "/:placeId/photos",
  cloudinaryPhotoUploader,
  async (req, res, next) => {
    try {
      const place = await PlaceSchema.find({ _id: req.params.placeId });
      if (place) {
        const photoToInsert = await PhotoSchema.find({
          ...req.body,
          placeId: req.params.placeId,
        }).save();

        const modifiedPlace = await PlaceSchema.findOneAndUpdate(
          { _id: req.params.placeId },
          { $push: { photos: photoToInsert } },
          { new: true, runValidators: true }
        );
        if (modifiedPlace) {
          res.send(modifiedPlace);
        }
      }
    } catch (error) {
      next(error);
    }
  }
);

//get all the photo
placeRouter.get("/:placeId/photos", async (req, res, next) => {
  try {
    const place = await PlaceSchema.findById(req.params.userId).populate(
      "userToDoList"
    );
    console.log(place.photos);
    if (user) {
      res.send(place.photos);
    } else {
      next(createError(404, `User with ${req.params.placeId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

//get a specific photo
placeRouter.get("/:placeId/photos/:photoId", async (req, res, next) => {
  try {
    const place = await PlaceSchema.findById(req.params.placeId).populate(
      "photos"
    );
    if (place) {
      const photos = await place.photos
        .find((photo) => req.params.placeId === photo._id.toString())
        .populate("place");
      console.log(place.photos);
      if (photos) {
        res.send(photos);
      } else {
        next(createError(404, " photo not found"));
      }
    } else {
      next(createError(404, "place not found"));
    }
  } catch (error) {
    next(error);
  }
});

//to delete a photo from a place
placeRouter.delete("/:placeId/photos/:photoId", async (req, res, next) => {
  try {
    await PlaceSchema.findOneAndUpdate(
      { _id: req.params.placeId },
      {
        $pull: {
          photos: req.params.photoId,
        },
      },
      { new: true }
    );
    await PhotoSchema.findByIdAndDelete(req.params.photoId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
//

export default placeRouter;
