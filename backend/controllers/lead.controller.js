import mongoose from "mongoose";
import Lead from "../models/lead.model.js";
import { capturePayPalOrder } from "../lib/paypal.js";

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");
const sanitizeEmail = (value) => sanitizeText(value).toLowerCase();
const isAdminUser = (user) => {
        const adminEmails = (process.env.ADMIN_EMAILS || "")
                .split(",")
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean);
        return Boolean(user && (user.role === "admin" || adminEmails.includes((user.email || "").toLowerCase())));
};

let leadModel = Lead;
let captureOrder = capturePayPalOrder;

export const __setLeadControllerDeps = ({ LeadModel, capturePayPal }) => {
        if (LeadModel) {
                leadModel = LeadModel;
        }
        if (capturePayPal) {
                captureOrder = capturePayPal;
        }
};

const PLAN_LABELS = {
        starter: "Basic",
        growth: "Pro",
        full: "Plus",
        Basic: "Basic",
        Pro: "Pro",
        Plus: "Plus",
};

const resolvePlanLabel = (value) => PLAN_LABELS[sanitizeText(value)] || "";

const computeLeadStatus = (lead) => {
        if (lead.planPaid) {
                return "PLAN_PAID";
        }
        return "CONTACT_FEE_PAID";
};

const findPaidLeadForUser = async ({ user, email }) => {
        const normalizedEmail = sanitizeEmail(email);
        if (user?._id) {
                return leadModel
                        .findOne({
                                contactFeePaid: true,
                                $or: [{ userId: user._id }, { email: normalizedEmail }],
                        })
                        .sort({ createdAt: -1 });
        }
        if (normalizedEmail) {
                return leadModel.findOne({ contactFeePaid: true, email: normalizedEmail }).sort({ createdAt: -1 });
        }
        return null;
};

const canAccessLead = (lead, user) => {
        if (!lead || !user) {
                return false;
        }

        if (isAdminUser(user)) {
                return true;
        }

        const leadUserId = lead.userId ? String(lead.userId) : "";
        const userId = user._id ? String(user._id) : "";
        const leadEmail = sanitizeEmail(lead.email);
        const userEmail = sanitizeEmail(user.email);

        return (leadUserId && userId && leadUserId === userId) || (leadEmail && userEmail && leadEmail === userEmail);
};

const buildProviderSummary = (captureResult) => {
        const summary = {
                id: captureResult?.id,
                status: captureResult?.status,
                update_time: captureResult?.update_time,
        };
        return JSON.stringify(summary);
};

const findLeadForCapture = async (leadId) => {
        if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
                return { error: { status: 400, message: "Invalid lead id" } };
        }

        const lead = await leadModel.findById(leadId);
        if (!lead) {
                return { error: { status: 404, message: "Lead not found" } };
        }

        return { lead };
};

const validateCaptureInput = (orderId) => {
        const normalized = sanitizeText(orderId);
        if (!normalized) {
                return { error: { status: 400, message: "Invalid order id" } };
        }
        return { orderId: normalized };
};

const confirmPayPalCapture = async (orderId) => {
        try {
                const captureResult = await captureOrder(orderId);
                if (captureResult?.status !== "COMPLETED") {
                        return { error: { status: 502, message: "Payment provider capture is not completed" } };
                }
                return { captureResult };
        } catch (error) {
                return { error: { status: 502, message: "Payment provider capture failed" } };
        }
};

