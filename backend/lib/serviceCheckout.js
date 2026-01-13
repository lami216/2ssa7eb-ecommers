import Service from "../models/service.model.js";
import ServiceCheckout from "../models/serviceCheckout.model.js";
import { createPayPalOrder } from "./paypal.js";
import {
        isServiceRequestEmailConfigured,
        sendServiceRequestEmail,
        sendTelegramNotification,
} from "./notifications.js";
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

export const createServiceCheckoutOrder = async ({
        packageId,
        name,
        email,
        whatsapp = "",
        alternateEmail = "",
        idea = "",
        amount,
        returnUrl,
        cancelUrl,
}) => {
        const selectedPackage = findPackage(packageId);

        if (!selectedPackage) {
                throw new Error("Invalid package");
        }

        const paypalOrder = await createPayPalOrder({
                amount: formatPayPalAmount(
                        Number.isFinite(Number(amount)) ? Number(amount) : selectedPackage.oneTimePrice
                ),
                currency: PAYPAL_CURRENCY,
                returnUrl,
                cancelUrl,
                description: selectedPackage.name,
                referenceId: selectedPackage.id,
        });

        const approveLink = paypalOrder?.links?.find((link) => link.rel === "approve");

        if (!approveLink?.href) {
                throw new Error("Failed to create PayPal approval link");
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

        return {
                orderId: paypalOrder.id,
                approveUrl: approveLink.href,
                packageName: selectedPackage.name,
        };
};

export const fulfillServiceCheckout = async ({ checkout, captureId }) => {
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

        return {
                serviceId: service._id,
                contact: {
                        email: checkout.email,
                        whatsapp: checkout.whatsapp,
                },
        };
};
