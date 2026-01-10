import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Mail, MessageSquare, Package, Phone, User } from "lucide-react";
import apiClient from "../lib/apiClient";

const HomePage = () => {
        const packages = useMemo(
                () => [
                        {
                                id: "starter",
                                name: "باقة الإقلاع – Basic",
                                price: "5000 أوقية قديمة",
                                monthly: "3000 أوقية قديمة",
                                badge: "خصم 70%",
                                details: [
                                        "قالب جاهز نغيّر الاسم والألوان فقط.",
                                        "لوحة التحكم ثابتة كما هي في القالب.",
                                        "مدة التنفيذ من 24 إلى 48 ساعة.",
                                ],
                        },
                        {
                                id: "growth",
                                name: "باقة النمو – Pro",
                                price: "10000 أوقية قديمة",
                                monthly: "5000 أوقية قديمة",
                                badge: "خصم 55%",
                                details: [
                                        "القالب كأساس مع تخصيص كامل لأي جزء.",
                                        "إضافة ميزات حسب الطلب.",
                                        "لوحة التحكم قابلة للتخصيص.",
                                        "مدة التنفيذ من يومين إلى 3 أيام حسب التعديلات.",
                                ],
                        },
                        {
                                id: "full",
                                name: "باقة السيطرة الكاملة – Plus",
                                price: "20000 أوقية قديمة",
                                monthly: "7000 أوقية قديمة",
                                badge: "خصم 40%",
                                details: [
                                        "بناء من الصفر بدون قالب.",
                                        "تنفيذ متجر أو منصة أو موقع خدمات أو أي نظام حسب الفكرة أو استنساخ موقع موجود.",
                                        "لوحة التحكم تُبنى حسب احتياج المشروع.",
                                        "المدة حسب حجم المتطلبات بدون رقم ثابت.",
                                ],
                        },
                ],
                []
        );

        const comparisonRows = useMemo(
                () => [
                        { label: "تشغيل سريع", starter: "✅", growth: "✅", full: "✅" },
                        { label: "تعديل الاسم والألوان", starter: "✅", growth: "✅", full: "✅" },
                        { label: "استضافة على سيرفر خاص", starter: "✅", growth: "✅", full: "✅" },
                        { label: "دعم فني عبر واتساب", starter: "✅", growth: "✅", full: "✅" },
                        { label: "حل الأعطال بدون حدود", starter: "✅", growth: "✅", full: "✅" },
                        { label: "تعديل القالب", starter: "❌", growth: "✅", full: "✅" },
                        { label: "إضافة ميزات جديدة", starter: "❌", growth: "✅", full: "✅" },
                        { label: "تخصيص لوحة التحكم", starter: "❌", growth: "✅", full: "✅" },
                        { label: "تصميم من الصفر", starter: "❌", growth: "❌", full: "✅" },
                        { label: "بناء نظام حسب الفكرة", starter: "❌", growth: "❌", full: "✅" },
                        { label: "قابلية توسعة مستقبلية عالية", starter: "❌", growth: "❌", full: "✅" },
                        { label: "مناسب للشركات والمنصات", starter: "❌", growth: "❌", full: "✅" },
                ],
                []
        );

        const [checkoutInfo, setCheckoutInfo] = useState({
                packageId: packages[0].id,
                name: "",
                email: "",
                whatsapp: "",
                alternateEmail: "",
                idea: "",
        });
        const [checkoutLoading, setCheckoutLoading] = useState(false);
        const [checkoutError, setCheckoutError] = useState("");

        const shouldReduceMotion = useReducedMotion();

        const handleCheckout = async (event) => {
                event.preventDefault();
                setCheckoutError("");

                if (!checkoutInfo.packageId || !checkoutInfo.name.trim() || !checkoutInfo.email.trim()) {
                        setCheckoutError("يرجى إدخال الاسم والبريد الإلكتروني واختيار الباقة.");
                        return;
                }

                try {
                        setCheckoutLoading(true);
                        const data = await apiClient.post("/payments/paypal/create-order", checkoutInfo);
                        if (data?.approveUrl) {
                                globalThis.location.href = data.approveUrl;
                        } else {
                                setCheckoutError("تعذر تجهيز الدفع عبر باي بال الآن.");
                        }
                } catch (error) {
                        setCheckoutError(error.response?.data?.message || "تعذر تجهيز الدفع عبر باي بال الآن.");
                } finally {
                        setCheckoutLoading(false);
                }
        };

        const ScrollReveal = ({ children, className, direction = "right", offset = ["start 90%", "start 55%"] }) => {
                const cardRef = useRef(null);
                const { scrollYProgress } = useScroll({
                        target: cardRef,
                        offset,
                });
                const isGlass = className?.includes("glass-");
                const fromX = direction === "right" ? 40 : direction === "left" ? -40 : 0;
                const fromY = direction === "up" ? 24 : 0;
                const x = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [fromX, 0]);
                const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [fromY, 0]);
                const opacity = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [0, 1]);

                return (
                        <motion.div
                                ref={cardRef}
                                style={{
                                        x,
                                        y,
                                        opacity,
                                        translateZ: isGlass ? 0 : undefined,
                                        willChange: isGlass && !shouldReduceMotion ? "transform, opacity" : "auto",
                                }}
                                className={`scroll-reveal ${className ?? ""}`}
                        >
                                {children}
                        </motion.div>
                );
        };

        return (
                <div className='relative min-h-screen overflow-hidden text-payzone-white'>
                        <div className='tech-bg'>
                                <div className='tech-bg__layer bg-tech-grid' />
                                <div className='tech-bg__layer bg-tech-circuit' />
                                <div className='tech-bg__layer bg-tech-symbols' />
                                <div className='tech-bg__layer bg-tech-glow' />
                        </div>

                        <div className='relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
                                <section className='text-center'>
                                        <ScrollReveal direction='right' className='glass-hero px-6 py-10 sm:px-10 sm:py-12 lg:px-14'>
                                                <span className='inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-payzone-gold'>
                                                        Payzone | بايزوون
                                                </span>
                                                <h1 className='mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl'>
                                                        نبني لك متجرك الإلكتروني بلوحة تحكم سهلة واستضافة قوية
                                                </h1>
                                                <p className='mt-4 text-lg text-white/70'>
                                                        خدمة Payzone بايزوون تجمع بين التصميم السريع، لوحة التحكم الواضحة،
                                                        واستضافة دائمة على سيرفرنا الخاص لتحمل الضغط والزيارات العالية مع سرعة واستقرار.
                                                </p>
                                                <div className='mt-8 flex flex-wrap justify-center gap-4'>
                                                        <a
                                                                href='#qualification'
                                                                onClick={(event) => {
                                                                        event.preventDefault();
                                                                        document.getElementById("qualification")?.scrollIntoView({ behavior: "smooth" });
                                                                }}
                                                                className='btn-primary'
                                                        >
                                                                ابدأ الآن
                                                        </a>
                                                        <a
                                                                href='#pricing'
                                                                onClick={(event) => {
                                                                        event.preventDefault();
                                                                        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                                                                }}
                                                                className='btn-secondary'
                                                        >
                                                                استكشف الباقات والأسعار
                                                        </a>
                                                </div>
                                        </ScrollReveal>
                                </section>

                                <section
                                        id='features'
                                        className='scroll-section mt-16 grid gap-6 lg:grid-cols-3'
                                >
                                        {[
                                                {
                                                        title: "لوحة تحكم سهلة",
                                                        description:
                                                                "إدارة المنتجات والطلبات والعملاء من لوحة واضحة تناسب الفرق الصغيرة والمتوسطة.",
                                                },
                                                {
                                                        title: "استضافة على سيرفرنا فقط",
                                                        description:
                                                                "نستضيف متجرك على سيرفر Payzone بايزوون الخاص لضمان السرعة والثبات تحت الضغط.",
                                                },
                                                {
                                                        title: "دعم مباشر عبر واتساب",
                                                        description:
                                                                "دعم فني سريع ومباشر عبر واتساب لمتابعة أي مشكلة أو طلب.",
                                                },
                                        ].map((item, index) => (
                                                <ScrollReveal
                                                        key={item.title}
                                                        direction={index % 2 === 0 ? "right" : "left"}
                                                        className='glass-card'
                                                >
                                                        <h3 className='text-xl font-semibold text-payzone-gold'>{item.title}</h3>
                                                        <p className='mt-3 text-white/70'>{item.description}</p>
                                                </ScrollReveal>
                                        ))}
                                </section>

                                <section
                                        id='steps'
                                        className='scroll-section mt-20'
                                >
                                        <ScrollReveal direction='right' className='glass-panel px-6 py-10 sm:px-10'>
                                                <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                                                        <div>
                                                                <h2 className='text-3xl font-bold text-payzone-gold'>آلية استقبال الطلبات عبر واتساب</h2>
                                                                <p className='mt-4 text-white/70'>
                                                                        نقوم بربط المتجر مباشرة بواتساب العميل. عند قيام أي زبون بالطلب،
                                                                        تصل رسالة جاهزة بكل تفاصيل الطلب إلى واتساب صاحب المتجر ليتم التواصل
                                                                        وإغلاق البيع بسهولة ودون تعقيد.
                                                                </p>
                                                        </div>
                                                        <div className='hidden lg:flex lg:flex-col lg:items-center lg:gap-3'>
                                                                <span className='text-sm text-white/50'>تسلسل الطلب</span>
                                                                <div className='h-20 w-px bg-gradient-to-b from-transparent via-payzone-gold/60 to-transparent' />
                                                        </div>
                                                </div>
                                                <div className='mt-8 grid gap-6 md:grid-cols-3'>
                                                        {[
                                                                {
                                                                        step: "1",
                                                                        title: "الزبون يطلب من المتجر",
                                                                        description: "واجهة واضحة تحفّز على إكمال الطلب.",
                                                                },
                                                                {
                                                                        step: "2",
                                                                        title: "رسالة جاهزة تصل فوراً",
                                                                        description: "تفاصيل الطلب تصل كاملة على واتساب صاحب المتجر.",
                                                                },
                                                                {
                                                                        step: "3",
                                                                        title: "تواصل مباشر وإغلاق البيع",
                                                                        description: "نقاش مباشر مع العميل لإتمام البيع بسهولة.",
                                                                },
                                                        ].map((item) => (
                                                                <ScrollReveal
                                                                        key={item.step}
                                                                        direction='left'
                                                                        className='glass-card glass-card--compact'
                                                                >
                                                                        <span className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-payzone-gold text-payzone-navy text-lg font-bold'>
                                                                                {item.step}
                                                                        </span>
                                                                        <h3 className='mt-4 text-lg font-semibold'>{item.title}</h3>
                                                                        <p className='mt-2 text-white/70'>{item.description}</p>
                                                                </ScrollReveal>
                                                        ))}
                                                </div>
                                        </ScrollReveal>
                                </section>

                                <section
                                        id='pricing'
                                        className='scroll-section scroll-target mt-20'
                                >
                                        <ScrollReveal direction='right' className='text-center'>
                                                <h2 className='text-3xl font-bold text-payzone-gold'>الباقات والأسعار</h2>
                                                <p className='mt-3 text-white/70'>
                                                        الأسعار المعروضة هي السعر بعد التخفيض مباشرة، مع دعم شهري ثابت لكل باقة.
                                                </p>
                                        </ScrollReveal>
                                        <div className='mt-10 grid gap-8 lg:grid-cols-3'>
                                                {packages.map((pkg) => {
                                                        const isHighlighted = pkg.id === "growth";
                                                        return (
                                                                <ScrollReveal
                                                                        key={pkg.id}
                                                                        direction={isHighlighted ? "right" : "left"}
                                                                        className={`glass-card flex h-full flex-col ${
                                                                                isHighlighted
                                                                                        ? "ring-1 ring-payzone-gold/40 shadow-[0_30px_80px_rgba(210,156,74,0.25)]"
                                                                                        : ""
                                                                        }`}
                                                                >
                                                                        <div className='flex items-center justify-between gap-4'>
                                                                                <h3 className='text-2xl font-semibold text-white'>{pkg.name}</h3>
                                                                                <span className='rounded-full bg-payzone-gold px-3 py-1 text-sm font-semibold text-payzone-navy'>
                                                                                        {pkg.badge}
                                                                                </span>
                                                                        </div>
                                                                        <div className='mt-4 text-3xl font-bold text-payzone-gold'>{pkg.price}</div>
                                                                        <div className='mt-2 text-sm text-white/70'>اشتراك شهري: {pkg.monthly}</div>
                                                                        <ul className='mt-6 space-y-3 text-white/80'>
                                                                                {pkg.details.map((detail) => (
                                                                                        <li key={detail} className='flex items-start gap-2'>
                                                                                                <span className='mt-1 h-2 w-2 rounded-full bg-payzone-gold' />
                                                                                                <span>{detail}</span>
                                                                                        </li>
                                                                                ))}
                                                                        </ul>
                                                                        <div className='mt-6 text-sm text-white/70'>
                                                                                حل المشاكل والأعطال غير محدود ضمن الاشتراك الشهري في جميع الباقات.
                                                                        </div>
                                                                        <div className='mt-3 text-sm text-white/70'>
                                                                                إضافة ميزات جديدة متاحة في باقة النمو – Pro وباقة السيطرة الكاملة – Plus،
                                                                                مع مرونة أكبر في باقة السيطرة الكاملة – Plus.
                                                                        </div>
                                                                        {pkg.id === "full" && (
                                                                                <div className='mt-3 text-sm text-white/70'>
                                                                                        السورس كود متاح فقط في هذه الباقة بقيمة 5000 أوقية قديمة عند الطلب.
                                                                                </div>
                                                                        )}
                                                                        <a
                                                                                href='#qualification'
                                                                                onClick={(event) => {
                                                                                        event.preventDefault();
                                                                                        document.getElementById("qualification")?.scrollIntoView({ behavior: "smooth" });
                                                                                }}
                                                                                className='btn-primary mt-8'
                                                                        >
                                                                                اطلب باقتك الآن
                                                                        </a>
                                                                </ScrollReveal>
                                                        );
                                                })}
                                        </div>
                                </section>

                                <section className='scroll-section mt-20'>
                                        <ScrollReveal direction='right' className='glass-panel px-6 py-10 sm:px-10'>
                                                <h2 className='text-3xl font-bold text-payzone-gold'>مقارنة حقيقية بين الباقات</h2>
                                                <p className='mt-3 text-white/70'>الفرق الأساسي في التصميم ولوحة التحكم ومستوى المرونة.</p>
                                                <div className='mt-8 hidden md:block'>
                                                        <table className='min-w-[680px] text-right text-sm'>
                                                                <thead>
                                                                        <tr className='text-white/60'>
                                                                                <th className='sticky right-0 z-10 border-l border-white/10 bg-payzone-navy/70 px-4 py-3'>
                                                                                        الميزة
                                                                                </th>
                                                                                <th className='px-4 py-3'>باقة الإقلاع – Basic</th>
                                                                                <th className='px-4 py-3'>باقة النمو – Pro</th>
                                                                                <th className='px-4 py-3'>باقة السيطرة الكاملة – Plus</th>
                                                                        </tr>
                                                                </thead>
                                                                <tbody>
                                                                        {comparisonRows.map((row) => (
                                                                                <tr key={row.label} className='border-t border-white/10 text-white/80'>
                                                                                        <td className='sticky right-0 z-10 border-l border-white/10 bg-payzone-navy/60 px-4 py-3'>
                                                                                                {row.label}
                                                                                        </td>
                                                                                        <td className='px-4 py-3'>{row.starter}</td>
                                                                                        <td className='px-4 py-3'>{row.growth}</td>
                                                                                        <td className='px-4 py-3'>{row.full}</td>
                                                                                </tr>
                                                                        ))}
                                                                </tbody>
                                                        </table>
                                                </div>
                                                <div className='mt-8 space-y-3 md:hidden'>
                                                        <div className='glass-card glass-card--compact flex items-center justify-between gap-3 text-xs text-white/60'>
                                                                <span className='flex-1 text-right'>الميزة</span>
                                                                <div className='grid w-[168px] grid-cols-3 gap-2 text-center'>
                                                                        <span>باقة الإقلاع – Basic</span>
                                                                        <span>باقة النمو – Pro</span>
                                                                        <span>باقة السيطرة الكاملة – Plus</span>
                                                                </div>
                                                        </div>
                                                        {comparisonRows.map((row) => (
                                                                <div
                                                                        key={row.label}
                                                                        className='glass-card glass-card--compact grid grid-cols-[minmax(0,1fr)_repeat(3,52px)] items-center gap-2 text-xs text-white/80'
                                                                >
                                                                        <span className='text-right'>{row.label}</span>
                                                                        <span className='text-center text-base'>{row.starter}</span>
                                                                        <span className='text-center text-base'>{row.growth}</span>
                                                                        <span className='text-center text-base'>{row.full}</span>
                                                                </div>
                                                        ))}
                                                </div>
                                        </ScrollReveal>
                                </section>

                                <section
                                        id='qualification'
                                        className='scroll-section mt-20 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'
                                >
                                        <ScrollReveal direction='right' className='glass-panel px-6 py-10 sm:px-10'>
                                                <h2 className='text-3xl font-bold text-payzone-gold'>نموذج طلب الباقة والدفع عبر PayPal</h2>
                                                <p className='mt-3 text-white/70'>
                                                        أدخل معلوماتك الأساسية ثم تابع الدفع عبر PayPal لتأكيد طلبك مباشرة.
                                                </p>
                                                <form className='mt-6 grid gap-4' onSubmit={handleCheckout}>
                                                        <label className='text-sm text-white/70'>
                                                                الباقة المختارة
                                                                <div className='relative mt-2'>
                                                                        <Package className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                                        <ChevronDown className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                                        <select
                                                                                value={checkoutInfo.packageId}
                                                                                onChange={(event) =>
                                                                                        setCheckoutInfo((prev) => ({
                                                                                                ...prev,
                                                                                                packageId: event.target.value,
                                                                                        }))
                                                                                }
                                                                                className='glass-input w-full appearance-none pr-12 pl-12'
                                                                        >
                                                                                {packages.map((pkg) => (
                                                                                        <option key={pkg.id} value={pkg.id}>
                                                                                                {pkg.name}
                                                                                        </option>
                                                                                ))}
                                                                        </select>
                                                                </div>
                                                        </label>
                                                        <label className='text-sm text-white/70'>
                                                                الاسم الكامل
                                                                <div className='relative mt-2'>
                                                                        <User className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                                        <input
                                                                                type='text'
                                                                                value={checkoutInfo.name}
                                                                                onChange={(event) =>
                                                                                        setCheckoutInfo((prev) => ({
                                                                                                ...prev,
                                                                                                name: event.target.value,
                                                                                        }))
                                                                                }
                                                                                className='glass-input w-full pr-12'
                                                                                placeholder='اكتب الاسم'
                                                                                required
                                                                        />
                                                                </div>
                                                        </label>
                                                        <label className='text-sm text-white/70'>
                                                                البريد الإلكتروني
                                                                <div className='relative mt-2'>
                                                                        <Mail className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                                        <input
                                                                                type='email'
                                                                                value={checkoutInfo.email}
                                                                                onChange={(event) =>
                                                                                        setCheckoutInfo((prev) => ({
                                                                                                ...prev,
                                                                                                email: event.target.value,
                                                                                        }))
                                                                                }
                                                                                className='glass-input w-full pr-12'
                                                                                placeholder='name@example.com'
                                                                                required
                                                                        />
                                                                </div>
                                                        </label>
                                                        <label className='text-sm text-white/70'>
                                                                رقم واتساب (اختياري)
                                                                <div className='relative mt-2'>
                                                                        <Phone className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                                        <input
                                                                                type='tel'
                                                                                value={checkoutInfo.whatsapp}
                                                                                onChange={(event) =>
                                                                                        setCheckoutInfo((prev) => ({
                                                                                                ...prev,
                                                                                                whatsapp: event.target.value,
                                                                                        }))
                                                                                }
                                                                                className='glass-input w-full pr-12'
                                                                                placeholder='مثال: 22200000000'
                                                                        />
                                                                </div>
                                                        </label>
                                                        <label className='text-sm text-white/70'>
                                                                بريد بديل (اختياري)
                                                                <div className='relative mt-2'>
                                                                        <Mail className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40' />
                                                                        <input
                                                                                type='email'
                                                                                value={checkoutInfo.alternateEmail}
                                                                                onChange={(event) =>
                                                                                        setCheckoutInfo((prev) => ({
                                                                                                ...prev,
                                                                                                alternateEmail: event.target.value,
                                                                                        }))
                                                                                }
                                                                                className='glass-input w-full pr-12'
                                                                                placeholder='alternative@example.com'
                                                                        />
                                                                </div>
                                                        </label>
                                                        <label className='text-sm text-white/70'>
                                                                فكرة أو اسم الموقع (اختياري)
                                                                <div className='relative mt-2'>
                                                                        <MessageSquare className='absolute right-4 top-4 h-4 w-4 text-white/40' />
                                                                        <textarea
                                                                                value={checkoutInfo.idea}
                                                                                onChange={(event) =>
                                                                                        setCheckoutInfo((prev) => ({
                                                                                                ...prev,
                                                                                                idea: event.target.value,
                                                                                        }))
                                                                                }
                                                                                rows={3}
                                                                                className='glass-input w-full resize-none pr-12'
                                                                                placeholder='اشرح الفكرة باختصار'
                                                                        />
                                                                </div>
                                                        </label>
                                                        {checkoutError && (
                                                                <div className='rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200'>
                                                                        {checkoutError}
                                                                </div>
                                                        )}
                                                        <button
                                                                type='submit'
                                                                className='btn-primary disabled:cursor-not-allowed disabled:opacity-60'
                                                                disabled={checkoutLoading}
                                                        >
                                                                {checkoutLoading ? "جاري تجهيز الدفع..." : "متابعة الدفع عبر PayPal"}
                                                        </button>
                                                </form>
                                        </ScrollReveal>
                                        <ScrollReveal direction='left' className='glass-panel px-6 py-10 sm:px-10'>
                                                <h2 className='text-2xl font-bold text-payzone-gold'>لمن هذه الخدمة؟</h2>
                                                <ol className='mt-6 space-y-4 text-white/80'>
                                                        {[
                                                                "الشركات",
                                                                "التجار",
                                                                "أصحاب الأفكار والمنصات",
                                                                "الأفراد",
                                                        ].map((item, index) => (
                                                                <li key={item} className='flex items-center gap-3'>
                                                                        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-payzone-gold text-payzone-navy font-bold'>
                                                                                {index + 1}
                                                                        </span>
                                                                        {item}
                                                                </li>
                                                                ))}
                                                </ol>
                                        </ScrollReveal>
                                </section>

                                <section className='scroll-section mt-20'>
                                        <ScrollReveal direction='right' className='glass-panel px-6 py-10 text-center sm:px-10'>
                                                <h2 className='text-3xl font-bold text-payzone-gold'>عروض تسويقية لفترة محدودة</h2>
                                                <p className='mt-3 text-white/70'>
                                                        الأسعار الحالية هي أسعار مخفّضة بالفعل. العروض لفترة محدودة بدون تحديد تاريخ.
                                                </p>
                                                <div className='mt-8 grid gap-6 md:grid-cols-3'>
                                                        {packages.map((pkg) => (
                                                                <ScrollReveal
                                                                        key={`${pkg.id}-offer`}
                                                                        direction='left'
                                                                        className='glass-card glass-card--compact'
                                                                >
                                                                        <div className='text-4xl font-bold text-payzone-gold'>{pkg.badge}</div>
                                                                        <div className='mt-3 text-lg font-semibold text-white'>{pkg.name}</div>
                                                                        <div className='mt-2 text-sm text-white/70'>السعر بعد الخصم: {pkg.price}</div>
                                                                </ScrollReveal>
                                                        ))}
                                                </div>
                                        </ScrollReveal>
                                </section>
                        </div>
                </div>
        );
};
export default HomePage;
