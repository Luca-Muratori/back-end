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
import photoRouter from "./api/photo/index.js";
import "./api/comment/model.js";

passport.use("google", googleStrategy);

const server = express();
const port = process.env.PORT || 3001;
console.log(port);

// server.all("/", function (req, res, next) {
//   console.log("access");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });
let whitelist = ["http://localhost:3000"];
console.log(whitelist);

var corsOptions = {
  origin: function (origin, callback) {
    console.log("cors");
    if (whitelist.some((allowedUrl) => allowedUrl === origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

server.use(cors());
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
server.use("/photo", photoRouter);

///----------------------errors handlers --------------------------------
server.use(unauthorizedHandler);
server.use(genericHandler);
server.use(forbiddenHandler);
