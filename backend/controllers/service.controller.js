import mongoose from "mongoose";
import Service from "../models/service.model.js";
import {
        cancelPayPalSubscription,
        createPayPalSubscription,
        getPayPalSubscriptionDetails,
} from "../lib/paypal.js";

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");

export const getMyServices = async (req, res) => {
        try {
                const email = req.user?.email?.toLowerCase();

                if (!email) {
                        return res.status(400).json({ message: "Email not found" });
                }

                const services = await Service.find({ email }).sort({ createdAt: -1 }).lean();

                return res.json(services);
        } catch (error) {
                console.log("Error fetching services", error.message);
                return res.status(500).json({ message: "Unable to fetch services" });
        }
};

export const adminListServices = async (req, res) => {
        try {
                const email = sanitizeText(req.query.email).toLowerCase();
                const filter = email ? { email } : {};
                const services = await Service.find(filter).sort({ createdAt: -1 }).lean();
                return res.json(services);
        } catch (error) {
                console.log("Error fetching admin services", error.message);
                return res.status(500).json({ message: "Unable to fetch services" });
        }
};

export const updateService = async (req, res) => {
        try {
                const serviceId = req.params.id;
                const status = sanitizeText(req.body.status);
                const subscriptionId = sanitizeText(req.body.subscriptionId);

                const updates = {};
                if (status) {
                        updates.status = status;
                }
                if (subscriptionId !== "") {
                        updates.subscriptionId = subscriptionId;
                }

                const service = await Service.findByIdAndUpdate(serviceId, updates, { new: true });

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                return res.json(service);
        } catch (error) {
                console.log("Error updating service", error.message);
                return res.status(500).json({ message: "Unable to update service" });
        }
};

export const activateTrial = async (req, res) => {
        try {
                const service = await Service.findByIdAndUpdate(
                        req.params.id,
                        { status: "Trialing", trialStartAt: new Date() },
                        { new: true }
                );

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                return res.json(service);
        } catch (error) {
                console.log("Error activating trial", error.message);
                return res.status(500).json({ message: "Unable to activate trial" });
        }
};

export const suspendService = async (req, res) => {
        try {
                const service = await Service.findByIdAndUpdate(
                        req.params.id,
                        { status: "Suspended" },
                        { new: true }
                );

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                return res.json(service);
        } catch (error) {
                console.log("Error suspending service", error.message);
                return res.status(500).json({ message: "Unable to suspend service" });
        }
};

export const cancelService = async (req, res) => {
        try {
                const service = await Service.findByIdAndUpdate(
                        req.params.id,
                        { status: "Canceled" },
                        { new: true }
                );

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                return res.json(service);
        } catch (error) {
                console.log("Error canceling service", error.message);
                return res.status(500).json({ message: "Unable to cancel service" });
        }
};

const resolveFrontendBaseUrl = () =>
        process.env.FRONTEND_URL ||
        process.env.CLIENT_URL ||
        process.env.APP_URL ||
        "http://localhost:5173";

const resolveSubscriptionPlanId = () => process.env.PAYPAL_PLAN_BASIC || "";

const resolveServiceForSubscription = async ({ subscription, fallbackSubscriptionId }) => {
        const customId = sanitizeText(subscription?.custom_id);
        if (customId && mongoose.Types.ObjectId.isValid(customId)) {
                const serviceByCustomId = await Service.findById(customId);
                if (serviceByCustomId) {
                        return serviceByCustomId;
                }
        }

        const lookupId = sanitizeText(subscription?.id || fallbackSubscriptionId);
        if (!lookupId) {
                return null;
        }
        return Service.findOne({ subscriptionId: lookupId });
};

const applySubscriptionStatusUpdate = ({ service, subscription }) => {
        const status = sanitizeText(subscription?.status);
        const now = new Date();
        const updates = {
                subscriptionId: subscription?.id || service.subscriptionId,
                subscriptionStatus: status === "ACTIVE" ? "ACTIVE" : "APPROVAL_PENDING",
                subscriptionApproveUrl: "",
        };

        if (status === "ACTIVE") {
                updates.trialStartAt = now;
                updates.trialEndAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                updates.status = "Trialing";
        }

        return updates;
};