const syncContactFeeUnlock = async (lead, user) => {
        if (!lead) {
                return null;
        }

        if (lead.contactFeePaid) {
                lead.whatsappUnlocked = true;
                lead.status = computeLeadStatus(lead);
                await lead.save();
                return lead;
        }

        const paidLead = await findPaidLeadForUser({ user, email: lead.email || user?.email });
        if (!paidLead) {
                lead.contactFeePaid = true;
                lead.contactFeePaidAt = new Date();
        } else {
                lead.contactFeePaid = true;
                lead.contactFeePaidAt = paidLead.contactFeePaidAt || new Date();
        }

        lead.contactFeeAmount = 0;
        lead.whatsappUnlocked = true;
        lead.status = computeLeadStatus(lead);
        await lead.save();
        return lead;
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

                const lead = await leadModel.create({
                        userId: req.user?._id || null,
                        fullName,
                        email,
                        selectedPlan,
                        idea,
                        contactFeeAmount: 0,
                        contactFeePaid: true,
                        contactFeePaidAt: new Date(),
                        whatsappUnlocked: true,
                        status: "CONTACT_FEE_PAID",
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
                const filter = user?._id ? { $or: [{ userId: user._id }, { email }] } : { email };

                const lead = await leadModel.findOne(filter).sort({ createdAt: -1 });
                if (!lead) {
                        return res.json(null);
                }

                const syncedLead = await syncContactFeeUnlock(lead, user);
                const leadData = syncedLead.toObject();
                return res.json({
                        ...leadData,
                        whatsappUnlocked: true,
                });
        } catch (error) {
                console.log("Error fetching leads", error.message);
                return res.status(500).json({ message: "Unable to fetch leads" });
        }
};

export const payContactFeeCapture = async (req, res) => {
        try {
                const { lead, error: leadError } = await findLeadForCapture(req.params.leadId);
                if (leadError) {
                        return res.status(leadError.status).json({ message: leadError.message });
                }

                if (!canAccessLead(lead, req.user)) {
                        return res.status(403).json({ message: "Forbidden" });
                }

                if (lead.contactFeePaid) {
                        return res.status(409).json({ message: "Contact fee already paid" });
                }

                const { orderId, error: inputError } = validateCaptureInput(req.body?.orderId || req.query?.orderId);
                if (inputError) {
                        return res.status(inputError.status).json({ message: inputError.message });
                }

                const { captureResult, error: captureError } = await confirmPayPalCapture(orderId);
                if (captureError) {
                        return res.status(captureError.status).json({ message: captureError.message });
                }

                const captureId = captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;

                lead.contactFeePaid = true;
                lead.contactFeePaidAt = new Date();
                lead.contactFeePaypalOrderId = orderId;
                lead.contactFeeTransactionId = captureId;
                lead.contactFeeProviderSummary = buildProviderSummary(captureResult);
                lead.whatsappUnlocked = true;
                lead.status = computeLeadStatus(lead);
                await lead.save();

                return res.json(lead);
        } catch (error) {
                console.log("Error capturing contact fee", error.message);
                return res.status(500).json({ message: "Unable to capture contact fee payment" });
        }
};

export const payPlanCapture = async (req, res) => {
        try {
                const { lead, error: leadError } = await findLeadForCapture(req.params.leadId);
                if (leadError) {
                        return res.status(leadError.status).json({ message: leadError.message });
                }

                if (!canAccessLead(lead, req.user)) {
                        return res.status(403).json({ message: "Forbidden" });
                }

                if (lead.planPaid) {
                        return res.status(409).json({ message: "Plan already paid" });
                }

                const { orderId, error: inputError } = validateCaptureInput(req.body?.orderId || req.query?.orderId);
                if (inputError) {
                        return res.status(inputError.status).json({ message: inputError.message });
                }

                const { captureResult, error: captureError } = await confirmPayPalCapture(orderId);
                if (captureError) {
                        return res.status(captureError.status).json({ message: captureError.message });
                }

                const captureId = captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;

                lead.planPaid = true;
                lead.planPaidAt = new Date();
                lead.planPaypalOrderId = orderId;
                lead.planTransactionId = captureId;
                lead.planProviderSummary = buildProviderSummary(captureResult);
                lead.status = computeLeadStatus(lead);
                await lead.save();

                return res.json(lead);
        } catch (error) {
                console.log("Error capturing plan payment", error.message);
                return res.status(500).json({ message: "Unable to capture plan payment" });
        }
};

export const adminListLeads = async (_req, res) => {
        try {
                const leads = await leadModel.find({}).sort({ createdAt: -1 }).lean();
                return res.json(leads);
        } catch (error) {
                console.log("Error listing leads", error.message);
                return res.status(500).json({ message: "Unable to list leads" });
        }
};
