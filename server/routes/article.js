import express from "express";
import { createArticle, getAllArticles, getArticleById } from "../controller/article.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createArticle);
router.get("/all", getAllArticles);
router.get("/:id", getArticleById);

export default router;
