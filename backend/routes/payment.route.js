import express from "express";
import { capturePayPalCheckout, createPayPalCheckout, listPackages } from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/packages", listPackages);
router.post("/paypal/create-order", createPayPalCheckout);
router.post("/paypal/capture", capturePayPalCheckout);

export default router;
