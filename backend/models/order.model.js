import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
        {
                productId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                        required: true,
                },
                name: {
                        type: String,
                        required: true,
                        trim: true,
                },
                price: {
                        type: Number,
                        required: true,
                        min: 0,
                },
                quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                },
                subtotal: {
                        type: Number,
                        required: true,
                        min: 0,
                },
        },
        { _id: false }
);

const OrderLogSchema = new mongoose.Schema(
        {
                action: {
                        type: String,
                        required: true,
                        trim: true,
                },
                statusBefore: {
                        type: String,
                },
                statusAfter: {
                        type: String,
                },
                reason: {
                        type: String,
                },
                changedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                },
                changedByName: {
                        type: String,
                },
                timestamp: {
                        type: Date,
                        default: Date.now,
                },
        },
        { _id: false }
);

const orderSchema = new mongoose.Schema(
        {
                items: {
                        type: [OrderItemSchema],
                        validate: {
                                validator(items) {
                                        return Array.isArray(items) && items.length > 0;
                                },
                                message: "Order must contain at least one item",
                        },
                        required: true,
                },
                subtotal: {
                        type: Number,
                        required: true,
                        min: 0,
                },
                total: {
                        type: Number,
                        required: true,
                        min: 0,
                },
                coupon: {
                        code: { type: String },
                        discountPercentage: { type: Number },
                        discountAmount: { type: Number, min: 0 },
                },
                totalDiscountAmount: {
                        type: Number,
                        default: 0,
                        min: 0,
                },
                customerName: {
                        type: String,
                        required: true,
                        trim: true,
                },
                phone: {
                        type: String,
                        required: true,
                        trim: true,
                },
                address: {
                        type: String,
                        required: true,
                        trim: true,
                },
                paymentMethod: {
                        type: String,
                        enum: ["whatsapp", "cash", "card"],
                        default: "whatsapp",
                },
                status: {
                        type: String,
                        enum: [
                                "pending",
                                "paid",
                                "paid_whatsapp",
                                "processing",
                                "shipped",
                                "delivered",
                                "cancelled",
                        ],
                        default: "paid_whatsapp",
                        index: true,
                },
                paidAt: {
                        type: Date,
                        default: Date.now,
                },
                optimisticPaid: {
                        type: Boolean,
                        default: true,
                },
                reconciliationNeeded: {
                        type: Boolean,
                        default: true,
                },
                orderNumber: {
                        type: Number,
                        unique: true,
                        index: true,
                },
                createdFrom: {
                        type: String,
                        default: "checkout_whatsapp",
                },
                canceledAt: {
                        type: Date,
                },
                canceledBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                },
                canceledByName: {
                        type: String,
                },
                log: {
                        type: [OrderLogSchema],
                        default: [],
                },
        },
        {
                timestamps: true,
        }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const BASE_ORDER_NUMBER = 10001;

orderSchema.pre("save", async function assignOrderNumber(next) {
        if (!this.isNew || this.orderNumber) {
                return next();
        }

        try {
                const lastOrder = await this.constructor
                        .findOne({ orderNumber: { $exists: true } })
                        .sort({ orderNumber: -1 })
                        .select({ orderNumber: 1 })
                        .lean();

                if (lastOrder?.orderNumber && Number.isFinite(lastOrder.orderNumber)) {
                        this.orderNumber = lastOrder.orderNumber + 1;
                } else {
                        this.orderNumber = BASE_ORDER_NUMBER;
                }

                return next();
        } catch (error) {
                return next(error);
        }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
