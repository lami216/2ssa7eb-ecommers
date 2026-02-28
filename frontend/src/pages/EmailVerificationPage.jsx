import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import { Loader, Send } from "lucide-react";
import useTranslation from "../hooks/useTranslation";

const OTPInput = memo(function OTPInput({ index, value, onChangeDigit, onKeyDownDigit, assignRef }) {
	const handleInputChange = useCallback(
		(event) => {
			onChangeDigit(index, event.target.value);
		},
		[index, onChangeDigit]
	);

	const handleInputKeyDown = useCallback(
		(event) => {
			onKeyDownDigit(index, event);
		},
		[index, onKeyDownDigit]
	);

	const setRef = useCallback(
		(element) => {
			assignRef(index, element);
		},
		[index, assignRef]
	);

	return (
		<input
			ref={setRef}
			type='text'
			maxLength='1'
			value={value}
			onChange={handleInputChange}
			onKeyDown={handleInputKeyDown}
			className='w-full h-12 text-center text-2xl font-bold bg-payzone-navy/60 text-white border border-payzone-indigo/40 rounded-lg focus:border-payzone-gold focus:outline-none focus:ring-1 focus:ring-payzone-gold'
		/>
	);
});

const EmailVerificationPage = () => {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const navigate = useNavigate();
	const { t } = useTranslation();

	const { loading, verifyEmail, resendVerificationCode } = useUserStore();

	const assignRef = useCallback((index, element) => {
		inputRefs.current[index] = element;
	}, []);

	const handleChange = useCallback((index, value) => {
		setCode((previousCode) => {
			const nextCode = [...previousCode];

			if (value.length > 1) {
				const pastedCode = value.slice(0, 6).split("");
				for (let i = 0; i < 6; i += 1) {
					nextCode[i] = pastedCode[i] || "";
				}

				const lastIndex = nextCode.findLastIndex((digit) => digit !== "");
				const focusIndex = lastIndex < 5 ? lastIndex + 1 : 5;
				inputRefs.current[focusIndex]?.focus();
				return nextCode;
			}

			nextCode[index] = value;
			if (value && index < 5) {
				inputRefs.current[index + 1]?.focus();
			}
			return nextCode;
		});
	}, []);

	const handleKeyDown = useCallback(
		(index, event) => {
			if (event.key === "Backspace" && !code[index] && index > 0) {
				inputRefs.current[index - 1]?.focus();
			}
		},
		[code]
	);

	const handleSubmit = useCallback(
		async (event) => {
			if (event) event.preventDefault();
			const verificationCode = code.join("");
			try {
				await verifyEmail(verificationCode);
				toast.success(t("auth.verify.success"));
				navigate("/");
			} catch {
				// Error handled in store
			}
		},
		[code, navigate, t, verifyEmail]
	);

	const handleResendCode = async () => {
		try {
			await resendVerificationCode();
		} catch {
			// Error handled in store
		}
	};

	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit();
		}
	}, [code, handleSubmit]);

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-payzone-gold'>
					{t("auth.verify.title")}
				</h2>
				<p className='mt-2 text-center text-sm text-white/60'>
					{t("auth.verify.instruction")}
				</p>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='rounded-xl border border-payzone-indigo/40 bg-white/5 py-8 px-4 shadow sm:px-10'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='flex justify-between gap-2' dir='ltr'>
							{code.map((digit, index) => (
								<div key={`otp-${index}`} className='w-full'>
									<OTPInput
										index={index}
										value={digit}
										onChangeDigit={handleChange}
										onKeyDownDigit={handleKeyDown}
										assignRef={assignRef}
									/>
								</div>
							))}
						</div>

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='submit'
							disabled={loading || code.some((digit) => !digit)}
							className='flex w-full items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-3 text-sm font-semibold text-payzone-navy transition duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo/60 disabled:opacity-50'
						>
							{loading ? (
								<>
									<Loader className='animate-spin' size={24} />
									{t("auth.verify.verifying")}
								</>
							) : (
								t("auth.verify.button")
							)}
						</motion.button>
					</form>

					<div className='mt-6 text-center'>
						<button
							onClick={handleResendCode}
							disabled={loading}
							className='text-payzone-indigo hover:text-payzone-gold text-sm font-medium transition duration-300 flex items-center justify-center gap-2 mx-auto'
						>
							<Send size={16} />
							{t("auth.verify.resend")}
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default EmailVerificationPage;
