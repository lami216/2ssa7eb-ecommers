import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck, Loader, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import FormField from "../components/FormField";

const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const prefilledEmail = location.state?.email || "";

	const [email, setEmail] = useState(prefilledEmail);
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [codeVerified, setCodeVerified] = useState(false);

	const { verifyResetCode, resetPassword, loading } = useUserStore();

	useEffect(() => {
		setCodeVerified(false);
	}, [email, code]);

	const handleVerifyCode = async () => {
		try {
			await verifyResetCode(email, code);
			setCodeVerified(true);
			toast.success("Reset code verified.");
		} catch {
			setCodeVerified(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (newPassword !== confirmNewPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		try {
			if (!codeVerified) {
				await verifyResetCode(email, code);
				setCodeVerified(true);
			}

			await resetPassword(email, code, newPassword);
			toast.success("Password reset successfully.");
			navigate("/login");
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
				<h2 className='mt-6 text-center text-3xl font-extrabold text-payzone-gold'>Reset Password</h2>
				<p className='mt-2 text-center text-sm text-white/60'>Use your email and 6-digit code to set a new password.</p>
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
							id="resetEmail"
							label="Email"
							type="email"
							Icon={Mail}
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>

						<FormField
							id="resetCode"
							label="6-digit Code"
							type="text"
							Icon={ShieldCheck}
							placeholder="123456"
							value={code}
							onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
						/>

						<button
							type='button'
							onClick={handleVerifyCode}
							disabled={loading || code.length !== 6}
							className='flex w-full items-center justify-center gap-2 rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:border-payzone-gold disabled:opacity-50'
						>
							{loading ? <Loader className='h-5 w-5 animate-spin' /> : <RefreshCw className='h-5 w-5' />}
							Verify Code
						</button>

						<FormField
							id="newPassword"
							label="New Password"
							type="password"
							Icon={Lock}
							placeholder="Enter new password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>

						<FormField
							id="confirmNewPassword"
							label="Confirm New Password"
							type="password"
							Icon={Lock}
							placeholder="Confirm new password"
							value={confirmNewPassword}
							onChange={(e) => setConfirmNewPassword(e.target.value)}
						/>

						<button
							type='submit'
							disabled={loading || !codeVerified}
							className='flex w-full items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy transition duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo/60 disabled:opacity-50'
						>
							{loading ? (
								<>
									<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
									Resetting...
								</>
							) : (
								"Reset Password"
							)}
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};

export default ResetPasswordPage;
