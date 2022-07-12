import express from "express";
import ToDoSchema from "./model.js";

const toDoRouter = express.Router();

toDoRouter.get("/", async (req, res, next) => {
  console.log("hello");
  try {
    const toDos = await ToDoSchema.find().populate("userId");
    if (toDos) {
      res.status(200).send(toDos);
    } else {
      console.log("to dos not founds");
    }
  } catch (error) {
    next(error);
  }
});

toDoRouter.get("/:toDoId", async (req, res, next) => {
  try {
    const toDo = await ToDoSchema.findByIdAndUpdate(req.params.toDoId).populate(
      "userId"
    );
    if (toDo) {
      res.status(200).send(toDo);
    } else {
      console.log("toDo not found");
    }
  } catch (error) {
    next(error);
  }
});

export default toDoRouter;
