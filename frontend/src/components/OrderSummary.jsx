import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { formatMRU } from "../lib/formatMRU";
import { formatNumberEn } from "../lib/formatNumberEn";

const OrderSummary = () => {
        const { cart, total } = useCartStore();
        const navigate = useNavigate();
        const { t } = useTranslation();

        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        const isDisabled = totalQuantity === 0;

        const handleCheckout = () => {
                if (isDisabled) return;
                navigate("/checkout");
        };

        return (
                <motion.div
                        className='space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-md'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                >
                        <h2 className='text-xl font-semibold text-payzone-gold'>{t("cart.summary.title")}</h2>

                        <div className='space-y-4 rounded-2xl border border-white/10 bg-payzone-navy/70 p-5 text-sm text-white/80 shadow-inner'>
                                <div className='flex items-center justify-between'>
                                        <span>{t("cart.summary.productsCount")}</span>
                                        <span className='text-base font-semibold text-white'>{formatNumberEn(totalQuantity)}</span>
                                </div>
                                <div className='flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold'>
                                        <span className='text-payzone-gold'>{t("cart.summary.grandTotal")}</span>
                                        <span className='text-white'>{formatMRU(total)}</span>
                                </div>
                        </div>

                        <motion.button
                                type='button'
                                className='w-full rounded-full bg-payzone-gold px-6 py-3 text-sm font-semibold text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d] focus:outline-none focus-visible:ring-2 focus-visible:ring-payzone-gold focus-visible:ring-offset-2 focus-visible:ring-offset-payzone-navy disabled:cursor-not-allowed disabled:opacity-60'
                                whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                                whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                                onClick={handleCheckout}
                                disabled={isDisabled}
                        >
                                {t("cart.summary.proceed")}
                        </motion.button>
                </motion.div>
        );
};
export default OrderSummary;
