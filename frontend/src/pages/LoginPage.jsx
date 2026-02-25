import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowLeft, Loader } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import GoogleLoginButton from "../components/GoogleLoginButton";
import FormField from "../components/FormField";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { login, loading } = useUserStore();
	const { t } = useTranslation();

	const handleSubmit = (e) => {
		e.preventDefault();
		login(email, password);
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-payzone-gold'>{t("auth.login.title")}</h2>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='rounded-3xl border border-white/10 bg-gradient-to-br from-[#070b1a] via-[#11192d] to-[#1b1032] px-4 py-8 shadow-xl shadow-black/20 sm:px-10'>
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

						<FormField
							id="password"
							label={t("auth.login.password")}
							type="password"
							Icon={Lock}
							placeholder={t("auth.login.placeholderPassword")}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>

						<div className='text-sm text-left'>
							<Link to='/forgot-password' className='font-medium text-payzone-indigo transition duration-300 hover:text-payzone-gold'>
								Forgot Password?
							</Link>
						</div>

						<button
							type='submit'
							className='btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm disabled:opacity-50'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
									{t("auth.login.loading")}
								</>
							) : (
								<>
									<LogIn className='h-5 w-5' aria-hidden='true' />
									{t("auth.login.button")}
								</>
							)}
						</button>
					</form>

					<GoogleLoginButton textKey="auth.login.orContinueWith" />

					<p className='mt-8 text-center text-sm text-white/70'>
						{t("auth.login.prompt")} {" "}
						<Link to='/signup' className='font-medium text-payzone-indigo transition duration-300 hover:text-payzone-gold'>
							{t("auth.login.cta")}{" "}
							<ArrowLeft className='mr-1 inline h-4 w-4' />
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default LoginPage;
