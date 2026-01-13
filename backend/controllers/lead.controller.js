import mongoose from "mongoose";
import Lead from "../models/lead.model.js";
import ServiceCheckout from "../models/serviceCheckout.model.js";
import { capturePayPalOrder, createPayPalOrder } from "../lib/paypal.js";
import { createServiceCheckoutOrder, fulfillServiceCheckout } from "./payment.controller.js";
import { SERVICE_PACKAGES } from "../../shared/servicePackages.js";

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");
const sanitizeEmail = (value) => sanitizeText(value).toLowerCase();
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const PLAN_LABELS = {
        starter: "Basic",
        growth: "Pro",
        full: "Plus",
        Basic: "Basic",
        Pro: "Pro",
        Plus: "Plus",
};

const PLAN_TO_PACKAGE_ID = {
        Basic: "starter",
        Pro: "growth",
        Plus: "full",
};

const resolvePlanLabel = (value) => PLAN_LABELS[sanitizeText(value)] || "";
const resolvePackageIdFromPlan = (planLabel) => PLAN_TO_PACKAGE_ID[planLabel] || "";
const resolvePackageById = (packageId) => SERVICE_PACKAGES.find((pkg) => pkg.id === packageId);

const resolveFrontendBaseUrl = () =>
        process.env.FRONTEND_URL ||
        process.env.CLIENT_URL ||
        process.env.APP_URL ||
        "http://localhost:5173";

const resolveContactFeeAmount = () => {
        const envAmount = Number(process.env.CONTACT_FEE_AMOUNT || 5);
        if (!Number.isFinite(envAmount) || envAmount <= 0) {
                return 5;
        }
        return envAmount;
};

const computeLeadStatus = (lead) => {
        if (lead.planPaid) {
                return "PLAN_PAID";
        }
        if (lead.checkoutEnabled) {
                return "CHECKOUT_ENABLED";
        }
        if (lead.contactFeePaid) {
                return "CONTACT_FEE_PAID";
        }
        return "NEW";
};

const assertLeadOwnership = (lead, user) => {
        if (!lead || !lead.userId || !user) {
                return true;
        }
        return lead.userId.toString() === user._id.toString();
};

export const createLead = async (req, res) => {
        try {
                const fullName = sanitizeText(req.body.fullName || req.body.name);
                const email = sanitizeEmail(req.body.email || req.user?.email);
                const selectedPlanInput = sanitizeText(req.body.selectedPlan || req.body.packageId);
                const idea = sanitizeText(req.body.idea);

                if (!fullName || !email || !selectedPlanInput) {
                        return res.status(400).json({ message: "Missing required fields" });
                }

                const selectedPlan = resolvePlanLabel(selectedPlanInput);
                if (!selectedPlan) {
                        return res.status(400).json({ message: "Invalid plan selection" });
                }

                const lead = await Lead.create({
                        userId: req.user?._id || null,
                        fullName,
                        email,
                        selectedPlan,
                        idea,
                        contactFeeAmount: resolveContactFeeAmount(),
                        status: "NEW",
                });

                return res.status(201).json(lead);
        } catch (error) {
                console.log("Error creating lead", error.message);
                return res.status(500).json({ message: "Unable to create lead" });
        }
};

export const getMyLeads = async (req, res) => {
        try {
                const user = req.user;
                if (!user) {
                        return res.status(401).json({ message: "Unauthorized" });
                }

                const email = sanitizeEmail(user.email);
                const filter = user?._id
                        ? { $or: [{ userId: user._id }, { email }] }
                        : { email };

                const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();
                return res.json(leads);
        } catch (error) {
                console.log("Error fetching leads", error.message);
                return res.status(500).json({ message: "Unable to fetch leads" });
        }
};

