import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "./ProductCard";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import apiClient from "../lib/apiClient";

const PeopleAlsoBought = () => {
        const [recommendations, setRecommendations] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const { t, i18n } = useTranslation();

        useEffect(() => {
                const fetchRecommendations = async () => {
                        try {
                                const data = await apiClient.get(`/products/recommendations?lang=${i18n.language}`);
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
        }, [i18n.language, t]);

        if (isLoading) return <LoadingSpinner />;

        return (
                <div className='mt-8'>
                        <h3 className='text-2xl font-semibold text-payzone-gold'>
                                {t("cart.recommendations.title")}
                        </h3>
                        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3'>
                                {recommendations.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                ))}
                        </div>
		</div>
	);
};
export default PeopleAlsoBought;
