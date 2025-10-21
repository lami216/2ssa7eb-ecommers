import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { formatNumberEn } from "../lib/formatNumberEn";

const GiftCouponCard = () => {
        const [userInputCode, setUserInputCode] = useState("");
        const user = useUserStore((state) => state.user);
        const { appliedCoupons, isCouponApplied, applyCoupon, removeCoupon } = useCartStore();
        const { t } = useTranslation();

        useEffect(() => {
                setUserInputCode("");
        }, [user]);

        const handleApplyCoupon = () => {
                if (!userInputCode) return;

                if (!user) {
                        toast.error(t("common.messages.loginRequiredForCoupon"));
                        return;
                }

                applyCoupon(userInputCode);
                setUserInputCode("");
        };

        const handleRemoveCoupon = (code) => {
                removeCoupon(code);
        };

        const hasAppliedCoupons = isCouponApplied && Array.isArray(appliedCoupons) && appliedCoupons.length > 0;

        return (
                <motion.div
                        className='space-y-4 rounded-xl border border-payzone-indigo/40 bg-white/5 p-4 shadow-sm backdrop-blur-sm sm:p-6'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                >
                        <div className='space-y-4'>
                                <div>
                                        <label htmlFor='voucher' className='mb-2 block text-sm font-medium text-white/80'>
                                                {t("cart.coupon.label")}
                                        </label>
                                        <input
                                                type='text'
                                                id='voucher'
                                                className='block w-full rounded-lg border border-payzone-indigo/40 bg-payzone-navy/60 p-2.5 text-sm text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                placeholder={t("cart.coupon.placeholder")}
                                                value={userInputCode}
                                                onChange={(e) => setUserInputCode(e.target.value)}
                                                required
                                        />
                                </div>

                                <motion.button
                                        type='button'
                                        className='flex w-full items-center justify-center rounded-lg bg-payzone-gold px-5 py-2.5 text-sm font-semibold text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-4 focus:ring-payzone-indigo/40'
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleApplyCoupon}
                                >
                                        {t("cart.coupon.apply")}
                                </motion.button>
                        </div>
                        {hasAppliedCoupons && (
                                <div className='mt-4 rounded-lg border border-payzone-indigo/40 bg-payzone-navy/40 p-4'>
                                        <h3 className='text-lg font-medium text-payzone-gold'>
                                                {t("cart.coupon.appliedTitle")}
                                        </h3>

                                        <ul className='mt-3 space-y-3 text-sm text-white/70'>
                                                {appliedCoupons.map((coupon) => {
                                                        const discount = formatNumberEn(
                                                                Number(coupon.discountPercentage) || 0
                                                        );

                                                        return (
                                                                <li
                                                                        key={coupon.code}
                                                                        className='flex items-center justify-between gap-3 rounded-md border border-payzone-indigo/30 bg-payzone-navy/30 px-3 py-2'
                                                                >
                                                                        <span>{t("cart.coupon.discount", { code: coupon.code, discount })}</span>
                                                                        <motion.button
                                                                                type='button'
                                                                                className='rounded-md bg-payzone-indigo px-3 py-1 text-xs font-medium text-white transition-colors duration-300 hover:bg-[#3b3ad6] focus:outline-none focus:ring-2 focus:ring-payzone-indigo/40'
                                                                                whileHover={{ scale: 1.05 }}
                                                                                whileTap={{ scale: 0.95 }}
                                                                                onClick={() => handleRemoveCoupon(coupon.code)}
                                                                        >
                                                                                {t("cart.coupon.remove")}
                                                                        </motion.button>
                                                                </li>
                                                        );
                                                })}
                                        </ul>

                                        {appliedCoupons.length > 1 && (
                                                <motion.button
                                                        type='button'
                                                        className='mt-4 flex w-full items-center justify-center rounded-lg border border-payzone-indigo/40 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-payzone-indigo/40 focus:outline-none focus:ring-4 focus:ring-payzone-indigo/40'
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleRemoveCoupon()}
                                                >
                                                        {t("cart.coupon.removeAll")}
                                                </motion.button>
                                        )}
                                </div>
                        )}
                </motion.div>
        );
};
export default GiftCouponCard;
