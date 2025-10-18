import { useEffect, useState } from "react";
import useTranslation from "../hooks/useTranslation";
import ProductCard from "./ProductCard";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import apiClient from "../lib/apiClient";

const PeopleAlsoBought = ({ productId, category }) => {
        const [recommendations, setRecommendations] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const { t } = useTranslation();

        useEffect(() => {
                const fetchRecommendations = async () => {
                        try {
                                const queryParams = new URLSearchParams();

                                if (productId) {
                                        queryParams.append("productId", productId);
                                }

                                if (category) {
                                        queryParams.append("category", category);
                                }

                                const endpoint = queryParams.toString()
                                        ? `/products/recommendations?${queryParams.toString()}`
                                        : `/products/recommendations`;

                                setIsLoading(true);
                                setRecommendations([]);

                                const data = await apiClient.get(endpoint);
                                setRecommendations(data);
                        } catch (error) {
                                toast.error(
                                        error.response?.data?.message || t("toast.recommendationsError")
                                );
                        } finally {
                                setIsLoading(false);
                        }
                };

                fetchRecommendations();
        }, [productId, category, t]);

        if (isLoading) return <LoadingSpinner />;

        return (
                <div className='mt-8'>
                        <h3 className='text-2xl font-semibold text-payzone-gold'>
                                {t("cart.recommendations.title")}
                        </h3>
                        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                {recommendations.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                ))}
                        </div>
		</div>
	);
};
export default PeopleAlsoBought;
