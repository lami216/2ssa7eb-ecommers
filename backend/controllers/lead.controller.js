import mongoose from "mongoose";
import Lead from "../models/lead.model.js";

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");
const sanitizeEmail = (value) => sanitizeText(value).toLowerCase();

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
                return Lead.findOne({
                        contactFeePaid: true,
                        $or: [{ userId: user._id }, { email: normalizedEmail }],
                }).sort({ createdAt: -1 });
        }
        if (normalizedEmail) {
                return Lead.findOne({ contactFeePaid: true, email: normalizedEmail }).sort({ createdAt: -1 });
        }
        return null;
};

const syncContactFeeUnlock = async (lead, user) => {
        if (!lead) {
                return null;
        }

        if (lead.contactFeePaid) {
                lead.whatsappUnlocked = true;
                lead.status = computeLeadStatus(lead);
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

                const lead = await Lead.create({
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

                const lead = await Lead.findOne(filter).sort({ createdAt: -1 });
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

export const adminListLeads = async (_req, res) => {
        try {
                const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
                return res.json(leads);
        } catch (error) {
                console.log("Error listing leads", error.message);
                return res.status(500).json({ message: "Unable to list leads" });
        }
};
