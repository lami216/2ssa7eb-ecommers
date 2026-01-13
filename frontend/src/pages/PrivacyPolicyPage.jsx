const PrivacyPolicyPage = () => {
        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-4xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-right'>
                                <h1 className='text-3xl font-bold text-payzone-gold'>سياسة الخصوصية</h1>
                                <p className='mt-4 text-white/70'>
                                        توضح هذه السياسة كيفية جمع بيانات طلب التواصل واستخدامها لدى Payzone.store.
                                </p>
                                <div className='mt-6 space-y-4 text-white/80'>
                                        <div>
                                                <h2 className='text-lg font-semibold text-white'>البيانات التي نجمعها</h2>
                                                <ul className='mt-2 list-disc space-y-1 pr-5 text-sm text-white/70'>
                                                        <li>الاسم الكامل.</li>
                                                        <li>البريد الإلكتروني.</li>
                                                        <li>وصف الاحتياج.</li>
                                                        <li>الخطة المختارة.</li>
                                                        <li>مرجع الدفع ورسوم التواصل.</li>
                                                </ul>
                                        </div>
                                        <div>
                                                <h2 className='text-lg font-semibold text-white'>الغرض من جمع البيانات</h2>
                                                <p className='mt-2 text-sm text-white/70'>
                                                        نستخدم بيانات طلب التواصل للتواصل معك وتقديم الخدمة المطلوبة وتأكيد الدفع.
                                                </p>
                                        </div>
                                        <div>
                                                <h2 className='text-lg font-semibold text-white'>التخزين والاحتفاظ</h2>
                                                <p className='mt-2 text-sm text-white/70'>
                                                        يتم الاحتفاظ بالبيانات لمدة زمنية معقولة للمتابعة والدعم، ثم حذفها عند عدم الحاجة.
                                                </p>
                                        </div>
                                        <div>
                                                <h2 className='text-lg font-semibold text-white'>عدم بيع البيانات</h2>
                                                <p className='mt-2 text-sm text-white/70'>
                                                        لا نقوم ببيع بياناتك أو مشاركتها لأغراض تسويقية مع أطراف ثالثة.
                                                </p>
                                        </div>
                                        <div>
                                                <h2 className='text-lg font-semibold text-white'>طلب حذف البيانات</h2>
                                                <p className='mt-2 text-sm text-white/70'>
                                                        يمكنك طلب حذف بياناتك عبر التواصل مع الدعم، وسيتم تنفيذ الطلب خلال فترة معقولة.
                                                </p>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default PrivacyPolicyPage;
