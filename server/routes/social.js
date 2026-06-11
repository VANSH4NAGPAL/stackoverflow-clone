import express from "express";
import multer from "multer";
import path from "path";
import { getAllPosts, createPost, likePost, addComment, sharePost, followUser } from "../controller/social.js";
import auth from "../middleware/auth.js";

const router = express.Router();

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'stackoverflow-clone-uploads',
    resource_type: 'auto',
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

router.get("/getall", getAllPosts);
router.post("/create", auth, upload.single("media"), createPost);
router.patch("/like/:id", auth, likePost);
router.post("/comment/:id", auth, addComment);
router.patch("/share/:id", sharePost);
router.patch("/follow/:id", auth, followUser);

export default router;
