import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			min: 0,
			required: true,
		},
                image: {
                        type: String,
                        required: [true, "Image is required"],
                },
                images: {
                        type: [
                                {
                                        url: {
                                                type: String,
                                                required: true,
                                        },
                                        public_id: {
                                                type: String,
                                                required: true,
                                        },
                                },
                        ],
                        default: [],
                        validate: {
                                validator(images) {
                                        return images.length <= 3;
                                },
                                message: "A product can have up to 3 images only",
                        },
                },
		category: {
			type: String,
			required: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
