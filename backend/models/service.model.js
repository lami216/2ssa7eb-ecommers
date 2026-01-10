import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
        {
                email: {
                        type: String,
                        required: true,
                        lowercase: true,
                        trim: true,
                        index: true,
                },
                domain: {
                        type: String,
                        default: "",
                        trim: true,
                },
                packageId: {
                        type: String,
                        required: true,
                        trim: true,
                },
                packageName: {
                        type: String,
                        required: true,
                        trim: true,
                },
                status: {
                        type: String,
                        enum: ["Pending", "Trialing", "Suspended", "Canceled"],
                        default: "Pending",
                },
                paymentId: {
                        type: String,
                        required: true,
                        trim: true,
                },
                provider: {
                        type: String,
                        default: "paypal",
                        trim: true,
                },
                subscriptionId: {
                        type: String,
                        default: "",
                        trim: true,
                },
                trialStartAt: {
                        type: Date,
                        default: null,
                },
                lastPaymentAt: {
                        type: Date,
                        default: null,
                },
        },
        {
                timestamps: true,
        }
);

serviceSchema.index({ email: 1, createdAt: -1 });

const Service = mongoose.model("Service", serviceSchema);

export default Service;
