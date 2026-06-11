import express from "express";
import { searchQuestions } from "../controller/search.js";

const router = express.Router();

router.get("/", searchQuestions);

export default router;
