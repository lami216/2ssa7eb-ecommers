import { useState } from "react";
import { X } from "lucide-react";

const PROMO_TEXT = "عرض خاص لأول 10 عملاء هذا الشهر — احجز مكانك الآن";

const PromoBanner = () => {
        const [isClosed, setIsClosed] = useState(false);

        return (
                <section
                        className={`mt-8 overflow-hidden transition-[max-height,opacity,margin] duration-500 ease-out ${
                                isClosed ? "max-h-0 opacity-0" : "max-h-40 opacity-100"
                        }`}
                        aria-hidden={isClosed}
                >
                        <div className='mx-auto w-full max-w-3xl'>
                                <div className='relative overflow-hidden rounded-2xl border border-payzone-gold/25 bg-[#0f1526]/80 px-5 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl'>
                                        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(210,156,74,0.18),transparent_55%)]' />
                                        <div className='relative flex items-center justify-between gap-4'>
                                                <p className='text-sm font-medium text-payzone-gold sm:text-base'>{PROMO_TEXT}</p>
                                                <button
                                                        type='button'
                                                        onClick={() => setIsClosed(true)}
                                                        className='rounded-full border border-payzone-gold/35 bg-white/5 p-1.5 text-payzone-gold transition hover:bg-payzone-gold/15'
                                                        aria-label='إغلاق العرض الخاص'
                                                >
                                                        <X size={14} />
                                                </button>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

export default PromoBanner;
