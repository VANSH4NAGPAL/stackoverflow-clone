import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  oauthLogin,
  watchTag,
  unwatchTag
} from "../controller/auth.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/signup", Signup);
router.post("/login", Login);
router.post("/oauth", oauthLogin);
router.get("/getalluser", getallusers);
router.patch("/update/:id", auth,updateprofile);
router.post("/watch-tag", auth, watchTag);
router.post("/unwatch-tag", auth, unwatchTag);
export default router;
