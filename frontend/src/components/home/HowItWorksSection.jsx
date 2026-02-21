const steps = ["أرسل طلبك", "شاهد متجرك جاهزًا", "ادفع عند الجاهزية"];

const HowItWorksSection = () => {
        return (
                <section className='mt-16'>
                        <h2 className='text-center text-3xl font-bold text-payzone-gold'>كيف تبدأ معنا؟</h2>
                        <div className='mt-8 grid gap-5 md:grid-cols-3'>
                                {steps.map((step, index) => (
                                        <article key={step} className='glass-card p-6 text-center'>
                                                <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-payzone-gold/20 font-bold text-payzone-gold'>
                                                        {index + 1}
                                                </span>
                                                <p className='mt-4 text-lg font-semibold text-white'>{step}</p>
                                        </article>
                                ))}
                        </div>
                        <p className='mt-6 text-center text-payzone-gold'>لا تدفع شيئًا حتى ترى النتيجة بنفسك</p>
                </section>
        );
};

export default HowItWorksSection;
