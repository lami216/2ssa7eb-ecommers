import ServiceCheckout from "../models/serviceCheckout.model.js";
import { capturePayPalOrder } from "../lib/paypal.js";
import { createServiceCheckoutOrder, fulfillServiceCheckout } from "../lib/serviceCheckout.js";
import { DEFAULT_CURRENCY, buildServicePackages } from "../../shared/servicePackages.js";

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");
const isValidOrderId = (value) => /^[A-Za-z0-9-]{10,40}$/.test(value);
const resolvePayPalCurrency = () => (process.env.PAYPAL_CURRENCY || DEFAULT_CURRENCY).toUpperCase();
const packages = buildServicePackages(resolvePayPalCurrency());

export const createPayPalCheckout = async (req, res) => {
        try {
                const allowDirectCheckout =
                        String(process.env.ENABLE_DIRECT_PLAN_CHECKOUT || "").toLowerCase() === "true";

                if (!allowDirectCheckout) {
                        return res.status(403).json({
                                message: "Direct plan checkout is disabled. Please use the contact request flow.",
                        });
                }

                const packageId = sanitizeText(req.body.packageId);
                const name = sanitizeText(req.body.name);
                const email = sanitizeText(req.body.email).toLowerCase();
                const whatsapp = sanitizeText(req.body.whatsapp);
                const alternateEmail = sanitizeText(req.body.alternateEmail).toLowerCase();
                const idea = sanitizeText(req.body.idea);

                if (!packageId || !name || !email) {
                        return res.status(400).json({ message: "Missing required fields" });
                }

                const frontendBase =
                        process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:5173";
                const returnUrl = `${frontendBase}/services/success`;
                const cancelUrl = `${frontendBase}/services/cancel`;

                const checkout = await createServiceCheckoutOrder({
                        packageId,
                        name,
                        email,
                        whatsapp,
                        alternateEmail,
                        idea,
                        returnUrl,
                        cancelUrl,
                });

                return res.json({
                        orderId: checkout.orderId,
                        approveUrl: checkout.approveUrl,
                });
        } catch (error) {
                console.log("Error creating PayPal checkout", error.message);
                if (error.message === "Invalid package") {
                        return res.status(400).json({ message: "Invalid package" });
                }
                return res.status(500).json({ message: "Unable to create PayPal checkout" });
        }
};

export const capturePayPalCheckout = async (req, res) => {
        try {
                const orderId = sanitizeText(req.body.orderId || req.query.orderId);

                if (!orderId || !isValidOrderId(orderId)) {
                        return res.status(400).json({ message: "Invalid order id" });
                }

                const checkout = await ServiceCheckout.findOne({ orderId });

                if (!checkout) {
                        return res.status(404).json({ message: "Checkout not found" });
                }

                if (checkout.status === "captured") {
                        return res.json({
                                serviceAlreadyCreated: true,
                                contact: {
                                        email: checkout.email,
                                        whatsapp: checkout.whatsapp,
                                },
                        });
                }

                const captureResult = await capturePayPalOrder(orderId);
                const captureStatus = captureResult?.status;

                if (captureStatus !== "COMPLETED") {
                        return res.status(400).json({ message: "Payment not completed" });
                }

                const captureId =
                        captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;
                const response = await fulfillServiceCheckout({ checkout, captureId });

                return res.json(response);
        } catch (error) {
                console.log("Error capturing PayPal checkout", error.message);
                return res.status(500).json({ message: "Unable to capture PayPal payment" });
        }
};

export const listPackages = async (_req, res) => {
        return res.json(packages);
};
