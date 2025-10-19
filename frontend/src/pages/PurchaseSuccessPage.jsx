import { ArrowRight, CheckCircle, MapPin, Phone, ShoppingBag, User2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import Confetti from "react-confetti";
import apiClient from "../lib/apiClient";
import { formatMRU } from "../lib/formatMRU";
import { formatNumberEn } from "../lib/formatNumberEn";

const ORDER_DETAILS_KEY = "lastOrderDetails";

const PurchaseSuccessPage = () => {
        const [isProcessing, setIsProcessing] = useState(true);
        const { clearCart } = useCartStore();
        const [error, setError] = useState(null);
        const [isWhatsAppOrder, setIsWhatsAppOrder] = useState(false);
        const [orderDetails, setOrderDetails] = useState(null);
        const location = useLocation();
        const navigate = useNavigate();
        const { t } = useTranslation();

        useEffect(() => {
                if (isWhatsAppOrder) return;

                const pendingWhatsAppOrder = sessionStorage.getItem("whatsappOrderSent");
                const isWhatsAppState = location.state?.orderType === "whatsapp";

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
                if (isWhatsAppState) {
                        sessionStorage.removeItem("whatsappOrderSent");
                        finalizeWhatsAppOrder();
                        navigate(window.location.pathname, { replace: true, state: null });
                } else if (sessionId) {
                        sessionStorage.removeItem("whatsappOrderSent");
                        handleCheckoutSuccess(sessionId);
                } else if (pendingWhatsAppOrder) {
                        sessionStorage.removeItem("whatsappOrderSent");
                        finalizeWhatsAppOrder();
                } else {
                        setIsProcessing(false);
                        setError(t("common.messages.noSessionId"));
                }
        }, [clearCart, isWhatsAppOrder, location, navigate, t]);

        useEffect(() => {
                if (location.state?.orderDetails) {
                        setOrderDetails(location.state.orderDetails);
                        sessionStorage.setItem(ORDER_DETAILS_KEY, JSON.stringify(location.state.orderDetails));
                        return;
                }

                const storedOrderDetails = sessionStorage.getItem(ORDER_DETAILS_KEY);

                if (!storedOrderDetails) return;

                try {
                        const parsed = JSON.parse(storedOrderDetails);
                        setOrderDetails(parsed);
                } catch (parseError) {
                        console.error("Unable to parse stored order details", parseError);
                }
        }, [location.state]);

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

        const heading = isWhatsAppOrder
                ? t("purchase.success.headingWhatsApp")
                : t("purchase.success.heading");
        const description = isWhatsAppOrder
                ? t("purchase.success.subheadingWhatsApp")
                : t("purchase.success.subheading");
        const followUp = t("purchase.success.followUp");

        const storedItems = orderDetails?.items ?? [];

        const derivedSummary = useMemo(() => {
                const totals = storedItems.reduce(
                        (accumulator, item) => {
                                const quantity = Number(item.quantity) || 0;
                                const price = Number(item.price) || 0;
                                accumulator.count += quantity;
                                accumulator.total += price * quantity;
                                return accumulator;
                        },
                        { count: 0, total: 0 }
                );

                return totals;
        }, [storedItems]);

        const totalCount = orderDetails?.summary?.totalQuantity ?? derivedSummary.count;
        const totalAmount = orderDetails?.summary?.total ?? derivedSummary.total;

        const storeUrl =
                import.meta.env.STORE_URL || import.meta.env.VITE_STORE_URL || import.meta.env.BASE_URL || "/";

        return (
                <div className='relative min-h-screen bg-gradient-to-b from-payzone-navy via-[#0b1f3a] to-[#08112a] px-4 py-16 text-white'>
                        <Confetti
                                width={window.innerWidth}
                                height={window.innerHeight}
                                gravity={0.08}
                                style={{ zIndex: 20 }}
                                numberOfPieces={600}
                                recycle={false}
                        />

                        <div className='relative z-30 mx-auto w-full max-w-5xl'>
                                <div className='overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md'>
                                        <div className='space-y-10 p-6 sm:p-10'>
                                                <div className='flex flex-col items-center gap-4 text-center'>
                                                        <div className='rounded-full bg-payzone-gold/10 p-4 text-payzone-gold'>
                                                                <CheckCircle className='h-16 w-16 sm:h-20 sm:w-20' />
                                                        </div>
                                                        <div className='space-y-2'>
                                                                <h1 className='text-3xl font-bold sm:text-4xl'>{heading}</h1>
                                                                <p className='text-base text-white/80 sm:text-lg'>{description}</p>
                                                                <p className='text-sm text-white/60'>{followUp}</p>
                                                        </div>
                                                </div>

                                                <div className='flex justify-center'>
                                                        <a
                                                                href={storeUrl}
                                                                className='group inline-flex items-center gap-3 rounded-full bg-payzone-gold px-8 py-3 text-base font-semibold text-payzone-navy shadow-lg transition duration-300 hover:bg-[#b8873d] focus:outline-none focus-visible:ring-2 focus-visible:ring-payzone-gold focus-visible:ring-offset-2 focus-visible:ring-offset-payzone-navy'
                                                        >
                                                                <ArrowRight
                                                                        className='h-5 w-5 transition-transform group-hover:-translate-x-1'
                                                                        style={{ transform: "scaleX(-1)" }}
                                                                />
                                                                {t("purchase.success.backToStore")}
                                                        </a>
                                                </div>

                                                <section className='space-y-6'>
                                                        <h2 className='text-xl font-semibold text-payzone-gold sm:text-2xl'>
                                                                {t("purchase.success.details.title")}
                                                        </h2>

                                                        {orderDetails ? (
                                                                <div className='space-y-6'>
                                                                        <div className='rounded-2xl border border-white/10 bg-payzone-navy/60 p-5 shadow-lg sm:p-6'>
                                                                                <h3 className='text-lg font-semibold text-white'>
                                                                                        {t("purchase.success.details.customer")}
                                                                                </h3>
                                                                                <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                                                                        <DetailCard
                                                                                                icon={<User2 className='h-5 w-5' />}
                                                                                                label={t("purchase.success.details.name")}
                                                                                                value={orderDetails?.customerName || "-"}
                                                                                        />
                                                                                        <DetailCard
                                                                                                icon={<Phone className='h-5 w-5' />}
                                                                                                label={t("purchase.success.details.phone")}
                                                                                                value={orderDetails?.phone || "-"}
                                                                                        />
                                                                                        <DetailCard
                                                                                                icon={<MapPin className='h-5 w-5' />}
                                                                                                label={t("purchase.success.details.address")}
                                                                                                value={orderDetails?.address || "-"}
                                                                                                className='sm:col-span-2 lg:col-span-3'
                                                                                        />
                                                                                </div>
                                                                        </div>

                                                                        <div className='overflow-hidden rounded-2xl border border-white/10 bg-payzone-navy/60 shadow-lg'>
                                                                                <div className='overflow-x-auto'>
                                                                                        <table className='min-w-full divide-y divide-white/10 text-sm'>
                                                                                                <thead className='bg-white/5 text-xs uppercase tracking-wide text-white/60'>
                                                                                                        <tr>
                                                                                                                <th scope='col' className='p-4 text-right font-medium'>
                                                                                                                        {t("purchase.success.details.products")}
                                                                                                                </th>
                                                                                                                <th scope='col' className='p-4 text-center font-medium'>
                                                                                                                        {t("purchase.success.details.quantity")}
                                                                                                                </th>
                                                                                                                <th scope='col' className='p-4 text-center font-medium'>
                                                                                                                        {t("purchase.success.details.unitPrice")}
                                                                                                                </th>
                                                                                                                <th scope='col' className='p-4 text-center font-medium'>
                                                                                                                        {t("purchase.success.details.total")}
                                                                                                                </th>
                                                                                                        </tr>
                                                                                                </thead>
                                                                                                <tbody className='divide-y divide-white/10'>
                                                                                                        {storedItems.length > 0 ? (
                                                                                                                storedItems.map((item) => {
                                                                                                                        const lineTotal = (item.price || 0) * (item.quantity || 0);
                                                                                                                        return (
                                                                                                                                <tr key={item.id || item._id || item.name} className='transition hover:bg-white/5'>
                                                                                                                                        <td className='p-4'>
                                                                                                                                                <div className='flex items-center gap-3'>
                                                                                                                                                        {item.image ? (
                                                                                                                                                                <img
                                                                                                                                                                        src={item.image}
                                                                                                                                                                        alt={item.name}
                                                                                                                                                                        className='h-16 w-16 rounded-xl object-cover shadow-sm'
                                                                                                                                                                />
                                                                                                                                                        ) : (
                                                                                                                                                                <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 text-white/50'>
                                                                                                                                                                        <ShoppingBag className='h-6 w-6' />
                                                                                                                                                                </div>
                                                                                                                                                        )}
                                                                                                                                                        <span className='font-medium text-white'>{item.name}</span>
                                                                                                                                                </div>
                                                                                                                                        </td>
                                                                                                                                        <td className='p-4 text-center font-semibold text-white/80'>
                                                                                                                                                {formatNumberEn(item.quantity || 0)}
                                                                                                                                        </td>
                                                                                                                                        <td className='p-4 text-center text-payzone-gold'>
                                                                                                                                                {formatMRU(item.price || 0)}
                                                                                                                                        </td>
                                                                                                                                        <td className='p-4 text-center font-semibold text-white'>
                                                                                                                                                {formatMRU(lineTotal)}
                                                                                                                                        </td>
                                                                                                                                </tr>
                                                                                                                        );
                                                                                                                })
                                                                                                        ) : (
                                                                                                                <tr>
                                                                                                                        <td colSpan={4} className='p-6 text-center text-white/60'>
                                                                                                                                {t("purchase.success.details.empty")}
                                                                                                                        </td>
                                                                                                                </tr>
                                                                                                        )}
                                                                                                </tbody>
                                                                                        </table>
                                                                                </div>
                                                                        </div>

                                                                        <div className='rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6'>
                                                                                <h3 className='text-lg font-semibold text-white'>
                                                                                        {t("purchase.success.details.summaryTitle")}
                                                                                </h3>
                                                                                <div className='mt-4 space-y-3 text-sm text-white/70'>
                                                                                        <div className='flex items-center justify-between'>
                                                                                                <span>{t("purchase.success.details.countLabel")}</span>
                                                                                                <span className='text-base font-semibold text-white'>
                                                                                                        {formatNumberEn(totalCount)}
                                                                                                </span>
                                                                                        </div>
                                                                                        <div className='flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold'>
                                                                                                <span className='text-payzone-gold'>
                                                                                                        {t("purchase.success.details.grandTotalLabel")}
                                                                                                </span>
                                                                                                <span className='text-white'>{formatMRU(totalAmount)}</span>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        ) : (
                                                                <div className='rounded-2xl border border-white/10 bg-payzone-navy/60 p-6 text-center text-white/70'>
                                                                        {t("purchase.success.noDetails")}
                                                                </div>
                                                        )}
                                                </section>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};
export default PurchaseSuccessPage;

const DetailCard = ({ icon, label, value, className = "" }) => (
        <div className={`flex items-start gap-3 rounded-xl bg-white/5 p-4 shadow-sm transition ${className}`}>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-payzone-gold/10 text-payzone-gold'>
                        {icon}
                </div>
                <div className='space-y-1'>
                        <p className='text-xs font-medium uppercase tracking-wide text-white/50'>{label}</p>
                        <p className='break-words text-sm font-semibold text-white whitespace-pre-line'>{value}</p>
                </div>
        </div>
);
