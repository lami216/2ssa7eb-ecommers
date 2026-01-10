import { useCallback, useEffect, useState } from "react";
import apiClient from "../lib/apiClient";

const statusOptions = ["Pending", "Trialing", "Suspended", "Canceled"];

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

const AdminServices = () => {
        const [services, setServices] = useState([]);
        const [searchEmail, setSearchEmail] = useState("");
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

        const fetchServices = useCallback(async () => {
                setLoading(true);
                setError("");
                try {
                        const query = searchEmail.trim() ? `?email=${encodeURIComponent(searchEmail.trim())}` : "";
                        const data = await apiClient.get(`/services/admin${query}`);
                        setServices(Array.isArray(data) ? data : []);
                } catch (err) {
                        setError(err.response?.data?.message || "تعذر تحميل الخدمات الآن.");
                } finally {
                        setLoading(false);
                }
        }, [searchEmail]);

        useEffect(() => {
                fetchServices();
        }, [fetchServices]);

        const updateService = async (serviceId, payload) => {
                try {
                        const updated = await apiClient.patch(`/services/${serviceId}`, payload);
                        setServices((prev) => prev.map((service) => (service._id === serviceId ? updated : service)));
                } catch (err) {
                        setError(err.response?.data?.message || "تعذر تحديث الخدمة.");
                }
        };

        const runAction = async (serviceId, action) => {
                try {
                        const updated = await apiClient.post(`/services/${serviceId}/${action}`);
                        setServices((prev) => prev.map((service) => (service._id === serviceId ? updated : service)));
                } catch (err) {
                        setError(err.response?.data?.message || "تعذر تنفيذ الإجراء.");
                }
        };

        return (
                <div className='rounded-3xl border border-white/10 bg-payzone-navy/70 p-6 text-white'>
                        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                                <div>
                                        <h2 className='text-2xl font-bold text-payzone-gold'>إدارة الخدمات</h2>
                                        <p className='mt-1 text-sm text-white/60'>ابحث بالبريد الإلكتروني لإظهار خدمات العميل.</p>
                                </div>
                                <div className='flex flex-col gap-3 sm:flex-row'>
                                        <input
                                                type='email'
                                                value={searchEmail}
                                                onChange={(event) => setSearchEmail(event.target.value)}
                                                placeholder='البريد الإلكتروني'
                                                className='rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none'
                                        />
                                        <button
                                                type='button'
                                                onClick={fetchServices}
                                                className='rounded-md bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                disabled={loading}
                                        >
                                                {loading ? "جاري البحث..." : "بحث"}
                                        </button>
                                </div>
                        </div>

                        {error && (
                                <div className='mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200'>
                                        {error}
                                </div>
                        )}

                        <div className='mt-6 overflow-x-auto'>
                                <table className='min-w-full text-sm'>
                                        <thead className='bg-white/5 text-white/60'>
                                                <tr>
                                                        <th className='px-4 py-3 text-right'>البريد الإلكتروني</th>
                                                        <th className='px-4 py-3 text-right'>الباقة</th>
                                                        <th className='px-4 py-3 text-right'>الحالة</th>
                                                        <th className='px-4 py-3 text-right'>بدء التجربة</th>
                                                        <th className='px-4 py-3 text-right'>آخر دفع</th>
                                                        <th className='px-4 py-3 text-right'>Subscription ID</th>
                                                        <th className='px-4 py-3 text-right'>إجراءات</th>
                                                </tr>
                                        </thead>
                                        <tbody>
                                                {services.map((service) => (
                                                        <tr key={service._id} className='border-t border-white/10 text-white/80'>
                                                                <td className='px-4 py-3'>{service.email}</td>
                                                                <td className='px-4 py-3'>{service.packageName}</td>
                                                                <td className='px-4 py-3'>
                                                                        <select
                                                                                value={service.status}
                                                                                onChange={(event) =>
                                                                                        updateService(service._id, {
                                                                                                status: event.target.value,
                                                                                        })
                                                                                }
                                                                                className='rounded-md border border-white/15 bg-payzone-navy/70 px-2 py-1 text-xs text-white focus:border-payzone-gold focus:outline-none'
                                                                        >
                                                                                {statusOptions.map((status) => (
                                                                                        <option key={status} value={status}>
                                                                                                {status}
                                                                                        </option>
                                                                                ))}
                                                                        </select>
                                                                </td>
                                                                <td className='px-4 py-3'>{formatDate(service.trialStartAt)}</td>
                                                                <td className='px-4 py-3'>{formatDate(service.lastPaymentAt)}</td>
                                                                <td className='px-4 py-3'>
                                                                        <input
                                                                                type='text'
                                                                                defaultValue={service.subscriptionId}
                                                                                onBlur={(event) =>
                                                                                        updateService(service._id, {
                                                                                                subscriptionId: event.target.value,
                                                                                        })
                                                                                }
                                                                                className='w-40 rounded-md border border-white/15 bg-payzone-navy/70 px-2 py-1 text-xs text-white focus:border-payzone-gold focus:outline-none'
                                                                        />
                                                                </td>
                                                                <td className='px-4 py-3'>
                                                                        <div className='flex flex-wrap gap-2'>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => runAction(service._id, "activate-trial")}
                                                                                        className='rounded-full bg-payzone-gold px-3 py-1 text-xs font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                                                >
                                                                                        Activate & Start Trial
                                                                                </button>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => runAction(service._id, "suspend")}
                                                                                        className='rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20'
                                                                                >
                                                                                        Suspend
                                                                                </button>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => runAction(service._id, "cancel")}
                                                                                        className='rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/30'
                                                                                >
                                                                                        Cancel
                                                                                </button>
                                                                        </div>
                                                                </td>
                                                        </tr>
                                                ))}
                                        </tbody>
                                </table>
                        </div>
                </div>
        );
};

export default AdminServices;
