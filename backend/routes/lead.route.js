import express from "express";
import { createLead, getMyLeads, payContactFeeCapture, payPlanCapture } from "../controllers/lead.controller.js";
import { optionalAuth, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", optionalAuth, createLead);
router.get("/me", protectRoute, getMyLeads);
router.post("/:leadId/pay-contact-fee/capture", protectRoute, payContactFeeCapture);
router.post("/:leadId/pay-plan/capture", protectRoute, payPlanCapture);

export default router;
