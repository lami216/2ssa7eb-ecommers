import nodemailer from "nodemailer";

const buildTransporter = () => {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host) {
                throw new Error("SMTP_HOST is not configured");
        }

        const auth = user && pass ? { user, pass } : undefined;
        return nodemailer.createTransport({
                host,
                port,
                secure: process.env.SMTP_SECURE === "true",
                auth,
        });
};

export const sendServiceRequestEmail = async ({ subject, text }) => {
        const to = process.env.SERVICE_REQUEST_EMAIL || process.env.SMTP_USER;

        if (!to) {
                throw new Error("SERVICE_REQUEST_EMAIL is not configured");
        }

        const transporter = buildTransporter();
        const from = process.env.SMTP_FROM || process.env.SMTP_USER;

        await transporter.sendMail({
                from,
                to,
                subject,
                text,
        });
};

export const sendTelegramNotification = async (message) => {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
                return false;
        }

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: {
                        "Content-Type": "application/json",
                },
                body: JSON.stringify({ chat_id: chatId, text: message }),
        });

        return response.ok;
};