export const createContactFeeOrder = async (req, res) => {
        try {
                const leadId = sanitizeText(req.params.id);

                if (!isValidObjectId(leadId)) {
                        return res.status(400).json({ message: "Invalid lead id" });
                }

                const lead = await Lead.findById(leadId);
                if (!lead) {
                        return res.status(404).json({ message: "Lead not found" });
                }

                if (!assertLeadOwnership(lead, req.user)) {
                        return res.status(403).json({ message: "Not authorized to access this lead" });
                }

                if (lead.contactFeePaid) {
                        return res.status(400).json({ message: "Contact fee already paid" });
                }

                const frontendBase = resolveFrontendBaseUrl();
                const returnUrl = `${frontendBase}/contact/success?leadId=${lead._id}`;
                const cancelUrl = `${frontendBase}/contact/cancel?leadId=${lead._id}`;

                const paypalOrder = await createPayPalOrder({
                        amount: lead.contactFeeAmount.toFixed(2),
                        currency: (process.env.PAYPAL_CURRENCY || "USD").toUpperCase(),
                        returnUrl,
                        cancelUrl,
                        description: "Contact fee",
                        referenceId: `contact-${lead._id}`,
                });

                const approveLink = paypalOrder?.links?.find((link) => link.rel === "approve");

                if (!approveLink?.href) {
                        return res.status(500).json({ message: "Failed to create PayPal approval link" });
                }

                lead.contactFeePaypalOrderId = paypalOrder.id;
                await lead.save();

                return res.json({
                        orderId: paypalOrder.id,
                        approveUrl: approveLink.href,
                });
        } catch (error) {
                console.log("Error creating contact fee order", error.message);
                return res.status(500).json({ message: "Unable to create contact fee order" });
        }
};

export const captureContactFee = async (req, res) => {
        try {
                const leadId = sanitizeText(req.params.id);
                const orderId = sanitizeText(req.body.orderId || req.query.orderId);

                if (!isValidObjectId(leadId)) {
                        return res.status(400).json({ message: "Invalid lead id" });
                }

                if (!orderId) {
                        return res.status(400).json({ message: "Invalid order id" });
                }

                const lead = await Lead.findById(leadId);
                if (!lead) {
                        return res.status(404).json({ message: "Lead not found" });
                }

                if (!assertLeadOwnership(lead, req.user)) {
                        return res.status(403).json({ message: "Not authorized to access this lead" });
                }

                if (lead.contactFeePaid) {
                        return res.json(lead);
                }

                if (lead.contactFeePaypalOrderId && lead.contactFeePaypalOrderId !== orderId) {
                        return res.status(400).json({ message: "Order mismatch for contact fee" });
                }

                const captureResult = await capturePayPalOrder(orderId);
                const captureStatus = captureResult?.status;
                if (captureStatus !== "COMPLETED") {
                        return res.status(400).json({ message: "Payment not completed" });
                }

                const captureId =
                        captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;

                lead.contactFeePaid = true;
                lead.contactFeePaidAt = new Date();
                lead.contactFeeTransactionId = captureId;
                lead.whatsappUnlocked = true;
                lead.status = computeLeadStatus(lead);
                await lead.save();

                return res.json(lead);
        } catch (error) {
                console.log("Error capturing contact fee", error.message);
                return res.status(500).json({ message: "Unable to capture contact fee" });
        }
};

export const createPlanOrder = async (req, res) => {
        try {
                const leadId = sanitizeText(req.params.id);

                if (!isValidObjectId(leadId)) {
                        return res.status(400).json({ message: "Invalid lead id" });
                }

                const lead = await Lead.findById(leadId);
                if (!lead) {
                        return res.status(404).json({ message: "Lead not found" });
                }

                if (!assertLeadOwnership(lead, req.user)) {
                        return res.status(403).json({ message: "Not authorized to access this lead" });
                }

                if (!lead.contactFeePaid) {
                        return res.status(400).json({ message: "Contact fee not paid" });
                }

                if (!lead.checkoutEnabled) {
                        return res.status(400).json({ message: "Checkout not enabled for this lead" });
                }

                if (lead.planPaid) {
                        return res.status(400).json({ message: "Plan already paid" });
                }

                const finalPrice = Number(lead.finalPrice);
                if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
                        return res.status(400).json({ message: "Invalid final price for plan" });
                }

                const agreedPlan = lead.agreedPlan || lead.selectedPlan;
                const packageId = resolvePackageIdFromPlan(agreedPlan);
                const selectedPackage = resolvePackageById(packageId);

                if (!selectedPackage) {
                        return res.status(400).json({ message: "Invalid plan configuration" });
                }

                const frontendBase = resolveFrontendBaseUrl();
                const returnUrl = `${frontendBase}/contact/plan/success?leadId=${lead._id}`;
                const cancelUrl = `${frontendBase}/contact/plan/cancel?leadId=${lead._id}`;

                const checkout = await createServiceCheckoutOrder({
                        packageId,
                        name: lead.fullName,
                        email: lead.email,
                        idea: lead.idea,
                        amount: finalPrice,
                        returnUrl,
                        cancelUrl,
                });

                lead.planPaypalOrderId = checkout.orderId;
                await lead.save();

                return res.json({
                        orderId: checkout.orderId,
                        approveUrl: checkout.approveUrl,
                });
        } catch (error) {
                console.log("Error creating plan order", error.message);
                if (error.message === "Invalid package") {
                        return res.status(400).json({ message: "Invalid plan configuration" });
                }
                return res.status(500).json({ message: "Unable to create plan order" });
        }
};

