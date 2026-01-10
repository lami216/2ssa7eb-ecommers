import nodemailer from "nodemailer";

const buildTransporter = () => {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host) {
                console.warn("SMTP_HOST is not configured. Skipping email notification.");
                return null;
        }

        const auth = user && pass ? { user, pass } : undefined;
        return nodemailer.createTransport({
                host,
                port,
                secure: process.env.SMTP_SECURE === "true",
                auth,
        });
};

export const isServiceRequestEmailConfigured = () => {
        const to = process.env.SERVICE_REQUEST_EMAIL || process.env.SMTP_USER;
        return Boolean(to && process.env.SMTP_HOST);
};

export const sendServiceRequestEmail = async ({ subject, text }) => {
        const to = process.env.SERVICE_REQUEST_EMAIL || process.env.SMTP_USER;

        if (!to) {
                console.warn("SERVICE_REQUEST_EMAIL is not configured. Skipping email notification.");
                return false;
        }

        const transporter = buildTransporter();
        if (!transporter) {
                return false;
        }

        const from = process.env.SMTP_FROM || process.env.SMTP_USER || to;

        try {
                await transporter.sendMail({
                        from,
                        to,
                        subject,
                        text,
                });
                return true;
        } catch (error) {
                console.warn("Failed to send service request email", error.message);
                return false;
        }
};

export const isTelegramConfigured = () =>
        Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

export const sendTelegramNotification = async (message) => {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
                console.warn("Telegram notification is not configured. Skipping Telegram message.");
                return false;
        }

        try {
                const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                        method: "POST",
                        headers: {
                                "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ chat_id: chatId, text: message }),
                });

                if (!response.ok) {
                        console.warn("Telegram notification failed with status", response.status);
                }

                return response.ok;
        } catch (error) {
                console.warn("Telegram notification failed", error.message);
                return false;
        }
};
