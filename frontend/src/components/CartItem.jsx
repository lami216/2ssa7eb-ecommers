import { Minus, Plus, Trash2 } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { formatNumberEn } from "../lib/formatNumberEn";

const CartItem = ({ item }) => {
        const { removeFromCart, updateQuantity } = useCartStore();
        const { t } = useTranslation();

        const priceValue = Number(item.price) || 0;
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
                <article className='rounded-2xl border border-white/10 bg-payzone-navy/70 p-4 shadow-lg shadow-black/20 backdrop-blur-md transition duration-300 hover:border-payzone-gold/60 sm:p-6'>
                        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6'>
                                <div className='flex flex-1 items-start gap-4'>
                                        <div className='h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-inner sm:h-28 sm:w-28'>
                                                {item.image ? (
                                                        <img src={item.image} alt={item.name} className='h-full w-full object-cover' />
                                                ) : (
                                                        <div className='flex h-full w-full items-center justify-center text-white/40'>
                                                                <span className='text-sm'>{t("common.status.noImage")}</span>
                                                        </div>
                                                )}
                                        </div>

                                        <div className='flex-1 space-y-2'>
                                                <h3 className='text-lg font-semibold text-white'>{item.name}</h3>
                                                {item.description && <p className='text-sm text-white/70'>{item.description}</p>}

                                                <div className='flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm text-white/70 shadow-inner lg:hidden'>
                                                        <div className='space-y-1'>
                                                                <span className='block text-xs font-medium uppercase tracking-wide text-white/40'>
                                                                        {t("cart.item.unitPrice")}
                                                                </span>
                                                                <span className='text-base font-semibold text-payzone-gold'>{formatMRU(priceValue)}</span>
                                                        </div>
                                                        <div className='space-y-1 text-end'>
                                                                <span className='block text-xs font-medium uppercase tracking-wide text-white/40'>
                                                                        {t("cart.item.lineTotal")}
                                                                </span>
                                                                <span className='text-base font-semibold text-white'>{formatMRU(lineTotal)}</span>
                                                        </div>
                                                </div>
                                        </div>
                                </div>

                                <div className='flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:border-0 sm:pt-0 lg:w-auto'>
                                        <div className='hidden flex-col text-right text-sm text-white/60 lg:flex'>
                                                <span className='text-xs font-medium uppercase tracking-wide text-white/40'>
                                                        {t("cart.item.unitPrice")}
                                                </span>
                                                <span className='text-base font-semibold text-payzone-gold'>{formatMRU(priceValue)}</span>
                                        </div>

                                        <div className='flex items-center gap-3'>
                                                <label className='sr-only' htmlFor={`quantity-${item._id}`}>
                                                        {t("cart.item.chooseQuantity")}
                                                </label>
                                                <button
                                                        type='button'
                                                        onClick={handleDecrease}
                                                        className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-payzone-gold/80 hover:bg-payzone-navy/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-payzone-gold'
                                                        aria-label={t("cart.item.decrease")}
                                                >
                                                        <Minus className='h-4 w-4' />
                                                </button>
                                                <span id={`quantity-${item._id}`} className='min-w-[2ch] text-center text-base font-semibold text-white'>
                                                        {formatNumberEn(quantityValue)}
                                                </span>
                                                <button
                                                        type='button'
                                                        onClick={handleIncrease}
                                                        className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-payzone-gold/80 hover:bg-payzone-navy/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-payzone-gold'
                                                        aria-label={t("cart.item.increase")}
                                                >
                                                        <Plus className='h-4 w-4' />
                                                </button>
                                        </div>

                                        <div className='hidden flex-col text-right text-sm text-white/60 lg:flex'>
                                                <span className='text-xs font-medium uppercase tracking-wide text-white/40'>
                                                        {t("cart.item.lineTotal")}
                                                </span>
                                                <span className='text-base font-semibold text-white'>{formatMRU(lineTotal)}</span>
                                        </div>

                                        <button
                                                type='button'
                                                onClick={handleRemove}
                                                className='inline-flex items-center justify-center gap-2 self-start rounded-full border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400 hover:bg-red-400/10 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
                                                aria-label={t("cart.item.remove")}
                                        >
                                                <Trash2 className='h-4 w-4' />
                                                <span className='hidden sm:inline'>{t("cart.item.remove")}</span>
                                        </button>
                                </div>
                        </div>
                </article>
        );
};
export default CartItem;
