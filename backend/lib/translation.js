import translate from "@vitalets/google-translate-api";

export const SUPPORTED_LANGUAGES = ["en", "ar", "fr"];

const normalizeLanguage = (lang) => {
        if (!lang || typeof lang !== "string") return "en";
        const normalized = lang.toLowerCase();
        return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : "en";
};

const translateField = async (value, from, to) => {
        if (!value) return "";
        try {
                const { text } = await translate(value, { from, to });
                return text;
        } catch (error) {
                console.error(`Translation failed from ${from} to ${to}:`, error.message);
                return value;
        }
};

export const buildTranslations = async ({
        name,
        description = "",
        baseLanguage = "en",
        manualTranslations = {},
}) => {
        const normalizedBase = normalizeLanguage(baseLanguage);
        const translations = {};

        const tasks = SUPPORTED_LANGUAGES.map(async (language) => {
                const manual = manualTranslations?.[language];
                if (manual && manual.name) {
                        translations[language] = {
                                name: manual.name,
                                description: manual.description ?? "",
                        };
                        return;
                }

                if (language === normalizedBase) {
                        translations[language] = {
                                name,
                                description,
                        };
                        return;
                }

                const [translatedName, translatedDescription] = await Promise.all([
                        translateField(name, normalizedBase, language),
                        translateField(description, normalizedBase, language),
                ]);

                translations[language] = {
                        name: translatedName,
                        description: translatedDescription,
                };
        });

        await Promise.all(tasks);

        return translations;
};

export const normalizeTranslations = (translations) => {
        if (!translations) return {};

        if (translations instanceof Map) {
                        return Array.from(translations.entries()).reduce((acc, [language, value]) => {
                                if (value) {
                                        acc[language] = {
                                                name: value.name,
                                                description: value.description ?? "",
                                        };
                                }
                                return acc;
                        }, {});
        }

        return Object.keys(translations).reduce((acc, language) => {
                const value = translations[language];
                if (value) {
                        acc[language] = {
                                name: value.name,
                                description: value.description ?? "",
                        };
                }
                return acc;
        }, {});
};

export const applyTranslation = ({ document, language }) => {
        if (!document) return document;
        const normalizedLanguage = normalizeLanguage(language);
        const translations = normalizeTranslations(document.translations);
        const fallbackLanguage = normalizeLanguage(document.baseLanguage || "en");
        const localized =
                translations[normalizedLanguage] || translations[fallbackLanguage] || {
                        name: document.name,
                        description: document.description,
                };

        return {
                ...document,
                name: localized?.name ?? document.name,
                description: localized?.description ?? document.description,
                translations,
        };
};
