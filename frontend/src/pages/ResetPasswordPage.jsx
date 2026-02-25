import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Key, Loader, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import FormField from "../components/FormField";
import { toast } from "react-hot-toast";

const ResetPasswordPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { resetPassword, loading } = useUserStore();

	const [email, setEmail] = useState(location.state?.email || "");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			return toast.error(t("common.messages.passwordMismatch"));
		}

		try {
			await resetPassword(email, code, newPassword);
			navigate("/login");
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
					{t("auth.resetPassword.title")}
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
						{t("auth.resetPassword.instruction")}
					</p>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<FormField
							id="email"
							label={t("auth.resetPassword.email")}
							type="email"
							Icon={Mail}
							placeholder={t("auth.login.placeholderEmail")}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>

						<FormField
							id="code"
							label={t("auth.resetPassword.code")}
							type="text"
							Icon={Key}
							placeholder="123456"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							maxLength={6}
						/>

						<FormField
							id="newPassword"
							label={t("auth.resetPassword.newPassword")}
							type="password"
							Icon={Lock}
							placeholder={t("auth.login.placeholderPassword")}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>

						<FormField
							id="confirmPassword"
							label={t("auth.resetPassword.confirmPassword")}
							type="password"
							Icon={CheckCircle}
							placeholder={t("auth.login.placeholderPassword")}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>

						<button
							type='submit'
							className='btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm disabled:opacity-50'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
									{t("auth.resetPassword.loading")}
								</>
							) : (
								<>
									<CheckCircle className='h-5 w-5' aria-hidden='true' />
									{t("auth.resetPassword.button")}
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

export default ResetPasswordPage;
