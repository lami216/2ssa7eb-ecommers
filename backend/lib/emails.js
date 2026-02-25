import { Resend } from "resend";

const getResendClient = () => new Resend(process.env.RESEND_API_KEY);

const escapeHTML = (str) =>
	str.replace(
		/[&<>"']/g,
		(tag) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			}[tag] || tag)
	);

export const sendVerificationEmail = async (email, verificationToken) => {
	const sender = process.env.EMAIL_FROM || "onboarding@resend.dev";
	try {
		await getResendClient().emails.send({
			from: sender,
			to: email,
			subject: "تأكيد البريد الإلكتروني - بايزون",
			html: `
				<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; direction: rtl; text-align: right;">
					<h2 style="color: #333; text-align: center;">مرحباً بك في بايزون!</h2>
					<p style="font-size: 16px; color: #555;">شكراً لتسجيلك معنا. يرجى استخدام الرمز التالي لتأكيد بريدك الإلكتروني:</p>
					<div style="text-align: center; margin: 30px 0;">
						<span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background: #F3F4F6; padding: 10px 20px; border-radius: 5px;">${escapeHTML(verificationToken)}</span>
					</div>
					<p style="font-size: 14px; color: #777;">هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
					<p style="font-size: 14px; color: #777;">إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد بأمان.</p>
				</div>
			`,
		});
	} catch (error) {
		console.error("Error sending verification email");
		throw new Error("Error sending verification email");
	}
};

export const sendWelcomeEmail = async (email, name) => {
	const sender = process.env.EMAIL_FROM || "onboarding@resend.dev";
	const frontendUrl = process.env.FRONTEND_URL || "https://payzone.store";

	try {
		await getResendClient().emails.send({
			from: sender,
			to: email,
			subject: "مرحباً بك في بايزون!",
			html: `
				<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; direction: rtl; text-align: right;">
					<h2 style="color: #333; text-align: center;">مرحباً بك، ${escapeHTML(name)}!</h2>
					<p style="font-size: 16px; color: #555;">تم تأكيد بريدك الإلكتروني بنجاح. نحن متحمسون لانضمامك إلينا!</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${frontendUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ابدأ التسوق</a>
					</div>
					<p style="font-size: 14px; color: #777;">إذا كان لديك أي أسئلة، فلا تتردد في الرد على هذا البريد الإلكتروني.</p>
				</div>
			`,
		});
	} catch (error) {
		console.error("Error sending welcome email");
	}
};
