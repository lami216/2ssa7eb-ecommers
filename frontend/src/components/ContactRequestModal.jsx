import { useEffect, useState } from "react";
import { Lock, Mail, MessageSquare, User, X } from "lucide-react";
import apiClient from "../lib/apiClient";

const ContactRequestModal = ({ open, onClose, selectedPlan }) => {
        const [formData, setFormData] = useState({
                fullName: "",
                email: "",
                needDescription: "",
        });
        const [submitting, setSubmitting] = useState(false);
        const [error, setError] = useState("");
        const [acceptedPolicies, setAcceptedPolicies] = useState(false);

        useEffect(() => {
                if (!open) {
                        setFormData({ fullName: "", email: "", needDescription: "" });
                        setError("");
                        setAcceptedPolicies(false);
                }
        }, [open]);

        if (!open) {
                return null;
        }

        const handleSubmit = async (event) => {
                event.preventDefault();
                setError("");

                if (!selectedPlan?.id) {
                        setError("يرجى اختيار الباقة أولاً.");
                        return;
                }

                try {
                        setSubmitting(true);
                        const request = await apiClient.post("/contact-requests", {
                                fullName: formData.fullName,
                                email: formData.email,
                                needDescription: formData.needDescription,
                                planId: selectedPlan.id,
                        });
                        const contactRequestId = request?.contactRequestId;

                        if (!contactRequestId) {
                                setError("تعذر إنشاء طلب التواصل.");
                                return;
                        }

                        const paypal = await apiClient.post("/payments/paypal/create-contact-fee-order", {
                                contactRequestId,
                        });

                        if (paypal?.approveUrl) {
                                sessionStorage.setItem("contactRequestId", contactRequestId);
                                globalThis.location.href = paypal.approveUrl;
                        } else {
                                setError("تعذر تجهيز دفع رسوم التواصل.");
                        }
                } catch (err) {
                        setError(err.response?.data?.message || "تعذر تجهيز دفع رسوم التواصل.");
                } finally {
                        setSubmitting(false);
                }
        };

        return (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8' dir='rtl'>
                        <div className='glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-payzone-navy/90 p-6 text-right text-white shadow-2xl'>
                                <div className='flex items-center justify-between'>
                                        <h2 className='text-2xl font-bold text-payzone-gold'>طلب تواصل عبر واتساب</h2>
                                        <button
                                                type='button'
                                                onClick={onClose}
                                                className='rounded-full bg-white/10 p-2 text-white/70 transition hover:text-white'
                                                aria-label='إغلاق'
                                        >
                                                <X className='h-5 w-5' />
                                        </button>
                                </div>
                                <p className='mt-2 text-sm text-white/70'>رسوم التواصل 5$ لفتح واتساب لمرة واحدة.</p>
                                <form className='mt-6 grid gap-4' onSubmit={handleSubmit}>
                                        <label className='text-sm text-white/70'>
                                                الاسم الكامل
                                                <div className='relative mt-2'>
                                                        <User className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                        <input
                                                                type='text'
                                                                value={formData.fullName}
                                                                onChange={(event) =>
                                                                        setFormData((prev) => ({
                                                                                ...prev,
                                                                                fullName: event.target.value,
                                                                        }))
                                                                }
                                                                className='glass-input w-full pr-12'
                                                                placeholder='اكتب الاسم'
                                                                required
                                                        />
                                                </div>
                                        </label>
                                        <label className='text-sm text-white/70'>
                                                البريد الإلكتروني
                                                <div className='relative mt-2'>
                                                        <Mail className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                        <input
                                                                type='email'
                                                                value={formData.email}
                                                                onChange={(event) =>
                                                                        setFormData((prev) => ({
                                                                                ...prev,
                                                                                email: event.target.value,
                                                                        }))
                                                                }
                                                                className='glass-input w-full pr-12'
                                                                placeholder='name@example.com'
                                                                required
                                                        />
                                                </div>
                                        </label>
                                        <label className='text-sm text-white/70'>
                                                الباقة المختارة
                                                <div className='relative mt-2'>
                                                        <Lock className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                        <input
                                                                type='text'
                                                                value={selectedPlan?.name || ""}
                                                                readOnly
                                                                className='glass-input w-full cursor-not-allowed pr-12 text-white/80'
                                                        />
                                                </div>
                                        </label>
                                        <label className='text-sm text-white/70'>
                                                وصف مختصر للاحتياج
                                                <div className='relative mt-2'>
                                                        <MessageSquare className='absolute right-4 top-4 h-4 w-4 text-white/40' />
                                                        <textarea
                                                                value={formData.needDescription}
                                                                onChange={(event) =>
                                                                        setFormData((prev) => ({
                                                                                ...prev,
                                                                                needDescription: event.target.value,
                                                                        }))
                                                                }
                                                                rows={3}
                                                                className='glass-input w-full resize-none pr-12'
                                                                placeholder='اشرح طلبك باختصار'
                                                                required
                                                        />
                                                </div>
                                        </label>
                                        {error && (
                                                <div className='rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200'>
                                                        {error}
                                                </div>
                                        )}
                                        <button
                                                type='submit'
                                                className='btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60'
                                                disabled={submitting || !acceptedPolicies}
                                        >
                                                <Lock className='h-4 w-4' />
                                                {submitting ? "جاري تحويلك إلى الدفع..." : "ادفع 5$ لفتح واتساب"}
                                        </button>
                                        <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70'>
                                                <p>
                                                        رسوم التواصل 5$ تفتح واتساب مباشرة. قد تُخصم من قيمة الباقة عند الاتفاق.
                                                </p>
                                                <p className='mt-2'>
                                                        اطّلع على{" "}
                                                        <a className='text-payzone-gold underline' href='/privacy'>
                                                                سياسة الخصوصية
                                                        </a>{" "}
                                                        و{" "}
                                                        <a className='text-payzone-gold underline' href='/refund-policy'>
                                                                سياسة الاسترجاع
                                                        </a>
                                                        .
                                                </p>
                                        </div>
                                        <label className='flex items-start gap-2 text-xs text-white/70'>
                                                <input
                                                        type='checkbox'
                                                        className='mt-1'
                                                        checked={acceptedPolicies}
                                                        onChange={(event) => setAcceptedPolicies(event.target.checked)}
                                                        required
                                                />
                                                أوافق على سياسة الخصوصية وسياسة الاسترجاع.
                                        </label>
                                </form>
                        </div>
                </div>
        );
};

export default ContactRequestModal;
