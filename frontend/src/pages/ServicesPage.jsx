import { useEffect, useState } from "react";
import apiClient from "../lib/apiClient";
import WhatsAppButton from "../components/WhatsAppButton";
import useLeadStatus from "../hooks/useLeadStatus";

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
        const { lead, isUnlocked, whatsappLink, loading: leadLoading } = useLeadStatus();

        useEffect(() => {
                let isMounted = true;

                const fetchServices = async () => {
                        try {
                                const data = await apiClient.get("/services/me");
                                if (isMounted) {
                                        setServices(Array.isArray(data) ? data : []);
                                }
                        } catch (requestError) {
                                console.error("Failed to load services", requestError);
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

        const statusLabels = {
                NEW: "تم استلام الطلب",
                CONTACT_FEE_PAID: "جاهز للتواصل",
                CHECKOUT_ENABLED: "جاهز للتواصل",
                PLAN_PAID: "جاهز للتواصل",
        };

        const leadStatusLabel = lead?.status ? statusLabels[lead.status] || lead.status : "";
        const shouldShowLeadCard = leadLoading || !lead;

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
                                        <div className='flex flex-wrap items-center justify-between gap-4'>
                                                <div>
                                                        <h1 className='text-3xl font-bold text-payzone-gold'>خدماتي</h1>
                                                        <p className='mt-2 text-white/70'>إدارة خدماتك الحالية من مكان واحد.</p>
                                                </div>
                                                <WhatsAppButton isUnlocked={isUnlocked} whatsappLink={whatsappLink} className='min-w-[200px]' />
                                        </div>
                                </div>
                                {error && (
                                        <div className='mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-4 text-sm text-red-200'>
                                                {error}
                                        </div>
                                )}

                                {shouldShowLeadCard && (
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
                                                                        <WhatsAppButton isUnlocked={isUnlocked} whatsappLink={whatsappLink} className='text-xs' />
                                                                </div>
                                                        </div>
                                                ) : (
                                                        <p className='mt-3 text-white/70'>
                                                                لا يوجد طلب تواصل حالياً. يمكنك تقديم طلب من الصفحة الرئيسية.
                                                        </p>
                                                )}
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
                                                                        <th className='px-6 py-4 text-right'>آخر تحديث</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {services.map((service) => (
                                                                        <tr key={service._id} className='border-t border-white/10 text-white/80'>
                                                                                <td className='px-6 py-4'>{service.packageName}</td>
                                                                                <td className='px-6 py-4'>{service.domain || "-"}</td>
                                                                                <td className='px-6 py-4'>{service.status}</td>
                                                                                <td className='px-6 py-4'>{formatDate(service.updatedAt || service.createdAt)}</td>
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
