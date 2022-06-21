import express from "express";
import createError from "http-errors";
import mongoose from "mongoose";
import {
  cloudinaryAvatarUploader,
  cloudinaryPhotoUploader,
} from "../../tools/uploadToCloudinary.js";
import UserSchema from "./model.js";
import ToDoSchema from "../toDo/model.js";

const userRouter = express.Router();

//create the user
userRouter.post("/", async (req, res, next) => {
  try {
    const profile = new UserSchema(req.body);
    const { _id } = await profile.save();
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//for upload the user's avatar
userRouter.put(
  "/:userId/uploadAvatar",
  cloudinaryAvatarUploader,
  async (req, res, next) => {
    try {
      const profile = await UserSchema.findByIdAndUpdate(
        req.params.profileId,
        { image: req.file.path },
        { new: true }
      );
      if (profile) {
        res.status(201).send(profile);
      } else {
        console.log("profile not found");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//for getting all the user
userRouter.get("/", async (req, res, next) => {
  try {
    const profile = await UserSchema.find();
    res.status(200).send(profile);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//for getting only one user by _id
userRouter.get("/:userId", async (req, res, next) => {
  try {
    const profile = await UserSchema.findById(req.params.userId)
      .populate("photos")
      .populate("userToDoList")
      .populate("favoritePhotos")
      .populate("friends")
      .populate("favoritePlace")
      .populate("comments");
    if (profile) {
      res.status(200).send(profile);
    } else {
      console.log("This profile does not exist");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//for modifying the user's information
userRouter.put("/:userId", async (req, res, next) => {
  try {
    const profile = await UserSchema.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true }
    );
    if (profile) {
      res.status(200).send(profile);
    } else {
      console.log("This profile does not exist");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//for deleting the user from the db
userRouter.delete("/:userId", async (req, res, next) => {
  try {
    const profile = await UserSchema.findByIdAndDelete(req.params.profileId);
    if (profile) {
      res.status(200).send("Profile Destroyed");
    } else {
      console.log("This profile does not exist");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//-------------------user/ToDo
//create a to do
userRouter.post("/:userId/toDos", async (req, res, next) => {
  try {
    const user = await UserSchema.find({ _id: req.params.userId });
    if (user) {
      const photoToInsert = await ToDoSchema({
        ...req.body,
        userId: req.params.userId,
      }).save();

      const modifiedUser = await ToDoSchema.findOneAndUpdate(
        { _id: req.params.userId },
        { $push: { photos: photoToInsert } },
        { new: true, runValidators: true }
      );
      if (modifiedUser) {
        res.send(modifiedUser);
      }
    }
  } catch (error) {
    next(error);
  }
});

//get all the to do
userRouter.get("/:userId/toDos", async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.userId).populate(
      "userToDoList"
    );
    console.log(user.userToDoList);
    if (user) {
      res.send(user.userToDoList);
    } else {
      next(createError(404, `User with ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

//get a specified to do
userRouter.get("/:userId/toDos/:toDoId", async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.userId).populate(
      "userToDoList"
    );
    if (user) {
      const toDo = await user.userToDoList
        .find((toDo) => req.params.toDoId === toDo._id.toString())
        .populate("user");
      console.log(user.toDo);
      if (toDo) {
        res.send(toDo);
      } else {
        next(createError(404, "to do not found"));
      }
    } else {
      next(createError(404, "user not found"));
    }
  } catch (error) {
    next(error);
  }
});

//modify a certain to do
userRouter.put("/:userId/toDos/:toDoId", async (req, res, next) => {
  try {
    const updated = await ToDoSchema.findByIdAndUpdate(
      req.params.toDoId,
      req.body,
      { new: true }
    );
    res.send(updated);
  } catch (error) {
    next(error);
  }
});

//delete a certain toDo
userRouter.delete("/:userId/toDos/:toDoId", async (req, res, next) => {
  try {
    await UserSchema.findOneAndUpdate(
      { _id: req.params.userId },
      {
        $pull: {
          userToDoList: req.params.toDoId,
        },
      },
      { new: true }
    );
    await ToDoSchema.findByIdAndDelete(req.params.toDoId);
    res.status(204).send();
  } catch (error) {
    res.send(error);
  }
});

//---------------------user/photo
//post a photo
userRouter.post(
  "/:userId/photos",
  cloudinaryPhotoUploader,
  async (req, res, next) => {
    try {
      const user = await UserSchema.find({ _id: req.params.userId });
      if (user) {
        const photoToInsert = await PhotoSchema({
          ...req.body,
          userId: req.params.userId,
        }).save();

        const modifiedUser = await UserSchema.findOneAndUpdate(
          { _id: req.params.userId },
          { $push: { photos: photoToInsert } },
          { new: true, runValidators: true }
        );
        if (modifiedUser) {
          res.send(modifiedUser);
        }
      }
    } catch (error) {
      next(error);
    }
  }
);

//get all the to do
userRouter.get("/:userId/photos", async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.userId).populate(
      "photos"
    );
    console.log(user.photos);
    if (user) {
      res.send(user.photos);
    } else {
      next(createError(404, `User with ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

//get a specified to do
userRouter.get("/:userId/photos/:photoId", async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.userId).populate(
      "photos"
    );
    if (user) {
      const photo = await user.photos
        .find((photo) => req.params.photoId === photo._id.toString())
        .populate("user");
      console.log(user.photo);
      if (photo) {
        res.send(photo);
      } else {
        next(createError(404, "to do not found"));
      }
    } else {
      next(createError(404, "user not found"));
    }
  } catch (error) {
    next(error);
  }
});

//delete a certain toDo
userRouter.delete("/:userId/photos/:photoId", async (req, res, next) => {
  try {
    await UserSchema.findOneAndUpdate(
      { _id: req.params.userId },
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
    res.send(error);
  }
});

export default userRouter;