export const capturePlanPayment = async (req, res) => {
        try {
                const leadId = sanitizeText(req.params.id);
                const orderId = sanitizeText(req.body.orderId || req.query.orderId);

                if (!isValidObjectId(leadId)) {
                        return res.status(400).json({ message: "Invalid lead id" });
                }

                if (!orderId) {
                        return res.status(400).json({ message: "Invalid order id" });
                }

                const lead = await Lead.findById(leadId);
                if (!lead) {
                        return res.status(404).json({ message: "Lead not found" });
                }

                if (!assertLeadOwnership(lead, req.user)) {
                        return res.status(403).json({ message: "Not authorized to access this lead" });
                }

                if (lead.planPaid) {
                        return res.json(lead);
                }

                if (!lead.contactFeePaid) {
                        return res.status(400).json({ message: "Contact fee not paid" });
                }

                if (!lead.checkoutEnabled) {
                        return res.status(400).json({ message: "Checkout not enabled for this lead" });
                }

                if (lead.planPaypalOrderId && lead.planPaypalOrderId !== orderId) {
                        return res.status(400).json({ message: "Order mismatch for plan payment" });
                }

                const checkout = await ServiceCheckout.findOne({ orderId });
                if (!checkout) {
                        return res.status(404).json({ message: "Checkout not found" });
                }

                if (checkout.status === "captured") {
                        lead.planPaid = true;
                        lead.planPaidAt = lead.planPaidAt || new Date();
                        lead.status = computeLeadStatus(lead);
                        await lead.save();
                        return res.json(lead);
                }

                const captureResult = await capturePayPalOrder(orderId);
                const captureStatus = captureResult?.status;
                if (captureStatus !== "COMPLETED") {
                        return res.status(400).json({ message: "Payment not completed" });
                }

                const captureId =
                        captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;

                lead.planPaid = true;
                lead.planPaidAt = new Date();
                lead.planTransactionId = captureId;
                lead.status = computeLeadStatus(lead);
                await lead.save();

                const serviceResult = await fulfillServiceCheckout({ checkout, captureId });

                return res.json({
                        lead,
                        serviceId: serviceResult.serviceId,
                });
        } catch (error) {
                console.log("Error capturing plan payment", error.message);
                return res.status(500).json({ message: "Unable to capture plan payment" });
        }
};

export const adminListLeads = async (_req, res) => {
        try {
                const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
                return res.json(leads);
        } catch (error) {
                console.log("Error listing leads", error.message);
                return res.status(500).json({ message: "Unable to list leads" });
        }
};

export const adminEnableCheckout = async (req, res) => {
        try {
                const leadId = sanitizeText(req.params.id);
                const agreedPlanInput = sanitizeText(req.body.agreedPlan);
                const discountAmount = Number(req.body.discountAmount || 0);

                if (!isValidObjectId(leadId)) {
                        return res.status(400).json({ message: "Invalid lead id" });
                }

                const lead = await Lead.findById(leadId);
                if (!lead) {
                        return res.status(404).json({ message: "Lead not found" });
                }

                if (!lead.contactFeePaid) {
                        return res.status(400).json({ message: "Contact fee not paid" });
                }

                const agreedPlan = resolvePlanLabel(agreedPlanInput || lead.selectedPlan);
                if (!agreedPlan) {
                        return res.status(400).json({ message: "Invalid agreed plan" });
                }

                const packageId = resolvePackageIdFromPlan(agreedPlan);
                const selectedPackage = resolvePackageById(packageId);
                if (!selectedPackage) {
                        return res.status(400).json({ message: "Invalid agreed plan" });
                }

                const safeDiscount = Number.isFinite(discountAmount) ? discountAmount : 0;
                const planBasePrice = Number(selectedPackage.oneTimePrice);
                const finalPrice = Math.max(planBasePrice - safeDiscount, 0);

                lead.checkoutEnabled = true;
                lead.enabledAt = new Date();
                lead.enabledBy = req.user?._id || null;
                lead.agreedPlan = agreedPlan;
                lead.planBasePrice = planBasePrice;
                lead.discountAmount = safeDiscount;
                lead.finalPrice = finalPrice;
                lead.status = computeLeadStatus(lead);
                await lead.save();

                return res.json(lead);
        } catch (error) {
                console.log("Error enabling checkout", error.message);
                return res.status(500).json({ message: "Unable to enable checkout" });
        }
};
