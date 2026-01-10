import Service from "../models/service.model.js";

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
