const supportItems = [
        "دعم فني مستمر",
        "تحديثات وصيانة",
        "حل المشاكل التقنية",
        "الاشتراك يشمل الدعم الكامل",
];

const easeItems = [
        "فيديوهات شرح",
        "لوحة تحكم سهلة",
        "إضافة منتجات خلال دقائق",
        "لا تحتاج خبرة تقنية",
];

const SupportSection = () => {
        return (
                <section className='mt-16'>
                        <h2 className='text-center text-3xl font-bold text-payzone-gold'>نحن معك بعد الإطلاق</h2>

                        <div className='mt-8 grid gap-5 md:grid-cols-2'>
                                <article className='glass-card p-6'>
                                        <h3 className='text-xl font-semibold text-white'>دعم مستمر</h3>
                                        <ul className='mt-4 space-y-2 text-white/75'>
                                                {supportItems.map((item) => (
                                                        <li key={item}>• {item}</li>
                                                ))}
                                        </ul>
                                </article>

                                <article className='glass-card p-6'>
                                        <h3 className='text-xl font-semibold text-white'>سهولة الاستخدام</h3>
                                        <ul className='mt-4 space-y-2 text-white/75'>
                                                {easeItems.map((item) => (
                                                        <li key={item}>• {item}</li>
                                                ))}
                                        </ul>
                                </article>
                        </div>

                        <p className='mt-6 text-center text-payzone-gold'>
                                نلتزم بتنفيذ كامل ما تتضمنه باقتك باحترافية
                        </p>
                </section>
        );
};

export default SupportSection;
