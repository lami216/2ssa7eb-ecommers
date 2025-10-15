import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";

const MAX_IMAGES = 3;

const CreateProductForm = () => {
        const [newProduct, setNewProduct] = useState({
                name: "",
                description: "",
                price: "",
                category: "",
                images: [],
                coverImageIndex: 0,
        });

        const { createProduct, loading } = useProductStore();
        const { categories, fetchCategories } = useCategoryStore();
        const { t } = useTranslation();

        useEffect(() => {
                fetchCategories();
        }, [fetchCategories]);

        const handleSubmit = async (event) => {
                event.preventDefault();
                try {
                        if (!newProduct.images.length) {
                                toast.error(t("admin.createProduct.messages.missingImages"));
                                return;
                        }

                        const orderedImages = [...newProduct.images];

                        if (orderedImages.length) {
                                const [coverImage] = orderedImages.splice(newProduct.coverImageIndex, 1);
                                orderedImages.unshift(coverImage);
                        }

                        const payload = {
                                name: newProduct.name.trim(),
                                description: newProduct.description.trim(),
                                price: Number(newProduct.price),
                                category: newProduct.category,
                                images: orderedImages,
                        };

                        if (!payload.name) {
                                toast.error(t("admin.createProduct.messages.nameRequired"));
                                return;
                        }

                        if (!payload.description) {
                                toast.error(t("admin.createProduct.messages.descriptionRequired"));
                                return;
                        }

                        if (!payload.category) {
                                toast.error(t("admin.createProduct.messages.categoryRequired"));
                                return;
                        }

                        if (Number.isNaN(payload.price)) {
                                toast.error(t("admin.createProduct.messages.invalidPrice"));
                                return;
                        }

                        await createProduct(payload);
                        setNewProduct({
                                name: "",
                                description: "",
                                price: "",
                                category: "",
                                images: [],
                                coverImageIndex: 0,
                        });
                        toast.success(t("admin.createProduct.messages.productCreated"));
                } catch {
                        console.log("error creating a product");
                }
        };

        const handleImagesChange = (event) => {
                const input = event.target;
                const files = Array.from(input.files || []);
                if (!files.length) return;

                Promise.all(
                        files.map(
                                (file) =>
                                        new Promise((resolve, reject) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => resolve(reader.result);
                                                reader.onerror = reject;
                                                reader.readAsDataURL(file);
                                        })
                        )
                )
                        .then((base64Images) => {
                                setNewProduct((prev) => {
                                        const remainingSlots = MAX_IMAGES - prev.images.length;

                                        if (remainingSlots <= 0) {
                                                toast.error(
                                                        t("admin.createProduct.messages.imagesLimit", { count: MAX_IMAGES })
                                                );
                                                return prev;
                                        }

                                        const acceptedImages = base64Images.slice(0, remainingSlots);

                                        if (base64Images.length > remainingSlots) {
                                                toast.error(
                                                        t("admin.createProduct.messages.imagesRemaining", {
                                                                count: remainingSlots,
                                                        })
                                                );
                                        }

                                        const updatedImages = [...prev.images, ...acceptedImages];
                                        const nextCoverIndex = prev.images.length === 0 ? 0 : prev.coverImageIndex;

                                        return {
                                                ...prev,
                                                images: updatedImages,
                                                coverImageIndex: Math.min(nextCoverIndex, updatedImages.length - 1),
                                        };
                                });
                        })
                        .catch(() => console.log("Failed to read images"))
                        .finally(() => {
                                input.value = "";
                        });
        };

        const handleRemoveImage = (indexToRemove) => {
                setNewProduct((prev) => {
                        const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
                        let nextCoverIndex = prev.coverImageIndex;

                        if (indexToRemove === prev.coverImageIndex) {
                                nextCoverIndex = 0;
                        } else if (indexToRemove < prev.coverImageIndex) {
                                nextCoverIndex = Math.max(prev.coverImageIndex - 1, 0);
                        }

                        return {
                                ...prev,
                                images: updatedImages,
                                coverImageIndex: updatedImages.length ? nextCoverIndex : 0,
                        };
                });
        };

        const handleSetCover = (index) => {
                setNewProduct((prev) => ({ ...prev, coverImageIndex: index }));
        };

        return (
                <motion.div
                        className='mx-auto mb-8 max-w-xl rounded-xl border border-payzone-indigo/40 bg-white/5 p-8 shadow-lg backdrop-blur-sm'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                >
                        <h2 className='mb-6 text-2xl font-semibold text-payzone-gold'>
                                {t("admin.createProduct.title")}
                        </h2>

                        <form onSubmit={handleSubmit} className='space-y-4'>
                                <div>
                                        <label htmlFor='name' className='block text-sm font-medium text-white/80'>
                                                {t("admin.createProduct.fields.name")}
                                        </label>
                                        <input
                                                type='text'
                                                id='name'
                                                name='name'
                                                value={newProduct.name}
                                                onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })}
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        />
                                </div>

                                <div>
                                        <label htmlFor='description' className='block text-sm font-medium text-white/80'>
                                                {t("admin.createProduct.fields.description")}
                                        </label>
                                        <textarea
                                                id='description'
                                                name='description'
                                                value={newProduct.description}
                                                onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })}
                                                rows='3'
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        />
                                </div>

                                <div>
                                        <label htmlFor='price' className='block text-sm font-medium text-white/80'>
                                                {t("admin.createProduct.fields.price")}
                                        </label>
                                        <input
                                                type='number'
                                                id='price'
                                                name='price'
                                                value={newProduct.price}
                                                onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })}
                                                step='0.01'
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        />
                                </div>

                                <div>
                                        <label htmlFor='category' className='block text-sm font-medium text-white/80'>
                                                {t("admin.createProduct.fields.category")}
                                        </label>
                                        <select
                                                id='category'
                                                name='category'
                                                value={newProduct.category}
                                                onChange={(event) => setNewProduct({ ...newProduct, category: event.target.value })}
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        >
                                                <option value=''>
                                                        {t("admin.createProduct.placeholders.category")}
                                                </option>
                                                {categories.map((category) => (
                                                        <option key={category._id} value={category.slug}>
                                                                {category.name}
                                                        </option>
                                                ))}
                                        </select>
                                </div>

                                <div className='mt-1 flex items-center'>
                                        <input
                                                type='file'
                                                id='images'
                                                className='sr-only'
                                                accept='image/*'
                                                multiple
                                                onChange={handleImagesChange}
                                                disabled={newProduct.images.length >= MAX_IMAGES}
                                        />
                                        <label
                                                htmlFor='images'
                                                className={`inline-flex items-center gap-2 rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-sm font-medium text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-payzone-indigo ${
                                                        newProduct.images.length >= MAX_IMAGES
                                                                ? "cursor-not-allowed opacity-60"
                                                                : "cursor-pointer hover:border-payzone-gold hover:bg-payzone-navy/80"
                                                }`}
                                                aria-disabled={newProduct.images.length >= MAX_IMAGES}
                                        >
                                                <Upload className='h-5 w-5' />
                                                {t("admin.createProduct.buttons.uploadImages")}
                                        </label>
                                        <span className='mr-3 text-sm text-white/60'>
                                                {newProduct.images.length} / {MAX_IMAGES} {t("admin.createProduct.fields.images")}
                                        </span>
                                </div>

                                {newProduct.images.length > 0 && (
                                        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
                                                {newProduct.images.map((image, index) => {
                                                        const isCover = index === newProduct.coverImageIndex;
                                                        return (
                                                                <div
                                                                        key={`${image}-${index}`}
                                                                        className={`relative overflow-hidden rounded-lg border ${
                                                                                isCover ? "border-payzone-gold" : "border-payzone-indigo/40"
                                                                        } bg-payzone-navy/60`}
                                                                >
                                                                        <img src={image} alt={`معاينة ${index + 1}`} className='h-32 w-full object-cover' />
                                                                        <div className='absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1 text-xs text-white'>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => handleSetCover(index)}
                                                                                        className={`inline-flex items-center gap-1 ${
                                                                                                isCover ? "text-payzone-gold" : "text-white"
                                                                                        }`}
                                                                                >
                                                                                        <Star className='h-3 w-3' />
                                                                                        {isCover
                                                                                                ? t("admin.createProduct.fields.cover")
                                                                                                : t("admin.createProduct.fields.setAsCover")}
                                                                                </button>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => handleRemoveImage(index)}
                                                                                        className='inline-flex items-center text-red-300 hover:text-red-200'
                                                                                        aria-label={t("common.actions.remove")}
                                                                                >
                                                                                        <X className='h-3 w-3' />
                                                                                        {t("common.actions.remove")}
                                                                                </button>
                                                                        </div>
                                                                </div>
                                                        );
                                                })}
                                        </div>
                                )}

                                <button
                                        type='submit'
                                        className='flex w-full items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy transition duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo/60 disabled:opacity-50'
                                        disabled={loading || newProduct.images.length === 0}
                                >
                                        {loading ? (
                                                <>
                                                        <Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
                                                        {t("admin.createProduct.buttons.loading")}
                                                </>
                                        ) : (
                                                <>
                                                        <PlusCircle className='h-5 w-5' />
                                                        {t("admin.createProduct.buttons.create")}
                                                </>
                                        )}
                                </button>
                        </form>
                </motion.div>
        );
};
export default CreateProductForm;
