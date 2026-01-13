import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiClient from "../lib/apiClient";
import { buildWhatsAppLink } from "../lib/whatsapp";

const ContactSuccessPage = () => {
        const [searchParams] = useSearchParams();
        const leadId = useMemo(() => searchParams.get("leadId"), [searchParams]);
        const orderId = useMemo(() => searchParams.get("token"), [searchParams]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [lead, setLead] = useState(null);
        const [whatsappUrl, setWhatsappUrl] = useState("");

        useEffect(() => {
                let isMounted = true;

                const loadConfig = async () => {
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

                loadConfig();

                return () => {
                        isMounted = false;
                };
        }, []);

        useEffect(() => {
                let isMounted = true;

                const capturePayment = async () => {
                        if (!leadId || !orderId) {
                                setError("تعذر العثور على بيانات الدفع.");
                                setLoading(false);
                                return;
                        }

                        try {
                                const data = await apiClient.post(
                                        `/leads/${encodeURIComponent(leadId)}/pay-contact-fee/capture`,
                                        { orderId }
                                );
                                if (isMounted) {
                                        setLead(data);
                                }
                        } catch (err) {
                                if (isMounted) {
                                        setError(err.response?.data?.message || "تعذر تأكيد دفع رسوم التواصل.");
                                }
                        } finally {
                                if (isMounted) {
                                        setLoading(false);
                                }
                        }
                };

                capturePayment();

                return () => {
                        isMounted = false;
                };
        }, [leadId, orderId]);

        const planLabels = {
                starter: "Basic",
                growth: "Pro",
                full: "Plus",
                Basic: "Basic",
                Pro: "Pro",
                Plus: "Plus",
        };
        const buildMessage = (leadData) => {
                const planLabel = planLabels[leadData.selectedPlan] || leadData.selectedPlan;
                return `السلام عليكم، أنا ${leadData.fullName} بريدي ${leadData.email}. مهتم بباقة ${planLabel}. تفاصيل: ${
                        leadData.idea || "بدون تفاصيل"
                }. رقم الطلب: ${leadData._id}`;
        };

        if (loading) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white'>
                                <div className='container mx-auto rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                        جاري تأكيد دفع رسوم التواصل...
                                </div>
                        </div>
                );
        }

        if (error) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white'>
                                <div className='container mx-auto rounded-3xl border border-red-400/30 bg-red-500/10 p-10 text-center'>
                                        {error}
                                </div>
                        </div>
                );
        }

        const whatsappLink = lead
                ? buildWhatsAppLink({ whatsappUrl, message: buildMessage(lead) })
                : "";

        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-3xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                <h1 className='text-3xl font-bold text-payzone-gold'>تم تفعيل التواصل عبر واتساب</h1>
                                <p className='mt-3 text-white/70'>
                                        شكراً لك. تم فتح زر واتساب وسنرد عليك قريباً لتأكيد المتطلبات.
                                </p>
                                {whatsappLink ? (
                                        <a
                                                href={whatsappLink}
                                                className='mt-6 inline-flex items-center justify-center rounded-full bg-payzone-gold px-6 py-3 text-sm font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                target='_blank'
                                                rel='noreferrer'
                                        >
                                                فتح واتساب الآن
                                        </a>
                                ) : (
                                        <p className='mt-6 text-sm text-white/60'>
                                                زر واتساب غير متاح حالياً، يرجى التواصل عبر البريد الإلكتروني.
                                        </p>
                                )}
                                <p className='mt-6 text-sm text-white/60'>
                                        سيتم تفعيل دفع الباقة بعد الاتفاق النهائي عبر واتساب.
                                </p>
                                <Link
                                        to='/my-services'
                                        className='mt-6 inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10'
                                >
                                        الانتقال إلى لوحتي
                                </Link>
                        </div>
                </div>
        );
};

export default ContactSuccessPage;
