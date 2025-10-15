import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

const serializeProduct = (product) => {
        if (!product) return product;
        return typeof product.toObject === "function" ? product.toObject() : product;
};

export const getAllProducts = async (req, res) => {
        try {
                const products = await Product.find({}).lean();
                res.json({ products });
        } catch (error) {
                console.log("Error in getAllProducts controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getFeaturedProducts = async (req, res) => {
        try {
                let featuredProducts = await redis.get("featured_products");
                if (featuredProducts) {
                        const parsed = JSON.parse(featuredProducts);
                        return res.json(parsed);
                }

                featuredProducts = await Product.find({ isFeatured: true }).lean();

                if (!featuredProducts || !featuredProducts.length) {
                        return res.status(404).json({ message: "No featured products found" });
                }

                await redis.set("featured_products", JSON.stringify(featuredProducts));

                res.json(featuredProducts);
        } catch (error) {
                console.log("Error in getFeaturedProducts controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const createProduct = async (req, res) => {
        try {
                const { name, description, price, category, images } = req.body;

                const trimmedName = typeof name === "string" ? name.trim() : "";
                const trimmedDescription =
                        typeof description === "string" ? description.trim() : "";

                if (!trimmedName) {
                        return res.status(400).json({ message: "Product name is required" });
                }

                if (!trimmedDescription) {
                        return res.status(400).json({ message: "Product description is required" });
                }

                if (!Array.isArray(images) || images.length === 0) {
                        return res.status(400).json({ message: "At least one product image is required" });
                }

                if (images.length > 3) {
                        return res.status(400).json({ message: "You can upload up to 3 images per product" });
                }

                if (typeof category !== "string" || !category.trim()) {
                        return res.status(400).json({ message: "Category is required" });
                }

                const sanitizedImages = images
                        .filter((image) => typeof image === "string" && image.trim().length > 0)
                        .slice(0, 3);

                if (!sanitizedImages.length) {
                        return res.status(400).json({ message: "Provided images are not valid" });
                }

                const numericPrice = Number(price);

                if (Number.isNaN(numericPrice)) {
                        return res.status(400).json({ message: "Price must be a valid number" });
                }

                const uploadedImages = [];

                try {
                        for (const base64Image of sanitizedImages) {
                                const uploadResult = await cloudinary.uploader.upload(base64Image, {
                                        folder: "products",
                                });

                                uploadedImages.push({
                                        url: uploadResult.secure_url,
                                        public_id: uploadResult.public_id,
                                });
                        }
                } catch (uploadError) {
                        if (uploadedImages.length) {
                                const uploadedPublicIds = uploadedImages
                                        .map((image) => image.public_id)
                                        .filter(Boolean);

                                try {
                                        await cloudinary.api.delete_resources(uploadedPublicIds);
                                } catch (cleanupError) {
                                        console.log(
                                                "Error cleaning up uploaded images after failure",
                                                cleanupError
                                        );
                                }
                        }

                        throw uploadError;
                }

                const product = await Product.create({
                        name: trimmedName,
                        description: trimmedDescription,
                        price: numericPrice,
                        image: uploadedImages[0]?.url,
                        images: uploadedImages,
                        category: category.trim(),
                });

                res.status(201).json(serializeProduct(product));
        } catch (error) {
                console.log("Error in createProduct controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const deleteProduct = async (req, res) => {
        try {
                const product = await Product.findById(req.params.id);

                if (!product) {
                        return res.status(404).json({ message: "Product not found" });
                }

                const publicIds = Array.isArray(product.images)
                        ? product.images
                                  .map((image) => (typeof image === "object" ? image.public_id : null))
                                  .filter(Boolean)
                        : [];

                if (publicIds.length) {
                        try {
                                await cloudinary.api.delete_resources(publicIds, {
                                        type: "upload",
                                        resource_type: "image",
                                });
                        } catch (cloudinaryError) {
                                console.log("Error deleting images from Cloudinary", cloudinaryError);
                        }
                }

                await Product.findByIdAndDelete(req.params.id);

                if (product.isFeatured) {
                        await updateFeaturedProductsCache();
                }

                res.json({ message: "Product and images deleted successfully" });
        } catch (error) {
                console.log("Error in deleteProduct controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getProductById = async (req, res) => {
        try {
                const product = await Product.findById(req.params.id);

                if (!product) {
                        return res.status(404).json({ message: "Product not found" });
                }

                res.json(serializeProduct(product));
        } catch (error) {
                console.log("Error in getProductById controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getRecommendedProducts = async (req, res) => {
        try {
                const products = await Product.aggregate([
                        {
                                $sample: { size: 4 },
                        },
                        {
                                $project: {
                                        _id: 1,
                                        name: 1,
                                        description: 1,
                                        image: 1,
                                        images: 1,
                                        price: 1,
                                        category: 1,
                                        isFeatured: 1,
                                },
                        },
                ]);

                res.json(products);
        } catch (error) {
                console.log("Error in getRecommendedProducts controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getProductsByCategory = async (req, res) => {
        const { category } = req.params;
        try {
                const products = await Product.find({ category }).lean();
                res.json({ products });
        } catch (error) {
                console.log("Error in getProductsByCategory controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const toggleFeaturedProduct = async (req, res) => {
        try {
                const product = await Product.findById(req.params.id);
                if (product) {
                        product.isFeatured = !product.isFeatured;
                        const updatedProduct = await product.save();
                        await updateFeaturedProductsCache();
                        res.json(serializeProduct(updatedProduct));
                } else {
                        res.status(404).json({ message: "Product not found" });
                }
        } catch (error) {
                console.log("Error in toggleFeaturedProduct controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

async function updateFeaturedProductsCache() {
        try {
                const featuredProducts = await Product.find({ isFeatured: true }).lean();
                await redis.set("featured_products", JSON.stringify(featuredProducts));
        } catch (error) {
                console.log("error in update cache function", error.message);
        }
}
