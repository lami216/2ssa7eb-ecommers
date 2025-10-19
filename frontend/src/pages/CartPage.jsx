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
        const leadText = t("cart.summary.lead");

        return (
                <div className='py-10 md:py-16'>
                        <div className='mx-auto max-w-screen-xl px-4 2xl:px-0'>
                                <div className='space-y-8'>
                                        <div className='text-center lg:text-start'>
                                                <h1 className='text-3xl font-bold text-white sm:text-4xl'>{t("cart.title")}</h1>
                                                {leadText && (
                                                        <p className='mt-2 text-sm text-white/60'>{leadText}</p>
                                                )}
                                        </div>

                                        <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr),360px] xl:grid-cols-[minmax(0,1fr),400px]'>
                                                <motion.section
                                                        className='flex-1'
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                >
                                                        <div className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8'>
                                                                {cart.length === 0 ? (
                                                                        <EmptyCartUI t={t} />
                                                                ) : (
                                                                        <div className='space-y-5'>
                                                                                {cart.map((item) => (
                                                                                        <CartItem key={item._id} item={item} />
                                                                                ))}
                                                                        </div>
                                                                )}
                                                        </div>
                                                </motion.section>

                                                {cart.length > 0 && (
                                                        <motion.aside
                                                                className='space-y-6'
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.5, delay: 0.4 }}
                                                        >
                                                                <OrderSummary />
                                                                <GiftCouponCard />
                                                        </motion.aside>
                                                )}
                                        </div>
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
                        className='mt-4 rounded-full bg-payzone-gold px-6 py-2 font-semibold text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d]'
                        to='/'
                >
                        {t("cart.empty.cta")}
                </Link>
        </motion.div>
);
