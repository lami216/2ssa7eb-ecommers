import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import apiClient from "../lib/apiClient";

const buildWhatsAppLink = (number, message) => {
        const trimmed = number.replaceAll(/\s+/g, "");
        const url = new URL(`https://wa.me/${trimmed}`);
        if (message) {
                url.searchParams.set("text", message);
        }
        return url.toString();
};

const ContactFeeSuccessPage = () => {
        const [searchParams] = useSearchParams();
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [ownerPhone, setOwnerPhone] = useState("");
        const [contactRequest, setContactRequest] = useState(null);
        const [copied, setCopied] = useState(false);

        const orderId = useMemo(() => searchParams.get("token"), [searchParams]);
        const requestId = useMemo(
                () => searchParams.get("contactRequestId") || sessionStorage.getItem("contactRequestId"),
                [searchParams]
        );

        useEffect(() => {
                let isMounted = true;
                apiClient
                        .get("/public-config")
                        .then((data) => {
                                if (isMounted) {
                                        setOwnerPhone(data?.whatsappOwnerPhone || "");
                                }
                        })
                        .catch(() => null);
                return () => {
                        isMounted = false;
                };
        }, []);

        useEffect(() => {
                let isMounted = true;

                const fetchRequest = async () => {
                        if (!requestId) {
                                setError("تعذر العثور على طلب التواصل.");
                                setLoading(false);
                                return;
                        }

                        try {
                                if (orderId) {
                                        const data = await apiClient.post("/payments/paypal/capture-contact-fee-order", {
                                                orderId,
                                                contactRequestId: requestId,
                                        });
                                        if (isMounted) {
                                                setContactRequest(data?.contactRequest || null);
                                        }
                                } else {
                                        const data = await apiClient.get(`/contact-requests/${requestId}`);
                                        if (!data?.paid) {
                                                throw new Error("لم يتم دفع رسوم التواصل بعد.");
                                        }
                                        if (isMounted) {
                                                setContactRequest(data);
                                        }
                                }

                                if (isMounted) {
                                        localStorage.setItem("contactFeeRequestId", requestId);
                                        sessionStorage.removeItem("contactRequestId");
                                }
                        } catch (err) {
                                if (isMounted) {
                                        setError(
                                                err.response?.data?.message ||
                                                        err.message ||
                                                        "تعذر تأكيد الدفع لرسوم التواصل."
                                        );
                                }
                        } finally {
                                if (isMounted) {
                                        setLoading(false);
                                }
                        }
                };

                fetchRequest();

                return () => {
                        isMounted = false;
                };
        }, [orderId, requestId]);

        const message = useMemo(() => {
                if (!contactRequest) return "";
                const lines = [
                        `طلب تواصل - Payzone`,
                        `الاسم: ${contactRequest.fullName || ""}`,
                        `البريد الإلكتروني: ${contactRequest.email || ""}`,
                        `الباقة: ${contactRequest.planName || ""}`,
                        `الوصف: ${contactRequest.needDescription || ""}`,
                        `رقم الطلب: ${contactRequest.id || contactRequest._id || ""}`,
                        `رقم الدفع: ${contactRequest.paypalOrderId || orderId || ""}`,
                ];
                return lines.filter(Boolean).join("\n");
        }, [contactRequest, orderId]);

        const handleCopy = async () => {
                try {
                        await navigator.clipboard.writeText(message);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                        console.warn("Unable to copy message", err);
                        setCopied(false);
                }
        };

        if (loading) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                                <div className='container mx-auto rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                        جاري تأكيد دفع رسوم التواصل...
                                </div>
                        </div>
                );
        }

        if (error) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                                <div className='container mx-auto rounded-3xl border border-red-400/30 bg-red-500/10 p-10 text-center'>
                                        {error}
                                </div>
                        </div>
                );
        }

        const whatsappLink = ownerPhone ? buildWhatsAppLink(ownerPhone, message) : "";

        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-3xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300'>
                                        <CheckCircle2 className='h-8 w-8' />
                                </div>
                                <h1 className='mt-6 text-3xl font-bold text-payzone-gold'>تم فتح واتساب بنجاح</h1>
                                <p className='mt-3 text-white/70'>
                                        الآن يمكنك التواصل مباشرة عبر واتساب باستخدام الرسالة الجاهزة.
                                </p>
                                <div className='mt-6 flex flex-wrap justify-center gap-3'>
                                        <a
                                                href={whatsappLink || "#"}
                                                className='inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-payzone-navy transition hover:bg-emerald-400'
                                                target={whatsappLink ? "_blank" : undefined}
                                                rel={whatsappLink ? "noreferrer" : undefined}
                                        >
                                                <MessageCircle className='h-4 w-4' />
                                                فتح واتساب الآن
                                        </a>
                                        <button
                                                type='button'
                                                onClick={handleCopy}
                                                className='inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40'
                                        >
                                                <Copy className='h-4 w-4' />
                                                {copied ? "تم النسخ" : "نسخ الرسالة"}
                                        </button>
                                </div>
                                <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-right text-sm text-white/80'>
                                        <p className='mb-2 text-xs text-white/60'>نص الرسالة الجاهز:</p>
                                        <pre className='whitespace-pre-wrap text-sm leading-relaxed'>{message}</pre>
                                </div>
                        </div>
                </div>
        );
};

export default ContactFeeSuccessPage;
