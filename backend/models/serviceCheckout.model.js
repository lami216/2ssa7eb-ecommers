import mongoose from "mongoose";

const serviceCheckoutSchema = new mongoose.Schema(
        {
                orderId: {
                        type: String,
                        required: true,
                        unique: true,
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
                name: {
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
                whatsapp: {
                        type: String,
                        default: "",
                        trim: true,
                },
                alternateEmail: {
                        type: String,
                        default: "",
                        lowercase: true,
                        trim: true,
                },
                idea: {
                        type: String,
                        default: "",
                        trim: true,
                },
                status: {
                        type: String,
                        enum: ["created", "captured", "canceled"],
                        default: "created",
                },
                captureId: {
                        type: String,
                        default: "",
                        trim: true,
                },
        },
        { timestamps: true }
);

serviceCheckoutSchema.index({ email: 1, createdAt: -1 });

const ServiceCheckout = mongoose.model("ServiceCheckout", serviceCheckoutSchema);

export default ServiceCheckout;
