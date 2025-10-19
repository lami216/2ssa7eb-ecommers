import { Minus, Plus, Trash2 } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { formatNumberEn } from "../lib/formatNumberEn";
import { getProductPricing } from "../lib/getProductPricing";

const CartItem = ({ item }) => {
        const { removeFromCart, updateQuantity } = useCartStore();
        const { t } = useTranslation();

        const { price: originalPrice, discountedPrice, isDiscounted, discountPercentage } =
                getProductPricing(item);
        const priceValue = Number(discountedPrice) || 0;
        const quantityValue = Number(item.quantity) || 0;
        const lineTotal = priceValue * quantityValue;

        const handleDecrease = () => {
                const nextQuantity = Math.max(1, quantityValue - 1);
                updateQuantity(item._id, nextQuantity);
        };

        const handleIncrease = () => {
                updateQuantity(item._id, quantityValue + 1);
        };

        const handleRemove = () => {
                removeFromCart(item._id);
        };

        return (
                <article
                        className='grid gap-4 rounded-2xl border border-white/12 bg-white/5 p-4 text-white shadow-lg shadow-black/20 backdrop-blur-md transition duration-300 hover:border-payzone-gold/70 sm:p-5 grid-cols-[96px_minmax(0,1fr)] md:grid-cols-[96px_minmax(0,1fr)_minmax(220px,1fr)]'
                        dir='rtl'
                >
                        <div className='row-span-1'>
                                <div className='h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-payzone-navy/60 shadow-inner sm:h-24 sm:w-24'>
                                        {item.image ? (
                                                <img src={item.image} alt={item.name} className='h-full w-full object-cover' />
                                        ) : (
                                                <div className='flex h-full w-full items-center justify-center text-white/50'>
                                                        <span className='text-sm'>{t("common.status.noImage")}</span>
                                                </div>
                                        )}
                                </div>
                        </div>

                        <div className='flex flex-col justify-between gap-3'>
                                <div className='space-y-2'>
                                        <div className='flex items-center justify-between gap-2'>
                                                <h3 className='text-[clamp(1.05rem,2.5vw,1.25rem)] font-semibold text-white'>
                                                        {item.name}
                                                </h3>
                                                {isDiscounted && (
                                                        <span className='rounded-full bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-200'>
                                                                -{discountPercentage}%
                                                        </span>
                                                )}
                                        </div>
                                        {item.description && (
                                                <p
                                                        className='text-sm text-white/70'
                                                        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                                                >
                                                        {item.description}
                                                </p>
                                        )}
                                </div>
                                <div className='flex flex-wrap items-center gap-2 text-sm text-white/70 sm:flex-nowrap'>
                                        <span className='text-white/50'>{t("cart.item.lineTotal")}</span>
                                        <span className='text-[clamp(1rem,2.4vw,1.1rem)] font-semibold text-payzone-gold'>
                                                {formatMRU(lineTotal)}
                                        </span>
                                </div>
                        </div>

                        <div className='col-span-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-payzone-navy/70 px-4 py-3 text-sm text-white/80 md:col-span-3 md:col-start-1 md:col-end-4 sm:gap-6'>
                                <div className='flex items-center gap-2 text-base font-semibold text-payzone-gold min-w-[150px] justify-end'>
                                        <span className='text-xs font-medium text-white/60'>{t("cart.item.unitPrice")}</span>
                                        <div className='flex flex-col items-end'>
                                                {isDiscounted && (
                                                        <span className='text-xs font-medium text-white/50 line-through'>
                                                                {formatMRU(originalPrice)}
                                                        </span>
                                                )}
                                                <span>{formatMRU(priceValue)}</span>
                                        </div>
                                </div>
                                <div className='flex flex-1 items-center justify-center gap-3 min-w-[190px] sm:min-w-[210px]'>
                                        <label className='sr-only' htmlFor={`quantity-${item._id}`}>
                                                {t("cart.item.chooseQuantity")}
                                        </label>
                                        <button
                                                type='button'
                                                onClick={handleDecrease}
                                                className='inline-flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-payzone-gold/80 hover:bg-payzone-navy/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-payzone-gold'
                                                aria-label={t("cart.item.decrease")}
                                        >
                                                <Minus className='h-4 w-4' />
                                        </button>
                                        <span
                                                id={`quantity-${item._id}`}
                                                className='flex h-10 min-w-[3rem] items-center justify-center rounded-xl bg-white/10 text-base font-semibold text-white'
                                        >
                                                {formatNumberEn(quantityValue)}
                                        </span>
                                        <button
                                                type='button'
                                                onClick={handleIncrease}
                                                className='inline-flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-payzone-gold/80 hover:bg-payzone-navy/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-payzone-gold'
                                                aria-label={t("cart.item.increase")}
                                        >
                                                <Plus className='h-4 w-4' />
                                        </button>
                                </div>
                                <button
                                        type='button'
                                        onClick={handleRemove}
                                        className='inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-red-400/40 bg-red-500/15 px-3 text-sm font-semibold text-red-200 transition hover:border-red-400 hover:bg-red-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
                                        aria-label={t("cart.item.remove")}
                                >
                                        <Trash2 className='h-4 w-4' />
                                        <span className='sr-only'>{t("cart.item.remove")}</span>
                                </button>
                        </div>
                </article>
        );
};
export default CartItem;
