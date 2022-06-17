import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, Model } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
});
