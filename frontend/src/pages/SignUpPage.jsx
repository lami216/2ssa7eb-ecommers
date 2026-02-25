import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowLeft, Loader } from "lucide-react";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import GoogleLoginButton from "../components/GoogleLoginButton";
import FormField from "../components/FormField";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { signup, loading } = useUserStore();
	const { t } = useTranslation();

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(formData);
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
					{t("auth.signup.title")}
				</h2>
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
							id="name"
							label={t("auth.signup.name")}
							type="text"
							Icon={User}
							placeholder={t("auth.signup.placeholderName")}
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						/>
						<FormField
							id="email"
							label={t("auth.signup.email")}
							type="email"
							Icon={Mail}
							placeholder={t("auth.signup.placeholderEmail")}
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						/>
						<FormField
							id="password"
							label={t("auth.signup.password")}
							type="password"
							Icon={Lock}
							placeholder={t("auth.signup.placeholderPassword")}
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
						/>
						<FormField
							id="confirmPassword"
							label={t("auth.signup.confirmPassword")}
							type="password"
							Icon={Lock}
							placeholder={t("auth.signup.placeholderPassword")}
							value={formData.confirmPassword}
							onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
						/>

						<button
							type='submit'
							className='flex w-full items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy transition duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo/60 disabled:opacity-50'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
									{t("auth.signup.loading")}
								</>
							) : (
								<>
									<UserPlus className='h-5 w-5' aria-hidden='true' />
									{t("auth.signup.button")}
								</>
							)}
						</button>
					</form>

					<GoogleLoginButton textKey="auth.signup.orContinueWith" />

					<p className='mt-8 text-center text-sm text-white/70'>
						{t("auth.signup.prompt")} {" "}
						<Link to='/login' className='font-medium text-payzone-indigo transition duration-300 hover:text-payzone-gold'>
							{t("auth.signup.cta")}{" "}
							<ArrowLeft className='mr-1 inline h-4 w-4' />
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default SignUpPage;
