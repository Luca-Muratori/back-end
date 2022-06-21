import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CommentSchema = new Schema({
  text: { type: String },
  userId: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] },
});

export default model("Comment", CommentSchema);
