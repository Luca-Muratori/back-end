import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  avatar: {
    type: String,
    default: "https://ui-avatars.com/api/?name=Unnamed+User",
  },
  whereUserLive: { type: String, required: true },
  photos: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],
  },
  userToDoList: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ToDo",
      },
    ],
  },
  favoritePhotos: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],
  },
  friends: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  favoritePlace: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place",
      },
    ],
  },
  comments: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
});

export default model("User", UserSchema);
