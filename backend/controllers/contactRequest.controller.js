import ContactRequest from "../models/contactRequest.model.js";
import { DEFAULT_CURRENCY, buildServicePackages } from "../../shared/servicePackages.js";

const packages = buildServicePackages(DEFAULT_CURRENCY);
const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");

const findPackage = (planId) => packages.find((pkg) => pkg.id === planId);

export const createContactRequest = async (req, res) => {
        try {
                const fullName = sanitizeText(req.body.fullName);
                const email = sanitizeText(req.body.email).toLowerCase();
                const needDescription = sanitizeText(req.body.needDescription);
                const planId = sanitizeText(req.body.planId);

                if (!fullName || !email || !needDescription || !planId) {
                        return res.status(400).json({ message: "Missing required fields" });
                }

                const selectedPackage = findPackage(planId);

                if (!selectedPackage) {
                        return res.status(400).json({ message: "Invalid plan" });
                }

                const contactRequest = await ContactRequest.create({
                        fullName,
                        email,
                        needDescription,
                        planId,
                        planName: selectedPackage.name,
                });

                return res.json({
                        contactRequestId: contactRequest._id,
                        planName: contactRequest.planName,
                });
        } catch (error) {
                console.log("Error creating contact request", error.message);
                return res.status(500).json({ message: "Unable to create contact request" });
        }
};

export const getContactRequest = async (req, res) => {
        try {
                const contactRequest = await ContactRequest.findById(req.params.id);

                if (!contactRequest) {
                        return res.status(404).json({ message: "Contact request not found" });
                }

                return res.json({
                        id: contactRequest._id,
                        fullName: contactRequest.fullName,
                        email: contactRequest.email,
                        needDescription: contactRequest.needDescription,
                        planId: contactRequest.planId,
                        planName: contactRequest.planName,
                        paid: contactRequest.paid,
                        paidAt: contactRequest.paidAt,
                        paypalOrderId: contactRequest.paypalOrderId,
                        paypalStatus: contactRequest.paypalStatus,
                        payerEmail: contactRequest.payerEmail,
                });
        } catch (error) {
                console.log("Error fetching contact request", error.message);
                return res.status(500).json({ message: "Unable to fetch contact request" });
        }
};
