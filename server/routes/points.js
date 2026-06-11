import express from "express";
import { getUserPoints, transferPoints, searchUsers } from "../controller/points.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/user/:id", getUserPoints);
router.get("/search", auth, searchUsers);
router.post("/transfer", auth, transferPoints);

export default router;
