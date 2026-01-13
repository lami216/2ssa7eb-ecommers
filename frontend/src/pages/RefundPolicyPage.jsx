const RefundPolicyPage = () => {
        return (
                <div className='min-h-screen bg-payzone-navy px-4 py-16 text-white' dir='rtl'>
                        <div className='container mx-auto max-w-4xl rounded-3xl border border-white/10 bg-payzone-navy/70 p-10 text-right'>
                                <h1 className='text-3xl font-bold text-payzone-gold'>سياسة الاسترجاع</h1>
                                <p className='mt-4 text-white/70'>
                                        تتم معالجة استرجاع رسوم التواصل بشكل يدوي بناءً على الطلب.
                                </p>
                                <div className='mt-6 space-y-4 text-white/80'>
                                        <p className='text-sm text-white/70'>
                                                في حال لم تبدأ الخدمة، يمكن طلب الاسترجاع خلال مدة تصل إلى 7 أيام من تاريخ الدفع.
                                                يتم مراجعة الطلب والرد خلال فترة عمل معقولة.
                                        </p>
                                        <p className='text-sm text-white/70'>
                                                لطلب الاسترجاع يرجى التواصل مع الدعم وتزويدنا برقم طلب التواصل ومرجع الدفع.
                                        </p>
                                </div>
                        </div>
                </div>
        );
};

export default RefundPolicyPage;
