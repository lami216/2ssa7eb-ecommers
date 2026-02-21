import { useState } from "react";

const rows = [
        { title: "إطلاق خلال 48 ساعة", starter: "✔", growth: "✔", expansion: "✔" },
        { title: "تخصيص الواجهة", starter: "محدود", growth: "متقدم", expansion: "كامل" },
        { title: "إدارة الطلبات", starter: "✔", growth: "✔", expansion: "✔" },
        { title: "قابلية التوسع", starter: "أساسية", growth: "متقدمة", expansion: "كاملة" },
        { title: "أولوية دعم", starter: "—", growth: "✔", expansion: "✔" },
];

const CompareSection = () => {
        const [expanded, setExpanded] = useState(false);

        return (
                <section className='mt-16'>
                        <div className='text-center'>
                                <button type='button' onClick={() => setExpanded((prev) => !prev)} className='btn-secondary'>
                                        مقارنة واضحة بين الباقات
                                </button>
                        </div>

                        <div
                                className={`overflow-hidden transition-[max-height,opacity,margin] duration-500 ${
                                        expanded ? "mt-6 max-h-[700px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                                <div className='glass-card overflow-x-auto p-4'>
                                        <table className='w-full min-w-[560px] text-right text-sm text-white'>
                                                <thead>
                                                        <tr className='border-b border-white/15 text-payzone-gold'>
                                                                <th className='p-3'>الميزة</th>
                                                                <th className='p-3'>الانطلاقة</th>
                                                                <th className='bg-payzone-gold/10 p-3'>النمو</th>
                                                                <th className='p-3'>التوسع</th>
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {rows.map((row) => (
                                                                <tr key={row.title} className='border-b border-white/10'>
                                                                        <td className='p-3'>{row.title}</td>
                                                                        <td className='p-3'>{row.starter}</td>
                                                                        <td className='bg-payzone-gold/10 p-3 font-semibold text-payzone-gold'>
                                                                                {row.growth}
                                                                        </td>
                                                                        <td className='p-3'>{row.expansion}</td>
                                                                </tr>
                                                        ))}
                                                </tbody>
                                        </table>
                                </div>
                        </div>
                </section>
        );
};

export default CompareSection;
