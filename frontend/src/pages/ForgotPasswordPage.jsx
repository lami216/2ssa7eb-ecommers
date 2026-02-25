import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Loader, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import FormField from "../components/FormField";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const navigate = useNavigate();
	const { forgotPassword, loading } = useUserStore();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await forgotPassword(email);
			toast.success(response?.message || "If your email exists, a reset code has been sent.");
			navigate("/reset-password", {
				state: { email: email.trim().toLowerCase() },
			});
		} catch {
			// handled in store
		}
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-payzone-gold'>Forgot Password</h2>
				<p className='mt-2 text-center text-sm text-white/60'>Enter your email to receive a 6-digit reset code.</p>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='rounded-xl border border-payzone-indigo/40 bg-white/5 py-8 px-4 shadow sm:px-10'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<FormField
							id="forgotEmail"
							label="Email"
							type="email"
							Icon={Mail}
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>

						<button
							type='submit'
							disabled={loading}
							className='flex w-full items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy transition duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo/60 disabled:opacity-50'
						>
							{loading ? (
								<>
									<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
									Sending...
								</>
							) : (
								<>
									<KeyRound className='h-5 w-5' aria-hidden='true' />
									Send Reset Code
								</>
							)}
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};

export default ForgotPasswordPage;
