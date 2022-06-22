import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String },
  surname: { type: String },
  avatar: {
    type: String,
    default: "https://ui-avatars.com/api/?name=Unnamed+User",
  },
  role: { type: String, enum: ["User", "Admin"], default: "User" },
  password: { type: String, required: false },
  refreshToken: { type: String },
  whereUserLive: { type: String },
  photos: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],
  },
  userToDoList: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ToDo",
      },
    ],
  },
  favoritePhotos: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],
  },
  friends: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  favoritePlace: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place",
      },
    ],
  },
  comments: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
});

UserSchema.pre("save", async function (next) {
  // BEFORE saving the user in db, execute a function (hash the password)
  // I am NOT using arrow functions here because of "this"
  const currentUser = this; // "this" here represents the current user I am trying to save in db
  const plainPW = this.password;

  if (currentUser.isModified("password")) {
    // only if the user is modifying the password field I am going to use some CPU cycles to hash that, otherwise they are just wasted
    const hash = await bcrypt.hash(plainPW, 11);
    currentUser.password = hash;
  }
  next();
});

UserSchema.methods.toJSON = function () {
  // this toJSON method is called EVERY TIME express does a res.send(user/s)
  const userDocument = this;
  const userObject = userDocument.toObject();
  delete userObject.password;
  delete userObject.__v;
  delete userObject.refreshToken;
  return userObject;
};

UserSchema.static("checkCredentials", async function (email, plainPW) {
  // custom method that, given email and pw it is going to return the user if those credentials are fine
  // 1. Find the user by email
  const user = await this.findOne({ email }); // "this" here refers to the UsersModel
  if (user) {
    // 2. If the email is found --> compare plainPW with the hashed one
    const isMatch = await bcrypt.compare(plainPW, user.password);
    if (isMatch) {
      // 3. If they do match --> return the user himself
      return user;
    } else {
      return null;
    }
  } else {
    // 4. In case of either email not found or password not correct --> return null
    return null;
  }
});

export default model("User", UserSchema);
