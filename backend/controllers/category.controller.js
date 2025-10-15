import Category from "../models/category.model.js";
import cloudinary from "../lib/cloudinary.js";
import { applyTranslation, buildTranslations, normalizeTranslations } from "../lib/translation.js";

const slugify = (value) => {
        return value
                .toString()
                .normalize("NFD")
                .replace(/[^\w\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-")
                .replace(/--+/g, "-")
                .toLowerCase();
};

const generateUniqueSlug = async (baseName, ignoreId = null) => {
        const baseSlug = slugify(baseName);
        let uniqueSlug = baseSlug;
        let counter = 1;

        while (true) {
                const existing = await Category.findOne({ slug: uniqueSlug });
                if (!existing || (ignoreId && existing._id.equals(ignoreId))) {
                        return uniqueSlug;
                }
                counter += 1;
                uniqueSlug = `${baseSlug}-${counter}`;
        }
};

const serializeCategory = (category, language) => {
        const plain = typeof category.toObject === "function" ? category.toObject() : category;
        const localized = applyTranslation({ document: plain, language });

        return {
                ...localized,
                translations: normalizeTranslations(localized.translations),
        };
};

export const getCategories = async (req, res) => {
        try {
                const { lang } = req.query;
                const categories = await Category.find({}).lean();
                const formatted = categories.map((category) => serializeCategory(category, lang));
                res.json({ categories: formatted });
        } catch (error) {
                console.log("Error in getCategories controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const createCategory = async (req, res) => {
        try {
                const { name, description = "", baseLanguage = "en", image, translations } = req.body;

                if (!name) {
                        return res.status(400).json({ message: "Name is required" });
                }

                if (!image) {
                        return res.status(400).json({ message: "Category image is required" });
                }

                const translationsMap = await buildTranslations({
                        name,
                        description,
                        baseLanguage,
                        manualTranslations: translations,
                });

                const uploadResult = await cloudinary.uploader.upload(image, {
                        folder: "categories",
                });

                const slug = await generateUniqueSlug(name);

                const category = await Category.create({
                        name,
                        description,
                        slug,
                        imageUrl: uploadResult.secure_url,
                        imagePublicId: uploadResult.public_id,
                        baseLanguage,
                        translations: translationsMap,
                });

                res.status(201).json(serializeCategory(category, req.query.lang || baseLanguage));
        } catch (error) {
                console.log("Error in createCategory controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const updateCategory = async (req, res) => {
        try {
                const { id } = req.params;
                const {
                        name,
                        description,
                        baseLanguage,
                        image,
                        translations,
                        autoTranslate = true,
                } = req.body;

                const category = await Category.findById(id);

                if (!category) {
                        return res.status(404).json({ message: "Category not found" });
                }

                let updatedName = category.name;
                let updatedDescription = category.description;
                let updatedBaseLanguage = category.baseLanguage;

                if (typeof name === "string" && name.trim()) {
                        updatedName = name.trim();
                        if (updatedName !== category.name) {
                                category.slug = await generateUniqueSlug(updatedName, category._id);
                        }
                }

                if (typeof description === "string") {
                        updatedDescription = description;
                }

                if (typeof baseLanguage === "string" && baseLanguage.trim()) {
                        updatedBaseLanguage = baseLanguage;
                }

                if (image && typeof image === "string" && image.startsWith("data:")) {
                        const uploadResult = await cloudinary.uploader.upload(image, {
                                folder: "categories",
                        });

                        if (category.imagePublicId) {
                                try {
                                        await cloudinary.uploader.destroy(category.imagePublicId);
                                } catch (cleanupError) {
                                        console.log("Failed to delete previous category image", cleanupError.message);
                                }
                        }

                        category.imageUrl = uploadResult.secure_url;
                        category.imagePublicId = uploadResult.public_id;
                }

                const existingTranslations = normalizeTranslations(category.translations);
                let mergedTranslations = { ...existingTranslations, ...normalizeTranslations(translations) };

                if (autoTranslate) {
                        mergedTranslations = await buildTranslations({
                                name: updatedName,
                                description: updatedDescription,
                                baseLanguage: updatedBaseLanguage,
                                manualTranslations: mergedTranslations,
                        });
                }

                category.name = updatedName;
                category.description = updatedDescription;
                category.baseLanguage = updatedBaseLanguage;
                category.translations = mergedTranslations;

                await category.save();

                res.json(serializeCategory(category, req.query.lang || updatedBaseLanguage));
        } catch (error) {
                console.log("Error in updateCategory controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const deleteCategory = async (req, res) => {
        try {
                const { id } = req.params;
                const category = await Category.findById(id);

                if (!category) {
                        return res.status(404).json({ message: "Category not found" });
                }

                if (category.imagePublicId) {
                        try {
                                await cloudinary.uploader.destroy(category.imagePublicId);
                        } catch (cleanupError) {
                                console.log("Failed to delete category image", cleanupError.message);
                        }
                }

                await Category.findByIdAndDelete(id);

                res.json({ message: "Category deleted successfully" });
        } catch (error) {
                console.log("Error in deleteCategory controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};
