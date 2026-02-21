import { useState } from "react";
import { SERVICE_PACKAGES } from "../../../../shared/servicePackages";

const PAYMENT_OPTIONS = [
        { value: "monthly", label: "شهري" },
        { value: "yearly", label: "سنوي" },
];

const ContactSection = () => {
        const [formData, setFormData] = useState({
                name: "",
                businessType: "",
                planId: SERVICE_PACKAGES[1]?.id || SERVICE_PACKAGES[0]?.id || "",
                paymentType: "yearly",
                whatsapp: "",
                idea: "",
        });

        const handleChange = (event) => {
                const { name, value } = event.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (event) => {
                event.preventDefault();
                const selectedPlan = SERVICE_PACKAGES.find((plan) => plan.id === formData.planId);
                const message = `مرحبًا، أرغب في بدء متجر جديد.%0Aالاسم: ${formData.name}%0Aنوع النشاط: ${formData.businessType}%0Aالباقة: ${selectedPlan?.name || "-"}%0Aطريقة الدفع: ${formData.paymentType === "yearly" ? "سنوي" : "شهري"}%0Aرقم واتساب: ${formData.whatsapp}%0Aفكرة المشروع: ${formData.idea || "لا يوجد"}`;
                window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
        };

        return (
                <section className='mt-16'>
                        <h2 className='text-center text-3xl font-bold text-payzone-gold'>ابدأ متجرك الآن</h2>
                        <form onSubmit={handleSubmit} className='mx-auto mt-8 grid max-w-3xl gap-4 glass-card p-6'>
                                <input name='name' value={formData.name} onChange={handleChange} required placeholder='الاسم' className='glass-input' />
                                <input name='businessType' value={formData.businessType} onChange={handleChange} required placeholder='نوع النشاط' className='glass-input' />
                                <select name='planId' value={formData.planId} onChange={handleChange} className='glass-input' required>
                                        {SERVICE_PACKAGES.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                        {plan.name}
                                                </option>
                                        ))}
                                </select>
                                <select name='paymentType' value={formData.paymentType} onChange={handleChange} className='glass-input' required>
                                        {PAYMENT_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                        {option.label}
                                                </option>
                                        ))}
                                </select>
                                <input name='whatsapp' value={formData.whatsapp} onChange={handleChange} required placeholder='رقم واتساب' className='glass-input' />
                                <textarea name='idea' value={formData.idea} onChange={handleChange} placeholder='فكرة المشروع (اختياري)' className='glass-input min-h-28' />
                                <button type='submit' className='btn-primary mt-2'>
                                        إرسال عبر واتساب
                                </button>
                        </form>
                </section>
        );
};

export default ContactSection;
