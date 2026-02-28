const FinalCTASection = ({ onScrollToStartStore }) => {
        return (
                <section className='mt-16 rounded-3xl border border-white/10 bg-slate-950 p-8 text-center sm:p-12'>
                        <h2 className='text-3xl font-black text-white'>جاهز لتبدأ البيع أونلاين؟</h2>
                        <p className='mt-3 text-white/70'>شاهد متجرك أولاً — وادفع عند الجاهزية</p>
                        <button
                                type='button'
                                onClick={onScrollToStartStore}
                                className='btn-primary mt-7 text-base'
                        >
                                ابدأ الآن
                        </button>
                </section>
        );
};

export default FinalCTASection;
