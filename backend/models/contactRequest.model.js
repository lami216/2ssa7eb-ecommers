import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema(
        {
                fullName: { type: String, required: true, trim: true },
                email: { type: String, required: true, trim: true, lowercase: true },
                needDescription: { type: String, required: true, trim: true },
                planId: { type: String, default: "" },
                planName: { type: String, required: true, trim: true },
                paid: { type: Boolean, default: false },
                paidAt: { type: Date },
                paypalOrderId: { type: String, default: "" },
                paypalStatus: { type: String, default: "" },
                payerEmail: { type: String, default: "" },
        },
        { timestamps: true }
);

export default mongoose.model("ContactRequest", contactRequestSchema);
