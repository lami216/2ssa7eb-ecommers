import { useEffect, useState } from "react";
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

const AdminLeads = () => {
        const [leads, setLeads] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");

        useEffect(() => {
                let isMounted = true;

                const fetchLeads = async () => {
                        try {
                                const data = await apiClient.get("/admin/leads");
                                if (isMounted) {
                                        setLeads(Array.isArray(data) ? data : []);
                                }
                        } catch {
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
                                                                <th className='px-4 py-3 text-right'>التواصل مفعل</th>
                                                                <th className='px-4 py-3 text-right'>تاريخ الإنشاء</th>
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {leads.map((lead) => (
                                                                <tr key={lead._id} className='border-t border-white/10 text-white/80'>
                                                                        <td className='px-4 py-3'>{lead.fullName}</td>
                                                                        <td className='px-4 py-3'>{lead.email}</td>
                                                                        <td className='px-4 py-3'>{lead.selectedPlan}</td>
                                                                        <td className='px-4 py-3'>{lead.status || "-"}</td>
                                                                        <td className='px-4 py-3'>
                                                                                {lead.contactFeePaid ? "نعم" : "نعم"}
                                                                        </td>
                                                                        <td className='px-4 py-3'>{formatDate(lead.createdAt)}</td>
                                                                </tr>
                                                        ))}
                                                </tbody>
                                        </table>
                                </div>
                        </div>
                </div>
        );
};

export default AdminLeads;
