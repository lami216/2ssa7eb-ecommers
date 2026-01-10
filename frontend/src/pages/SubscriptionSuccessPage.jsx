import { useEffect } from "react";

const SubscriptionSuccessPage = () => {
        useEffect(() => {
                const params = new URLSearchParams(window.location.search);
                const query = params.toString();
                window.location.href = `/api/paypal/subscription/complete${query ? `?${query}` : ""}`;
        }, []);

        return (
                <div className='mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center text-white'>
                        <h1 className='text-3xl font-bold text-payzone-gold'>جاري تفعيل الاشتراك</h1>
                        <p className='mt-4 text-base text-white/70'>يرجى الانتظار حتى نؤكد الاشتراك.</p>
                </div>
        );
};

export default SubscriptionSuccessPage;
