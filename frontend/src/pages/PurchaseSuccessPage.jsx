import { ArrowRight, CheckCircle, MapPin, Phone, ShoppingBag, User2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
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
                        } catch (requestError) {
                                console.log(requestError);
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
                <div
                        className='min-h-screen bg-gradient-to-b from-payzone-navy via-[#0b1f3a] to-[#08112a] px-4 py-10 text-white sm:py-16'
                        dir='rtl'
                >
                        <div className='mx-auto w-full max-w-5xl'>
                                <div className='h-4 sm:h-6' aria-hidden='true' />
                                <section className='space-y-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:space-y-8 sm:p-10'>
                                        <div className='flex flex-col items-center gap-4 text-center'>
                                                <div className='grid h-16 w-16 place-items-center rounded-full border border-payzone-gold/60 bg-payzone-gold/10 text-payzone-gold sm:h-20 sm:w-20'>
                                                        <CheckCircle className='h-9 w-9 sm:h-11 sm:w-11' />
                                                </div>
                                                <div className='space-y-2'>
                                                        <h1 className='text-[clamp(1.9rem,4.5vw,2.7rem)] font-bold tracking-tight text-white'>{heading}</h1>
                                                        <p className='mx-auto max-w-2xl text-[clamp(1rem,2.6vw,1.1rem)] text-white/80'>{description}</p>
                                                        <p className='text-sm text-white/60'>{followUp}</p>
                                                </div>
                                        </div>

                                        <a
                                                href={storeUrl}
                                                className='mx-auto inline-flex min-h-[3.25rem] min-w-[14rem] items-center justify-center gap-2 rounded-full bg-payzone-gold px-10 text-[clamp(1rem,2.4vw,1.1rem)] font-semibold text-payzone-navy shadow-lg transition duration-300 hover:bg-[#b8873d] focus:outline-none focus-visible:ring-2 focus-visible:ring-payzone-gold focus-visible:ring-offset-2 focus-visible:ring-offset-payzone-navy'
                                        >
                                                <ArrowRight className='h-5 w-5 transition-transform' style={{ transform: "scaleX(-1)" }} />
                                                {t("purchase.success.backToStore")}
                                        </a>

                                        <section aria-labelledby='delivery-details' className='space-y-6'>
                                                <h2 id='delivery-details' className='text-[clamp(1.2rem,3vw,1.5rem)] font-semibold text-payzone-gold'>
                                                        {t("purchase.success.details.title")}
                                                </h2>

                                                {orderDetails ? (
                                                        <>
                                                                <div className='w-full rounded-2xl border border-white/12 bg-payzone-navy/70 p-5 shadow-lg sm:p-6'>
                                                                        <div className='space-y-3 text-[clamp(0.95rem,2.4vw,1rem)] text-white/80'>
                                                                                <DetailRow
                                                                                        icon={<User2 className='h-5 w-5' />}
                                                                                        label={t("purchase.success.details.name")}
                                                                                        value={orderDetails?.customerName || "-"}
                                                                                />
                                                                                <DetailRow
                                                                                        icon={<Phone className='h-5 w-5' />}
                                                                                        label={t("purchase.success.details.phone")}
                                                                                        value={orderDetails?.phone || "-"}
                                                                                />
                                                                                <DetailRow
                                                                                        icon={<MapPin className='h-5 w-5' />}
                                                                                        label={t("purchase.success.details.address")}
                                                                                        value={orderDetails?.address || "-"}
                                                                                />
                                                                        </div>
                                                                </div>

                                                                <div className='w-full overflow-hidden rounded-2xl border border-white/12 bg-white/5 shadow-lg'>
                                                                        <table className='min-w-full border-collapse text-[clamp(0.9rem,2.1vw,0.95rem)] text-white/80'>
                                                                                <thead className='bg-white/10 text-white/70'>
                                                                                        <tr>
                                                                                                <th scope='col' className='px-4 py-3 text-right font-medium'>
                                                                                                        {t("purchase.success.details.image")}
                                                                                                </th>
                                                                                                <th scope='col' className='px-4 py-3 text-right font-medium'>
                                                                                                        {t("purchase.success.details.products")}
                                                                                                </th>
                                                                                                <th scope='col' className='px-4 py-3 text-left font-medium'>
                                                                                                        {t("purchase.success.details.quantity")}
                                                                                                </th>
                                                                                                <th scope='col' className='px-4 py-3 text-left font-medium'>
                                                                                                        {t("purchase.success.details.unitPrice")}
                                                                                                </th>
                                                                                                <th scope='col' className='px-4 py-3 text-left font-medium'>
                                                                                                        {t("purchase.success.details.total")}
                                                                                                </th>
                                                                                        </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                        {storedItems.length > 0 ? (
                                                                                                storedItems.map((item) => {
                                                                                                        const lineTotal = (item.price || 0) * (item.quantity || 0);
                                                                                                        return (
                                                                                                                <tr
                                                                                                                        key={item.id || item._id || item.name}
                                                                                                                        className='border-b border-white/10 last:border-none hover:bg-white/5'
                                                                                                                >
                                                                                                                        <td className='px-4 py-3 align-middle'>
                                                                                                                                <div className='flex justify-center'>
                                                                                                                                        {item.image ? (
                                                                                                                                                <img
                                                                                                                                                        src={item.image}
                                                                                                                                                        alt={item.name}
                                                                                                                                                        className='h-16 w-16 rounded-xl object-cover'
                                                                                                                                                />
                                                                                                                                        ) : (
                                                                                                                                                <div className='grid h-16 w-16 place-items-center rounded-xl bg-payzone-navy/60 text-white/60'>
                                                                                                                                                        <ShoppingBag className='h-6 w-6' />
                                                                                                                                                </div>
                                                                                                                                        )}
                                                                                                                                </div>
                                                                                                                        </td>
                                                                                                                        <td className='px-4 py-3 align-middle text-right text-white'>
                                                                                                                                <span
                                                                                                                                        className='block font-semibold'
                                                                                                                                        style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}
                                                                                                                                >
                                                                                                                                        {item.name}
                                                                                                                                </span>
                                                                                                                        </td>
                                                                                                                        <td className='px-4 py-3 align-middle text-left font-semibold text-white'>
                                                                                                                                {formatNumberEn(item.quantity || 0)}
                                                                                                                        </td>
                                                                                                                        <td className='px-4 py-3 align-middle text-left text-payzone-gold'>
                                                                                                                                {formatMRU(item.price || 0)}
                                                                                                                        </td>
                                                                                                                        <td className='px-4 py-3 align-middle text-left font-semibold text-white'>
                                                                                                                                {formatMRU(lineTotal)}
                                                                                                                        </td>
                                                                                                                </tr>
                                                                                                        );
                                                                                                })
                                                                                        ) : (
                                                                                                <tr>
                                                                                                        <td colSpan={5} className='px-4 py-6 text-center text-white/60'>
                                                                                                                {t("purchase.success.details.empty")}
                                                                                                        </td>
                                                                                                </tr>
                                                                                        )}
                                                                                </tbody>
                                                                        </table>
                                                                </div>

                                                                <div className='w-full rounded-2xl border border-white/12 bg-white/5 p-5 shadow-lg sm:p-6'>
                                                                        <div className='flex items-center justify-between text-[clamp(0.95rem,2.4vw,1rem)] text-white/80'>
                                                                                <span>{t("purchase.success.details.countLabel")}</span>
                                                                                <span className='text-[clamp(1.05rem,2.6vw,1.2rem)] font-semibold text-white'>
                                                                                        {formatNumberEn(totalCount)}
                                                                                </span>
                                                                        </div>
                                                                        <div className='mt-3 flex items-center justify-between border-t border-white/15 pt-3 text-[clamp(1.05rem,2.8vw,1.25rem)] font-semibold'>
                                                                                <span className='text-payzone-gold'>
                                                                                        {t("purchase.success.details.grandTotalLabel")}
                                                                                </span>
                                                                                <span className='text-white'>{formatMRU(totalAmount)}</span>
                                                                        </div>
                                                                </div>
                                                        </>
                                                ) : (
                                                        <div className='w-full rounded-2xl border border-white/12 bg-payzone-navy/70 p-6 text-center text-white/70'>
                                                                {t("purchase.success.noDetails")}
                                                        </div>
                                                )}
                                        </section>
                                </section>
                        </div>
                </div>
        );
};
export default PurchaseSuccessPage;

const DetailRow = ({ icon, label, value }) => (
        <div className='flex flex-wrap items-center gap-3 border-b border-white/10 pb-3 last:border-none last:pb-0'>
                <span className='flex items-center gap-2 text-white/70'>
                        <span className='grid h-9 w-9 place-items-center rounded-full bg-white/10 text-payzone-gold'>{icon}</span>
                        <span className='font-medium'>{label}</span>
                </span>
                <span className='flex-1 break-words text-left text-base font-semibold text-white rtl:text-right'>
                        {value}
                </span>
        </div>
);
