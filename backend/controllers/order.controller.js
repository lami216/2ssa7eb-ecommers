import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";

const PAID_STATUSES = ["paid", "paid_whatsapp", "delivered"];
const ORDER_STATUS_OPTIONS = [
        "pending",
        "paid",
        "paid_whatsapp",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
];

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");
const normalizePhone = (value) => (typeof value === "string" ? value.replace(/\D/g, "") : "");

const computeUnitPrice = (product) => {
        const price = Number(product.price) || 0;
        if (!product.isDiscounted) {
                return price;
        }

        const discountPercentage = Number(product.discountPercentage) || 0;
        if (discountPercentage <= 0) {
                return price;
        }

        const discountValue = price * (discountPercentage / 100);
        const discounted = price - discountValue;
        return Number(discounted.toFixed(2));
};

const mapOrderResponse = (order) => ({
        ...order,
        subtotal: Number(order.subtotal || 0),
        total: Number(order.total || 0),
});

const appendLogEntry = (order, entry) => {
        order.log.push({
                timestamp: new Date(),
                ...entry,
        });
};

export const createWhatsAppOrder = async (req, res) => {
        try {
                const items = Array.isArray(req.body?.items) ? req.body.items : [];
                const customerName = normalizeString(req.body?.customerName);
                const phone = normalizePhone(req.body?.phone);
                const address = normalizeString(req.body?.address);
                const couponCodeInput = normalizeString(req.body?.couponCode || req.body?.coupon?.code);

                if (!items.length) {
                        return res.status(400).json({ message: "Order must contain at least one item" });
                }

                if (!customerName) {
                        return res.status(400).json({ message: "Customer name is required" });
                }

                if (!phone) {
                        return res.status(400).json({ message: "Phone number is required" });
                }

                if (!address) {
                        return res.status(400).json({ message: "Address is required" });
                }

                const normalizedItems = items
                        .map((item) => {
                                const candidate = [item.productId, item._id].find((value) =>
                                        mongoose.Types.ObjectId.isValid(value)
                                );

                                if (!candidate) {
                                        return null;
                                }

                                const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

                                return {
                                        productId: candidate.toString(),
                                        quantity,
                                };
                        })
                        .filter(Boolean);

                const productIds = [...new Set(normalizedItems.map((item) => item.productId))];

                if (!productIds.length) {
                        return res.status(400).json({ message: "Invalid product list" });
                }

                const products = await Product.find({ _id: { $in: productIds } }).lean();

                if (products.length !== productIds.length) {
                        return res.status(400).json({ message: "One or more products are invalid" });
                }

                const itemsWithDetails = [];
                let subtotal = 0;

                for (const item of normalizedItems) {
                        const product = products.find(
                                (productDoc) => productDoc._id.toString() === item.productId
                        );

                        if (!product) {
                                return res.status(400).json({ message: "Unable to match product for order item" });
                        }

                        const { quantity } = item;
                        const unitPrice = computeUnitPrice(product);
                        const lineSubtotal = Number((unitPrice * quantity).toFixed(2));

                        subtotal += lineSubtotal;

                        itemsWithDetails.push({
                                productId: product._id,
                                name: product.name,
                                price: unitPrice,
                                quantity,
                                subtotal: lineSubtotal,
                        });
                }

                if (!itemsWithDetails.length) {
                        return res.status(400).json({ message: "Order items are invalid" });
                }

                subtotal = Number(subtotal.toFixed(2));

                let appliedCoupon = null;
                let total = subtotal;

                if (couponCodeInput) {
                        const coupon = await Coupon.findOne({
                                code: couponCodeInput.toUpperCase(),
                                isActive: true,
                                expiresAt: { $gt: new Date() },
                        }).lean();

                        if (!coupon) {
                                return res.status(400).json({ message: "Coupon is invalid or expired" });
                        }

                        const discountAmount = Number(((subtotal * coupon.discountPercentage) / 100).toFixed(2));
                        total = Number(Math.max(0, subtotal - discountAmount).toFixed(2));

                        appliedCoupon = {
                                code: coupon.code,
                                discountPercentage: coupon.discountPercentage,
                                discountAmount,
                        };
                } else {
                        total = subtotal;
                }

                const order = await Order.create({
                        items: itemsWithDetails,
                        subtotal,
                        total,
                        coupon: appliedCoupon,
                        customerName,
                        phone,
                        address,
                        paymentMethod: "whatsapp",
                        status: "paid_whatsapp",
                        paidAt: new Date(),
                        optimisticPaid: true,
                        reconciliationNeeded: true,
                        createdFrom: "checkout_whatsapp",
                        log: [
                                {
                                        action: "created",
                                        statusAfter: "paid_whatsapp",
                                        reason: "Order captured via WhatsApp checkout",
                                        changedByName: "checkout_whatsapp",
                                        timestamp: new Date(),
                                },
                        ],
                });

                return res.status(201).json({
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        subtotal: order.subtotal,
                        total: order.total,
                });
        } catch (error) {
                console.log("Error in createWhatsAppOrder", error);
                return res.status(500).json({ message: "Failed to create order" });
        }
};

