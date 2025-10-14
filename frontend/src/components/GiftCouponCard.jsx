import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";

const GiftCouponCard = () => {
        const [userInputCode, setUserInputCode] = useState("");
        const user = useUserStore((state) => state.user);
        const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } = useCartStore();

        useEffect(() => {
                if (!user) return;

                getMyCoupon();
        }, [getMyCoupon, user]);

        useEffect(() => {
                if (coupon) setUserInputCode(coupon.code);
        }, [coupon]);

        const handleApplyCoupon = () => {
                if (!userInputCode) return;

                if (!user) {
                        toast.error("قم بتسجيل الدخول لتفعيل كوبون الخصم");
                        return;
                }

                applyCoupon(userInputCode);
        };

        const handleRemoveCoupon = async () => {
                await removeCoupon();
                setUserInputCode("");
        };

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
                                                Do you have a voucher or gift card?
                                        </label>
                                        <input
                                                type='text'
                                                id='voucher'
                                                className='block w-full rounded-lg border border-payzone-indigo/40 bg-payzone-navy/60 p-2.5 text-sm text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                placeholder='Enter code here'
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
                                        Apply Code
                                </motion.button>
                        </div>
                        {isCouponApplied && coupon && (
                                <div className='mt-4 rounded-lg border border-payzone-indigo/40 bg-payzone-navy/40 p-4'>
                                        <h3 className='text-lg font-medium text-payzone-gold'>Applied Coupon</h3>

                                        <p className='mt-2 text-sm text-white/70'>
                                                {coupon.code} - {coupon.discountPercentage}% off
                                        </p>

                                        <motion.button
                                                type='button'
                                                className='mt-3 flex w-full items-center justify-center rounded-lg bg-payzone-indigo px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#3b3ad6] focus:outline-none focus:ring-4 focus:ring-payzone-indigo/40'
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleRemoveCoupon}
                                        >
                                                Remove Coupon
                                        </motion.button>
                                </div>
                        )}

                        {coupon && (
                                <div className='mt-4 rounded-lg border border-payzone-indigo/20 bg-white/5 p-4'>
                                        <h3 className='text-lg font-medium text-payzone-gold'>Your Available Coupon:</h3>
                                        <p className='mt-2 text-sm text-white/70'>
                                                {coupon.code} - {coupon.discountPercentage}% off
                                        </p>
                                </div>
                        )}
                </motion.div>
        );
};
export default GiftCouponCard;
