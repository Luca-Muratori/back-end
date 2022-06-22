import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import passport from "passport";
import googleStrategy from "./auth/googleAuth.js";
import {
  unauthorizedHandler,
  genericHandler,
  forbiddenHandler,
} from "./errorsHandler.js";
import userRouter from "./api/user/index.js";
import placeRouter from "./api/place/index.js";

passport.use("google", googleStrategy);

const server = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(express.json());
server.use(passport.initialize());

///--------------------endpoints
server.use("/user", userRouter);
server.use("/place", placeRouter);

///----------------------errors handlers --------------------------------
server.use(unauthorizedHandler);
server.use(genericHandler);
server.use(forbiddenHandler);

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected!");
  console.log("server is connected to port ", port);
  server.listen(port, () => {
    console.table(listEndpoints(server));
  });
});
