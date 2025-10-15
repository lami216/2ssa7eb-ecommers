import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en/translation.json";
import ar from "../locales/ar/translation.json";
import fr from "../locales/fr/translation.json";

const resources = {
        en: { translation: en },
        ar: { translation: ar },
        fr: { translation: fr },
};

i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
                resources,
                fallbackLng: "en",
                supportedLngs: ["en", "ar", "fr"],
                interpolation: {
                        escapeValue: false,
                },
                detection: {
                        order: ["localStorage", "querystring", "navigator"],
                        caches: ["localStorage"],
                },
        });

export default i18n;
