import { useEffect } from "react";
import { LANGUAGE } from "../lib/locale";

const LanguageProvider = ({ children }) => {
        useEffect(() => {
                const locale = LANGUAGE;
                document.documentElement.lang = locale;
                document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
        }, [LANGUAGE]);

        return children;
};

export default LanguageProvider;
