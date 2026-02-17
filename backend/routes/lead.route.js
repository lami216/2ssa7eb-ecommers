import express from "express";
import { createLead, getMyLeads } from "../controllers/lead.controller.js";
import { optionalAuth, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", optionalAuth, createLead);
router.get("/me", protectRoute, getMyLeads);

export default router;
