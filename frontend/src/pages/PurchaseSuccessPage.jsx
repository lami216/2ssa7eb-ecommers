import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartStore } from "../stores/useCartStore";
import Confetti from "react-confetti";
import apiClient from "../lib/apiClient";

const PurchaseSuccessPage = () => {
        const [isProcessing, setIsProcessing] = useState(true);
        const { clearCart } = useCartStore();
        const [error, setError] = useState(null);
        const [isWhatsAppOrder, setIsWhatsAppOrder] = useState(false);
        const { t } = useTranslation();

        useEffect(() => {
                const pendingWhatsAppOrder = sessionStorage.getItem("whatsappOrderSent");
                const handleCheckoutSuccess = async (sessionId) => {
                        try {
                                await apiClient.post("/payments/checkout-success", { sessionId });
                                await clearCart();
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
                        setError(t("common.messages.noSessionId"));
                }
        }, [clearCart, t]);

        if (isProcessing)
                return (
                        <div className='flex h-screen items-center justify-center text-white'>
                                {t("purchase.success.processing")}
                        </div>
                );

        if (error)
                return (
                        <div className='flex h-screen items-center justify-center text-white'>
                                {t("purchase.success.error", { message: error })}
                        </div>
                );

        const title = isWhatsAppOrder ? t("purchase.success.whatsAppTitle") : t("purchase.success.title");
        const message = isWhatsAppOrder ? t("purchase.success.whatsAppMessage") : t("purchase.success.message");
        const hint = isWhatsAppOrder ? t("purchase.success.whatsAppHint") : t("purchase.success.hint");
        const thanksText = isWhatsAppOrder ? t("purchase.success.thanksWhatsApp") : t("purchase.success.thanks");
        const continueLabel = isWhatsAppOrder ? t("purchase.success.whatsAppButton") : t("purchase.success.button");

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
                                        <h1 className='mb-2 text-center text-2xl font-bold text-white sm:text-3xl'>{title}</h1>

                                        <p className='mb-2 text-center text-white/80'>{message}</p>
                                        <p className='mb-6 text-center text-sm text-payzone-gold'>{hint}</p>
                                        {!isWhatsAppOrder && (
                                                <div className='mb-6 rounded-lg border border-payzone-indigo/40 bg-payzone-navy/60 p-4'>
                                                        <div className='mb-2 flex items-center justify-between'>
                                                                <span className='text-sm text-white/60'>{t("purchase.success.orderNumber")}</span>
                                                                <span className='text-sm font-semibold text-payzone-gold'>#12345</span>
                                                        </div>
                                                        <div className='flex items-center justify-between'>
                                                                <span className='text-sm text-white/60'>{t("purchase.success.estimatedDelivery")}</span>
                                                                <span className='text-sm font-semibold text-payzone-gold'>
                                                                        {t("purchase.success.estimatedDeliveryValue")}
                                                                </span>
                                                        </div>
                                                </div>
                                        )}

                                        <div className='space-y-4'>
                                                <button className='flex w-full items-center justify-center rounded-lg bg-payzone-gold px-4 py-2 font-bold text-payzone-navy transition duration-300 hover:bg-[#b8873d]'>
                                                        <HandHeart className='mr-2' size={18} />
                                                        {thanksText}
                                                </button>
                                                <Link
                                                        to={'/'}
                                                        className='flex w-full items-center justify-center rounded-lg border border-payzone-indigo/40 bg-white/5 px-4 py-2 font-bold text-payzone-indigo transition duration-300 hover:text-payzone-gold'
                                                >
                                                        {continueLabel}
                                                        <ArrowRight className='ml-2' size={18} />
                                                </Link>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};
export default PurchaseSuccessPage;
