import { create } from "zustand";
import { toast } from "react-hot-toast";
import apiClient from "../lib/apiClient";

export const useCartStore = create((set, get) => ({
	cart: [],
	coupon: null,
	total: 0,
	subtotal: 0,
	isCouponApplied: false,

	getMyCoupon: async () => {
                try {
                        const data = await apiClient.get("/coupons");
                        set({ coupon: data });
                } catch (error) {
                        console.error("Error fetching coupon:", error);
                }
        },
        applyCoupon: async (code) => {
                try {
                        const data = await apiClient.post("/coupons/validate", { code });
                        set({ coupon: data, isCouponApplied: true });
                        get().calculateTotals();
                        toast.success("Coupon applied successfully");
                } catch (error) {
                        toast.error(error.response?.data?.message || "Failed to apply coupon");
                }
        },
	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	getCartItems: async () => {
                try {
                        const data = await apiClient.get("/cart");
                        set({ cart: data });
                        get().calculateTotals();
                } catch (error) {
                        set({ cart: [] });
                        toast.error(error.response?.data?.message || "An error occurred");
                }
        },
	clearCart: async () => {
		set({ cart: [], coupon: null, total: 0, subtotal: 0 });
	},
	addToCart: async (product) => {
                try {
                        await apiClient.post("/cart", { productId: product._id });
                        toast.success("Product added to cart");

			set((prevState) => {
				const existingItem = prevState.cart.find((item) => item._id === product._id);
				const newCart = existingItem
					? prevState.cart.map((item) =>
							item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
					  )
					: [...prevState.cart, { ...product, quantity: 1 }];
				return { cart: newCart };
			});
			get().calculateTotals();
                } catch (error) {
                        toast.error(error.response?.data?.message || "An error occurred");
                }
	},
	removeFromCart: async (productId) => {
                try {
                        await apiClient.delete(`/cart`, { body: { productId } });
                        set((prevState) => ({ cart: prevState.cart.filter((item) => item._id !== productId) }));
                        get().calculateTotals();
                } catch (error) {
                        toast.error(error.response?.data?.message || "Failed to remove item");
                }
        },
        updateQuantity: async (productId, quantity) => {
                if (quantity === 0) {
                        get().removeFromCart(productId);
                        return;
                }

                try {
                        await apiClient.put(`/cart/${productId}`, { quantity });
                        set((prevState) => ({
                                cart: prevState.cart.map((item) =>
                                        item._id === productId ? { ...item, quantity } : item
                                ),
                        }));
                        get().calculateTotals();
                } catch (error) {
                        toast.error(error.response?.data?.message || "Failed to update quantity");
                }
        },
	calculateTotals: () => {
		const { cart, coupon } = get();
		const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		let total = subtotal;

		if (coupon) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal - discount;
		}

		set({ subtotal, total });
	},
}));
