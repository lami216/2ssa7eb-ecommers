import { useEffect, useMemo, useRef, useState } from "react";
import { ListFilter, Loader2, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useCategoryStore } from "../stores/useCategoryStore";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";
import apiClient from "../lib/apiClient";
import "./SearchBar.css";

const DEBOUNCE_DELAY = 250;

const SearchBar = () => {
        const navigate = useNavigate();
        const { t } = useTranslation();
        const containerRef = useRef(null);
        const inputRef = useRef(null);
        const [query, setQuery] = useState("");
        const [suggestions, setSuggestions] = useState([]);
        const [isSearching, setIsSearching] = useState(false);
        const [showCategories, setShowCategories] = useState(false);
        const [inputFocused, setInputFocused] = useState(false);
        const [highlightedIndex, setHighlightedIndex] = useState(-1);

        const categories = useCategoryStore((state) => state.categories);
        const fetchCategories = useCategoryStore((state) => state.fetchCategories);
        const categoriesLoading = useCategoryStore((state) => state.loading);

        const getLabel = (key, fallback) => {
                const value = t(key);
                return value === key ? fallback : value;
        };

        useEffect(() => {
                if (!categories.length) {
                        fetchCategories();
                }
        }, [categories.length, fetchCategories]);

        useEffect(() => {
                const handleClickOutside = (event) => {
                        if (containerRef.current && !containerRef.current.contains(event.target)) {
                                setShowCategories(false);
                                setInputFocused(false);
                                setHighlightedIndex(-1);
                        }
                };

                document.addEventListener("mousedown", handleClickOutside);
                return () => {
                        document.removeEventListener("mousedown", handleClickOutside);
                };
        }, []);

        const trimmedQuery = useMemo(() => query.trim(), [query]);

        useEffect(() => {
                setHighlightedIndex(-1);
        }, [trimmedQuery]);

        useEffect(() => {
                if (!trimmedQuery) {
                        setSuggestions([]);
                        setIsSearching(false);
                        return;
                }

                const controller = new AbortController();
                setIsSearching(true);

                const handle = setTimeout(() => {
                        apiClient
                                .get(`/products/search?q=${encodeURIComponent(trimmedQuery)}`, {
                                        signal: controller.signal,
                                })
                                .then((data) => {
                                        setSuggestions(Array.isArray(data?.products) ? data.products : []);
                                        setIsSearching(false);
                                })
                                .catch((error) => {
                                        if (error.name === "AbortError") {
                                                return;
                                        }
                                        console.error("Failed to search products", error);
                                        setSuggestions([]);
                                        setIsSearching(false);
                                });
                }, DEBOUNCE_DELAY);

                return () => {
                        clearTimeout(handle);
                        controller.abort();
                };
        }, [trimmedQuery]);

        useEffect(() => {
                if (!suggestions.length) {
                        setHighlightedIndex(-1);
                        return;
                }

                if (highlightedIndex >= suggestions.length) {
                        setHighlightedIndex(suggestions.length - 1);
                }
        }, [suggestions, highlightedIndex]);

        const shouldShowSuggestions = inputFocused && Boolean(trimmedQuery) && !showCategories;

        const handleSelectProduct = (product) => {
                if (!product?._id) {
                        return;
                }

                setQuery("");
                setInputFocused(false);
                setHighlightedIndex(-1);
                setSuggestions([]);
                navigate(`/products/${product._id}`);
        };

        const handleProductKeyNavigation = (event) => {
                if (!shouldShowSuggestions || (!suggestions.length && !isSearching)) {
                        return;
                }

                if (event.key === "ArrowDown") {
                        event.preventDefault();
                        if (!suggestions.length) {
                                return;
                        }
                        setHighlightedIndex((prev) => {
                                const next = prev + 1;
                                if (next >= suggestions.length) {
                                        return 0;
                                }
                                return next;
                        });
                } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        if (!suggestions.length) {
                                return;
                        }
                        setHighlightedIndex((prev) => {
                                if (prev <= 0) {
                                        return suggestions.length - 1;
                                }
                                return prev - 1;
                        });
                } else if (event.key === "Enter") {
                        if (!suggestions.length) {
                                return;
                        }
                        event.preventDefault();
                        const targetIndex = highlightedIndex >= 0 ? highlightedIndex : 0;
                        handleSelectProduct(suggestions[targetIndex]);
                } else if (event.key === "Escape") {
                        setInputFocused(false);
                        setHighlightedIndex(-1);
                }
        };

        const handleSubmit = (event) => {
                event.preventDefault();

                if (!suggestions.length) {
                        return;
                }

                const targetIndex = highlightedIndex >= 0 ? highlightedIndex : 0;
                handleSelectProduct(suggestions[targetIndex]);
        };

        const handleCategoryToggle = () => {
                setShowCategories((previous) => {
                        const next = !previous;
                        if (next) {
                                setInputFocused(false);
                                setHighlightedIndex(-1);
                                inputRef.current?.blur();
                        } else {
                                inputRef.current?.focus();
                                setInputFocused(true);
                        }
                        return next;
                });
        };

        const handleCategorySelect = (category) => {
                if (!category?.slug) {
                        return;
                }
                setShowCategories(false);
                setInputFocused(false);
                setHighlightedIndex(-1);
                setQuery("");
                navigate(`/category/${category.slug}`);
        };

        return (
                <div ref={containerRef} className='search-bar-wrapper'>
                        <form className='search-bar-surface' onSubmit={handleSubmit} role='search'>
                                <button
                                        type='button'
                                        className='search-category-button'
                                        onClick={handleCategoryToggle}
                                        aria-expanded={showCategories}
                                        aria-haspopup='listbox'
                                >
                                        <ListFilter className='search-button-icon' size={18} />
                                        <span>{getLabel("home.searchCategoriesLabel", "الفئات")}</span>
                                </button>
                                <div className='search-input-wrapper'>
                                        <SearchIcon className='search-input-icon' size={18} />
                                        <input
                                                ref={inputRef}
                                                type='text'
                                                value={query}
                                                onFocus={() => setInputFocused(true)}
                                                onChange={(event) => {
                                                        setQuery(event.target.value);
                                                        setShowCategories(false);
                                                }}
                                                onKeyDown={handleProductKeyNavigation}
                                                placeholder={getLabel("home.searchPlaceholder", "ابحث عن منتج...")}
                                                className='search-input'
                                                aria-label={getLabel("home.searchAriaLabel", "ابحث عن منتج")}
                                        />
                                </div>
                                <button
                                        type='submit'
                                        className='search-submit-button'
                                        disabled={!trimmedQuery || isSearching}
                                        aria-label={getLabel("home.searchSubmit", "تنفيذ البحث")}
                                >
                                        {isSearching ? (
                                                <Loader2 className='search-button-icon animate-spin' size={18} />
                                        ) : (
                                                <SearchIcon className='search-button-icon' size={18} />
                                        )}
                                </button>
                        </form>

                        {showCategories && (
                                <div className='search-dropdown' role='listbox'>
                                        <div className='search-dropdown-header'>
                                                <span>{getLabel("home.searchCategoriesTitle", "اختر فئة")}</span>
                                                {categoriesLoading && (
                                                        <Loader2 className='search-button-icon animate-spin' size={16} />
                                                )}
                                        </div>
                                        <ul className='search-dropdown-list'>
                                                {categoriesLoading && !categories.length ? (
                                                        <li className='search-empty-state'>
                                                                {getLabel("home.searchCategoriesLoading", "جاري تحميل الفئات...")}
                                                        </li>
                                                ) : categories.length ? (
                                                        categories.map((category) => (
                                                                <li key={category._id}>
                                                                        <button
                                                                                type='button'
                                                                                className='search-option'
                                                                                onClick={() => handleCategorySelect(category)}
                                                                        >
                                                                                <span className='search-option-title'>{category.name}</span>
                                                                                {category.description ? (
                                                                                        <span className='search-option-subtitle'>
                                                                                                {category.description}
                                                                                        </span>
                                                                                ) : null}
                                                                        </button>
                                                                </li>
                                                        ))
                                                ) : (
                                                        <li className='search-empty-state'>
                                                                {getLabel("home.searchCategoriesEmpty", "لا توجد فئات متاحة حالياً.")}
                                                        </li>
                                                )}
                                        </ul>
                                </div>
                        )}

                        {shouldShowSuggestions && (
                                <div className='search-dropdown' role='listbox'>
                                        {isSearching ? (
                                                <div className='search-loading-state'>
                                                        <Loader2 className='search-button-icon animate-spin' size={16} />
                                                        <span>{getLabel("home.searchLoading", "جاري تحميل النتائج...")}</span>
                                                </div>
                                        ) : suggestions.length ? (
                                                <ul className='search-dropdown-list'>
                                                        {suggestions.map((product, index) => {
                                                                const pricing = getProductPricing(product);
                                                                const isActive = highlightedIndex === index;
                                                                const categoryLabel =
                                                                        typeof product.category === "string"
                                                                                ? product.category
                                                                                : product.category?.name;

                                                                return (
                                                                        <li key={product._id}>
                                                                                <button
                                                                                        type='button'
                                                                                        className={`search-option${
                                                                                                isActive ? " search-option-active" : ""
                                                                                        }`}
                                                                                        onMouseDown={(event) => event.preventDefault()}
                                                                                        onClick={() => handleSelectProduct(product)}
                                                                                >
                                                                                        <div>
                                                                                                <span className='search-option-title'>{product.name}</span>
                                                                                                {categoryLabel && (
                                                                                                        <span className='search-option-subtitle'>
                                                                                                                {categoryLabel}
                                                                                                        </span>
                                                                                                )}
                                                                                        </div>
                                                                                        <div className='search-option-price'>
                                                                                                {pricing.isDiscounted ? (
                                                                                                        <>
                                                                                                                <span className='search-option-old-price'>
                                                                                                                        {formatMRU(pricing.price)}
                                                                                                                </span>
                                                                                                                <span className='search-option-current-price'>
                                                                                                                        {formatMRU(pricing.discountedPrice)}
                                                                                                                </span>
                                                                                                        </>
                                                                                                ) : (
                                                                                                        <span className='search-option-current-price'>
                                                                                                                {formatMRU(pricing.price)}
                                                                                                        </span>
                                                                                                )}
                                                                                        </div>
                                                                                </button>
                                                                        </li>
                                                                );
                                                        })}
                                                </ul>
                                        ) : (
                                                <div className='search-empty-state'>
                                                        {getLabel("home.searchNoResults", "لا توجد منتجات مطابقة لبحثك.")}
                                                </div>
                                        )}
                                </div>
                        )}
                </div>
        );
};

export default SearchBar;
