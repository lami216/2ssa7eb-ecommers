import express from "express";
import {
        captureContactFeeOrder,
        capturePayPalCheckout,
        createContactFeeOrder,
        createPayPalCheckout,
        listPackages,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/packages", listPackages);
router.post("/paypal/create-order", createPayPalCheckout);
router.post("/paypal/capture", capturePayPalCheckout);
router.post("/paypal/create-contact-fee-order", createContactFeeOrder);
router.post("/paypal/capture-contact-fee-order", captureContactFeeOrder);

export default router;