export const createServiceSubscription = async (req, res) => {
        try {
                const serviceId = req.params.id;
                const service = await Service.findById(serviceId);

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                const planId = resolveSubscriptionPlanId();

                if (!planId) {
                        return res.status(400).json({ message: "Missing PAYPAL_PLAN_BASIC configuration" });
                }

                const frontendBase = resolveFrontendBaseUrl();
                const serviceParam = encodeURIComponent(service._id.toString());
                const returnUrl = `${frontendBase}/subscription/success?serviceId=${serviceParam}`;
                const cancelUrl = `${frontendBase}/subscription/cancel?serviceId=${serviceParam}`;

                const subscription = await createPayPalSubscription({
                        planId,
                        returnUrl,
                        cancelUrl,
                        trialDays: 30,
                        customId: service._id.toString(),
                });

                const approveLink = subscription?.links?.find((link) => link.rel === "approve");

                if (!approveLink?.href || !subscription?.id) {
                        return res.status(500).json({ message: "Failed to create PayPal subscription approval link" });
                }

                service.subscriptionId = subscription.id;
                service.subscriptionStatus = "APPROVAL_PENDING";
                service.subscriptionApproveUrl = approveLink.href;
                service.subscriptionCreatedAt = new Date();
                await service.save();

                return res.json({
                        service,
                        approve_url: approveLink.href,
                });
        } catch (error) {
                console.log("Error creating PayPal subscription", error.message);
                return res.status(500).json({ message: "Unable to create PayPal subscription" });
        }
};

export const markSubscriptionTrialStarted = async (req, res) => {
        try {
                const serviceId = req.params.id;
                const force = Boolean(req.body.force);
                const service = await Service.findById(serviceId);

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                if (service.subscriptionStatus !== "ACTIVE" && !force) {
                        return res.status(400).json({
                                message: "Subscription is not active yet",
                        });
                }

                service.status = "Trialing";
                service.trialStartAt = new Date();
                await service.save();

                return res.json(service);
        } catch (error) {
                console.log("Error marking subscription trial", error.message);
                return res.status(500).json({ message: "Unable to start trial" });
        }
};

export const handlePayPalSubscriptionReturn = async (req, res) => {
        try {
                const subscriptionId = sanitizeText(req.query.subscription_id || req.query.token);
                const frontendBase = resolveFrontendBaseUrl();

                if (!subscriptionId) {
                        return res.redirect(`${frontendBase}/subscription/cancel`);
                }

                const subscription = await getPayPalSubscriptionDetails(subscriptionId);
                const service = await resolveServiceForSubscription({
                        subscription,
                        fallbackSubscriptionId: subscriptionId,
                });

                if (!service) {
                        return res.redirect(`${frontendBase}/subscription/cancel`);
                }

                const updates = applySubscriptionStatusUpdate({ service, subscription });
                await Service.findByIdAndUpdate(service._id, updates, { new: true });

                return res.redirect(
                        `${frontendBase}${updates.subscriptionStatus === "ACTIVE" ? "/subscription/success" : "/subscription/cancel"}`
                );
        } catch (error) {
                console.log("Error handling PayPal subscription return", error.message);
                const frontendBase = resolveFrontendBaseUrl();
                return res.redirect(`${frontendBase}/subscription/cancel`);
        }
};

