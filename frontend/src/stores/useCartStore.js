import { create } from "zustand";
import { toast } from "react-hot-toast";
import apiClient from "../lib/apiClient";
import { useUserStore } from "./useUserStore";
import { translate } from "../lib/locale";

const LOCAL_CART_KEY = "guest_cart_items";

const isBrowser = typeof window !== "undefined";

const loadCartFromStorage = () => {
        if (!isBrowser) return [];

        try {
                const storedCart = window.localStorage.getItem(LOCAL_CART_KEY);
                if (!storedCart) return [];

                const parsedCart = JSON.parse(storedCart);
                if (!Array.isArray(parsedCart)) return [];

                return parsedCart.map((item) => ({ ...item, quantity: item.quantity || 1 }));
        } catch (error) {
                console.error("Failed to load cart from storage", error);
                return [];
        }
};

const persistCartToStorage = (cart) => {
        if (!isBrowser) return;

        try {
                window.localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
        } catch (error) {
                console.error("Failed to persist cart to storage", error);
        }
};

const getAuthenticatedUser = () => useUserStore.getState().user;

export const useCartStore = create((set, get) => ({
        cart: loadCartFromStorage(),
        coupon: null,
        total: 0,
        subtotal: 0,
        isCouponApplied: false,

        initializeCart: () => {
                const localCart = loadCartFromStorage();
                set({ cart: localCart });
                get().calculateTotals();
        },

        getMyCoupon: async () => {
                const user = getAuthenticatedUser();

                if (!user) {
                        set({ coupon: null, isCouponApplied: false });
                        return;
                }

                try {
                        const data = await apiClient.get("/coupons");
                        set({ coupon: data });
                } catch (error) {
                        console.error("Error fetching coupon:", error);
                }
        },
        applyCoupon: async (code) => {
                const user = getAuthenticatedUser();

                if (!user) {
                        toast.error(translate("common.messages.loginRequiredForCoupon"));
                        return;
                }

                try {
                        const data = await apiClient.post("/coupons/validate", { code });
                        set({ coupon: data, isCouponApplied: true });
                        get().calculateTotals();
                        toast.success(translate("common.messages.couponAppliedSuccess"));
                } catch (error) {
                        toast.error(error.response?.data?.message || translate("toast.applyCouponError"));
                }
        },
        removeCoupon: () => {
                set({ coupon: null, isCouponApplied: false });
                get().calculateTotals();
                toast.success(translate("common.messages.couponRemoved"));
        },

        getCartItems: async () => {
                const user = getAuthenticatedUser();

                if (!user) {
                        const localCart = loadCartFromStorage();
                        set({ cart: localCart });
                        get().calculateTotals();
                        return;
                }

                try {
                        const data = await apiClient.get("/cart");
                        set({ cart: data });
                        persistCartToStorage(data);
                        get().calculateTotals();
                } catch (error) {
                        const fallbackCart = loadCartFromStorage();
                        set({ cart: fallbackCart });
                        toast.error(error.response?.data?.message || translate("toast.cartFetchError"));
                        get().calculateTotals();
                }
        },
        clearCart: async () => {
                const user = getAuthenticatedUser();

                persistCartToStorage([]);
                set({ cart: [], coupon: null, total: 0, subtotal: 0, isCouponApplied: false });

                if (!user) return;

                try {
                        await apiClient.delete("/cart", { body: {} });
                } catch (error) {
                        console.error("Failed to clear remote cart", error);
                }
        },
        addToCart: async (product) => {
                const user = getAuthenticatedUser();

                const updateLocalCart = () => {
                        set((prevState) => {
                                const existingItem = prevState.cart.find((item) => item._id === product._id);
                                const newCart = existingItem
                                        ? prevState.cart.map((item) =>
                                                        item._id === product._id
                                                                ? { ...item, quantity: item.quantity + 1 }
                                                                : item
                                          )
                                        : [...prevState.cart, { ...product, quantity: 1 }];

                                persistCartToStorage(newCart);
                                return { cart: newCart };
                        });
                        get().calculateTotals();
                };

                if (!user) {
                        updateLocalCart();
                        toast.success(translate("common.messages.productAddedToCart"));
                        return;
                }

                try {
                        await apiClient.post("/cart", { productId: product._id });
                        toast.success(translate("common.messages.productAddedToCart"));
                } catch (error) {
                        toast.error(error.response?.data?.message || translate("toast.addToCartError"));
                }

                updateLocalCart();
        },
        removeFromCart: async (productId) => {
                const user = getAuthenticatedUser();

                set((prevState) => {
                        const newCart = prevState.cart.filter((item) => item._id !== productId);
                        persistCartToStorage(newCart);
                        return { cart: newCart };
                });
                get().calculateTotals();

                if (!user) return;

                try {
                        await apiClient.delete(`/cart`, { body: { productId } });
                } catch (error) {
                        toast.error(error.response?.data?.message || translate("toast.removeItemError"));
                }
        },
        updateQuantity: async (productId, quantity) => {
                if (quantity === 0) {
                        get().removeFromCart(productId);
                        return;
                }

                const user = getAuthenticatedUser();

                set((prevState) => {
                        const newCart = prevState.cart.map((item) =>
                                item._id === productId ? { ...item, quantity } : item
                        );
                        persistCartToStorage(newCart);
                        return { cart: newCart };
                });
                get().calculateTotals();

                if (!user) return;

                try {
                        await apiClient.put(`/cart/${productId}`, { quantity });
                } catch (error) {
                        toast.error(error.response?.data?.message || translate("toast.updateQuantityError"));
                }
        },
        calculateTotals: () => {
                const { cart, coupon } = get();
                const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                let total = subtotal;

                if (coupon && coupon.discountPercentage) {
                        total = subtotal - subtotal * (coupon.discountPercentage / 100);
                }

                set({ subtotal, total });
        },
}));
