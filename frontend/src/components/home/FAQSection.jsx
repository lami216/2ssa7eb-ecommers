import { useState } from "react";

const faqs = [
        {
                q: "هل أحتاج خبرة تقنية؟",
                a: "لا، نوفر لوحة تحكم بسيطة وفيديوهات شرح تساعدك على إدارة المتجر بسهولة.",
        },
        {
                q: "ماذا يشمل الاشتراك؟",
                a: "يشمل الاستضافة، الصيانة، الدعم الفني، والتحديثات الأساسية حسب الباقة.",
        },
        {
                q: "متى أحصل على متجري؟",
                a: "عادة خلال 48 ساعة كبداية، وقد تزيد المدة حسب متطلبات التخصيص.",
        },
        {
                q: "هل يمكنني الإلغاء في أي وقت؟",
                a: "نعم، يمكنك الإلغاء وفق شروط الاشتراك الخاصة بالباقة المختارة.",
        },
];

const FAQSection = () => {
        const [openIndex, setOpenIndex] = useState(0);

        return (
                <section className='mt-16'>
                        <h2 className='text-center text-3xl font-bold text-payzone-gold'>الأسئلة الشائعة</h2>

                        <div className='mx-auto mt-8 max-w-3xl space-y-3'>
                                {faqs.map((item, index) => {
                                        const isOpen = openIndex === index;
                                        return (
                                                <article key={item.q} className='glass-card p-4'>
                                                        <button
                                                                type='button'
                                                                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                                                className='flex w-full items-center justify-between text-right text-white'
                                                        >
                                                                <span>{item.q}</span>
                                                                <span className='text-payzone-gold'>{isOpen ? "−" : "+"}</span>
                                                        </button>
                                                        {isOpen && <p className='mt-3 text-sm text-white/75'>{item.a}</p>}
                                                </article>
                                        );
                                })}
                        </div>
                </section>
        );
};

export default FAQSection;
