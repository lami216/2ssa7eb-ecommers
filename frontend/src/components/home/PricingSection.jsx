import { useMemo, useState } from "react";
import { DEFAULT_CURRENCY, SERVICE_PACKAGES } from "../../../../shared/servicePackages.js";

const formatPrice = (amount) => `${Number(amount || 0).toFixed(0)} ${DEFAULT_CURRENCY}`;

const PricingSection = ({ pricingRef }) => {
        const [billingCycle, setBillingCycle] = useState("yearly");

        const plans = useMemo(
                () =>
                        SERVICE_PACKAGES.map((plan) => {
                                const monthlyPrice = Number(plan.monthlyPrice) || 0;
                                const setupFee = Number(plan.oneTimePrice) || 0;
                                const originalYearly = monthlyPrice * 12;
                                const discountedYearly = originalYearly * 0.8;
                                const savedAmount = originalYearly - discountedYearly;

                                return {
                                        ...plan,
                                        monthlyPrice,
                                        setupFee,
                                        originalYearly,
                                        discountedYearly,
                                        savedAmount,
                                };
                        }),
                []
        );

        return (
                <section ref={pricingRef} id='pricing' className='mt-16 scroll-mt-32'>
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
                                        return (
                                                <article
                                                        key={plan.id}
                                                        className={`glass-card p-6 ${featured ? "scale-[1.03] border-payzone-gold shadow-xl shadow-payzone-gold/30" : ""}`}
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
                                                                        <p className='mt-1 text-sm text-white/70'>بدون رسوم إعداد</p>
                                                                        <p className='mt-2 text-xs text-emerald-300'>
                                                                                مقدار التوفير: {formatPrice(plan.savedAmount)}
                                                                        </p>
                                                                </div>
                                                        ) : (
                                                                <div className='mt-6'>
                                                                        <p className='text-3xl font-black text-payzone-gold'>
                                                                                {formatPrice(plan.monthlyPrice)}
                                                                                <span className='text-base font-medium text-white/70'> / شهريًا</span>
                                                                        </p>
                                                                        <p className='mt-1 text-sm text-white/70'>
                                                                                رسوم إعداد مرة واحدة: {formatPrice(plan.setupFee)}
                                                                        </p>
                                                                        <p className='mt-3 text-xs text-payzone-gold'>
                                                                                إعداد احترافي + أول شهر تشغيل مجاني
                                                                        </p>
                                                                </div>
                                                        )}
                                                </article>
                                        );
                                })}
                        </div>
                </section>
        );
};

export default PricingSection;
