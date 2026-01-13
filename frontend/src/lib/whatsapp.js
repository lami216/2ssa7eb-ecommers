export const extractWhatsAppNumber = (whatsappUrl) => {
        if (!whatsappUrl) return "";

        try {
                const url = new URL(whatsappUrl);
                const phoneParam = url.searchParams.get("phone") || "";
                const pathValue = url.pathname.replaceAll("/", "");
                const candidate = phoneParam || pathValue;
                return candidate.replaceAll(/\D/g, "");
        } catch {
                return "";
        }
};

export const buildWhatsAppLink = ({ whatsappUrl, message }) => {
        const number = extractWhatsAppNumber(whatsappUrl);
        if (!number) return "";
        const link = new URL(`https://wa.me/${number}`);
        if (message) {
                link.searchParams.set("text", message);
        }
        return link.toString();
};
