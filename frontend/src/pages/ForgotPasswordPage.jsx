import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Loader, ArrowLeft } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import FormField from "../components/FormField";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const { forgotPassword, loading } = useUserStore();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await forgotPassword(email);
			navigate("/reset-password", { state: { email } });
		} catch (error) {
			// error handled in store
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
				<h2 className='mt-6 text-center text-3xl font-extrabold text-payzone-gold'>
					{t("auth.forgotPassword.title")}
				</h2>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='rounded-3xl border border-white/10 bg-gradient-to-br from-[#070b1a] via-[#11192d] to-[#1b1032] px-4 py-8 shadow-xl shadow-black/20 sm:px-10'>
					<p className='mb-6 text-center text-white/70'>
						{t("auth.forgotPassword.instruction")}
					</p>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<FormField
							id="email"
							label={t("auth.login.email")}
							type="email"
							Icon={Mail}
							placeholder={t("auth.login.placeholderEmail")}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>

						<button
							type='submit'
							className='btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm disabled:opacity-50'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
									{t("common.loading")}
								</>
							) : (
								<>
									<ArrowRight className='h-5 w-5' aria-hidden='true' />
									{t("auth.forgotPassword.button")}
								</>
							)}
						</button>
					</form>

					<div className='mt-8 text-center'>
						<Link
							to='/login'
							className='text-sm font-medium text-payzone-indigo transition duration-300 hover:text-payzone-gold inline-flex items-center gap-1'
						>
							<ArrowLeft className='h-4 w-4' />
							{t("auth.forgotPassword.backToLogin")}
						</Link>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default ForgotPasswordPage;
