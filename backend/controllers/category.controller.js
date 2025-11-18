import Category from "../models/category.model.js";
import cloudinary from "../lib/cloudinary.js";

const isCloudinaryConfigured = () =>
        Boolean(
                process.env.CLOUDINARY_CLOUD_NAME &&
                        process.env.CLOUDINARY_API_KEY &&
                        process.env.CLOUDINARY_API_SECRET
        );

const uploadCategoryImage = async (image) => {
        if (!image || typeof image !== "string") {
                throw new Error("INVALID_IMAGE_FORMAT");
        }

        const isDataUri = image.startsWith("data:");

        if (!isDataUri) {
                throw new Error("INVALID_IMAGE_FORMAT");
        }

        if (!isCloudinaryConfigured()) {
                return {
                        secure_url: image,
                        public_id: null,
                };
        }

        return await cloudinary.uploader.upload(image, {
                folder: "categories",
        });
};

const slugify = (value) => {
        if (value === undefined || value === null) {
                return "";
        }

        const normalized = value
                .toString()
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "");

        const slug = normalized
                .replace(/[^\p{L}\p{N}\s-]/gu, "")
                .trim()
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .toLowerCase();

        return slug;
};

const generateUniqueSlug = async (baseName, ignoreId = null) => {
        const baseSlug = slugify(baseName) || "category";
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

const serializeCategory = (category) => {
        if (!category) return category;
        return typeof category.toObject === "function" ? category.toObject() : category;
};

export const getCategories = async (req, res) => {
        try {
                const categories = await Category.find({}).lean();
                res.json({ categories });
        } catch (error) {
                console.log("Error in getCategories controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const createCategory = async (req, res) => {
        try {
                const payload = req?.body && typeof req.body === "object" ? req.body : {};
                const rawName = payload.name;
                const rawDescription = payload.description;
                const rawImage = payload.image;

                if (typeof rawName !== "string" || !rawName.trim()) {
                        return res.status(400).json({ message: "Name is required" });
                }

                if (rawDescription !== undefined && typeof rawDescription !== "string") {
                        return res.status(400).json({ message: "Invalid category description" });
                }

                if (typeof rawImage !== "string") {
                        return res.status(400).json({ message: "Category image is required" });
                }

                const trimmedName = rawName.trim();
                const trimmedDescription =
                        typeof rawDescription === "string" ? rawDescription.trim() : "";
                const imageContent = rawImage.toString();

                let uploadResult;
                try {
                        uploadResult = await uploadCategoryImage(imageContent);
                } catch (uploadError) {
                        if (uploadError.message === "INVALID_IMAGE_FORMAT") {
                                return res.status(400).json({ message: "Invalid category image format" });
                        }
                        throw uploadError;
                }

                if (!uploadResult?.secure_url) {
                        return res.status(500).json({ message: "Failed to process category image" });
                }

                const slug = await generateUniqueSlug(trimmedName);

                const categoryData = {
                        name: trimmedName.toString(),
                        description: trimmedDescription.toString(),
                        slug: slug.toString(),
                        imageUrl:
                                typeof uploadResult.secure_url === "string"
                                        ? uploadResult.secure_url
                                        : String(uploadResult.secure_url),
                        imagePublicId:
                                typeof uploadResult.public_id === "string"
                                        ? uploadResult.public_id
                                        : uploadResult.public_id
                                          ? String(uploadResult.public_id)
                                          : null,
                };

                const category = await Category.create(categoryData);

                res.status(201).json(serializeCategory(category));
        } catch (error) {
                console.log("Error in createCategory controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const updateCategory = async (req, res) => {
        try {
                const { id } = req.params;
                const { name, description, image } = req.body;

                const category = await Category.findById(id);

                if (!category) {
                        return res.status(404).json({ message: "Category not found" });
                }

                if (typeof name === "string" && name.trim()) {
                        const trimmed = name.trim();
                        if (trimmed !== category.name) {
                                category.slug = await generateUniqueSlug(trimmed, category._id);
                        }
                        category.name = trimmed;
                }

                if (typeof description === "string") {
                        category.description = description.trim();
                }

                if (image && typeof image === "string" && image.startsWith("data:")) {
                        let uploadResult;
                        try {
                                uploadResult = await uploadCategoryImage(image);
                        } catch (uploadError) {
                                if (uploadError.message === "INVALID_IMAGE_FORMAT") {
                                        return res.status(400).json({ message: "Invalid category image format" });
                                }
                                throw uploadError;
                        }

                        if (!uploadResult?.secure_url) {
                                return res.status(500).json({ message: "Failed to process category image" });
                        }

                        if (category.imagePublicId && isCloudinaryConfigured()) {
                                try {
                                        await cloudinary.uploader.destroy(category.imagePublicId);
                                } catch (cleanupError) {
                                        console.log("Failed to delete previous category image", cleanupError.message);
                                }
                        }

                        category.imageUrl = uploadResult.secure_url;
                        category.imagePublicId = uploadResult.public_id;
                }

                await category.save();

                res.json(serializeCategory(category));
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

                if (category.imagePublicId && isCloudinaryConfigured()) {
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
