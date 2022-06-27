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
import "./api/comment/model.js";

passport.use("google", googleStrategy);

const server = express();
const port = process.env.PORT || 3001;

let whitelist = [
  "http://localhost:3000",
  "https://solo-capstone.herokuapp.com/user/login",
  "https://solo-capstone.herokuapp.com/user/googleLogin",
];

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
};

server.use(cors(corsOptions));
server.use(express.json());
server.use(passport.initialize());

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected!");
  console.log("server is connected to port ", port);
  server.listen(port, () => {
    console.table(listEndpoints(server));
  });
});

///--------------------endpoints
server.use("/user", userRouter);
server.use("/place", placeRouter);

///----------------------errors handlers --------------------------------
server.use(unauthorizedHandler);
server.use(genericHandler);
server.use(forbiddenHandler);
