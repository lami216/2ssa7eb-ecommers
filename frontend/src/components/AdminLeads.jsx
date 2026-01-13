import { useEffect, useMemo, useState } from "react";
import apiClient from "../lib/apiClient";
import { SERVICE_PACKAGES } from "../../../shared/servicePackages.js";

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

const PLAN_OPTIONS = [
        { value: "Basic", label: "Basic" },
        { value: "Pro", label: "Pro" },
        { value: "Plus", label: "Plus" },
];

const PLAN_TO_PACKAGE = {
        Basic: "starter",
        Pro: "growth",
        Plus: "full",
};

const AdminLeads = () => {
        const [leads, setLeads] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [selectedLead, setSelectedLead] = useState(null);
        const [agreedPlan, setAgreedPlan] = useState("Basic");
        const [discountAmount, setDiscountAmount] = useState(5);
        const [saving, setSaving] = useState(false);

        const packageById = useMemo(() => {
                return SERVICE_PACKAGES.reduce((acc, pkg) => {
                        acc[pkg.id] = pkg;
                        return acc;
                }, {});
        }, []);

        useEffect(() => {
                let isMounted = true;

                const fetchLeads = async () => {
                        try {
                                const data = await apiClient.get("/admin/leads");
                                if (isMounted) {
                                        setLeads(Array.isArray(data) ? data : []);
                                }
                        } catch (err) {
                                if (isMounted) {
                                        setError("تعذر تحميل طلبات التواصل.");
                                }
                        } finally {
                                if (isMounted) {
                                        setLoading(false);
                                }
                        }
                };

                fetchLeads();

                return () => {
                        isMounted = false;
                };
        }, []);

        const basePrice = useMemo(() => {
                const packageId = PLAN_TO_PACKAGE[agreedPlan];
                return packageById[packageId]?.oneTimePrice || 0;
        }, [agreedPlan, packageById]);

        const finalPrice = useMemo(() => {
                const discount = Number(discountAmount) || 0;
                return Math.max(basePrice - discount, 0);
        }, [basePrice, discountAmount]);

        const openModal = (lead) => {
                setSelectedLead(lead);
                setAgreedPlan(lead?.selectedPlan || "Basic");
                setDiscountAmount(lead?.discountAmount ?? 5);
        };

        const closeModal = () => {
                setSelectedLead(null);
        };

        const handleEnableCheckout = async () => {
                if (!selectedLead) return;
                setSaving(true);
                try {
                        const response = await apiClient.patch(
                                `/admin/leads/${encodeURIComponent(selectedLead._id)}/enable-checkout`,
                                {
                                        agreedPlan,
                                        discountAmount: Number(discountAmount) || 0,
                                }
                        );
                        setLeads((prev) =>
                                prev.map((lead) => (lead._id === response._id ? response : lead))
                        );
                        closeModal();
                } catch (err) {
                        setError(err.response?.data?.message || "تعذر تفعيل الدفع للباقة.");
                } finally {
                        setSaving(false);
                }
        };

        if (loading) {
                return (
                        <div className='rounded-3xl border border-white/10 bg-payzone-navy/70 p-8 text-center text-white'>
                                جاري تحميل الطلبات...
                        </div>
                );
        }

        return (
                <div className='space-y-6 text-white'>
                        {error && (
                                <div className='rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-4 text-sm text-red-200'>
                                        {error}
                                </div>
                        )}
                        <div className='overflow-hidden rounded-3xl border border-white/10 bg-payzone-navy/70'>
                                <div className='overflow-x-auto'>
                                        <table className='min-w-full text-sm'>
                                                <thead className='bg-white/5 text-white/60'>
                                                        <tr>
                                                                <th className='px-4 py-3 text-right'>الاسم</th>
                                                                <th className='px-4 py-3 text-right'>البريد</th>
                                                                <th className='px-4 py-3 text-right'>الباقة</th>
                                                                <th className='px-4 py-3 text-right'>الحالة</th>
                                                                <th className='px-4 py-3 text-right'>رسوم التواصل</th>
                                                                <th className='px-4 py-3 text-right'>الدفع مفعل</th>
                                                                <th className='px-4 py-3 text-right'>السعر النهائي</th>
                                                                <th className='px-4 py-3 text-right'>تاريخ الطلب</th>
                                                                <th className='px-4 py-3 text-right'>الإجراء</th>
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {leads.map((lead) => (
                                                                <tr key={lead._id} className='border-t border-white/10 text-white/80'>
                                                                        <td className='px-4 py-3'>{lead.fullName}</td>
                                                                        <td className='px-4 py-3'>{lead.email}</td>
                                                                        <td className='px-4 py-3'>{lead.selectedPlan}</td>
                                                                        <td className='px-4 py-3'>{lead.status}</td>
                                                                        <td className='px-4 py-3'>
                                                                                {lead.contactFeePaid ? "مدفوع" : "غير مدفوع"}
                                                                        </td>
                                                                        <td className='px-4 py-3'>
                                                                                {lead.checkoutEnabled ? "مفعل" : "غير مفعل"}
                                                                        </td>
                                                                        <td className='px-4 py-3'>
                                                                                {lead.finalPrice ?? "-"}
                                                                        </td>
                                                                        <td className='px-4 py-3'>{formatDate(lead.createdAt)}</td>
                                                                        <td className='px-4 py-3'>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => openModal(lead)}
                                                                                        className='rounded-full bg-payzone-gold px-4 py-2 text-xs font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                                                >
                                                                                        تفعيل دفع الباقة
                                                                                </button>
                                                                        </td>
                                                                </tr>
                                                        ))}
                                                </tbody>
                                        </table>
                                </div>
                        </div>

                        {selectedLead && (
                                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4'>
                                        <div className='w-full max-w-lg rounded-3xl border border-white/10 bg-payzone-navy p-8'>
                                                <h3 className='text-xl font-bold text-payzone-gold'>تفعيل دفع الباقة</h3>
                                                <p className='mt-2 text-sm text-white/70'>
                                                        اختر الباقة المتفق عليها وحدد الخصم المناسب.
                                                </p>
                                                <div className='mt-6 space-y-4 text-sm'>
                                                        <label className='block'>
                                                                الباقة المتفق عليها
                                                                <select
                                                                        value={agreedPlan}
                                                                        onChange={(event) => setAgreedPlan(event.target.value)}
                                                                        className='mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white'
                                                                >
                                                                        {PLAN_OPTIONS.map((plan) => (
                                                                                <option key={plan.value} value={plan.value}>
                                                                                        {plan.label}
                                                                                </option>
                                                                        ))}
                                                                </select>
                                                        </label>
                                                        <label className='block'>
                                                                الخصم (USD)
                                                                <input
                                                                        type='number'
                                                                        min='0'
                                                                        value={discountAmount}
                                                                        onChange={(event) => setDiscountAmount(event.target.value)}
                                                                        className='mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white'
                                                                />
                                                        </label>
                                                        <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
                                                                <div className='flex items-center justify-between'>
                                                                        <span>السعر الأساسي</span>
                                                                        <span>{basePrice} USD</span>
                                                                </div>
                                                                <div className='mt-2 flex items-center justify-between'>
                                                                        <span>السعر النهائي</span>
                                                                        <span className='font-semibold text-payzone-gold'>
                                                                                {finalPrice} USD
                                                                        </span>
                                                                </div>
                                                        </div>
                                                </div>
                                                <div className='mt-6 flex flex-wrap justify-end gap-3'>
                                                        <button
                                                                type='button'
                                                                onClick={closeModal}
                                                                className='rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80'
                                                        >
                                                                إلغاء
                                                        </button>
                                                        <button
                                                                type='button'
                                                                onClick={handleEnableCheckout}
                                                                className='rounded-full bg-payzone-gold px-4 py-2 text-xs font-semibold text-payzone-navy'
                                                                disabled={saving}
                                                        >
                                                                {saving ? "جاري التفعيل..." : "تأكيد التفعيل"}
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        )}
                </div>
        );
};

export default AdminLeads;
