import { create } from "zustand";
import apiClient from "../lib/apiClient";
import { translate } from "../lib/locale";

let activeController = null;

export const useSearchStore = create((set, get) => ({
        query: "",
        category: null,
        results: [],
        loading: false,
        error: null,
        lastFetchedQuery: "",
        lastFetchedCategory: null,
        setQuery: (value) => set({ query: value }),
        setCategory: (value) => set({ category: value || null }),
        clearResults: () => {
                if (activeController) {
                        activeController.abort();
                        activeController = null;
                }
                set({
                        results: [],
                        loading: false,
                        error: null,
                        lastFetchedQuery: "",
                        lastFetchedCategory: null,
                });
        },
        cancelOngoing: () => {
                if (activeController) {
                        activeController.abort();
                        activeController = null;
                }
        },
        searchProducts: async ({ query, category } = {}) => {
                const trimmedQuery = (query ?? get().query ?? "").trim();
                const normalizedCategory = category ?? get().category ?? null;

                if (!trimmedQuery && !normalizedCategory) {
                        set({
                                results: [],
                                loading: false,
                                error: null,
                                lastFetchedQuery: "",
                                lastFetchedCategory: null,
                        });
                        return [];
                }

                if (activeController) {
                        activeController.abort();
                }

                const controller = new AbortController();
                activeController = controller;

                set({ loading: true, error: null });

                try {
                        const params = new URLSearchParams();
                        if (trimmedQuery) {
                                params.set("q", trimmedQuery);
                        }
                        if (normalizedCategory) {
                                params.set("category", normalizedCategory);
                        }

                        const endpoint = `/products/search${params.toString() ? `?${params.toString()}` : ""}`;
                        const data = await apiClient.get(endpoint, { signal: controller.signal });

                        if (controller.signal.aborted) {
                                return [];
                        }

                        const products = Array.isArray(data?.products) ? data.products : [];

                        set({
                                results: products,
                                loading: false,
                                error: null,
                                lastFetchedQuery: trimmedQuery,
                                lastFetchedCategory: normalizedCategory,
                        });

                        activeController = null;
                        return products;
                } catch (error) {
                        if (controller.signal.aborted) {
                                return [];
                        }

                        set({
                                loading: false,
                                error: error.response?.data?.message || translate("search.genericError"),
                        });

                        activeController = null;
                        throw error;
                }
        },
}));

export default useSearchStore;