export const listOrders = async (req, res) => {
        try {
                        const { status, search } = req.query;

                const filters = {};

                if (status && ORDER_STATUS_OPTIONS.includes(status)) {
                        filters.status = status;
                }

                if (search) {
                        const normalizedSearch = search.trim();
                        if (normalizedSearch) {
                                const orFilters = [
                                        { customerName: { $regex: normalizedSearch, $options: "i" } },
                                        { phone: { $regex: normalizedSearch.replace(/\s+/g, ""), $options: "i" } },
                                ];

                                const parsedNumber = Number(normalizedSearch);
                                if (Number.isFinite(parsedNumber)) {
                                        orFilters.push({ orderNumber: parsedNumber });
                                }

                                filters.$or = orFilters;
                        }
                }

                const orders = await Order.find(filters)
                        .sort({ createdAt: -1 })
                        .lean();

                return res.json({
                        orders: orders.map(mapOrderResponse),
                });
        } catch (error) {
                console.log("Error in listOrders", error);
                return res.status(500).json({ message: "Failed to load orders" });
        }
};

export const updateOrderStatus = async (req, res) => {
        try {
                const { id } = req.params;
                const { status, reason } = req.body || {};

                if (!ORDER_STATUS_OPTIONS.includes(status)) {
                        return res.status(400).json({ message: "Invalid status" });
                }

                if (status === "cancelled") {
                        return res.status(400).json({ message: "Use the cancel endpoint to cancel orders" });
                }

                const order = await Order.findById(id);
                if (!order) {
                        return res.status(404).json({ message: "Order not found" });
                }

                const previousStatus = order.status;
                if (previousStatus === status) {
                        return res.json({ order: mapOrderResponse(order.toObject()) });
                }

                order.status = status;

                if (PAID_STATUSES.includes(status) && !order.paidAt) {
                        order.paidAt = new Date();
                }

                if (status === "delivered") {
                        order.reconciliationNeeded = false;
                }

                appendLogEntry(order, {
                        action: "status_change",
                        statusBefore: previousStatus,
                        statusAfter: status,
                        reason: normalizeString(reason) || undefined,
                        changedBy: req.user?._id,
                        changedByName: req.user?.name,
                });

                await order.save();

                const updatedOrder = await Order.findById(order._id).lean();

                return res.json({ order: mapOrderResponse(updatedOrder) });
        } catch (error) {
                console.log("Error in updateOrderStatus", error);
                return res.status(500).json({ message: "Failed to update order status" });
        }
};

export const cancelOrder = async (req, res) => {
        try {
                const { id } = req.params;
                const { reason } = req.body || {};

                const order = await Order.findById(id);
                if (!order) {
                        return res.status(404).json({ message: "Order not found" });
                }

                if (order.status === "cancelled") {
                        return res.json({ order: mapOrderResponse(order.toObject()) });
                }

                const previousStatus = order.status;

                order.status = "cancelled";
                order.optimisticPaid = false;
                order.canceledAt = new Date();
                order.canceledBy = req.user?._id;
                order.canceledByName = req.user?.name;
                order.reconciliationNeeded = true;

                appendLogEntry(order, {
                        action: "cancelled",
                        statusBefore: previousStatus,
                        statusAfter: "cancelled",
                        reason: normalizeString(reason) || undefined,
                        changedBy: req.user?._id,
                        changedByName: req.user?.name,
                });

                await order.save();

                const updatedOrder = await Order.findById(order._id).lean();

                return res.json({ order: mapOrderResponse(updatedOrder) });
        } catch (error) {
                console.log("Error in cancelOrder", error);
                return res.status(500).json({ message: "Failed to cancel order" });
        }
};
