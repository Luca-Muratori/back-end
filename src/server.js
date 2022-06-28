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

server.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
let whitelist = [
  "http://localhost:3000",
  "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=https%3A%2F%2Fsolo-capstone.herokuapp.com%2Fuser%2FgoogleRedirect&scope=profile%20email&client_id=699957671428-fsntp9p1f52dc831iduap2bp0p1nkg14.apps.googleusercontent.com",
  // "https://solo-capstone.herokuapp.com/user/login",
  // "https://solo-capstone.herokuapp.com/user/googleLogin",
  // "https://solo-capstone.herokuapp.com/user/googleRedirect",
  // "https://solo-capstone.herokuapp.com",
];
console.log(whitelist);

var corsOptions = {
  origin: function (origin, callback) {
    console.log("origin", origin);
    if (whitelist.some((allowedUrl) => allowedUrl === origin)) {
      console.log(whitelist.indexOf(origin));
      console.log(origin);
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
