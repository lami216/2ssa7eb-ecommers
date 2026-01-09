import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../lib/apiClient";

const buildWhatsAppLink = (number) => {
        const trimmed = number.replace(/\s+/g, "");
        return `https://wa.me/${trimmed}`;
};

const ServiceSuccessPage = () => {
        const [searchParams] = useSearchParams();
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [contact, setContact] = useState({ email: "", whatsapp: "" });

        const orderId = useMemo(() => searchParams.get("token"), [searchParams]);

        useEffect(() => {
                let isMounted = true;

                const capturePayment = async () => {
                        if (!orderId) {
                                setError("تعذر العثور على رقم الدفع.");
                                setLoading(false);
                                return;
                        }

                        try {
                                const data = await apiClient.post("/payments/paypal/capture", { orderId });
                                if (isMounted) {
                                        setContact({
                                                email: data?.contact?.email || "",
                                                whatsapp: data?.contact?.whatsapp || "",
                                        });
                                }
                        } catch (err) {
                                if (isMounted) {
                                        setError(err.response?.data?.message || "تعذر تأكيد الدفع عبر PayPal.");
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
        }, [orderId]);

        if (loading) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white'>
                                <div className='container mx-auto rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                        جاري تأكيد الدفع...
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

        const hasWhatsApp = Boolean(contact.whatsapp);
        const contactLink = hasWhatsApp
                ? buildWhatsAppLink(contact.whatsapp)
                : contact.email
                  ? `mailto:${contact.email}`
                  : "mailto:info@payzone.com";
        const contactLabel = hasWhatsApp ? "تواصل عبر واتساب" : "تواصل عبر البريد";

        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-3xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                <h1 className='text-3xl font-bold text-payzone-gold'>تم استلام طلبك</h1>
                                <p className='mt-3 text-white/70'>سنتواصل معك قريباً لتأكيد التفاصيل المطلوبة.</p>
                                <a
                                        href={contactLink}
                                        className='mt-6 inline-flex items-center justify-center rounded-full bg-payzone-gold px-6 py-3 text-sm font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                        target={hasWhatsApp ? "_blank" : undefined}
                                        rel={hasWhatsApp ? "noreferrer" : undefined}
                                >
                                        {contactLabel}
                                </a>
                        </div>
                </div>
        );
};

export default ServiceSuccessPage;
