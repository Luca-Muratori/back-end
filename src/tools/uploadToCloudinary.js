import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

export const cloudinaryAvatarUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "profile_avatars",
    },
  }),
}).single("avatar");

export const cloudinaryPhotoUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "photos",
    },
  }),
}).single("photo");
