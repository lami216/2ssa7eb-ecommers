import { motion } from "framer-motion";

const steps = ["أرسل طلبك", "شاهد متجرك جاهزًا", "ادفع عند الجاهزية وانطلق للبيع"];

const HowItWorksSection = () => {
        return (
                <section className='mt-16'>
                        <h2 className='text-center text-3xl font-bold text-payzone-gold'>كيف نبدأ معك؟</h2>
                        <div className='mt-8 grid gap-4 md:grid-cols-3'>
                                {steps.map((step, index) => (
                                        <motion.div
                                                key={step}
                                                initial={{ opacity: 0, y: 12 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.08 }}
                                                className='glass-card p-6 text-center'
                                        >
                                                <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-payzone-gold font-bold text-payzone-navy'>
                                                        {index + 1}
                                                </div>
                                                <p className='mt-4 text-lg font-semibold text-white'>{step}</p>
                                        </motion.div>
                                ))}
                        </div>

                        <div className='mt-6 rounded-2xl border border-payzone-gold/30 bg-payzone-gold/10 p-4 text-center text-payzone-gold'>
                                لا تدفع شيئًا حتى ترى النتيجة بنفسك
                        </div>
                </section>
        );
};

export default HowItWorksSection;
