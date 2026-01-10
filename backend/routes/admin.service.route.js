import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
        createServiceSubscription,
        markSubscriptionTrialStarted,
} from "../controllers/service.controller.js";

const router = express.Router();

router.post("/services/:id/subscription/create", protectRoute, adminRoute, createServiceSubscription);
router.post(
        "/services/:id/subscription/trial-start",
        protectRoute,
        adminRoute,
        markSubscriptionTrialStarted
);

export default router;
