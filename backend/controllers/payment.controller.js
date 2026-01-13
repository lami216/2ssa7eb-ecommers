import Service from "../models/service.model.js";
import ServiceCheckout from "../models/serviceCheckout.model.js";
import ContactRequest from "../models/contactRequest.model.js";
import { capturePayPalOrder, createPayPalOrder } from "../lib/paypal.js";
import {
        isServiceRequestEmailConfigured,
        sendServiceRequestEmail,
        sendTelegramNotification,
} from "../lib/notifications.js";
import { DEFAULT_CURRENCY, buildServicePackages } from "../../shared/servicePackages.js";

const resolvePayPalCurrency = () => (process.env.PAYPAL_CURRENCY || DEFAULT_CURRENCY).toUpperCase();
const PAYPAL_CURRENCY = resolvePayPalCurrency();
const packages = buildServicePackages(PAYPAL_CURRENCY);

const findPackage = (packageId) => packages.find((pkg) => pkg.id === packageId);
const formatPayPalAmount = (amount) => {
        const normalized = Number(amount);
        if (!Number.isFinite(normalized)) {
                return "0.00";
        }
        return normalized.toFixed(2);
};

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");
const isValidOrderId = (value) => /^[A-Za-z0-9-]{10,40}$/.test(value);
const CONTACT_FEE_AMOUNT = "5.00";
const CONTACT_FEE_CURRENCY = "USD";

export const createPayPalCheckout = async (req, res) => {
        try {
                const packageId = sanitizeText(req.body.packageId);
                const name = sanitizeText(req.body.name);
                const email = sanitizeText(req.body.email).toLowerCase();
                const whatsapp = sanitizeText(req.body.whatsapp);
                const alternateEmail = sanitizeText(req.body.alternateEmail).toLowerCase();
                const idea = sanitizeText(req.body.idea);

                if (!packageId || !name || !email) {
                        return res.status(400).json({ message: "Missing required fields" });
                }

                const selectedPackage = findPackage(packageId);

                if (!selectedPackage) {
                        return res.status(400).json({ message: "Invalid package" });
                }

                const frontendBase =
                        process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:5173";
                const returnUrl = `${frontendBase}/services/success`;
                const cancelUrl = `${frontendBase}/services/cancel`;

                const paypalOrder = await createPayPalOrder({
                        amount: formatPayPalAmount(selectedPackage.oneTimePrice),
                        currency: PAYPAL_CURRENCY,
                        returnUrl,
                        cancelUrl,
                        description: selectedPackage.name,
                        referenceId: selectedPackage.id,
                });

                const approveLink = paypalOrder?.links?.find((link) => link.rel === "approve");

                if (!approveLink?.href) {
                        return res.status(500).json({ message: "Failed to create PayPal approval link" });
                }

                await ServiceCheckout.create({
                        orderId: paypalOrder.id,
                        packageId: selectedPackage.id,
                        packageName: selectedPackage.name,
                        name,
                        email,
                        whatsapp,
                        alternateEmail,
                        idea,
                });

                return res.json({
                        orderId: paypalOrder.id,
                        approveUrl: approveLink.href,
                });
        } catch (error) {
                console.log("Error creating PayPal checkout", error.message);
                return res.status(500).json({ message: "Unable to create PayPal checkout" });
        }
};

const buildNotificationMessage = ({ name, email, whatsapp, idea, paymentId, packageName }) => {
        const lines = [
                `طلب جديد لخدمة Payzone`,
                `الاسم: ${name}`,
                `البريد الإلكتروني: ${email}`,
                `وسيلة التواصل (واتساب): ${whatsapp || "غير محدد"}`,
                `فكرة أو اسم الموقع: ${idea || "غير محدد"}`,
                `الباقة: ${packageName}`,
                `Payment ID: ${paymentId}`,
        ];

        return lines.join("\n");
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

                const service = await Service.create({
                        email: checkout.email,
                        domain: "",
                        packageId: checkout.packageId,
                        packageName: checkout.packageName,
                        status: "Pending",
                        paymentId: captureId,
                        provider: "paypal",
                        subscriptionId: "",
                        trialStartAt: null,
                        lastPaymentAt: new Date(),
                });

                checkout.status = "captured";
                checkout.captureId = captureId;
                await checkout.save();

                const message = buildNotificationMessage({
                        name: checkout.name,
                        email: checkout.email,
                        whatsapp: checkout.whatsapp,
                        idea: checkout.idea,
                        paymentId: captureId,
                        packageName: checkout.packageName,
                });

                try {
                        await sendTelegramNotification(message);
                } catch (notifyError) {
                        console.warn("Telegram notification failed", notifyError.message);
                }

                if (isServiceRequestEmailConfigured()) {
                        try {
                                await sendServiceRequestEmail({
                                        subject: "طلب خدمة جديد بعد دفع PayPal",
                                        text: message,
                                });
                        } catch (emailError) {
                                console.warn("Service request email failed", emailError.message);
                        }
                }

                return res.json({
                        serviceId: service._id,
                        contact: {
                                email: checkout.email,
                                whatsapp: checkout.whatsapp,
                        },
                });
        } catch (error) {
                console.log("Error capturing PayPal checkout", error.message);
                return res.status(500).json({ message: "Unable to capture PayPal payment" });
        }
};

