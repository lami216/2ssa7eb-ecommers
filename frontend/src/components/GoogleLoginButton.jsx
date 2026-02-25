import { GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "../stores/useUserStore";
import useTranslation from "../hooks/useTranslation";

const GoogleLoginButton = ({ textKey }) => {
	const { googleLogin } = useUserStore();
	const { t } = useTranslation();

	return (
		<div className='mt-6'>
			<div className='relative'>
				<div className='absolute inset-0 flex items-center'>
					<div className='w-full border-t border-payzone-indigo/40'></div>
				</div>
				<div className='relative flex justify-center text-sm'>
					<span className='bg-[#0f111a] px-2 text-white/60'>{t(textKey)}</span>
				</div>
			</div>

			<div className='mt-6 flex justify-center'>
				<GoogleLogin
					onSuccess={(credentialResponse) => {
						googleLogin(credentialResponse.credential);
					}}
					onError={() => {
						console.error("Google Login Failed");
					}}
					theme='filled_blue'
					shape='pill'
					locale='ar'
				/>
			</div>
		</div>
	);
};

export default GoogleLoginButton;
