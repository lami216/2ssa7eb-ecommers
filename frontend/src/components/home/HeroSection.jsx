import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const HeroSection = ({ projectsCount = 0, onScrollToPricing }) => {
        const [topBarClosed, setTopBarClosed] = useState(false);

        const proofLine = useMemo(() => `تم إطلاق ${projectsCount} متجر حتى الآن`, [projectsCount]);

        return (
                <section className='relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#070b1a] via-[#11192d] to-[#1b1032] p-6 sm:p-10'>
                        <div
                                className={`mb-8 overflow-hidden transition-[max-height,opacity,margin] duration-500 ease-out ${
                                        topBarClosed ? "max-h-0 opacity-0 mb-0" : "max-h-24 opacity-100"
                                }`}
                                aria-hidden={topBarClosed}
                        >
                                <div className='flex items-center justify-between gap-3 rounded-xl border border-payzone-gold/30 bg-payzone-gold/10 px-4 py-3 text-sm text-payzone-gold backdrop-blur'>
                                        <p>خطط مرنة تناسب الجميع — ادفع شهريًا أو سنويًا بدون التزام</p>
                                        <button
                                                type='button'
                                                onClick={() => setTopBarClosed(true)}
                                                className='rounded-md border border-payzone-gold/40 px-2 py-1 text-xs hover:bg-payzone-gold/20'
                                        >
                                                إغلاق
                                        </button>
                                </div>
                        </div>

                        <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45 }}
                                className='mx-auto max-w-4xl text-center'
                        >
                                <span className='inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-white/85 sm:text-sm'>
                                        خطط مرنة تناسب الجميع — ادفع شهريًا أو سنويًا بدون التزام
                                </span>

                                <h1 className='mt-5 text-3xl font-black leading-tight text-white sm:text-5xl'>
                                        ابدأ البيع أونلاين خلال 48 ساعة
                                        <br />
                                        متجرك الإلكتروني جاهز ابتداءً من 5,000 أوقية
                                </h1>

                                <p className='mx-auto mt-5 max-w-2xl text-base text-white/75 sm:text-lg'>{proofLine}</p>

                                <button
                                        type='button'
                                        onClick={onScrollToPricing}
                                        className='btn-primary mt-8 inline-flex items-center justify-center'
                                >
                                        عرض الأسعار
                                </button>
                        </motion.div>
                </section>
        );
};

export default HeroSection;
