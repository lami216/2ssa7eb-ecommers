import { useMemo, useState } from "react";

const WHATSAPP_NUMBER = "22231117700";

const HomePage = () => {
        const packages = useMemo(
                () => [
                        {
                                id: "starter",
                                name: "باقة الانطلاق",
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
                                name: "باقة التوسّع",
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
                                name: "باقة الحل الكامل",
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
                        { label: "متجر إلكتروني جاهز", starter: "✅", growth: "✅", full: "✅" },
                        { label: "تشغيل سريع", starter: "✅", growth: "✅", full: "✅" },
                        { label: "لوحة تحكم", starter: "✅", growth: "✅", full: "✅" },
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

        const [qualification, setQualification] = useState({
                packageName: packages[0].name,
                businessType: "شركة",
                notes: "",
        });

        const buildWhatsAppLink = (packageName, extra) => {
                const lines = [
                        "السلام عليكم، أرغب بالبدء مع Payzone بايزوون.",
                        `الباقة المختارة: ${packageName}.`,
                ];
                if (extra?.businessType) {
                        lines.push(`نوع النشاط: ${extra.businessType}.`);
                }
                if (extra?.notes) {
                        lines.push(`تفاصيل مختصرة: ${extra.notes}.`);
                }
                lines.push("أرجو تزويدي بخطوات البدء.");
                const message = lines.join("\n");
                return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        };

        const qualificationLink = buildWhatsAppLink(qualification.packageName, qualification);

        return (
                <div className='relative min-h-screen overflow-hidden text-payzone-white'>
                        <div className='relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
                                <section className='text-center'>
                                        <span className='inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm text-payzone-gold'>
                                                Payzone | بايزوون
                                        </span>
                                        <h1 className='mt-6 text-4xl font-bold sm:text-5xl lg:text-6xl'>
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
                                                        className='rounded-lg border border-payzone-indigo/50 px-6 py-3 font-semibold text-white/80 transition hover:border-payzone-gold hover:text-payzone-gold'
                                                >
                                                        عرض الباقات والأسعار
                                                </a>
                                        </div>
                                </section>

                                <section className='mt-16 grid gap-6 lg:grid-cols-3'>
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
                                        ].map((item) => (
                                                <div
                                                        key={item.title}
                                                        className='rounded-2xl border border-payzone-indigo/40 bg-white/5 p-6 shadow-lg'
                                                >
                                                        <h3 className='text-xl font-semibold text-payzone-gold'>{item.title}</h3>
                                                        <p className='mt-3 text-white/70'>{item.description}</p>
                                                </div>
                                        ))}
                                </section>

                                <section className='mt-20 rounded-3xl border border-payzone-indigo/40 bg-white/5 p-10 shadow-xl'>
                                        <h2 className='text-3xl font-bold text-payzone-gold'>آلية استقبال الطلبات عبر واتساب</h2>
                                        <p className='mt-4 text-white/70'>
                                                نقوم بربط المتجر مباشرة بواتساب العميل. عند قيام أي زبون بالطلب،
                                                تصل رسالة جاهزة بكل تفاصيل الطلب إلى واتساب صاحب المتجر ليتم التواصل
                                                وإغلاق البيع بسهولة ودون تعقيد.
                                        </p>
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
                                                        <div
                                                                key={item.step}
                                                                className='rounded-2xl border border-payzone-indigo/40 bg-payzone-navy/60 p-6'
                                                        >
                                                                <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-payzone-gold text-payzone-navy font-bold'>
                                                                        {item.step}
                                                                </span>
                                                                <h3 className='mt-4 text-lg font-semibold'>{item.title}</h3>
                                                                <p className='mt-2 text-white/70'>{item.description}</p>
                                                        </div>
                                                ))}
                                        </div>
                                </section>

                                <section id='packages' className='mt-20'>
                                        <div className='text-center'>
                                                <h2 className='text-3xl font-bold text-payzone-gold'>الباقات والأسعار</h2>
                                                <p className='mt-3 text-white/70'>
                                                        الأسعار المعروضة هي السعر بعد التخفيض مباشرة، مع دعم شهري ثابت لكل باقة.
                                                </p>
                                        </div>
                                        <div className='mt-10 grid gap-8 lg:grid-cols-3'>
                                                {packages.map((pkg) => (
                                                        <div
                                                                key={pkg.id}
                                                                className='flex h-full flex-col rounded-2xl border border-payzone-indigo/40 bg-white/5 p-8 shadow-lg'
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
                                                                        إضافة ميزات جديدة متاحة في باقة التوسّع وباقة الحل الكامل،
                                                                        مع مرونة أكبر في الحل الكامل.
                                                                </div>
                                                                {pkg.id === "full" && (
                                                                        <div className='mt-3 text-sm text-white/70'>
                                                                                السورس كود متاح فقط في هذه الباقة بقيمة 5000 أوقية قديمة عند الطلب.
                                                                        </div>
                                                                )}
                                                                <a
                                                                        href={buildWhatsAppLink(pkg.name)}
                                                                        target='_blank'
                                                                        rel='noreferrer'
                                                                        className='mt-8 inline-flex items-center justify-center rounded-lg bg-payzone-gold px-5 py-3 font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                                >
                                                                        اطلب باقتك الآن
                                                                </a>
                                                        </div>
                                                ))}
                                        </div>
                                </section>

                                <section className='mt-20 rounded-3xl border border-payzone-indigo/40 bg-payzone-navy/70 p-10'>
                                        <h2 className='text-3xl font-bold text-payzone-gold'>مقارنة حقيقية بين الباقات</h2>
                                        <p className='mt-3 text-white/70'>
                                                الفرق الأساسي في التصميم ولوحة التحكم ومستوى المرونة.
                                        </p>
                                        <div className='mt-8 overflow-x-auto'>
                                                <table className='min-w-full text-right text-sm'>
                                                        <thead>
                                                                <tr className='text-white/60'>
                                                                        <th className='px-4 py-3'>الميزة</th>
                                                                        <th className='px-4 py-3'>الانطلاق</th>
                                                                        <th className='px-4 py-3'>التوسّع</th>
                                                                        <th className='px-4 py-3'>الحل الكامل</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {comparisonRows.map((row) => (
                                                                        <tr key={row.label} className='border-t border-white/10'>
                                                                                <td className='px-4 py-3 text-white/80'>{row.label}</td>
                                                                                <td className='px-4 py-3'>{row.starter}</td>
                                                                                <td className='px-4 py-3'>{row.growth}</td>
                                                                                <td className='px-4 py-3'>{row.full}</td>
                                                                        </tr>
                                                                ))}
                                                        </tbody>
                                                </table>
                                        </div>
                                </section>

                                <section id='qualification' className='mt-20 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'>
                                        <div className='rounded-3xl border border-payzone-indigo/40 bg-white/5 p-10'>
                                                <h2 className='text-3xl font-bold text-payzone-gold'>نموذج تأهيل سريع قبل واتساب</h2>
                                                <p className='mt-3 text-white/70'>
                                                        ساعدنا في تصفية طلبك حتى نوجّهك مباشرةً للخيار الأنسب قبل التواصل عبر واتساب.
                                                </p>
                                                <form className='mt-6 grid gap-4'>
                                                        <label className='text-sm text-white/70'>
                                                                الباقة المختارة
                                                                <select
                                                                        value={qualification.packageName}
                                                                        onChange={(event) =>
                                                                                setQualification((prev) => ({
                                                                                        ...prev,
                                                                                        packageName: event.target.value,
                                                                                }))
                                                                        }
                                                                        className='mt-2 w-full rounded-lg border border-payzone-indigo/40 bg-payzone-navy/70 px-4 py-3 text-white'
                                                                >
                                                                        {packages.map((pkg) => (
                                                                                <option key={pkg.id} value={pkg.name}>
                                                                                        {pkg.name}
                                                                                </option>
                                                                        ))}
                                                                </select>
                                                        </label>
                                                        <label className='text-sm text-white/70'>
                                                                نوع النشاط
                                                                <select
                                                                        value={qualification.businessType}
                                                                        onChange={(event) =>
                                                                                setQualification((prev) => ({
                                                                                        ...prev,
                                                                                        businessType: event.target.value,
                                                                                }))
                                                                        }
                                                                        className='mt-2 w-full rounded-lg border border-payzone-indigo/40 bg-payzone-navy/70 px-4 py-3 text-white'
                                                                >
                                                                        <option>شركة</option>
                                                                        <option>تاجر</option>
                                                                        <option>منصة/فكرة</option>
                                                                        <option>فرد</option>
                                                                </select>
                                                        </label>
                                                        <label className='text-sm text-white/70'>
                                                                تفاصيل مختصرة
                                                                <textarea
                                                                        value={qualification.notes}
                                                                        onChange={(event) =>
                                                                                setQualification((prev) => ({
                                                                                        ...prev,
                                                                                        notes: event.target.value,
                                                                                }))
                                                                        }
                                                                        rows={3}
                                                                        className='mt-2 w-full rounded-lg border border-payzone-indigo/40 bg-payzone-navy/70 px-4 py-3 text-white'
                                                                        placeholder='صف متطلباتك بسرعة (اختياري)'
                                                                />
                                                        </label>
                                                        <a
                                                                href={qualificationLink}
                                                                target='_blank'
                                                                rel='noreferrer'
                                                                className='inline-flex items-center justify-center rounded-lg bg-payzone-gold px-5 py-3 font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                        >
                                                                انتقل لواتساب برسالة جاهزة
                                                        </a>
                                                </form>
                                        </div>
                                        <div className='rounded-3xl border border-payzone-indigo/40 bg-payzone-navy/60 p-10'>
                                                <h2 className='text-2xl font-bold text-payzone-gold'>لمن هذه الخدمة؟</h2>
                                                <ol className='mt-6 space-y-4 text-white/80'>
                                                        <li className='flex items-center gap-3'>
                                                                <span className='h-8 w-8 rounded-full bg-payzone-gold text-payzone-navy flex items-center justify-center font-bold'>1</span>
                                                                الشركات
                                                        </li>
                                                        <li className='flex items-center gap-3'>
                                                                <span className='h-8 w-8 rounded-full bg-payzone-gold text-payzone-navy flex items-center justify-center font-bold'>2</span>
                                                                التجار
                                                        </li>
                                                        <li className='flex items-center gap-3'>
                                                                <span className='h-8 w-8 rounded-full bg-payzone-gold text-payzone-navy flex items-center justify-center font-bold'>3</span>
                                                                أصحاب الأفكار والمنصات
                                                        </li>
                                                        <li className='flex items-center gap-3'>
                                                                <span className='h-8 w-8 rounded-full bg-payzone-gold text-payzone-navy flex items-center justify-center font-bold'>4</span>
                                                                الأفراد
                                                        </li>
                                                </ol>
                                        </div>
                                </section>

                                <section className='mt-20 rounded-3xl border border-payzone-indigo/40 bg-white/5 p-10 text-center'>
                                        <h2 className='text-3xl font-bold text-payzone-gold'>عروض تسويقية لفترة محدودة</h2>
                                        <p className='mt-3 text-white/70'>
                                                الأسعار الحالية هي أسعار مخفّضة بالفعل. العروض لفترة محدودة بدون تحديد تاريخ.
                                        </p>
                                        <div className='mt-8 grid gap-6 md:grid-cols-3'>
                                                {packages.map((pkg) => (
                                                        <div
                                                                key={`${pkg.id}-offer`}
                                                                className='rounded-2xl border border-payzone-indigo/40 bg-payzone-navy/60 p-6'
                                                        >
                                                                <div className='text-4xl font-bold text-payzone-gold'>{pkg.badge}</div>
                                                                <div className='mt-3 text-lg font-semibold text-white'>{pkg.name}</div>
                                                                <div className='mt-2 text-sm text-white/70'>السعر بعد الخصم: {pkg.price}</div>
                                                        </div>
                                                ))}
                                        </div>
                                </section>
                        </div>
                </div>
        );
};
export default HomePage;
