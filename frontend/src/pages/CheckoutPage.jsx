import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { formatNumberEn } from "../lib/formatNumberEn";

const CheckoutPage = () => {
        const { cart, total, subtotal, coupon, isCouponApplied, clearCart } = useCartStore();
        const navigate = useNavigate();
        const [customerName, setCustomerName] = useState("");
        const [whatsAppNumber, setWhatsAppNumber] = useState("");
        const [address, setAddress] = useState("");
        const [whatsAppError, setWhatsAppError] = useState("");

        useEffect(() => {
                const hasPendingWhatsAppRedirect = sessionStorage.getItem("whatsappOrderSent");

                if (cart.length === 0 && !hasPendingWhatsAppRedirect) {
                        toast.error("سلتك فارغة، قم بإضافة منتجات أولاً");
                        navigate("/cart", { replace: true });
                }
        }, [cart, navigate]);

        useEffect(() => {
                const shouldRedirect = sessionStorage.getItem("whatsappOrderSent");

                if (shouldRedirect) {
                        sessionStorage.removeItem("whatsappOrderSent");
                        navigate("/purchase-success", { replace: true });
                }
        }, [navigate]);

        const normalizedWhatsAppNumber = whatsAppNumber.replace(/\D/g, "");
        const isWhatsAppValid = /^\d{8}$/.test(normalizedWhatsAppNumber);
        const isFormValid =
                customerName.trim() !== "" &&
                address.trim() !== "" &&
                cart.length > 0 &&
                isWhatsAppValid;

        const handleWhatsAppChange = (event) => {
                const value = event.target.value;
                setWhatsAppNumber(value);

                const digitsOnly = value.replace(/\D/g, "");

                if (value.trim() === "") {
                        setWhatsAppError("");
                        return;
                }

                if (!/^\d{8}$/.test(digitsOnly)) {
                        setWhatsAppError("الرجاء إدخال رقم واتساب صحيح مكوّن من 8 أرقام");
                } else {
                        setWhatsAppError("");
                }
        };

        const productsSummary = useMemo(
                () =>
                        cart.map((item, index) => {
                                const lineTotal = item.price * item.quantity;
                                const productIndex = formatNumberEn(index + 1);
                                const quantity = formatNumberEn(item.quantity);
                                return `${productIndex}. ${item.name} × ${quantity} = ${formatMRU(lineTotal)}`;
                        }),
                [cart]
        );

        const savings = Math.max(subtotal - total, 0);

        const handleSubmit = async (event) => {
                event.preventDefault();

                if (!customerName.trim() || !whatsAppNumber.trim() || !address.trim()) {
                        toast.error("يرجى تعبئة جميع الحقول قبل إرسال الطلب");
                        return;
                }

                if (!/^\d{8}$/.test(normalizedWhatsAppNumber)) {
                        setWhatsAppError("الرجاء إدخال رقم واتساب صحيح مكوّن من 8 أرقام");
                        toast.error("رقم الواتساب غير صحيح، تأكد أنه يحتوي على 8 أرقام");
                        return;
                }

                if (cart.length === 0) {
                        toast.error("سلتك فارغة");
                        navigate("/cart");
                        return;
                }

                const displayCustomerNumber = normalizedWhatsAppNumber || whatsAppNumber;

                const messageLines = [
                        `طلب جديد من ${customerName}`,
                        `رقم الواتساب للعميل: ${displayCustomerNumber}`,
                        `العنوان: ${address}`,
                        "",
                        "تفاصيل المنتجات:",
                        ...productsSummary,
                ];

                if (productsSummary.length === 0) {
                        messageLines.push("- لا توجد منتجات في السلة");
                }

                if (coupon && isCouponApplied) {
                        const discountPercentage = formatNumberEn(coupon.discountPercentage);
                        messageLines.push("", `الكوبون المستخدم: ${coupon.code} (${discountPercentage}% خصم)`);
                }

                if (savings > 0) {
                        messageLines.push("", `قيمة التوفير: ${formatMRU(savings)}`);
                }

                messageLines.push("", `الإجمالي المستحق: ${formatMRU(total)}`);
                messageLines.push("", "شكراً لتسوقك من متجر الصاحب!");

                const DEFAULT_STORE_WHATSAPP_NUMBER = "22241380130";
                const envStoreNumber = import.meta.env.VITE_STORE_WHATSAPP_NUMBER;
                const storeNumber =
                        envStoreNumber && envStoreNumber.trim() !== ""
                                ? envStoreNumber
                                : DEFAULT_STORE_WHATSAPP_NUMBER;
                let normalizedStoreNumber = storeNumber ? storeNumber.replace(/[^0-9]/g, "") : "";
                if (normalizedStoreNumber.length === 8) {
                        normalizedStoreNumber = `222${normalizedStoreNumber}`;
                }
                const params = new URLSearchParams({ text: messageLines.join("\n") });
                if (normalizedStoreNumber) {
                        params.set("phone", normalizedStoreNumber);
                }
                const url = `https://api.whatsapp.com/send?${params.toString()}`;

                const handleSuccessfulOrder = async (shouldNavigateToSuccess) => {
                        sessionStorage.setItem("whatsappOrderSent", "true");
                        await clearCart();

                        if (shouldNavigateToSuccess) {
                                navigate("/purchase-success", { replace: true });
                        }
                };

                const newWindow = window.open(url, "_blank", "noopener,noreferrer");

                if (newWindow) {
                        await handleSuccessfulOrder(true);
                        return;
                }

                try {
                        await handleSuccessfulOrder(false);
                        window.location.href = url;
                } catch (error) {
                        console.error("Unable to automatically open WhatsApp order", error);

                        if (navigator.clipboard?.writeText) {
                                await navigator.clipboard.writeText(url);
                                toast.success(
                                        "تم نسخ رابط الطلب بنجاح. افتح واتساب وألصق الرابط لإرسال الطلب."
                                );
                        } else {
                                toast.error(
                                        "تعذر فتح أو نسخ رابط واتساب تلقائيًا. يرجى السماح بفتح النوافذ المنبثقة والمحاولة مجددًا."
                                );
                        }
                }
        };

        if (cart.length === 0) {
                return null;
        }

        return (
                <div className='py-10 md:py-16'>
                        <div className='mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 lg:flex-row'>
                                <motion.section
                                        className='w-full rounded-xl border border-gray-700 bg-gray-800/70 p-6 shadow-lg backdrop-blur'
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4 }}
                                >
                                        <h1 className='mb-6 text-2xl font-bold text-emerald-400'>إتمام الطلب</h1>
                                        <form className='space-y-5' onSubmit={handleSubmit}>
                                                <div className='space-y-2'>
                                                        <label className='block text-sm font-medium text-gray-300' htmlFor='customerName'>
                                                                الاسم الكامل
                                                        </label>
                                                        <input
                                                                id='customerName'
                                                                type='text'
                                                                value={customerName}
                                                                onChange={(event) => setCustomerName(event.target.value)}
                                                                className='w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                                                placeholder='أدخل اسمك الكامل'
                                                                required
                                                        />
                                                </div>

                                                <div className='space-y-2'>
                                                        <label className='block text-sm font-medium text-gray-300' htmlFor='whatsAppNumber'>
                                                                رقم الواتساب
                                                        </label>
                                                        <input
                                                                id='whatsAppNumber'
                                                                type='tel'
                                                                value={whatsAppNumber}
                                                                onChange={handleWhatsAppChange}
                                                                className='w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                                                placeholder='مثال: 443322**'
                                                                required
                                                        />
                                                        {whatsAppError && (
                                                                <p className='text-sm text-red-400'>{whatsAppError}</p>
                                                        )}
                                                </div>

                                                <div className='space-y-2'>
                                                        <label className='block text-sm font-medium text-gray-300' htmlFor='address'>
                                                                العنوان التفصيلي
                                                        </label>
                                                        <textarea
                                                                id='address'
                                                                value={address}
                                                                onChange={(event) => setAddress(event.target.value)}
                                                                rows={4}
                                                                className='w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                                                placeholder='اكتب عنوان التوصيل بالكامل'
                                                                required
                                                        />
                                                </div>

                                                <motion.button
                                                        type='submit'
                                                        disabled={!isFormValid}
                                                        className='w-full rounded-lg bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50'
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.97 }}
                                                >
                                                        إرسال الطلب عبر واتساب
                                                </motion.button>
                                        </form>
                                </motion.section>

                                <motion.aside
                                        className='w-full rounded-xl border border-gray-700 bg-gray-800/70 p-6 shadow-lg backdrop-blur lg:max-w-sm'
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                        <h2 className='text-xl font-semibold text-emerald-400'>ملخص السلة</h2>
                                        <ul className='mt-4 space-y-3 text-sm text-gray-300'>
                                                {cart.map((item) => (
                                                        <li key={item._id} className='flex justify-between gap-4'>
                                                                <span className='font-medium text-white'>{item.name}</span>
                                                                <span>
                                                                        {formatNumberEn(item.quantity)} × {formatMRU(item.price)}
                                                                </span>
                                                        </li>
                                                ))}
                                        </ul>

                                        <div className='mt-6 space-y-2 border-t border-gray-700 pt-4 text-sm text-gray-300'>
                                                <div className='flex justify-between'>
                                                        <span>الإجمالي الفرعي</span>
                                                        <span>{formatMRU(subtotal)}</span>
                                                </div>
                                                {savings > 0 && (
                                                        <div className='flex justify-between text-emerald-400'>
                                                                <span>التوفير</span>
                                                                <span>-{formatMRU(savings)}</span>
                                                        </div>
                                                )}
                                                <div className='flex justify-between text-base font-semibold text-white'>
                                                        <span>الإجمالي</span>
                                                        <span>{formatMRU(total)}</span>
                                                </div>
                                        </div>

                                        <p className='mt-4 text-xs text-gray-500'>
                                                سيتم فتح واتساب مع رسالة جاهزة تتضمن تفاصيل طلبك لإرسالها إلى متجر الصاحب.
                                        </p>
                                </motion.aside>
                        </div>
                </div>
        );
};

export default CheckoutPage;
