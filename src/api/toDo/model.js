import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ToDoSchema = new Schema({
  title: { type: String, required: true },
  where: { type: String, required: true },
  description: { type: String, required: false },
  userId: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
});

export default model("ToDo", ToDoSchema);
