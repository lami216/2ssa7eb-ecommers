import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
        activateTrial,
        adminListServices,
        cancelService,
        getMyServices,
        suspendService,
        updateService,
} from "../controllers/service.controller.js";

const router = express.Router();

router.get("/me", protectRoute, getMyServices);

router.get("/admin", protectRoute, adminRoute, adminListServices);
router.patch("/:id", protectRoute, adminRoute, updateService);
router.post("/:id/activate-trial", protectRoute, adminRoute, activateTrial);
router.post("/:id/suspend", protectRoute, adminRoute, suspendService);
router.post("/:id/cancel", protectRoute, adminRoute, cancelService);

export default router;
