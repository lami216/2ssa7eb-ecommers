import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../lib/apiClient";

const SubscriptionManagePage = () => {
        const { serviceId } = useParams();
        const [service, setService] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [successMessage, setSuccessMessage] = useState("");
        const [isCanceling, setIsCanceling] = useState(false);

        useEffect(() => {
                let isMounted = true;
                const fetchService = async () => {
                        setLoading(true);
                        setError("");
                        try {
                                const data = await apiClient.get("/services/me");
                                const services = Array.isArray(data) ? data : [];
                                const selected = services.find((item) => item._id === serviceId);
                                if (isMounted) {
                                        setService(selected || null);
                                        if (!selected) {
                                                setError("لم يتم العثور على الخدمة المطلوبة.");
                                        }
                                }
                        } catch (err) {
                                if (isMounted) {
                                        setError(err.response?.data?.message || "تعذر تحميل بيانات الاشتراك.");
                                }
                        } finally {
                                if (isMounted) {
                                        setLoading(false);
                                }
                        }
                };

                fetchService();
                return () => {
                        isMounted = false;
                };
        }, [serviceId]);

        const handleCancelSubscription = async () => {
                if (!service) return;
                setError("");
                setSuccessMessage("");
                setIsCanceling(true);
                try {
                        const safeServiceId = encodeURIComponent(service._id);
                        const updated = await apiClient.post(
                                `/services/${safeServiceId}/subscription/cancel`
                        );
                        setService(updated);
                        setSuccessMessage("تم إلغاء تفعيل الاشتراك.");
                } catch (err) {
                        setError(err.response?.data?.message || "تعذر إلغاء الاشتراك الآن.");
                } finally {
                        setIsCanceling(false);
                }
        };

        if (loading) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white'>
                                <div className='container mx-auto rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                        جاري تحميل بيانات الاشتراك...
                                </div>
                        </div>
                );
        }

        if (!service) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white'>
                                <div className='container mx-auto rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                        {error || "تعذر العثور على الخدمة."}
                                        <div className='mt-4'>
                                                <Link
                                                        to='/my-services'
                                                        className='inline-flex items-center justify-center rounded-full bg-payzone-gold px-4 py-2 text-xs font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                >
                                                        العودة إلى خدماتي
                                                </Link>
                                        </div>
                                </div>
                        </div>
                );
        }

        const canCancel = ["ACTIVE", "TRIALING"].includes(service.subscriptionStatus);

        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto'>
                                <div className='mb-8 rounded-3xl border border-white/10 bg-payzone-navy/70 p-8'>
                                        <h1 className='text-3xl font-bold text-payzone-gold'>إدارة الاشتراك</h1>
                                        <p className='mt-2 text-white/70'>تابع حالة الاشتراك الخاص بخدمتك.</p>
                                </div>

                                {error && (
                                        <div className='mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-4 text-sm text-red-200'>
                                                {error}
                                        </div>
                                )}

                                {successMessage && (
                                        <div className='mb-6 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-100'>
                                                {successMessage}
                                        </div>
                                )}

                                <div className='rounded-3xl border border-white/10 bg-payzone-navy/70 p-6'>
                                        <div className='grid gap-4 text-sm text-white/80'>
                                                <div className='flex flex-col gap-1'>
                                                        <span className='text-white/60'>الباقة</span>
                                                        <span>{service.packageName}</span>
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                        <span className='text-white/60'>حالة الاشتراك</span>
                                                        <span>{service.subscriptionStatus || "-"}</span>
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                        <span className='text-white/60'>Subscription ID</span>
                                                        <span>{service.subscriptionId || "-"}</span>
                                                </div>
                                        </div>

                                        <div className='mt-6 flex flex-wrap gap-3'>
                                                <Link
                                                        to='/my-services'
                                                        className='inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20'
                                                >
                                                        العودة إلى خدماتي
                                                </Link>
                                                <button
                                                        type='button'
                                                        onClick={handleCancelSubscription}
                                                        className='inline-flex items-center justify-center rounded-full bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/30'
                                                        disabled={!canCancel || isCanceling}
                                                >
                                                        {isCanceling ? "جاري الإلغاء..." : "إلغاء الاشتراك"}
                                                </button>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default SubscriptionManagePage;
