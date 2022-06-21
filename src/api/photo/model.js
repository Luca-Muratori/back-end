import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PhotoSchema = new Schema({
  cloudinaryLink: { type: String },
  userId: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  placeId: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place",
      },
    ],
  },
  description: { type: String },
});

export default model("Photo", PhotoSchema);
