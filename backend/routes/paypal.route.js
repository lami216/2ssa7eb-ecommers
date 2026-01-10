import express from "express";
import {
        completePayPalSubscription,
        handlePayPalSubscriptionReturn,
} from "../controllers/service.controller.js";

const router = express.Router();

router.get("/subscription/return", handlePayPalSubscriptionReturn);
router.get("/subscription/complete", completePayPalSubscription);

export default router;
