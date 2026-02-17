import express from "express";
import { adminEnableCheckout, adminListLeads } from "../controllers/lead.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/leads", protectRoute, adminRoute, adminListLeads);
router.patch("/leads/:id/enable-checkout", protectRoute, adminRoute, adminEnableCheckout);

export default router;
