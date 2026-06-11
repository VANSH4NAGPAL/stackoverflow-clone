import express from "express";
import {
  Askquestion,
  deletequestion,
  getallquestion,
  votequestion,
  getAllTags,
} from "../controller/question.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/ask", auth, Askquestion);
router.get("/getallquestion", getallquestion);
router.delete("/delete/:id", auth, deletequestion);
router.patch("/vote/:id", auth, votequestion);
router.get("/tags/all", getAllTags);

export default router;
