import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
        const { i18n, t } = useTranslation();

        const languages = useMemo(
                () => [
                        { code: "en", label: t("common.languages.en") },
                        { code: "ar", label: t("common.languages.ar") },
                        { code: "fr", label: t("common.languages.fr") },
                ],
                [t]
        );

        return (
                <label className='flex items-center gap-2 text-sm font-medium text-white/70'>
                        <span>{t("languageSwitcher.label")}</span>
                        <select
                                className='rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-2 py-1 text-xs text-white focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                value={i18n.language}
                                onChange={(event) => i18n.changeLanguage(event.target.value)}
                        >
                                {languages.map((language) => (
                                        <option key={language.code} value={language.code}>
                                                {language.label}
                                        </option>
                                ))}
                        </select>
                </label>
        );
};

export default LanguageSwitcher;
