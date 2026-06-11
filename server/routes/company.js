import express from "express";
import { getCompanies, addCompany } from "../controller/company.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/all", getCompanies);
router.post("/add", auth, addCompany);

export default router;
