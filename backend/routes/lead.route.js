import express from "express";
import {
        captureContactFee,
        capturePlanPayment,
        createContactFeeOrder,
        createLead,
        createPlanOrder,
        getMyLeads,
} from "../controllers/lead.controller.js";
import { optionalAuth, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", optionalAuth, createLead);
router.get("/me", protectRoute, getMyLeads);
router.post("/:id/pay-contact-fee/create-order", optionalAuth, createContactFeeOrder);
router.post("/:id/pay-contact-fee/capture", optionalAuth, captureContactFee);
router.post("/:id/pay-plan/create-order", protectRoute, createPlanOrder);
router.post("/:id/pay-plan/capture", protectRoute, capturePlanPayment);

export default router;
