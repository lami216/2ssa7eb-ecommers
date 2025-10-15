import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";
import i18n from "../lib/i18n";

const getLanguage = () => i18n.language || "en";
const translate = (key, options) => i18n.t(key, options);

export const useProductStore = create((set, get) => ({
        products: [],
        selectedProduct: null,
        loading: false,
        productDetailsLoading: false,

        setProducts: (products) => {
                const currentSelected = get().selectedProduct;
                const nextSelected = currentSelected
                        ? products.find((product) => product._id === currentSelected._id) || currentSelected
                        : null;
                set({ products, selectedProduct: nextSelected });
        },
        setSelectedProduct: (product) => set({ selectedProduct: product }),
        clearSelectedProduct: () => set({ selectedProduct: null }),
        createProduct: async (productData, language = getLanguage()) => {
                set({ loading: true });
                try {
                        const data = await apiClient.post(`/products?lang=${language}`, productData);
                        set((prevState) => ({
                                products: [...prevState.products, data],
                                loading: false,
                        }));
                        toast.success(translate("common.messages.productCreated"));
                        return data;
                } catch (error) {
                        toast.error(error.response?.data?.message || translate("toast.createProductError"));
                        set({ loading: false });
                        throw error;
                }
        },
        fetchAllProducts: async (language = getLanguage()) => {
                set({ loading: true });
                try {
                        const data = await apiClient.get(`/products?lang=${language}`);
                        get().setProducts(data.products);
                        set({ loading: false });
                } catch (error) {
                        set({ error: translate("toast.fetchProductsError"), loading: false });
                        toast.error(error.response?.data?.message || translate("toast.fetchProductsError"));
                }
        },
        fetchProductsByCategory: async (category, language = getLanguage()) => {
                set({ loading: true });
                try {
                        const data = await apiClient.get(`/products/category/${category}?lang=${language}`);
                        get().setProducts(data.products);
                        set({ loading: false });
                } catch (error) {
                        set({ error: translate("toast.fetchProductsError"), loading: false });
                        toast.error(error.response?.data?.message || translate("toast.fetchProductsError"));
                }
        },
        fetchProductById: async (productId, language = getLanguage()) => {
                const existingProduct = get().products.find((product) => product._id === productId);
                if (existingProduct) {
                        const translations = existingProduct.translations ?? {};
                        const localized = translations[language]
                                ? { ...existingProduct, ...translations[language] }
                                : existingProduct;
                        set({ selectedProduct: localized });
                        return localized;
                }

                set({ productDetailsLoading: true });

                try {
                        const data = await apiClient.get(`/products/${productId}?lang=${language}`);
                        set((prevState) => {
                                const alreadyInList = prevState.products.some((product) => product._id === data._id);
                                return {
                                        products: alreadyInList
                                                ? prevState.products.map((product) =>
                                                          product._id === data._id ? data : product
                                                  )
                                                : [...prevState.products, data],
                                        selectedProduct: data,
                                        productDetailsLoading: false,
                                };
                        });
                        return data;
                } catch (error) {
                        set({ productDetailsLoading: false });
                        toast.error(error.response?.data?.message || translate("toast.loadProductError"));
                        throw error;
                }
        },
        deleteProduct: async (productId) => {
                set({ loading: true });
                try {
                        await apiClient.delete(`/products/${productId}`);
                        set((prevState) => ({
                                products: prevState.products.filter((product) => product._id !== productId),
                                selectedProduct:
                                        prevState.selectedProduct?._id === productId ? null : prevState.selectedProduct,
                                loading: false,
                        }));
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.deleteProductError"));
                }
        },
        toggleFeaturedProduct: async (productId, language = getLanguage()) => {
                set({ loading: true });
                try {
                        const data = await apiClient.patch(`/products/${productId}?lang=${language}`);
                        set((prevState) => ({
                                products: prevState.products.map((product) =>
                                        product._id === productId ? { ...product, isFeatured: data.isFeatured } : product
                                ),
                                selectedProduct:
                                        prevState.selectedProduct?._id === productId
                                                ? { ...prevState.selectedProduct, isFeatured: data.isFeatured }
                                                : prevState.selectedProduct,
                                loading: false,
                        }));
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.updateProductError"));
                }
        },
        fetchFeaturedProducts: async (language = getLanguage()) => {
                set({ loading: true });
                try {
                        const data = await apiClient.get(`/products/featured?lang=${language}`);
                        get().setProducts(data);
                        set({ loading: false });
                } catch (error) {
                        set({ error: translate("toast.fetchProductsError"), loading: false });
                        console.log("Error fetching featured products:", error);
                }
        },
}));
