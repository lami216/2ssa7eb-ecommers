const PrivacyPage = () => {
        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-4xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10'>
                                <h1 className='text-3xl font-bold text-payzone-gold'>سياسة الخصوصية</h1>
                                <p className='mt-4 text-white/70'>
                                        نحترم خصوصيتك ونلتزم بحماية البيانات الشخصية التي تشاركها معنا عند تعبئة نموذج
                                        التواصل أو الدفع.
                                </p>
                                <ul className='mt-6 space-y-3 text-white/80'>
                                        <li>نستخدم بياناتك للتواصل معك بخصوص الخدمة المطلوبة فقط.</li>
                                        <li>لن نقوم بمشاركة بياناتك مع أي جهة خارجية دون موافقتك.</li>
                                        <li>
                                                قد نستخدم البريد الإلكتروني لتحديثات تخص طلبك أو إرسال روابط تفعيل الخدمة عند
                                                اكتمالها.
                                        </li>
                                        <li>يمكنك طلب تعديل أو حذف بياناتك عبر التواصل معنا مباشرة.</li>
                                </ul>
                        </div>
                </div>
        );
};

export default PrivacyPage;
