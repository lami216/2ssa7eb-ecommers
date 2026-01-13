import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiClient from "../lib/apiClient";

const ContactPlanSuccessPage = () => {
        const [searchParams] = useSearchParams();
        const leadId = useMemo(() => searchParams.get("leadId"), [searchParams]);
        const orderId = useMemo(() => searchParams.get("token"), [searchParams]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");

        useEffect(() => {
                let isMounted = true;

                const capturePlanPayment = async () => {
                        if (!leadId || !orderId) {
                                setError("تعذر العثور على بيانات الدفع.");
                                setLoading(false);
                                return;
                        }

                        try {
                                await apiClient.post(`/leads/${encodeURIComponent(leadId)}/pay-plan/capture`, {
                                        orderId,
                                });
                        } catch (err) {
                                if (isMounted) {
                                        setError(err.response?.data?.message || "تعذر تأكيد دفع الباقة.");
                                }
                        } finally {
                                if (isMounted) {
                                        setLoading(false);
                                }
                        }
                };

                capturePlanPayment();

                return () => {
                        isMounted = false;
                };
        }, [leadId, orderId]);

        if (loading) {
                return (
                        <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white'>
                                <div className='container mx-auto rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                        جاري تأكيد دفع الباقة...
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

        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-3xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                <h1 className='text-3xl font-bold text-payzone-gold'>تم تأكيد دفع الباقة</h1>
                                <p className='mt-3 text-white/70'>
                                        تم استلام الدفع بنجاح وسيبدأ فريقنا في الخطوات التالية لإنشاء الخدمة.
                                </p>
                                <Link
                                        to='/my-services'
                                        className='mt-6 inline-flex items-center justify-center rounded-full bg-payzone-gold px-6 py-3 text-sm font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                >
                                        متابعة الخدمات
                                </Link>
                        </div>
                </div>
        );
};

export default ContactPlanSuccessPage;
