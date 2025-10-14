import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";

export const useProductStore = create((set) => ({
	products: [],
	loading: false,

	setProducts: (products) => set({ products }),
	createProduct: async (productData) => {
		set({ loading: true });
		try {
                        const data = await apiClient.post("/products", productData);
                        set((prevState) => ({
                                products: [...prevState.products, data],
                                loading: false,
                        }));
                } catch (error) {
                        toast.error(error.response?.data?.error || "Failed to create product");
                        set({ loading: false });
                }
        },
        fetchAllProducts: async () => {
                set({ loading: true });
                try {
                        const data = await apiClient.get("/products");
                        set({ products: data.products, loading: false });
                } catch (error) {
                        set({ error: "Failed to fetch products", loading: false });
                        toast.error(error.response?.data?.error || "Failed to fetch products");
                }
        },
        fetchProductsByCategory: async (category) => {
                set({ loading: true });
                try {
                        const data = await apiClient.get(`/products/category/${category}`);
                        set({ products: data.products, loading: false });
                } catch (error) {
                        set({ error: "Failed to fetch products", loading: false });
                        toast.error(error.response?.data?.error || "Failed to fetch products");
                }
        },
        deleteProduct: async (productId) => {
                set({ loading: true });
                try {
                        await apiClient.delete(`/products/${productId}`);
                        set((prevProducts) => ({
                                products: prevProducts.products.filter((product) => product._id !== productId),
                                loading: false,
                        }));
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.error || "Failed to delete product");
                }
        },
        toggleFeaturedProduct: async (productId) => {
                set({ loading: true });
                try {
                        const data = await apiClient.patch(`/products/${productId}`);
                        // this will update the isFeatured prop of the product
                        set((prevProducts) => ({
                                products: prevProducts.products.map((product) =>
                                        product._id === productId ? { ...product, isFeatured: data.isFeatured } : product
                                ),
                                loading: false,
                        }));
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.error || "Failed to update product");
                }
        },
        fetchFeaturedProducts: async () => {
                set({ loading: true });
                try {
                        const data = await apiClient.get("/products/featured");
                        set({ products: data, loading: false });
                } catch (error) {
                        set({ error: "Failed to fetch products", loading: false });
                        console.log("Error fetching featured products:", error);
                }
        },
}));
