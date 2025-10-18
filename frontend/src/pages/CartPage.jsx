import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";

const CartPage = () => {
        const { cart } = useCartStore();
        const { t } = useTranslation();

        return (
                <div className='py-8 md:py-16'>
                        <div className='mx-auto max-w-screen-xl px-4 2xl:px-0'>
                                <div className='mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8'>
                                        <motion.div
                                                className='mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl'
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                        >
                                                {cart.length === 0 ? (
                                                        <EmptyCartUI t={t} />
                                                ) : (
                                                        <div className='space-y-6'>
                                                                {cart.map((item) => (
                                                                        <CartItem key={item._id} item={item} />
								))}
							</div>
						)}
					</motion.div>

					{cart.length > 0 && (
						<motion.div
							className='mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
						>
							<OrderSummary />
							<GiftCouponCard />
						</motion.div>
					)}
				</div>
			</div>
                </div>
        );
};
export default CartPage;

const EmptyCartUI = ({ t }) => (
        <motion.div
                className='flex flex-col items-center justify-center space-y-4 py-16'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
        >
                <ShoppingCart className='h-24 w-24 text-payzone-gold' />
                <h3 className='text-2xl font-semibold text-white'>{t("cart.empty.title")}</h3>
                <p className='text-white/70'>{t("cart.empty.description")}</p>
                <Link
                        className='mt-4 rounded-md bg-payzone-gold px-6 py-2 font-semibold text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d]'
                        to='/'
                >
                        {t("cart.empty.cta")}
                </Link>
        </motion.div>
);
