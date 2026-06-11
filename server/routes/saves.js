import express from "express";
import { toggleSave, getSavedQuestions } from "../controller/saves.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/toggle", auth, toggleSave);
router.get("/all", auth, getSavedQuestions);

export default router;
