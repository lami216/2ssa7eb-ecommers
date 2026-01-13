import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import apiClient from "../lib/apiClient";
import { buildWhatsAppLink } from "../lib/whatsapp";

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
        const [lead, setLead] = useState(null);
        const [leadLoading, setLeadLoading] = useState(true);
        const [planPaymentLoading, setPlanPaymentLoading] = useState(false);
        const [whatsappUrl, setWhatsappUrl] = useState("");
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

                const fetchLead = async () => {
                        try {
                                const data = await apiClient.get("/leads/me");
                                if (isMounted) {
                                        setLead(Array.isArray(data) ? data[0] : null);
                                }
                        } catch {
                                if (isMounted) {
                                        setLead(null);
                                }
                        } finally {
                                if (isMounted) {
                                        setLeadLoading(false);
                                }
                        }
                };

                const fetchWhatsApp = async () => {
                        try {
                                const config = await apiClient.get("/public-config");
                                if (isMounted) {
                                        setWhatsappUrl(config?.whatsapp || "");
                                }
                        } catch {
                                if (isMounted) {
                                        setWhatsappUrl("");
                                }
                        }
                };

                fetchServices();
                fetchLead();
                fetchWhatsApp();

                return () => {
                        isMounted = false;
                };
        }, []);

        const handleActivateSubscription = async (serviceId) => {
                setError("");
                setActionServiceId(serviceId);
                try {
                        const safeServiceId = encodeURIComponent(serviceId);
                        const response = await apiClient.post(
                                `/services/${safeServiceId}/subscription/start`
                        );
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

        const handlePlanPayment = async () => {
                if (!lead?._id) return;
                setError("");
                setPlanPaymentLoading(true);
                try {
                        const response = await apiClient.post(
                                `/leads/${encodeURIComponent(lead._id)}/pay-plan/create-order`
                        );
                        if (response?.approveUrl) {
                                window.location.href = response.approveUrl;
                        } else {
                                setError("تعذر إنشاء رابط الدفع للباقة.");
                        }
                } catch (error) {
                        setError(error.response?.data?.message || "تعذر إنشاء رابط الدفع للباقة.");
                } finally {
                        setPlanPaymentLoading(false);
                }
        };

        const statusLabels = {
                NEW: "بانتظار دفع رسوم التواصل",
                CONTACT_FEE_PAID: "تم دفع رسوم التواصل",
                CHECKOUT_ENABLED: "تم تفعيل الدفع للباقة",
                PLAN_PAID: "تم دفع الباقة",
        };

        const planLabels = {
                starter: "Basic",
                growth: "Pro",
                full: "Plus",
                Basic: "Basic",
                Pro: "Pro",
                Plus: "Plus",
        };
        const leadStatusLabel = lead?.status ? statusLabels[lead.status] || lead.status : "";
        const leadWhatsAppLink = lead?.contactFeePaid
                ? buildWhatsAppLink({
                          whatsappUrl,
                          message: `السلام عليكم، أنا ${lead.fullName} بريدي ${lead.email}. مهتم بباقة ${
                                  planLabels[lead.selectedPlan] || lead.selectedPlan
                          }. تفاصيل: ${lead.idea || "بدون تفاصيل"}. رقم الطلب: ${lead._id}`,
                  })
                : "";

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

                                <div className='mb-8 rounded-3xl border border-white/10 bg-payzone-navy/70 p-8'>
                                        <h2 className='text-2xl font-bold text-payzone-gold'>طلب التواصل الخاص بك</h2>
                                        {leadLoading ? (
                                                <p className='mt-3 text-white/70'>جاري تحميل تفاصيل الطلب...</p>
                                        ) : lead ? (
                                                <div className='mt-4 space-y-3 text-white/80'>
                                                        <div className='flex flex-wrap items-center gap-4 text-sm'>
                                                                <span>الاسم: {lead.fullName}</span>
                                                                <span>الباقة: {lead.selectedPlan}</span>
                                                                <span>الحالة: {leadStatusLabel}</span>
                                                        </div>
                                                        <div className='flex flex-wrap items-center gap-3'>
                                                                {lead.contactFeePaid && leadWhatsAppLink && (
                                                                        <a
                                                                                href={leadWhatsAppLink}
                                                                                target='_blank'
                                                                                rel='noreferrer'
                                                                                className='inline-flex items-center justify-center rounded-full bg-payzone-gold px-4 py-2 text-xs font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                                        >
                                                                                فتح واتساب
                                                                        </a>
                                                                )}
                                                                {lead.checkoutEnabled && !lead.planPaid && (
                                                                        <button
                                                                                type='button'
                                                                                onClick={handlePlanPayment}
                                                                                className='inline-flex items-center justify-center rounded-full bg-payzone-gold px-4 py-2 text-xs font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                                                disabled={planPaymentLoading}
                                                                        >
                                                                                {planPaymentLoading
                                                                                        ? "جاري تجهيز الدفع..."
                                                                                        : `دفع الباقة ${lead.finalPrice} USD`}
                                                                        </button>
                                                                )}
                                                                {lead.planPaid && (
                                                                        <span className='text-xs text-emerald-200'>
                                                                                تم دفع الباقة بنجاح
                                                                        </span>
                                                                )}
                                                        </div>
                                                        {!lead.checkoutEnabled && (
                                                                <p className='text-sm text-white/60'>
                                                                        سيتم تفعيل الدفع للباقة بعد الاتفاق عبر واتساب.
                                                                </p>
                                                        )}
                                                </div>
                                        ) : (
                                                <p className='mt-3 text-white/70'>
                                                        لا يوجد طلب تواصل حالياً. يمكنك تقديم طلب من الصفحة الرئيسية.
                                                </p>
                                        )}
                                </div>

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
                                                                                                        to={`/subscription/manage/${encodeURIComponent(
                                                                                                                service._id
                                                                                                        )}`}
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
