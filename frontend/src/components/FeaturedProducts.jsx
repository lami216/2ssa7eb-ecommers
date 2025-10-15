import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";

const FeaturedProducts = ({ featuredProducts }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [itemsPerPage, setItemsPerPage] = useState(4);

        const { addToCart } = useCartStore();
        const { t } = useTranslation();

        useEffect(() => {
                const handleResize = () => {
                        if (window.innerWidth < 640) setItemsPerPage(1);
                        else if (window.innerWidth < 1024) setItemsPerPage(2);
                        else if (window.innerWidth < 1280) setItemsPerPage(3);
                        else setItemsPerPage(4);
                };

                handleResize();
                window.addEventListener("resize", handleResize);
                return () => window.removeEventListener("resize", handleResize);
        }, []);

        const nextSlide = () => {
                setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
        };

        const prevSlide = () => {
                setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
        };

        const isStartDisabled = currentIndex === 0;
        const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

        return (
                <div className='py-12'>
                        <div className='container mx-auto px-4'>
                                <h2 className='mb-4 text-center text-5xl font-bold sm:text-6xl'>
                                        <span className='bg-gradient-to-r from-payzone-gold via-payzone-gold/80 to-payzone-indigo bg-clip-text text-transparent'>
                                                {t("home.featuredTitle")}
                                        </span>
                                </h2>
                                <div className='relative'>
                                        <div className='overflow-hidden'>
                                                <div
                                                        className='flex transition-transform duration-300 ease-in-out'
                                                        style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                                                >
                                                        {featuredProducts?.map((product) => (
                                                                <div key={product._id} className='w-full flex-shrink-0 px-2 sm:w-1/2 lg:w-1/3 xl:w-1/4'>
                                                                        <div className='group flex h-full flex-col overflow-hidden rounded-xl border border-payzone-indigo/30 bg-white/5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-payzone-gold/60 hover:shadow-xl'>
                                                                                <div className='overflow-hidden'>
                                                                                        <img
                                                                                                src={product.image}
                                                                                                alt={product.name}
                                                                                                className='h-48 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110'
                                                                                        />
                                                                                </div>
                                                                                <div className='p-4'>
                                                                                        <h3 className='mb-2 text-lg font-semibold text-white'>{product.name}</h3>
                                                                                        <p className='mb-4 font-medium text-payzone-gold'>
                                                                                                {formatMRU(product.price)}
                                                                                        </p>
                                                                                        <button
                                                                                                onClick={() => addToCart(product)}
                                                                                                className='flex w-full items-center justify-center gap-2 rounded bg-payzone-gold py-2 px-4 font-semibold text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d]'
                                                                                        >
                                                                                                <ShoppingCart className='h-5 w-5' />
                                                                                                {t("common.actions.addToCart")}
                                                                                        </button>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                        <button
                                                onClick={prevSlide}
                                                disabled={isStartDisabled}
                                                className={`absolute top-1/2 -left-4 flex -translate-y-1/2 transform items-center justify-center rounded-full p-2 transition-colors duration-300 ${
                                                        isStartDisabled
                                                                ? "cursor-not-allowed bg-white/10 text-white/40"
                                                                : "bg-payzone-indigo text-white hover:bg-[#3b3ad6]"
                                                }`}
                                        >
                                                <ChevronLeft className='h-6 w-6' />
                                        </button>

                                        <button
                                                onClick={nextSlide}
                                                disabled={isEndDisabled}
                                                className={`absolute top-1/2 -right-4 flex -translate-y-1/2 transform items-center justify-center rounded-full p-2 transition-colors duration-300 ${
                                                        isEndDisabled
                                                                ? "cursor-not-allowed bg-white/10 text-white/40"
                                                                : "bg-payzone-indigo text-white hover:bg-[#3b3ad6]"
                                                }`}
                                        >
                                                <ChevronRight className='h-6 w-6' />
                                        </button>
                                </div>
                        </div>
                </div>
        );
};
export default FeaturedProducts;
