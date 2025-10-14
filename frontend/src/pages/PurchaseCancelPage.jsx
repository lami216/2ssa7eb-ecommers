import { XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PurchaseCancelPage = () => {
        return (
                <div className='flex min-h-screen items-center justify-center px-4'>
                        <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className='relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-payzone-indigo/40 bg-white/5 p-6 shadow-2xl backdrop-blur-sm sm:p-8'
                        >
                                <div className='flex justify-center'>
                                        <XCircle className='mb-4 h-16 w-16 text-payzone-indigo' />
                                </div>
                                <h1 className='mb-2 text-center text-2xl font-bold text-white sm:text-3xl'>Purchase Cancelled</h1>
                                <p className='mb-6 text-center text-white/80'>
                                        Your order has been cancelled. No charges have been made.
                                </p>
                                <div className='mb-6 rounded-lg border border-payzone-indigo/40 bg-payzone-navy/60 p-4'>
                                        <p className='text-center text-sm text-white/70'>
                                                If you encountered any issues during the checkout process, please contact our support team.
                                        </p>
                                </div>
                                <div className='space-y-4'>
                                        <Link
                                                to={'/'}
                                                className='flex w-full items-center justify-center rounded-lg bg-payzone-gold px-4 py-2 font-bold text-payzone-navy transition duration-300 hover:bg-[#b8873d]'
                                        >
                                                <ArrowLeft className='mr-2' size={18} />
                                                Return to Shop
                                        </Link>
                                </div>
                        </motion.div>
                </div>
        );
};

export default PurchaseCancelPage;
