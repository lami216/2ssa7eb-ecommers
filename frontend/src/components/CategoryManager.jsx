import { useCallback, useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2, Edit3, X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useCategoryStore } from "../stores/useCategoryStore";

const CategoryManager = () => {
        const {
                categories,
                selectedCategory,
                setSelectedCategory,
                clearSelectedCategory,
                createCategory,
                updateCategory,
                deleteCategory,
                fetchCategories,
                loading,
        } = useCategoryStore();
        const { t, i18n } = useTranslation();

        const languages = useMemo(
                () => [
                        { code: "en", label: t("common.languages.en") },
                        { code: "ar", label: t("common.languages.ar") },
                        { code: "fr", label: t("common.languages.fr") },
                ],
                [t]
        );

        const createEmptyTranslations = useCallback(
                () =>
                        languages.reduce((accumulator, language) => {
                                accumulator[language.code] = { name: "", description: "" };
                                return accumulator;
                        }, {}),
                [languages]
        );

        const [activeLanguage, setActiveLanguage] = useState(languages[0]?.code ?? "en");
        const [formState, setFormState] = useState({
                baseLanguage: "en",
                translations: createEmptyTranslations(),
                image: "",
                imagePreview: "",
                imageChanged: false,
        });

        useEffect(() => {
                fetchCategories(i18n.language);
        }, [fetchCategories, i18n.language]);

        useEffect(() => {
                const defaultLanguage = languages.find((language) => language.code === i18n.language)?.code ?? languages[0]?.code;
                if (defaultLanguage) {
                        setActiveLanguage(defaultLanguage);
                }
        }, [i18n.language, languages]);

        const resetForm = useCallback(() => {
                setFormState({
                        baseLanguage: "en",
                        translations: createEmptyTranslations(),
                        image: "",
                        imagePreview: "",
                        imageChanged: false,
                });
        }, [createEmptyTranslations]);

        useEffect(() => {
                if (!selectedCategory) {
                        resetForm();
                        return;
                }

                const normalizedTranslations = createEmptyTranslations();
                const translations = selectedCategory.translations || {};

                Object.keys(normalizedTranslations).forEach((languageCode) => {
                        const translation = translations[languageCode];
                        normalizedTranslations[languageCode] = {
                                name: translation?.name ?? "",
                                description: translation?.description ?? "",
                        };
                });

                const baseLanguage = selectedCategory.baseLanguage || "en";

                setFormState({
                        baseLanguage,
                        translations: normalizedTranslations,
                        image: "",
                        imagePreview: selectedCategory.imageUrl,
                        imageChanged: false,
                });
                const preferredLanguage = languages.find((language) => language.code === baseLanguage)?.code || languages[0]?.code || "en";
                setActiveLanguage(preferredLanguage);
        }, [selectedCategory, createEmptyTranslations, resetForm, languages]);

        const handleTranslationChange = (languageCode, field, value) => {
                setFormState((previous) => ({
                        ...previous,
                        translations: {
                                ...previous.translations,
                                [languageCode]: {
                                        ...previous.translations[languageCode],
                                        [field]: value,
                                },
                        },
                }));
        };

        const handleImageChange = (event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => {
                        const result = typeof reader.result === "string" ? reader.result : "";
                        setFormState((previous) => ({
                                ...previous,
                                image: result,
                                imagePreview: result,
                                imageChanged: true,
                        }));
                };
                reader.readAsDataURL(file);
                event.target.value = "";
        };

        const handleSubmit = async (event) => {
                event.preventDefault();
                const baseLanguage = formState.baseLanguage;
                const baseTranslation = formState.translations[baseLanguage] ?? { name: "", description: "" };

                if (!baseTranslation.name?.trim()) {
                        toast.error(t("categories.manager.form.nameRequired"));
                        return;
                }

                if (!selectedCategory && !formState.image) {
                        toast.error(t("categories.manager.form.imageRequired"));
                        return;
                }

                const preparedTranslations = Object.entries(formState.translations).reduce((accumulator, [languageCode, value]) => {
                        if (value?.name?.trim()) {
                                accumulator[languageCode] = {
                                        name: value.name.trim(),
                                        description: value.description?.trim() ?? "",
                                };
                        }
                        return accumulator;
                }, {});

                const payload = {
                        name: baseTranslation.name.trim(),
                        description: baseTranslation.description?.trim() ?? "",
                        baseLanguage,
                        translations: preparedTranslations,
                        language: i18n.language,
                        autoTranslate: true,
                };

                if (formState.image && (selectedCategory ? formState.imageChanged : true)) {
                        payload.image = formState.image;
                }

                try {
                        if (selectedCategory) {
                                await updateCategory(selectedCategory._id, payload);
                        } else {
                                await createCategory(payload);
                        }
                        resetForm();
                        clearSelectedCategory();
                } catch (error) {
                        console.error("Category save failed", error);
                }
        };

        const handleEdit = (category) => {
                setSelectedCategory(category);
        };

        const handleCancelEdit = () => {
                clearSelectedCategory();
                resetForm();
        };

        const handleDelete = (category) => {
                if (window.confirm(t("categories.manager.confirmDelete"))) {
                        deleteCategory(category._id);
                }
        };

        const activeTranslation = formState.translations[activeLanguage] ?? { name: "", description: "" };

        return (
                <div className='mx-auto mb-12 max-w-5xl space-y-8'>
                        <div className='rounded-xl border border-payzone-indigo/40 bg-white/5 p-6 shadow-lg backdrop-blur-sm'>
                                <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                        <div>
                                                <h2 className='text-2xl font-semibold text-payzone-gold'>{t("categories.manager.title")}</h2>
                                                <p className='text-sm text-white/70'>{t("categories.manager.description")}</p>
                                        </div>
                                        {selectedCategory && (
                                                <button
                                                        type='button'
                                                        className='inline-flex items-center gap-2 rounded-md border border-payzone-indigo/40 px-3 py-1 text-sm text-white transition hover:border-payzone-gold'
                                                        onClick={handleCancelEdit}
                                                >
                                                        <X className='h-4 w-4' />
                                                        {t("categories.manager.form.cancelEdit")}
                                                </button>
                                        )}
                                </div>

                                <form onSubmit={handleSubmit} className='space-y-6'>
                                        <div className='grid gap-4 sm:grid-cols-2'>
                                                <div>
                                                        <label className='block text-sm font-medium text-white/80' htmlFor='category-base-language'>
                                                                {t("categories.manager.form.baseLanguage")}
                                                        </label>
                                                        <select
                                                                id='category-base-language'
                                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                                value={formState.baseLanguage}
                                                                onChange={(event) => {
                                                                        const nextLanguage = event.target.value;
                                                                        setFormState((previous) => ({
                                                                                ...previous,
                                                                                baseLanguage: nextLanguage,
                                                                        }));
                                                                        setActiveLanguage(nextLanguage);
                                                                }}
                                                        >
                                                                {languages.map((language) => (
                                                                        <option key={language.code} value={language.code}>
                                                                                {language.label}
                                                                        </option>
                                                                ))}
                                                        </select>
                                                </div>
                                                <div>
                                                        <label className='block text-sm font-medium text-white/80'>
                                                                {t("categories.manager.form.image")}
                                                        </label>
                                                        <div className='mt-1 flex items-center gap-3'>
                                                                <input
                                                                        type='file'
                                                                        id='category-image'
                                                                        accept='image/*'
                                                                        className='sr-only'
                                                                        onChange={handleImageChange}
                                                                />
                                                                <label
                                                                        htmlFor='category-image'
                                                                        className='inline-flex cursor-pointer items-center gap-2 rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-sm text-white transition hover:border-payzone-gold hover:bg-payzone-navy/80'
                                                                >
                                                                        <ImagePlus className='h-4 w-4' />
                                                                        {formState.imagePreview
                                                                                ? t("categories.manager.form.changeImage")
                                                                                : t("categories.manager.form.chooseImage")}
                                                                </label>
                                                                {formState.imagePreview && (
                                                                        <img
                                                                                src={formState.imagePreview}
                                                                                alt='Category preview'
                                                                                className='h-14 w-14 rounded-lg object-cover'
                                                                        />
                                                                )}
                                                        </div>
                                                        <p className='mt-2 text-xs text-white/60'>{t("categories.manager.form.imageHint")}</p>
                                                </div>
                                        </div>

                                        <div>
                                                <div className='mb-4 flex flex-wrap gap-2'>
                                                        {languages.map((language) => {
                                                                const isActive = language.code === activeLanguage;
                                                                return (
                                                                        <button
                                                                                key={language.code}
                                                                                type='button'
                                                                                onClick={() => setActiveLanguage(language.code)}
                                                                                className={`rounded-md px-3 py-1 text-sm transition ${
                                                                                        isActive
                                                                                                ? "bg-payzone-gold text-payzone-navy"
                                                                                                : "bg-white/10 text-white/70 hover:bg-white/20"
                                                                                }`}
                                                                        >
                                                                                {language.label}
                                                                        </button>
                                                                );
                                                        })}
                                                </div>
                                                <div className='grid gap-4 sm:grid-cols-2'>
                                                        <div>
                                                                <label className='block text-sm font-medium text-white/80' htmlFor='category-name'>
                                                                        {t("categories.manager.form.name")}
                                                                </label>
                                                                <input
                                                                        id='category-name'
                                                                        type='text'
                                                                        className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                                        value={activeTranslation.name}
                                                                        onChange={(event) => handleTranslationChange(activeLanguage, "name", event.target.value)}
                                                                        required={activeLanguage === formState.baseLanguage}
                                                                />
                                                        </div>
                                                        <div>
                                                                <label className='block text-sm font-medium text-white/80' htmlFor='category-description'>
                                                                        {t("categories.manager.form.description")}
                                                                </label>
                                                                <textarea
                                                                        id='category-description'
                                                                        rows={3}
                                                                        className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                                        value={activeTranslation.description}
                                                                        onChange={(event) => handleTranslationChange(activeLanguage, "description", event.target.value)}
                                                                />
                                                        </div>
                                                </div>
                                        </div>

                                        <button
                                                type='submit'
                                                className='inline-flex items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 font-semibold text-payzone-navy transition hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo disabled:opacity-50'
                                                disabled={loading}
                                        >
                                                <Save className='h-4 w-4' />
                                                {selectedCategory
                                                        ? t("categories.manager.form.submitUpdate")
                                                        : t("categories.manager.form.submitCreate")}
                                        </button>
                                </form>
                        </div>

                        <div className='rounded-xl border border-payzone-indigo/40 bg-white/5 p-6 shadow-lg backdrop-blur-sm'>
                                <h3 className='mb-4 text-xl font-semibold text-payzone-gold'>{t("categories.manager.list.title")}</h3>
                                {categories.length === 0 ? (
                                        <p className='text-sm text-white/70'>{t("categories.manager.list.empty")}</p>
                                ) : (
                                        <ul className='space-y-4'>
                                                {categories.map((category) => (
                                                        <li
                                                                key={category._id}
                                                                className='flex flex-col gap-3 rounded-lg border border-white/10 bg-payzone-navy/40 p-4 sm:flex-row sm:items-center sm:justify-between'
                                                        >
                                                                <div className='flex items-center gap-4'>
                                                                        <img
                                                                                src={category.imageUrl}
                                                                                alt={category.name}
                                                                                className='h-14 w-14 rounded-lg object-cover'
                                                                        />
                                                                        <div>
                                                                                <p className='text-lg font-semibold text-white'>{category.name}</p>
                                                                                {category.description && (
                                                                                        <p className='text-sm text-white/60'>{category.description}</p>
                                                                                )}
                                                                        </div>
                                                                </div>
                                                                <div className='flex items-center gap-2'>
                                                                        <button
                                                                                type='button'
                                                                                className='inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1 text-sm text-white transition hover:bg-white/20'
                                                                                onClick={() => handleEdit(category)}
                                                                        >
                                                                                <Edit3 className='h-4 w-4' />
                                                                                {t("categories.manager.list.actions.edit")}
                                                                        </button>
                                                                        <button
                                                                                type='button'
                                                                                className='inline-flex items-center gap-1 rounded-md bg-red-500/20 px-3 py-1 text-sm text-red-200 transition hover:bg-red-500/30'
                                                                                onClick={() => handleDelete(category)}
                                                                        >
                                                                                <Trash2 className='h-4 w-4' />
                                                                                {t("categories.manager.list.actions.delete")}
                                                                        </button>
                                                                </div>
                                                        </li>
                                                ))}
                                        </ul>
                                )}
                        </div>
                </div>
        );
};

export default CategoryManager;
