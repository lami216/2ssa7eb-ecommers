const ContactFeeCancelPage = () => {
        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-3xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-center'>
                                <h1 className='text-3xl font-bold text-payzone-gold'>تم إلغاء الدفع</h1>
                                <p className='mt-3 text-white/70'>
                                        لم يتم إكمال دفع رسوم التواصل. يمكنك المحاولة مرة أخرى من صفحة الباقات.
                                </p>
                                <a
                                        href='/#pricing'
                                        className='mt-6 inline-flex items-center justify-center rounded-full bg-payzone-gold px-6 py-3 text-sm font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                >
                                        العودة للباقات
                                </a>
                        </div>
                </div>
        );
};

export default ContactFeeCancelPage;
