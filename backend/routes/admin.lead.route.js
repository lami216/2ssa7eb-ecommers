import express from "express";
import { adminListLeads } from "../controllers/lead.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/leads", protectRoute, adminRoute, adminListLeads);

export default router;
