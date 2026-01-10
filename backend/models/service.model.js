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
                        alias: "subscription_id",
                },
                subscriptionStatus: {
                        type: String,
                        default: "NONE",
                        trim: true,
                        alias: "subscription_status",
                },
                subscriptionApproveUrl: {
                        type: String,
                        default: "",
                        trim: true,
                        alias: "subscription_approve_url",
                },
                subscriptionCreatedAt: {
                        type: Date,
                        default: null,
                        alias: "subscription_created_at",
                },
                trialStartAt: {
                        type: Date,
                        default: null,
                        alias: "trial_start_at",
                },
                trialEndAt: {
                        type: Date,
                        default: null,
                        alias: "trial_end_at",
                },
                canceledAt: {
                        type: Date,
                        default: null,
                        alias: "canceled_at",
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