export const listPackages = async (_req, res) => {
        return res.json(packages);
};

export const createContactFeeOrder = async (req, res) => {
        try {
                const contactRequestId = sanitizeText(req.body.contactRequestId);

                if (!contactRequestId) {
                        return res.status(400).json({ message: "Missing contact request id" });
                }

                const contactRequest = await ContactRequest.findById(contactRequestId);

                if (!contactRequest) {
                        return res.status(404).json({ message: "Contact request not found" });
                }

                if (contactRequest.paid) {
                        return res.status(400).json({ message: "Contact request already paid" });
                }

                const frontendBase =
                        process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:5173";
                const returnUrl = `${frontendBase}/payment/success?contactRequestId=${contactRequest._id}`;
                const cancelUrl = `${frontendBase}/payment/cancel?contactRequestId=${contactRequest._id}`;
                const customId = `${contactRequest._id}:${contactRequest.planId || "plan"}:${contactRequest.planName}`;

                const paypalOrder = await createPayPalOrder({
                        amount: CONTACT_FEE_AMOUNT,
                        currency: CONTACT_FEE_CURRENCY,
                        returnUrl,
                        cancelUrl,
                        description: "Contact Fee - Payzone",
                        referenceId: "contact-fee",
                        customId,
                        itemName: "Contact Fee - Payzone",
                });

                const approveLink = paypalOrder?.links?.find((link) => link.rel === "approve");

                if (!approveLink?.href) {
                        return res.status(500).json({ message: "Failed to create PayPal approval link" });
                }

                contactRequest.paypalOrderId = paypalOrder.id;
                contactRequest.paypalStatus = paypalOrder.status || "CREATED";
                await contactRequest.save();

                return res.json({
                        orderId: paypalOrder.id,
                        approveUrl: approveLink.href,
                });
        } catch (error) {
                console.log("Error creating contact fee PayPal order", error.message);
                return res.status(500).json({ message: "Unable to create PayPal order" });
        }
};

export const captureContactFeeOrder = async (req, res) => {
        try {
                const orderId = sanitizeText(req.body.orderId || req.query.orderId);
                const contactRequestId = sanitizeText(req.body.contactRequestId || req.query.contactRequestId);

                if (!orderId || !isValidOrderId(orderId)) {
                        return res.status(400).json({ message: "Invalid order id" });
                }

                if (!contactRequestId) {
                        return res.status(400).json({ message: "Missing contact request id" });
                }

                const contactRequest = await ContactRequest.findById(contactRequestId);

                if (!contactRequest) {
                        return res.status(404).json({ message: "Contact request not found" });
                }

                if (contactRequest.paid) {
                        return res.json({
                                paid: true,
                                contactRequest: {
                                        id: contactRequest._id,
                                        fullName: contactRequest.fullName,
                                        email: contactRequest.email,
                                        needDescription: contactRequest.needDescription,
                                        planId: contactRequest.planId,
                                        planName: contactRequest.planName,
                                        paypalOrderId: contactRequest.paypalOrderId,
                                },
                        });
                }

                const captureResult = await capturePayPalOrder(orderId);
                const captureStatus = captureResult?.status;

                if (captureStatus !== "COMPLETED") {
                        return res.status(400).json({ message: "Payment not completed" });
                }

                contactRequest.paid = true;
                contactRequest.paidAt = new Date();
                contactRequest.paypalOrderId = orderId;
                contactRequest.paypalStatus = captureStatus;
                contactRequest.payerEmail = captureResult?.payer?.email_address || "";
                await contactRequest.save();

                return res.json({
                        paid: true,
                        contactRequest: {
                                id: contactRequest._id,
                                fullName: contactRequest.fullName,
                                email: contactRequest.email,
                                needDescription: contactRequest.needDescription,
                                planId: contactRequest.planId,
                                planName: contactRequest.planName,
                                paypalOrderId: orderId,
                        },
                        payerEmail: contactRequest.payerEmail,
                });
        } catch (error) {
                console.log("Error capturing contact fee order", error.message);
                return res.status(500).json({ message: "Unable to capture PayPal payment" });
        }
};
