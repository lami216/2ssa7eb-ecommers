import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { HOME_PLANS } from "./pricingData";

const formatPrice = (amount) => `${Number(amount || 0).toLocaleString("en-US")} أوقية`;

const PricingSection = ({ pricingRef }) => {
        const [billingCycle, setBillingCycle] = useState("yearly");
        const [openDetails, setOpenDetails] = useState({});

        const plans = useMemo(
                () =>
                        HOME_PLANS.map((plan) => {
                                const originalYearly = plan.monthlyPrice * 12;
                                const discountedYearly = originalYearly * 0.8;
                                const savedAmount = originalYearly - discountedYearly;
                                return {
                                        ...plan,
                                        originalYearly,
                                        discountedYearly,
                                        savedAmount,
                                };
                        }),
                []
        );

        return (
                <section ref={pricingRef} id='pricing' className='mt-16 scroll-mt-36'>
                        <div className='text-center'>
                                <h2 className='text-3xl font-bold text-payzone-gold'>الأسعار</h2>
                                <div className='mx-auto mt-5 inline-flex rounded-full border border-white/20 bg-white/5 p-1'>
                                        <button
                                                type='button'
                                                onClick={() => setBillingCycle("monthly")}
                                                className={`rounded-full px-4 py-2 text-sm ${
                                                        billingCycle === "monthly" ? "bg-white text-slate-900" : "text-white/70"
                                                }`}
                                        >
                                                شهري
                                        </button>
                                        <button
                                                type='button'
                                                onClick={() => setBillingCycle("yearly")}
                                                className={`rounded-full px-4 py-2 text-sm ${
                                                        billingCycle === "yearly" ? "bg-white text-slate-900" : "text-white/70"
                                                }`}
                                        >
                                                سنوي
                                        </button>
                                </div>
                        </div>

                        <div className='mt-8 grid gap-5 lg:grid-cols-3'>
                                {plans.map((plan, index) => {
                                        const featured = index === 1;
                                        const detailsOpen = Boolean(openDetails[plan.id]);

                                        return (
                                                <article
                                                        key={plan.id}
                                                        className={`glass-card p-6 ${
                                                                featured
                                                                        ? "scale-[1.03] border-payzone-gold shadow-xl shadow-payzone-gold/30"
                                                                        : "border-white/20"
                                                        }`}
                                                >
                                                        {featured && (
                                                                <span className='mb-3 inline-flex rounded-full bg-payzone-gold px-3 py-1 text-xs font-bold text-payzone-navy'>
                                                                        الأكثر طلبًا
                                                                </span>
                                                        )}
                                                        <h3 className='text-2xl font-bold text-white'>{plan.name}</h3>

                                                        {billingCycle === "yearly" ? (
                                                                <div className='mt-6'>
                                                                        <p className='text-sm text-white/60 line-through'>
                                                                                {formatPrice(plan.originalYearly)}
                                                                        </p>
                                                                        <p className='text-3xl font-black text-payzone-gold'>
                                                                                {formatPrice(plan.discountedYearly)}
                                                                        </p>
                                                                        <p className='mt-1 text-sm text-white/80'>بدون رسوم إعداد</p>
                                                                        <p className='mt-2 text-xs text-emerald-300'>
                                                                                وفرت {formatPrice(plan.savedAmount)}
                                                                        </p>
                                                                </div>
                                                        ) : (
                                                                <div className='mt-6'>
                                                                        <p className='text-3xl font-black text-payzone-gold'>
                                                                                {formatPrice(plan.monthlyPrice)}
                                                                                <span className='text-base font-medium text-white/70'> / شهريًا</span>
                                                                        </p>
                                                                        <p className='mt-1 text-sm text-white/80'>
                                                                                رسوم الإعداد: {formatPrice(plan.setupFee)}
                                                                        </p>
                                                                        <p className='mt-3 text-xs text-payzone-gold'>
                                                                                إعداد احترافي + أول شهر تشغيل مجاني
                                                                        </p>
                                                                </div>
                                                        )}

                                                        <ul className='mt-5 space-y-2 text-sm text-white/80'>
                                                                {plan.bullets.map((item) => (
                                                                        <li key={item}>• {item}</li>
                                                                ))}
                                                        </ul>

                                                        <button
                                                                type='button'
                                                                onClick={() =>
                                                                        setOpenDetails((prev) => ({
                                                                                ...prev,
                                                                                [plan.id]: !prev[plan.id],
                                                                        }))
                                                                }
                                                                className='mt-4 inline-flex items-center gap-2 text-sm text-payzone-gold'
                                                        >
                                                                عرض التفاصيل
                                                                <ChevronDown
                                                                        size={16}
                                                                        className={`transition-transform ${detailsOpen ? "rotate-180" : ""}`}
                                                                />
                                                        </button>

                                                        <div
                                                                className={`overflow-hidden transition-[max-height,opacity] duration-400 ${
                                                                        detailsOpen ? "max-h-44 opacity-100" : "max-h-0 opacity-0"
                                                                }`}
                                                        >
                                                                <ul className='mt-3 space-y-1 text-xs text-white/70'>
                                                                        {plan.details.map((item) => (
                                                                                <li key={item}>- {item}</li>
                                                                        ))}
                                                                </ul>
                                                        </div>
                                                </article>
                                        );
                                })}
                        </div>
                </section>
        );
};

export default PricingSection;
