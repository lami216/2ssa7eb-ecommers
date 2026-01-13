const RefundPolicyPage = () => {
        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-4xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10'>
                                <h1 className='text-3xl font-bold text-payzone-gold'>سياسة الاسترجاع</h1>
                                <p className='mt-4 text-white/70'>
                                        رسوم التواصل الرمزية تُستخدم لتأكيد جدية الطلب وفتح قناة واتساب، وهي غير قابلة
                                        للاسترجاع بعد تفعيل التواصل.
                                </p>
                                <ul className='mt-6 space-y-3 text-white/80'>
                                        <li>يمكن إلغاء طلب التواصل قبل الدفع بدون أي رسوم.</li>
                                        <li>
                                                بعد دفع رسوم التواصل وبدء المحادثة، يتم متابعة تفاصيل المشروع وتحديد السعر
                                                النهائي.
                                        </li>
                                        <li>
                                                أي دفعات خاصة بالباقة يتم التعامل معها حسب الاتفاق المكتوب بين الطرفين وبما
                                                يتوافق مع مراحل التنفيذ.
                                        </li>
                                        <li>لأي استفسار يرجى التواصل معنا مباشرة عبر واتساب.</li>
                                </ul>
                        </div>
                </div>
        );
};

export default RefundPolicyPage;
