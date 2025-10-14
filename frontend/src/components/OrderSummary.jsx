import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { formatMRU } from "../lib/formatMRU";

const OrderSummary = () => {
        const { total, subtotal, coupon, isCouponApplied } = useCartStore();
        const navigate = useNavigate();

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
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
                        <p className='text-xl font-semibold text-emerald-400'>ملخص الطلب</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
                                                <dt className='text-base font-normal text-gray-300'>السعر قبل الخصم</dt>
                                                <dd className='text-base font-medium text-white'>
                                                        {formatMRU(subtotal)}
                                                </dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
                                                        <dt className='text-base font-normal text-gray-300'>التوفير</dt>
                                                        <dd className='text-base font-medium text-emerald-400'>
                                                                -{formatMRU(savings)}
                                                        </dd>
                                                </dl>
                                        )}

                                        {coupon && isCouponApplied && (
                                                <dl className='flex items-center justify-between gap-4'>
                                                        <dt className='text-base font-normal text-gray-300'>الكوبون ({coupon.code})</dt>
                                                        <dd className='text-base font-medium text-emerald-400'>
                                                                -{formattedDiscount ?? coupon.discountPercentage}%
                                                        </dd>
                                                </dl>
                                        )}
                                        <dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
                                                <dt className='text-base font-bold text-white'>الإجمالي</dt>
                                                <dd className='text-base font-bold text-emerald-400'>
                                                        {formatMRU(total)}
                                                </dd>
                                        </dl>
				</div>

                                <motion.button
                                        type='button'
                                        className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCheckout}
                                >
                                        متابعة إلى إتمام الطلب
                                </motion.button>

                                <div className='flex items-center justify-center gap-2'>
                                        <span className='text-sm font-normal text-gray-400'>أو</span>
                                        <Link
                                                to='/'
                                                className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
                                        >
                                                متابعة التسوق
                                                <MoveRight size={16} />
                                        </Link>
                                </div>
			</div>
		</motion.div>
	);
};
export default OrderSummary;
