import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: true,
                },
                description: {
                        type: String,
                        default: "",
                },
        },
        { _id: false }
);

const categorySchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: true,
                },
                description: {
                        type: String,
                        default: "",
                },
                slug: {
                        type: String,
                        required: true,
                        unique: true,
                },
                imageUrl: {
                        type: String,
                        required: true,
                },
                imagePublicId: {
                        type: String,
                        required: true,
                },
                baseLanguage: {
                        type: String,
                        default: "en",
                },
                translations: {
                        type: Map,
                        of: translationSchema,
                        default: {},
                },
        },
        { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
