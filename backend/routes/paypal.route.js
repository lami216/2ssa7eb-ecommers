import express from "express";
import { handlePayPalSubscriptionReturn } from "../controllers/service.controller.js";

const router = express.Router();

router.get("/subscription/return", handlePayPalSubscriptionReturn);

export default router;
