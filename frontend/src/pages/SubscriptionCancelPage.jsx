import { useEffect } from "react";

const SubscriptionCancelPage = () => {
        useEffect(() => {
                const params = new URLSearchParams(window.location.search);
                if (!params.has("canceled")) {
                        params.set("canceled", "1");
                }
                const query = params.toString();
                window.location.href = `/api/paypal/subscription/complete${query ? `?${query}` : ""}`;
        }, []);

        return (
                <div className='mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center text-white'>
                        <h1 className='text-3xl font-bold text-red-300'>جاري التحقق من حالة الاشتراك</h1>
                        <p className='mt-4 text-base text-white/70'>يرجى الانتظار.</p>
                </div>
        );
};

export default SubscriptionCancelPage;
