import Service from "../models/service.model.js";
import { createPayPalSubscription, getPayPalSubscriptionDetails } from "../lib/paypal.js";
import { SERVICE_PACKAGES } from "../../shared/servicePackages.js";

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

const resolveSubscriptionPlanId = (packageId) => {
        const planIds = [
                process.env.PAYPAL_PLAN_BASIC,
                process.env.PAYPAL_PLAN_PLUS,
                process.env.PAYPAL_PLAN_PRO,
        ];
        const packageIndex = SERVICE_PACKAGES.findIndex((pkg) => pkg.id === packageId);
        if (packageIndex === -1) {
                return "";
        }
        return planIds[packageIndex] || "";
};

export const createServiceSubscription = async (req, res) => {
        try {
                const serviceId = req.params.id;
                const service = await Service.findById(serviceId);

                if (!service) {
                        return res.status(404).json({ message: "Service not found" });
                }

                const planId = resolveSubscriptionPlanId(service.packageId);

                if (!planId) {
                        return res.status(400).json({ message: "Missing PayPal plan id for package" });
                }

                const frontendBase = resolveFrontendBaseUrl();
                const returnUrl = `${frontendBase}/api/paypal/subscription/return`;
                const cancelUrl = `${frontendBase}/subscription/cancel`;

                const subscription = await createPayPalSubscription({
                        planId,
                        returnUrl,
                        cancelUrl,
                        trialDays: 30,
                });

                const approveLink = subscription?.links?.find((link) => link.rel === "approve");

                if (!approveLink?.href || !subscription?.id) {
                        return res.status(500).json({ message: "Failed to create PayPal subscription approval link" });
                }

                service.subscriptionId = subscription.id;
                service.subscriptionStatus = "PendingApproval";
                service.subscriptionApproveUrl = approveLink.href;
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
                const status = subscription?.status;

                if (!status || !["ACTIVE", "APPROVAL_PENDING"].includes(status)) {
                        await Service.findOneAndUpdate(
                                { subscriptionId },
                                { subscriptionStatus: status || "UNKNOWN" },
                                { new: true }
                        );
                        return res.redirect(`${frontendBase}/subscription/cancel`);
                }

                await Service.findOneAndUpdate(
                        { subscriptionId },
                        {
                                subscriptionStatus: status,
                                subscriptionApproveUrl: "",
                        },
                        { new: true }
                );

                return res.redirect(`${frontendBase}/subscription/success`);
        } catch (error) {
                console.log("Error handling PayPal subscription return", error.message);
                const frontendBase = resolveFrontendBaseUrl();
                return res.redirect(`${frontendBase}/subscription/cancel`);
        }
};
