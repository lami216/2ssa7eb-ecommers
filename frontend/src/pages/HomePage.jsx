import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Mail, MessageSquare, Package, User } from "lucide-react";
import apiClient from "../lib/apiClient";
import { DEFAULT_CURRENCY, SERVICE_PACKAGES } from "../../../shared/servicePackages.js";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { buildLeadWhatsAppMessage } from "../lib/lead";
import useLeadStatus from "../hooks/useLeadStatus";
import WhatsAppButton from "../components/WhatsAppButton";

const HomePage = () => {
        const { lead, setLead, isUnlocked, whatsappUrl, whatsappLink, loading: leadLoading } = useLeadStatus();
        const formatPackagePrice = (amount, currency) => {
                const normalized = Number(amount);
                if (!Number.isFinite(normalized)) {
                        return "";
                }
                return `${normalized.toFixed(0)} ${currency}`;
        };

        const packageDetails = useMemo(
                () => ({
                        starter: {
                                badge: "انطلاقة ذكية",
                                details: [
                                        "متجر احترافي جاهز بإطلاق سريع خلال 24 إلى 48 ساعة.",
                                        "بوابات دفع مدمجة: بايبال + سترايب.",
                                        "لوحة تحكم واضحة مع تخصيص محدود جدًا.",
                                        "إضافة أو إزالة المميزات غير متاحة في هذه الباقة.",
                                ],
                        },
                        growth: {
                                badge: "خصم سنوي حتى 40%",
                                details: [
                                        "واجهة احترافية مع تخصيص أوسع يلائم نمو المشروع.",
                                        "بوابات دفع مدمجة: بايبال + سترايب.",
                                        "تخصيص لوحة التحكم ضمن حدود واضحة بحسب الاحتياج.",
                                        "إضافة أو إزالة المميزات بشكل محدود وفق الطلب.",
                                        "مدة التنفيذ من يومين إلى 3 أيام حسب التعديلات.",
                                ],
                        },
                        full: {
                                badge: "خصم سنوي حتى 40%",
                                details: [
                                        "حل مخصص بالكامل حسب الفكرة أو استنساخ تجربة قائمة.",
                                        "بوابات دفع مدمجة: بايبال + سترايب.",
                                        "تخصيص كامل للواجهة ولوحة التحكم حسب الطلب.",
                                        "إضافة أو إزالة المميزات بحرية بحسب المتطلبات.",
                                        "مدة التنفيذ حسب حجم المشروع دون رقم ثابت.",
                                ],
                        },
                }),
                []
        );
        const packages = useMemo(() => {
                return SERVICE_PACKAGES.map((pkg) => {
                        const details = packageDetails[pkg.id] || {};
                        return {
                                ...pkg,
                                currency: DEFAULT_CURRENCY,
                                ...details,
                                priceLabel: formatPackagePrice(pkg.oneTimePrice, DEFAULT_CURRENCY),
                                monthlyLabel: formatPackagePrice(pkg.monthlyPrice, DEFAULT_CURRENCY),
                        };
                });
        }, [packageDetails]);

        const comparisonRows = useMemo(
                () => [
                        { label: "موقع احترافي جاهز", starter: "✅", growth: "✅", full: "✅" },
                        { label: "بوابة دفع مدمجة (بايبال + سترايب)", starter: "✅", growth: "✅", full: "✅" },
                        { label: "لوحة تحكم سهلة الاستخدام", starter: "✅", growth: "✅", full: "✅" },
                        { label: "إدارة الطلبات", starter: "✅", growth: "✅", full: "✅" },
                        { label: "دعم واتساب", starter: "✅", growth: "✅", full: "✅" },
                        { label: "إدارة العملاء", starter: "✅", growth: "✅", full: "✅" },
                        { label: "تخصيص واجهة الموقع", starter: "محدود", growth: "أوسع", full: "كامل" },
                        { label: "إضافة وإزالة المميزات", starter: "غير متاح", growth: "محدود", full: "بحرية حسب الطلب" },
                        { label: "قابلية التوسع مستقبلًا", starter: "محدودة", growth: "قابلة للتوسع", full: "مرنة بالكامل" },
                        { label: "خصم عند الدفع السنوي", starter: "—", growth: "حتى 40%", full: "حتى 40%" },
                ],
                []
        );

        const [checkoutInfo, setCheckoutInfo] = useState({
                packageId: packages[0]?.id || "",
                name: "",
                email: "",
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
                        const leadData = await apiClient.post("/leads", {
                                selectedPlan: checkoutInfo.packageId,
                                fullName: checkoutInfo.name,
                                email: checkoutInfo.email,
                                idea: checkoutInfo.idea,
                        });

                        if (!leadData?._id) {
                                setCheckoutError("تعذر إنشاء طلب التواصل حالياً.");
                                return;
                        }
                        setLead(leadData);

                        const data = await apiClient.post(
                                `/leads/${encodeURIComponent(leadData._id)}/pay-contact-fee/create-order`
                        );
                        if (data?.alreadyPaid && data?.lead) {
                                setLead(data.lead);
                                const link = buildWhatsAppLink({
                                        whatsappUrl,
                                        message: buildLeadWhatsAppMessage(data.lead),
                                });
                                if (link) {
                                        window.open(link, "_blank");
                                }
                                return;
                        }
                        if (data?.approveUrl) {
                                globalThis.location.href = data.approveUrl;
                        } else {
                                setCheckoutError("تعذر تجهيز دفع رسوم التواصل عبر باي بال الآن.");
                        }
                } catch (error) {
                        setCheckoutError(
                                error.response?.data?.message || "تعذر تجهيز دفع رسوم التواصل عبر باي بال الآن."
                        );
                } finally {
                        setCheckoutLoading(false);
                }
        };

        const contactFeeAmountLabel = lead?.contactFeeAmount ? Number(lead.contactFeeAmount).toFixed(0) : "5";

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
                <div className='home-page-bg relative min-h-screen overflow-hidden text-payzone-white'>
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
                                                        اطلق متجرك الإلكتروني خلال أيام وتحكم بكل شيء من لوحة واحدة ذكية
                                                </h1>
                                                <p className='mt-4 text-lg text-white/70'>
                                                        نبني لك متجر سريع ومستقر مرتبط ببوابات الدفع مثل بايبال وسترايب، مع لوحة تحكم بسيطة
                                                        تدير منها المنتجات والطلبات والعملاء من أي جهاز ومن أي مكان، مع دعم مباشر عبر واتساب.
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
                                                                شوف الباقات والأسعار
                                                        </a>
                                                </div>
                                                <p className='mt-4 text-sm text-white/60'>خلال دقائق تعرف أنسب باقة لمشروعك.</p>
                                        </ScrollReveal>
                                </section>

                                <section
                                        id='features'
                                        className='scroll-section mt-16 grid gap-6 lg:grid-cols-3'
                                >
                                        {[
                                                {
                                                        title: "تحكم بمتجرك وطلباتك بدون خبرة تقنية",
                                                        description:
                                                                "كل شيء واضح وسريع، ومن أي جهاز ومن أي مكان مع إمكانية التواصل معنا مباشرة على واتساب عند الحاجة.",
                                                },
                                                {
                                                        title: "استضافة قوية على سيرفر مخصص لمتجرك",
                                                        description:
                                                                "نستضيف متجرك على بيئة مستقرة لضمان السرعة والثبات تحت الضغط مع متابعة مستمرة.",
                                                },
                                                {
                                                        title: "دعم مباشر عبر واتساب",
                                                        description:
                                                                "تواصل معنا على واتساب لمتابعة أي تعديل أو استفسار أثناء الإعداد وبعد الإطلاق.",
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
                                                                <h2 className='text-3xl font-bold text-payzone-gold'>آلية استقبال الطلبات داخل لوحة التحكم</h2>
                                                                <p className='mt-4 text-white/70'>
                                                                        الطلبات تصل مباشرة داخل لوحة التحكم، ويصلك إشعار تلقائي عبر البريد الإلكتروني
                                                                        أو تيليجرام لتتابع كل طلب بسرعة ووضوح.
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
                                                                        title: "العميل يطلب من متجرك",
                                                                        description: "واجهة سريعة تحفّز على إكمال الطلب بثقة.",
                                                                },
                                                                {
                                                                        step: "2",
                                                                        title: "الطلب يظهر في لوحة التحكم",
                                                                        description: "يصلك إشعار فوري عبر الإيميل أو تيليجرام مع التفاصيل.",
                                                                },
                                                                {
                                                                        step: "3",
                                                                        title: "تبدأ التنفيذ والمتابعة",
                                                                        description: "تدير الطلب وتجهزه وتتابع العميل من مكان واحد.",
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
                                                        اختر اشتراكًا شهريًا واضحًا أو وفّر سنويًا بخصم يصل إلى 40% على باقتي Plus وPro.
                                                </p>
                                        </ScrollReveal>
                                        <div className='mt-10 grid gap-8 lg:grid-cols-3'>
                                                {packages.map((pkg) => {
                                                        const isHighlighted = pkg.id === "growth";
                                                        const lockedLabelMap = {
                                                                starter: "ابدأ الآن",
                                                                growth: "تواصل معنا",
                                                                full: "اختر الاحتراف",
                                                        };
                                                        const hintMap = {
                                                                starter: "مناسب للانطلاق السريع بدون تعقيد.",
                                                                growth: "الأفضل لمعظم المشاريع إذا تريد نمو سريع.",
                                                                full: "حل مخصص حسب احتياج مشروعك.",
                                                        };
                                                        const lockedLabel = lockedLabelMap[pkg.id] || "ابدأ الآن";
                                                        const unlockedLabel = lockedLabel;
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
                                                                        <div className='mt-4 text-3xl font-bold text-payzone-gold'>{pkg.priceLabel}</div>
                                                                        <div className='mt-2 text-sm text-white/70'>اشتراك سنوي بعد الخصم</div>
                                                                        <div className='mt-1 text-sm text-white/70'>اشتراك شهري: {pkg.monthlyLabel}</div>
                                                                        <ul className='mt-6 space-y-3 text-white/80'>
                                                                                {pkg.details.map((detail) => (
                                                                                        <li key={detail} className='flex items-start gap-2'>
                                                                                                <span className='mt-1 h-2 w-2 rounded-full bg-payzone-gold' />
                                                                                                <span>{detail}</span>
                                                                                        </li>
                                                                                ))}
                                                                        </ul>
                                                                        <div className='mt-6 text-sm text-white/70'>
                                                                                الاشتراك الشهري يشمل المتابعة والتحديثات الأساسية لتشغيل المتجر بثبات.
                                                                        </div>
                                                                        <div className='mt-3 text-sm text-white/70'>
                                                                                خصم سنوي جذاب حتى 40% متاح في باقتي Plus وPro.
                                                                        </div>
                                                                        {pkg.id === "full" && (
                                                                                <div className='mt-3 text-sm text-white/70'>
                                                                                        السورس كود متاح فقط في هذه الباقة بقيمة إضافية تُحدد عند الطلب.
                                                                                </div>
                                                                        )}
                                                                        <WhatsAppButton
                                                                                isUnlocked={isUnlocked}
                                                                                whatsappLink={whatsappLink}
                                                                                lockedLabel={lockedLabel}
                                                                                unlockedLabel={unlockedLabel}
                                                                                className='mt-8'
                                                                                onLockedClick={() => {
                                                                                        setCheckoutInfo((prev) => ({
                                                                                                ...prev,
                                                                                                packageId: pkg.id,
                                                                                        }));
                                                                                        document
                                                                                                .getElementById("qualification")
                                                                                                ?.scrollIntoView({ behavior: "smooth" });
                                                                                }}
                                                                        />
                                                                        <div className='mt-3 text-sm text-white/70'>{hintMap[pkg.id]}</div>
                                                                </ScrollReveal>
                                                        );
                                                })}
                                        </div>
                                </section>

                                <section className='scroll-section mt-20'>
                                        <ScrollReveal direction='right' className='glass-panel px-6 py-10 sm:px-10'>
                                                <h2 className='text-3xl font-bold text-payzone-gold'>مقارنة واضحة بين الباقات</h2>
                                                <p className='mt-3 text-white/70'>مقارنة مباشرة توضّح الفرق الحقيقي في المرونة والتخصيص.</p>
                                                <div className='mt-8 hidden md:block'>
                                                        <table className='min-w-[680px] text-right text-sm'>
                                                                <thead>
                                                                        <tr className='text-white/60'>
                                                                                <th className='sticky right-0 z-10 border-l border-white/10 bg-payzone-navy/70 px-4 py-3'>
                                                                                        الميزة
                                                                                </th>
                                                                                <th className='px-4 py-3'>باقة الشرارة – Basic</th>
                                                                                <th className='px-4 py-3'>باقة القفزة – Pro</th>
                                                                                <th className='px-4 py-3'>باقة الريادة – Plus</th>
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
                                                                        <span>باقة الشرارة – Basic</span>
                                                                        <span>باقة القفزة – Pro</span>
                                                                        <span>باقة الريادة – Plus</span>
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
                                                <h2 className='text-3xl font-bold text-payzone-gold'>ابدأ الآن وفعّل التواصل</h2>
                                                <p className='mt-3 text-white/70'>
                                                        أدخل معلوماتك ثم ادفع الرسوم الرمزية لتفعيل التواصل عبر واتساب وبدء النقاش حول
                                                        متطلبات مشروعك بشكل واضح ومباشر، بما يساعد على جدية الطلبات وتنظيمها.
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
                                                                {checkoutLoading
                                                                        ? "جاري تجهيز الدفع..."
                                                                        : isUnlocked
                                                                          ? "تواصل عبر واتساب الآن 💬"
                                                                          : `دفع رسوم التواصل ${contactFeeAmountLabel} ${DEFAULT_CURRENCY}`}
                                                        </button>
                                                        <p className='text-xs text-white/60'>
                                                                بعد الدفع يظهر لك زر واتساب برسالة جاهزة لتبدأ معنا مباشرة.
                                                        </p>
                                                        <div className='mt-2 flex flex-wrap gap-4 text-xs text-white/60'>
                                                                <a href='/privacy' className='underline underline-offset-4'>
                                                                        سياسة الخصوصية
                                                                </a>
                                                                <a href='/refund-policy' className='underline underline-offset-4'>
                                                                        سياسة الاسترجاع
                                                                </a>
                                                        </div>
                                                </form>
                                                {leadLoading && (
                                                        <div className='mt-4 text-sm text-white/50'>جاري تحديث حالة التواصل...</div>
                                                )}
                                                {!leadLoading && isUnlocked && whatsappLink && (
                                                        <div className='mt-4'>
                                                                <WhatsAppButton
                                                                        isUnlocked
                                                                        whatsappLink={whatsappLink}
                                                                        className='w-full'
                                                                />
                                                        </div>
                                                )}
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
                                                                        <div className='mt-2 text-sm text-white/70'>
                                                                                السعر بعد الخصم: {pkg.priceLabel}
                                                                        </div>
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