export const startServiceSubscription = async (req, res) => {
        try {
                const email = req.user?.email?.toLowerCase();
                const serviceId = String(req.params.id || "").trim();

                if (!email) {
                        return res.status(400).json({ message: "Email not found" });
                }

                if (!mongoose.Types.ObjectId.isValid(serviceId)) {
                        return res.status(400).json({ message: "Invalid service id" });
                }

                const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
                const service = await Service.findOne({ _id: serviceObjectId, email });

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                if (service.subscriptionStatus === "ACTIVE" || service.subscriptionStatus === "TRIALING") {
                        return res.status(400).json({ message: "الاشتراك مفعل بالفعل" });
                }

                const pendingStatuses = ["NONE", "PENDING", "APPROVAL_PENDING", ""];
                if (!pendingStatuses.includes(service.subscriptionStatus || "")) {
                        return res.status(400).json({ message: "لا يمكن تفعيل الاشتراك في الحالة الحالية" });
                }

                if (service.subscriptionStatus === "APPROVAL_PENDING" && service.subscriptionApproveUrl) {
                        return res.json({ approve_url: service.subscriptionApproveUrl });
                }

                const planId = resolveSubscriptionPlanId();

                if (!planId) {
                        return res.status(400).json({ message: "Missing PAYPAL_PLAN_BASIC configuration" });
                }

                const frontendBase = resolveFrontendBaseUrl();
                const serviceParam = encodeURIComponent(service._id.toString());
                const returnUrl = `${frontendBase}/subscription/success?serviceId=${serviceParam}`;
                const cancelUrl = `${frontendBase}/subscription/cancel?serviceId=${serviceParam}`;

                const subscription = await createPayPalSubscription({
                        planId,
                        returnUrl,
                        cancelUrl,
                        trialDays: 30,
                        customId: service._id.toString(),
                });

                const approveLink = subscription?.links?.find((link) => link.rel === "approve");

                if (!approveLink?.href || !subscription?.id) {
                        return res.status(500).json({ message: "Failed to create PayPal subscription approval link" });
                }

                service.subscriptionId = subscription.id;
                service.subscriptionStatus = "APPROVAL_PENDING";
                service.subscriptionApproveUrl = approveLink.href;
                service.subscriptionCreatedAt = new Date();
                await service.save();

                return res.json({ approve_url: approveLink.href });
        } catch (error) {
                console.log("Error starting PayPal subscription", error.message);
                return res.status(500).json({ message: "Unable to create PayPal subscription" });
        }
};

export const completePayPalSubscription = async (req, res) => {
        const frontendBase = resolveFrontendBaseUrl();
        try {
                const serviceId = sanitizeText(req.query.serviceId);
                const token = sanitizeText(req.query.subscription_id || req.query.token || req.query.ba_token);
                const wasCanceled = String(req.query.canceled || "").toLowerCase() === "1";

                if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
                        return res.redirect(`${frontendBase}/my-services?success=0`);
                }

                const service = await Service.findById(serviceId);

                if (!service) {
                        return res.redirect(`${frontendBase}/my-services?success=0`);
                }

                if (!token) {
                        const redirectParam = wasCanceled ? "subCanceled=1" : "pending=1";
                        return res.redirect(`${frontendBase}/my-services?${redirectParam}`);
                }

                const subscription = await getPayPalSubscriptionDetails(token);

                const updates = applySubscriptionStatusUpdate({ service, subscription });
                await Service.findByIdAndUpdate(service._id, updates, { new: true });

                if (updates.subscriptionStatus === "ACTIVE") {
                        return res.redirect(`${frontendBase}/my-services?success=1`);
                }

                const pendingParam = wasCanceled ? "subCanceled=1" : "pending=1";
                return res.redirect(`${frontendBase}/my-services?${pendingParam}`);
        } catch (error) {
                console.log("Error completing PayPal subscription", error.message);
                return res.redirect(`${frontendBase}/my-services?success=0`);
        }
};

export const cancelServiceSubscription = async (req, res) => {
        try {
                const email = req.user?.email?.toLowerCase();
                const serviceId = String(req.params.id || "").trim();

                if (!email) {
                        return res.status(400).json({ message: "Email not found" });
                }

                if (!mongoose.Types.ObjectId.isValid(serviceId)) {
                        return res.status(400).json({ message: "Invalid service id" });
                }

                const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
                const service = await Service.findOne({ _id: serviceObjectId, email });

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                if (!service.subscriptionId) {
                        return res.status(400).json({ message: "لا يوجد اشتراك لإلغائه" });
                }

                await cancelPayPalSubscription(service.subscriptionId);

                service.subscriptionStatus = "CANCELED";
                service.canceledAt = new Date();
                service.status = "Canceled";
                await service.save();

                return res.json(service);
        } catch (error) {
                console.log("Error canceling PayPal subscription", error.message);
                return res.status(500).json({ message: "Unable to cancel subscription" });
        }
};
