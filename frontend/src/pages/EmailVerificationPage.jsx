import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import { Loader, Send } from "lucide-react";
import useTranslation from "../hooks/useTranslation";

const EmailVerificationPage = () => {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const navigate = useNavigate();
	const { t } = useTranslation();

	const { loading, verifyEmail, resendVerificationCode } = useUserStore();

	const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastIndex < 5 ? lastIndex + 1 : 5;
			inputRefs.current[focusIndex]?.focus();
		} else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1]?.focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleSubmit = async (e) => {
		if (e) e.preventDefault();
		const verificationCode = code.join("");
		try {
			await verifyEmail(verificationCode);
			toast.success(t("auth.verify.success"));
			navigate("/");
		} catch (error) {
			console.error(error);
		}
	};

	const handleResendCode = async () => {
		try {
			await resendVerificationCode();
		} catch (error) {
			console.error(error);
		}
	};

	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit();
		}
	}, [code]);

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
						<div className='flex justify-between gap-2' dir="ltr">
							{code.map((digit, index) => (
								<input
									key={index}
									ref={(el) => (inputRefs.current[index] = el)}
									type='text'
									maxLength='1'
									value={digit}
									onChange={(e) => handleChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									className='w-full h-12 text-center text-2xl font-bold bg-payzone-navy/60 text-white border border-payzone-indigo/40 rounded-lg focus:border-payzone-gold focus:outline-none focus:ring-1 focus:ring-payzone-gold'
								/>
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
