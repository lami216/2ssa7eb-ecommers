import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import Confetti from "react-confetti";
import apiClient from "../lib/apiClient";

const PurchaseSuccessPage = () => {
        const [isProcessing, setIsProcessing] = useState(true);
        const { clearCart } = useCartStore();
        const [error, setError] = useState(null);
        const [isWhatsAppOrder, setIsWhatsAppOrder] = useState(false);

        useEffect(() => {
                const pendingWhatsAppOrder = sessionStorage.getItem("whatsappOrderSent");
                const handleCheckoutSuccess = async (sessionId) => {
                        try {
                                await apiClient.post("/payments/checkout-success", { sessionId });
                                clearCart();
                        } catch (error) {
                                console.log(error);
                        } finally {
                                setIsProcessing(false);
                        }
                };

                const finalizeWhatsAppOrder = async () => {
                        setIsWhatsAppOrder(true);
                        await clearCart();
                        setIsProcessing(false);
                        setError(null);
                };

                const sessionId = new URLSearchParams(window.location.search).get("session_id");
                if (sessionId) {
                        sessionStorage.removeItem("whatsappOrderSent");
                        handleCheckoutSuccess(sessionId);
                } else if (pendingWhatsAppOrder) {
                        sessionStorage.removeItem("whatsappOrderSent");
                        finalizeWhatsAppOrder();
                } else {
                        setIsProcessing(false);
                        setError("No session ID found in the URL");
                }
        }, [clearCart]);

        if (isProcessing) return "Processing...";

        if (error) return `Error: ${error}`;

        return (
                <div className='flex h-screen items-center justify-center px-4'>
                        <Confetti
                                width={window.innerWidth}
                                height={window.innerHeight}
                                gravity={0.1}
                                style={{ zIndex: 99 }}
                                numberOfPieces={700}
                                recycle={false}
                        />

                        <div className='relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-payzone-indigo/40 bg-white/5 shadow-2xl backdrop-blur-sm'>
                                <div className='p-6 sm:p-8'>
                                        <div className='flex justify-center'>
                                                <CheckCircle className='mb-4 h-16 w-16 text-payzone-gold' />
                                        </div>
                                        <h1 className='mb-2 text-center text-2xl font-bold text-white sm:text-3xl'>
                                                {isWhatsAppOrder ? "تم إرسال طلبك عبر واتساب!" : "Purchase Successful!"}
                                        </h1>

                                        <p className='mb-2 text-center text-white/80'>
                                                {isWhatsAppOrder
                                                        ? "تلقينا تفاصيل طلبك عبر الواتساب وسيتواصل معك فريقنا لتأكيده."
                                                        : "Thank you for your order. We're processing it now."}
                                        </p>
                                        <p className='mb-6 text-center text-sm text-payzone-gold'>
                                                {isWhatsAppOrder
                                                        ? "ترقب رسالة من Payzone للتأكيد والمتابعة."
                                                        : "Check your email for order details and updates."}
                                        </p>
                                        {!isWhatsAppOrder && (
                                                <div className='mb-6 rounded-lg border border-payzone-indigo/40 bg-payzone-navy/60 p-4'>
                                                        <div className='mb-2 flex items-center justify-between'>
                                                                <span className='text-sm text-white/60'>Order number</span>
                                                                <span className='text-sm font-semibold text-payzone-gold'>#12345</span>
                                                        </div>
                                                        <div className='flex items-center justify-between'>
                                                                <span className='text-sm text-white/60'>Estimated delivery</span>
                                                                <span className='text-sm font-semibold text-payzone-gold'>3-5 business days</span>
                                                        </div>
                                                </div>
                                        )}

                                        <div className='space-y-4'>
                                                <button className='flex w-full items-center justify-center rounded-lg bg-payzone-gold px-4 py-2 font-bold text-payzone-navy transition duration-300 hover:bg-[#b8873d]'>
                                                        <HandHeart className='mr-2' size={18} />
                                                        {isWhatsAppOrder ? "نشكر ثقتك بنا!" : "Thanks for trusting us!"}
                                                </button>
                                                <Link
                                                        to={'/'}
                                                        className='flex w-full items-center justify-center rounded-lg border border-payzone-indigo/40 bg-white/5 px-4 py-2 font-bold text-payzone-indigo transition duration-300 hover:text-payzone-gold'
                                                >
                                                        {isWhatsAppOrder ? "العودة للتسوق" : "Continue Shopping"}
                                                        <ArrowRight className='ml-2' size={18} />
                                                </Link>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};
export default PurchaseSuccessPage;
