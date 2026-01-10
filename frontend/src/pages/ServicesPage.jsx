import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import apiClient from "../lib/apiClient";

const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("ar", {
                year: "numeric",
                month: "short",
                day: "numeric",
        });
};

const ServicesPage = () => {
        const [services, setServices] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [actionServiceId, setActionServiceId] = useState("");
        const location = useLocation();

        const successMessage = useMemo(() => {
                const params = new URLSearchParams(location.search);
                const successValue = params.get("success");
                const pendingValue = params.get("pending");
                const canceledValue = params.get("subCanceled");
                if (successValue === "1") {
                        return "تم تفعيل الاشتراك بنجاح.";
                }
                if (pendingValue === "1") {
                        return "الاشتراك قيد الانتظار ويحتاج للموافقة.";
                }
                if (canceledValue === "1") {
                        return "تم إلغاء تفعيل الاشتراك.";
                }
                if (successValue === "0") {
                        return "تعذر تفعيل الاشتراك حالياً.";
                }
                return "";
        }, [location.search]);

        useEffect(() => {
                let isMounted = true;

                const fetchServices = async () => {
                        try {
                                const data = await apiClient.get("/services/me");
                                if (isMounted) {
                                        setServices(Array.isArray(data) ? data : []);
                                }
                        } catch (error) {
                                console.error("Failed to load services", error);
                                if (isMounted) {
                                        setServices([]);
                                        setError("تعذر تحميل الخدمات حالياً.");
                                }
                        } finally {
                                if (isMounted) {
                                        setLoading(false);
                                }
                        }
                };

                fetchServices();

                return () => {
                        isMounted = false;
                };
        }, []);

        const handleActivateSubscription = async (serviceId) => {
                setError("");
                setActionServiceId(serviceId);
                try {
                        const response = await apiClient.post(`/services/${serviceId}/subscription/start`);
                        if (response?.approve_url) {
                                window.location.href = response.approve_url;
                        } else {
                                setError("تعذر إنشاء رابط تفعيل الاشتراك.");
                        }
                } catch (error) {
                        console.error("Failed to start subscription", error);
                        setError(error.response?.data?.message || "تعذر بدء الاشتراك حالياً.");
                } finally {
                        setActionServiceId("");
                }
        };

        const isSubscriptionActive = (service) =>
                ["ACTIVE", "TRIALING"].includes(service.subscriptionStatus);
        const shouldShowActivate = (service) => {
                const status = service.subscriptionStatus || "";
                const pendingStatuses = ["NONE", "PENDING", "APPROVAL_PENDING", ""];
                return !service.subscriptionId || pendingStatuses.includes(status);
        };

        if (loading) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white'>
                                <div className='container mx-auto rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                        جاري تحميل الخدمات...
                                </div>
                        </div>
                );
        }

        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto'>
                                <div className='mb-8 rounded-3xl border border-white/10 bg-payzone-navy/70 p-8'>
                                        <h1 className='text-3xl font-bold text-payzone-gold'>خدماتي</h1>
                                        <p className='mt-2 text-white/70'>إدارة خدماتك الحالية من مكان واحد.</p>
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

                                <div className='overflow-hidden rounded-3xl border border-white/10 bg-payzone-navy/70'>
                                        <div className='overflow-x-auto'>
                                                <table className='min-w-full text-sm'>
                                                        <thead className='bg-white/5 text-white/60'>
                                                                <tr>
                                                                        <th className='px-6 py-4 text-right'>الباقة</th>
                                                                        <th className='px-6 py-4 text-right'>النطاق</th>
                                                                        <th className='px-6 py-4 text-right'>الحالة</th>
                                                                        <th className='px-6 py-4 text-right'>آخر دفع</th>
                                                                        <th className='px-6 py-4 text-right'>إدارة الاشتراك</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {services.map((service) => (
                                                                        <tr key={service._id} className='border-t border-white/10 text-white/80'>
                                                                                <td className='px-6 py-4'>{service.packageName}</td>
                                                                                <td className='px-6 py-4'>{service.domain || "-"}</td>
                                                                                <td className='px-6 py-4'>{service.status}</td>
                                                                                <td className='px-6 py-4'>{formatDate(service.lastPaymentAt)}</td>
                                                                                <td className='px-6 py-4'>
                                                                                        {isSubscriptionActive(service) && !shouldShowActivate(service) ? (
                                                                                                <Link
                                                                                                        to={`/subscription/manage/${service._id}`}
                                                                                                        className='inline-flex items-center justify-center rounded-full bg-payzone-gold px-4 py-2 text-xs font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                                                                >
                                                                                                        إدارة اشتراكي
                                                                                                </Link>
                                                                                        ) : (
                                                                                                <button
                                                                                                        type='button'
                                                                                                        onClick={() => handleActivateSubscription(service._id)}
                                                                                                        className='inline-flex items-center justify-center rounded-full bg-payzone-gold px-4 py-2 text-xs font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                                                                        disabled={actionServiceId === service._id}
                                                                                                >
                                                                                                        {actionServiceId === service._id
                                                                                                                ? "جاري التفعيل..."
                                                                                                                : "تفعيل اشتراكي"}
                                                                                                </button>
                                                                                        )}
                                                                                </td>
                                                                        </tr>
                                                                ))}
                                                        </tbody>
                                                </table>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default ServicesPage;
