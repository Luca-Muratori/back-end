import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PlaceSchema = new Schema({
  name: { type: String },
  country: { type: String },
  likes: { type: String },
  photos: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }] },
  toDoList: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "ToDo" }],
  },
});
