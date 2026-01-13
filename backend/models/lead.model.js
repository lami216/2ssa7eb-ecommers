import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
        {
                userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null,
                },
                fullName: {
                        type: String,
                        required: true,
                        trim: true,
                },
                email: {
                        type: String,
                        required: true,
                        lowercase: true,
                        trim: true,
                },
                selectedPlan: {
                        type: String,
                        enum: ["Basic", "Pro", "Plus"],
                        required: true,
                },
                idea: {
                        type: String,
                        default: "",
                        trim: true,
                },
                contactFeeAmount: {
                        type: Number,
                        default: 5,
                },
                contactFeePaid: {
                        type: Boolean,
                        default: false,
                },
                contactFeePaidAt: {
                        type: Date,
                        default: null,
                },
                contactFeePaypalOrderId: {
                        type: String,
                        default: "",
                        trim: true,
                },
                contactFeeTransactionId: {
                        type: String,
                        default: "",
                        trim: true,
                },
                whatsappUnlocked: {
                        type: Boolean,
                        default: false,
                },
                checkoutEnabled: {
                        type: Boolean,
                        default: false,
                },
                enabledAt: {
                        type: Date,
                        default: null,
                },
                enabledBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null,
                },
                agreedPlan: {
                        type: String,
                        enum: ["Basic", "Pro", "Plus"],
                        default: null,
                },
                planBasePrice: {
                        type: Number,
                        default: null,
                },
                discountAmount: {
                        type: Number,
                        default: 0,
                },
                finalPrice: {
                        type: Number,
                        default: null,
                },
                planPaypalOrderId: {
                        type: String,
                        default: "",
                        trim: true,
                },
                planTransactionId: {
                        type: String,
                        default: "",
                        trim: true,
                },
                planPaid: {
                        type: Boolean,
                        default: false,
                },
                planPaidAt: {
                        type: Date,
                        default: null,
                },
                status: {
                        type: String,
                        enum: ["NEW", "CONTACT_FEE_PAID", "CHECKOUT_ENABLED", "PLAN_PAID"],
                        default: "NEW",
                },
        },
        { timestamps: true }
);

leadSchema.index({ email: 1 });
leadSchema.index({ userId: 1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
