import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LanguageProvider = ({ children }) => {
        const { i18n } = useTranslation();

        useEffect(() => {
                const language = i18n.language || "en";
                document.documentElement.lang = language;
                document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        }, [i18n.language]);

        return children;
};

export default LanguageProvider;
