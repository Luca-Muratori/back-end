import express from "express";
import createError from "http-errors";
import mongoose from "mongoose";
import {
  cloudinaryAvatarUploader,
  cloudinaryPhotoUploader,
} from "../../tools/uploadToCloudinary.js";
import UserSchema from "./model.js";
import ToDoSchema from "../toDo/model.js";
import PhotoSchema from "../photo/model.js";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import {
  authenticateUser,
  verifyRefreshTokenAndGenerateNewTokens,
} from "../../auth/tools.js";
import passport from "passport";

const userRouter = express.Router();

//for google authorization
userRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
); // the purpose of this endpoint is to redirect users to Google Consent Screen
userRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    // the purpose of this endpoint is to receive a response from Google, execute the google callback function and then send a response back
    try {
      const { accessToken, refreshToken } = req.user;
      res.redirect(
        `${process.env.FE_URL}/home?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

userRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain credentials from req.body
    console.log("hello");
    const { email, password } = req.body;
    console.log("req.body", email, password);

    // 2. Verify credentials
    const user = await UserSchema.checkCredentials(email, password);
    if (user) {
      // 3. If credentials are ok --> generate an access token (JWT) and send it as a response
      const { accessToken, refreshToken } = await authenticateUser(user);
      console.log("user", user);
      res.send({ accessToken, refreshToken });
    } else {
      // 4. If credentials are not ok --> throw an error (401)
      next(createError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

//create the user
userRouter.post("/", async (req, res, next) => {
  try {
    const profile = new UserSchema(req.body);
    const { _id } = await profile.save();
    res.status(201).send({ _id });
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
        req.params.userId,
        { avatar: req.file.path },
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
    console.log("hello");
    const users = await UserSchema.find().populate("photos");
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//for gettin only the user that had login
userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log("user/me");
    const user = await UserSchema.findById(req.user._id).populate(
      "userToDoList"
    );
    res.send(user);
  } catch (error) {
    next(error);
  }
});

//for modify only the user that had login
userRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const modifiedUser = await UserSchema.findByIdAndUpdate(
      req.user._id,
      req.body
    );
  } catch (error) {
    next(error);
  }
});

//to delete the user that had login
userRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  await UserSchema.findByIdAndDelete(req.user._id);
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
userRouter.put(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
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
  }
);

//for deleting the user from the db
userRouter.delete(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
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
  }
);

userRouter.post("/refreshTokens", async (req, res, next) => {
  try {
    // 1. Receive the refresh token in req.body
    const { currentRefreshToken } = req.body;

    // 2. Check validity of that token (check if it is not expired, check if it is not compromised, check if it is same as the one we store in db)
    const { accessToken, refreshToken } =
      await verifyRefreshTokenAndGenerateNewTokens(currentRefreshToken);
    // 3. If everything is fine --> generate a new pair of tokens (accessToken2 & refreshToken2)

    // 4. Send them back as a response
    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

//-------------------user/ToDo
//create a to do
userRouter.post("/:userId/toDos", async (req, res, next) => {
  try {
    const user = await UserSchema.find({ _id: req.params.userId });
    if (user) {
      const toDoToInsert = await ToDoSchema({
        ...req.body,
        userId: req.params.userId,
      }).save();
      console.log("12", toDoToInsert);

      const modifiedUser = await UserSchema.findOneAndUpdate(
        { _id: req.params.userId },
        { $push: { userToDoList: toDoToInsert } },
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
      const toDo = await user.userToDoList.find(
        (toDo) => req.params.toDoId === toDo._id.toString()
      );
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
          cloudinaryLink: req.file.path,
          userId: req.params.userId,
        }).save();

        const modifiedUser = await UserSchema.findOneAndUpdate(
          { _id: req.params.userId },
          { $push: { photos: photoToInsert } },
          { new: true, runValidators: true }
        );
        if (modifiedUser) {
          console.log(res);
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
        .populate("userId");
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
