import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid3x3, Loader2, Search as SearchIcon, X } from "lucide-react";

import useTranslation from "../hooks/useTranslation";
import apiClient from "../lib/apiClient";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";
import { useCategoryStore } from "../stores/useCategoryStore";

const SearchBar = () => {
        const [query, setQuery] = useState("");
        const [results, setResults] = useState([]);
        const [searching, setSearching] = useState(false);
        const [showResults, setShowResults] = useState(false);
        const [showCategories, setShowCategories] = useState(false);
        const [error, setError] = useState("");

        const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
        const { t } = useTranslation();
        const navigate = useNavigate();
        const wrapperRef = useRef(null);

        useEffect(() => {
                if (!categories.length) {
                        fetchCategories();
                }
        }, [categories.length, fetchCategories]);

        useEffect(() => {
                const handleOutsideClick = (event) => {
                        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                                setShowResults(false);
                                setShowCategories(false);
                        }
                };

                document.addEventListener("mousedown", handleOutsideClick);

                return () => {
                        document.removeEventListener("mousedown", handleOutsideClick);
                };
        }, []);

        useEffect(() => {
                const trimmed = query.trim();
                setError("");

                if (!trimmed) {
                        setResults([]);
                        setShowResults(false);
                        setSearching(false);
                        return undefined;
                }

                let isActive = true;
                setResults([]);
                setSearching(true);
                setShowResults(true);

                const timeoutId = setTimeout(async () => {
                        try {
                                const data = await apiClient.get(
                                        `/products/search?query=${encodeURIComponent(trimmed)}`
                                );
                                if (!isActive) return;

                                const products = Array.isArray(data?.products) ? data.products : [];
                                setResults(products);
                                setShowResults(true);
                        } catch (requestError) {
                                if (!isActive) return;
                                const message =
                                        requestError?.response?.data?.message || t("search.genericError");
                                setError(message);
                                setResults([]);
                                setShowResults(true);
                        } finally {
                                if (isActive) {
                                        setSearching(false);
                                }
                        }
                }, 250);

                return () => {
                        isActive = false;
                        clearTimeout(timeoutId);
                };
        }, [query, t]);

        const handleSubmit = (event) => {
                event.preventDefault();

                if (!query.trim()) {
                        setShowResults(false);
                        return;
                }

                if (results.length > 0) {
                        handleSelectProduct(results[0]);
                } else {
                        setShowResults(true);
                }
        };

        const handleSelectProduct = (product) => {
                navigate(`/products/${product._id}`);
                setQuery("");
                setResults([]);
                setShowResults(false);
        };

        const handleSelectCategory = (category) => {
                navigate(`/category/${category.slug}`);
                setShowCategories(false);
                setShowResults(false);
                setQuery("");
                setResults([]);
        };

        const handleToggleCategories = () => {
                setShowCategories((previous) => !previous);
                setShowResults(false);
        };

        const handleChange = (event) => {
                setQuery(event.target.value);
                setShowCategories(false);
        };

        const handleClear = () => {
                setQuery("");
                setResults([]);
                setShowResults(false);
                setError("");
        };

        return (
                <div ref={wrapperRef} className='mx-auto flex w-full max-w-4xl flex-col gap-3'>
                        <form
                                onSubmit={handleSubmit}
                                className='flex flex-col gap-3 rounded-3xl border border-white/10 bg-payzone-navy/80 p-4 shadow-xl backdrop-blur'
                        >
                                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                        <div className='relative flex-1'>
                                                <SearchIcon className='pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-payzone-gold/80' />
                                                <input
                                                        type='search'
                                                        value={query}
                                                        onChange={handleChange}
                                                        placeholder={t("search.placeholder")}
                                                        className='w-full rounded-2xl border border-transparent bg-payzone-navy/60 py-3 pr-12 pl-4 text-base text-payzone-white placeholder:text-payzone-white/60 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo/60'
                                                />
                                                {query && (
                                                        <button
                                                                type='button'
                                                                onClick={handleClear}
                                                                className='absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20'
                                                                aria-label={t("search.clear")}
                                                        >
                                                                <X className='h-4 w-4' />
                                                        </button>
                                                )}
                                        </div>

                                        <div className='flex flex-row items-center gap-2 self-end sm:self-auto'>
                                                <button
                                                        type='submit'
                                                        className='flex items-center gap-2 rounded-2xl bg-gradient-to-r from-payzone-gold to-payzone-indigo px-5 py-3 text-sm font-semibold text-payzone-white shadow-md transition hover:shadow-lg'
                                                >
                                                        <SearchIcon className='h-5 w-5' />
                                                        <span>{t("search.action")}</span>
                                                </button>
                                                <button
                                                        type='button'
                                                        onClick={handleToggleCategories}
                                                        className='flex items-center gap-2 rounded-2xl border border-payzone-indigo/40 bg-payzone-navy/70 px-5 py-3 text-sm font-semibold text-payzone-gold transition hover:border-payzone-gold/60 hover:text-payzone-white'
                                                >
                                                        <Grid3x3 className='h-5 w-5' />
                                                        <span>{t("search.categories")}</span>
                                                </button>
                                        </div>
                                </div>
                        </form>

                        {showResults && (
                                <div className='rounded-3xl border border-white/10 bg-payzone-navy/95 p-4 shadow-2xl backdrop-blur'>
                                        <div className='mb-3 flex items-center justify-between text-sm font-semibold text-payzone-gold'>
                                                <span>{t("search.resultsTitle")}</span>
                                                {searching && <Loader2 className='h-4 w-4 animate-spin text-payzone-indigo' />}
                                        </div>

                                        {!searching && error && (
                                                <div className='rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
                                                        {error}
                                                </div>
                                        )}

                                        {!searching && !error && results.length === 0 && (
                                                <div className='rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-payzone-white/70'>
                                                        {t("search.noResults", { query })}
                                                </div>
                                        )}

                                        {(searching || results.length > 0) && (
                                                <ul className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
                                                        {results.map((product) => {
                                                                const { price, discountedPrice, isDiscounted } =
                                                                        getProductPricing(product);
                                                                const image = product.image || product.images?.[0]?.url;
                                                                return (
                                                                        <li key={product._id}>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => handleSelectProduct(product)}
                                                                                        className='group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-white/5 p-4 text-right transition hover:border-payzone-gold/50 hover:bg-white/10'
                                                                                >
                                                                                        <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-payzone-indigo/30 bg-payzone-navy/50'>
                                                                                                {image ? (
                                                                                                        <img
                                                                                                                src={image}
                                                                                                                alt={product.name}
                                                                                                                className='h-full w-full object-cover transition duration-300 group-hover:scale-105'
                                                                                                        />
                                                                                                ) : (
                                                                                                        <div className='flex h-full w-full items-center justify-center text-payzone-white/60'>
                                                                                                                <SearchIcon className='h-6 w-6' />
                                                                                                        </div>
                                                                                                )}
                                                                                        </div>
                                                                                        <div className='flex flex-1 flex-col items-start gap-1 text-right'>
                                                                                                <span className='text-base font-semibold text-payzone-white'>
                                                                                                        {product.name}
                                                                                                </span>
                                                                                                <p className='line-clamp-2 text-sm text-payzone-white/60'>
                                                                                                        {product.description}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className='flex flex-col items-end gap-1'>
                                                                                                {isDiscounted ? (
                                                                                                        <>
                                                                                                                <span className='text-xs text-payzone-white/60 line-through'>
                                                                                                                        {formatMRU(price)}
                                                                                                                </span>
                                                                                                                <span className='text-sm font-semibold text-payzone-gold'>
                                                                                                                        {formatMRU(discountedPrice)}
                                                                                                                </span>
                                                                                                        </>
                                                                                                ) : (
                                                                                                        <span className='text-sm font-semibold text-payzone-gold'>
                                                                                                                {formatMRU(price)}
                                                                                                        </span>
                                                                                                )}
                                                                                        </div>
                                                                                </button>
                                                                        </li>
                                                                );
                                                        })}
                                                </ul>
                                        )}
                                </div>
                        )}

                        {showCategories && (
                                <div className='rounded-3xl border border-white/10 bg-payzone-navy/95 p-4 shadow-2xl backdrop-blur'>
                                        <div className='mb-3 flex items-center justify-between text-sm font-semibold text-payzone-gold'>
                                                <span>{t("search.categoriesTitle")}</span>
                                                {categoriesLoading && (
                                                        <Loader2 className='h-4 w-4 animate-spin text-payzone-indigo' />
                                                )}
                                        </div>

                                        {!categoriesLoading && categories.length === 0 && (
                                                <div className='rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-payzone-white/70'>
                                                        {t("search.categoriesEmpty")}
                                                </div>
                                        )}

                                        {categories.length > 0 && (
                                                <ul className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
                                                        {categories.map((category) => (
                                                                <li key={category._id}>
                                                                        <button
                                                                                type='button'
                                                                                onClick={() => handleSelectCategory(category)}
                                                                                className='flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-white/5 p-4 text-sm font-semibold text-payzone-white transition hover:border-payzone-gold/50 hover:bg-white/10'
                                                                        >
                                                                                <span>{category.name}</span>
                                                                                <span className='text-xs text-payzone-gold/80'>
                                                                                        /category/{category.slug}
                                                                                </span>
                                                                        </button>
                                                                </li>
                                                        ))}
                                                </ul>
                                        )}
                                </div>
                        )}
                </div>
        );
};

export default SearchBar;
