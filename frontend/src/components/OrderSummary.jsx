import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { formatMRU } from "../lib/formatMRU";

const OrderSummary = () => {
        const { total, subtotal, coupon, isCouponApplied } = useCartStore();
        const navigate = useNavigate();
        const { t } = useTranslation();

        const savings = subtotal - total;
        const formattedDiscount =
                coupon?.discountPercentage !== undefined && coupon?.discountPercentage !== null
                        ? Number(coupon.discountPercentage).toLocaleString("en-US")
                        : null;
        const handleCheckout = () => {
                navigate("/checkout");
        };

        return (
                <motion.div
                        className='space-y-4 rounded-lg border border-payzone-indigo/40 bg-white/5 p-4 shadow-sm backdrop-blur-sm sm:p-6'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                >
                        <p className='text-xl font-semibold text-payzone-gold'>
                                {t("cart.summary.title")}
                        </p>

                        <div className='space-y-4'>
                                <div className='space-y-2'>
                                        <dl className='flex items-center justify-between gap-4'>
                                                <dt className='text-base font-normal text-white/70'>
                                                        {t("cart.summary.subtotal")}
                                                </dt>
                                                <dd className='text-base font-medium text-white'>
                                                        {formatMRU(subtotal)}
                                                </dd>
                                        </dl>

                                        {savings > 0 && (
                                                <dl className='flex items-center justify-between gap-4'>
                                                        <dt className='text-base font-normal text-white/70'>
                                                                {t("cart.summary.savings")}
                                                        </dt>
                                                        <dd className='text-base font-medium text-payzone-gold'>
                                                                -{formatMRU(savings)}
                                                        </dd>
                                                </dl>
                                        )}

                                        {coupon && isCouponApplied && (
                                                <dl className='flex items-center justify-between gap-4'>
                                                        <dt className='text-base font-normal text-white/70'>
                                                                {t("cart.summary.coupon", { code: coupon.code })}
                                                        </dt>
                                                        <dd className='text-base font-medium text-payzone-gold'>
                                                                -{formattedDiscount ?? coupon.discountPercentage}%
                                                        </dd>
                                                </dl>
                                        )}
                                        <dl className='flex items-center justify-between gap-4 border-t border-white/10 pt-2'>
                                                <dt className='text-base font-bold text-white'>
                                                        {t("cart.summary.total")}
                                                </dt>
                                                <dd className='text-base font-bold text-payzone-gold'>
                                                        {formatMRU(total)}
                                                </dd>
                                        </dl>
                                </div>

                                <motion.button
                                        type='button'
                                        className='flex w-full items-center justify-center rounded-lg bg-payzone-gold px-5 py-2.5 text-sm font-semibold text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-4 focus:ring-payzone-indigo/40'
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCheckout}
                                >
                                        {t("cart.summary.proceed")}
                                </motion.button>

                                <div className='flex items-center justify-center gap-2'>
                                        <span className='text-sm font-normal text-white/60'>
                                                {t("cart.summary.or")}
                                        </span>
                                        <Link
                                                to='/'
                                                className='inline-flex items-center gap-2 text-sm font-medium text-payzone-indigo underline transition-colors duration-300 hover:text-payzone-gold hover:no-underline'
                                        >
                                                {t("cart.summary.continue")}
                                                <MoveLeft size={16} />
                                        </Link>
                                </div>
                        </div>
		</motion.div>
	);
};
export default OrderSummary;
