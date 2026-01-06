import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader, X, Save, PlusCircle, Star } from "lucide-react";
import toast from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";
import { useProductStore } from "../stores/useProductStore";

const MAX_IMAGES = 3;

const createInitialFormState = () => ({
        name: "",
        description: "",
        projectUrl: "",
        richText: "",
        existingImages: [],
        newImages: [],
        coverSource: "existing",
        coverIndex: 0,
});

const readFileAsDataURL = (file) =>
        new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
        });

const validateProductFormFields = (state, totalImages, t) => {
        const trimmedName = state.name.trim();
        if (!trimmedName) {
                return { error: t("admin.createProduct.messages.nameRequired") };
        }

        const trimmedDescription = state.description.trim();
        if (!trimmedDescription) {
                return { error: t("admin.createProduct.messages.descriptionRequired") };
        }

        const trimmedProjectUrl = state.projectUrl.trim();
        if (!trimmedProjectUrl) {
                return { error: t("admin.createProduct.messages.projectUrlRequired") };
        }

        const trimmedRichText = state.richText.trim();
        if (!trimmedRichText) {
                return { error: t("admin.createProduct.messages.richTextRequired") };
        }

        if (totalImages === 0) {
                return { error: t("admin.createProduct.messages.missingImages") };
        }

        return {
                trimmedName,
                trimmedDescription,
                trimmedProjectUrl,
                trimmedRichText,
        };
};

const CreateProductForm = () => {
        const [formState, setFormState] = useState(() => createInitialFormState());
        const {
                createProduct,
                updateProduct,
                loading,
                selectedProduct,
                clearSelectedProduct,
        } = useProductStore();
        const { t } = useTranslation();

        useEffect(() => {
                if (!selectedProduct) {
                        setFormState(createInitialFormState());
                        return;
                }

                const existingImages = Array.isArray(selectedProduct.images)
                        ? selectedProduct.images
                                  .map((image) => ({
                                          url: typeof image === "object" ? image.url : image,
                                          public_id: typeof image === "object" ? image.public_id : null,
                                  }))
                                  .filter((image) => typeof image.url === "string" && image.url.length > 0)
                        : [];

                setFormState({
                        name: selectedProduct.name ?? "",
                        description: selectedProduct.description ?? "",
                        projectUrl: selectedProduct.projectUrl ?? "",
                        richText: selectedProduct.richText ?? "",
                        existingImages,
                        newImages: [],
                        coverSource: existingImages.length ? "existing" : "new",
                        coverIndex: 0,
                });
        }, [selectedProduct]);

        const totalImages = formState.existingImages.length + formState.newImages.length;

        const isEditing = Boolean(selectedProduct);

        const handleImagesChange = async (event) => {
                const files = Array.from(event.target.files || []);
                if (!files.length) return;

                try {
                        const base64Images = await Promise.all(files.map(readFileAsDataURL));
                        setFormState((previous) => {
                                const remainingSlots =
                                        MAX_IMAGES - (previous.existingImages.length + previous.newImages.length);

                                if (remainingSlots <= 0) {
                                        toast.error(
                                                t("admin.createProduct.messages.imagesLimit", { count: MAX_IMAGES })
                                        );
                                        return previous;
                                }

                                const acceptedImages = base64Images.slice(0, remainingSlots);

                                if (base64Images.length > remainingSlots) {
                                        toast.error(
                                                t("admin.createProduct.messages.imagesRemaining", { count: remainingSlots })
                                        );
                                }

                                if (!acceptedImages.length) {
                                        return previous;
                                }

                                const nextNewImages = [...previous.newImages, ...acceptedImages];
                                let coverSource = previous.coverSource;
                                let coverIndex = previous.coverIndex;

                                if (previous.existingImages.length + previous.newImages.length === 0) {
                                        coverSource = "new";
                                        coverIndex = 0;
                                }

                                return {
                                        ...previous,
                                        newImages: nextNewImages,
                                        coverSource,
                                        coverIndex,
                                };
                        });
                } catch {
                        toast.error(t("admin.createProduct.messages.imagesUploadError"));
                } finally {
                        event.target.value = "";
                }
        };

        const handleRemoveExistingImage = (indexToRemove) => {
                setFormState((previous) => {
                        const updatedExisting = previous.existingImages.filter((_, index) => index !== indexToRemove);

                        let coverSource = previous.coverSource;
                        let coverIndex = previous.coverIndex;

                        if (previous.coverSource === "existing") {
                                if (indexToRemove === previous.coverIndex) {
                                        if (updatedExisting.length) {
                                                coverIndex = 0;
                                        } else if (previous.newImages.length) {
                                                coverSource = "new";
                                                coverIndex = 0;
                                        } else {
                                                coverIndex = 0;
                                        }
                                } else if (indexToRemove < previous.coverIndex) {
                                        coverIndex = Math.max(previous.coverIndex - 1, 0);
                                }
                        }

                        return {
                                ...previous,
                                existingImages: updatedExisting,
                                coverSource,
                                coverIndex,
                        };
                });
        };

        const handleRemoveNewImage = (indexToRemove) => {
                setFormState((previous) => {
                        const updatedNew = previous.newImages.filter((_, index) => index !== indexToRemove);

                        let coverSource = previous.coverSource;
                        let coverIndex = previous.coverIndex;

                        if (previous.coverSource === "new") {
                                if (indexToRemove === previous.coverIndex) {
                                        if (updatedNew.length) {
                                                coverIndex = 0;
                                        } else if (previous.existingImages.length) {
                                                coverSource = "existing";
                                                coverIndex = 0;
                                        } else {
                                                coverIndex = 0;
                                        }
                                } else if (indexToRemove < previous.coverIndex) {
                                        coverIndex = Math.max(previous.coverIndex - 1, 0);
                                }
                        }

                        return {
                                ...previous,
                                newImages: updatedNew,
                                coverSource,
                                coverIndex,
                        };
                });
        };

        const handleSetCover = (type, index) => {
                setFormState((previous) => ({
                        ...previous,
                        coverSource: type,
                        coverIndex: index,
                }));
        };

        const resetForm = () => {
                setFormState(createInitialFormState());
                clearSelectedProduct();
        };

        const buildOrderedImages = () => {
                let existing = [...formState.existingImages];
                let fresh = [...formState.newImages];

                if (formState.coverSource === "existing" && existing.length) {
                        if (formState.coverIndex >= 0 && formState.coverIndex < existing.length) {
                                const [cover] = existing.splice(formState.coverIndex, 1);
                                existing = [cover, ...existing];
                        }
                } else if (formState.coverSource === "new" && fresh.length) {
                        if (formState.coverIndex >= 0 && formState.coverIndex < fresh.length) {
                                const [cover] = fresh.splice(formState.coverIndex, 1);
                                fresh = [cover, ...fresh];
                        }
                } else if (!existing.length && fresh.length) {
                        const [cover] = fresh.splice(0, 1);
                        fresh = [cover, ...fresh];
                } else if (!fresh.length && existing.length) {
                        const [cover] = existing.splice(0, 1);
                        existing = [cover, ...existing];
                }

                return { existing, fresh };
        };

        const handleSubmit = async (event) => {
                event.preventDefault();

                const fieldValidation = validateProductFormFields(formState, totalImages, t);
                if (fieldValidation.error) {
                        toast.error(fieldValidation.error);
                        return;
                }
                const { existing, fresh } = buildOrderedImages();

                try {
                        if (isEditing && selectedProduct) {
                                await updateProduct(selectedProduct._id, {
                                        name: fieldValidation.trimmedName,
                                        description: fieldValidation.trimmedDescription,
                                        projectUrl: fieldValidation.trimmedProjectUrl,
                                        richText: fieldValidation.trimmedRichText,
                                        price: 0,
                                        category: "مشاريع",
                                        existingImages: existing.map((image) => image.public_id).filter(Boolean),
                                        newImages: fresh,
                                        cover: {
                                                source: formState.coverSource,
                                                index: formState.coverIndex,
                                        },
                                });
                                resetForm();
                        } else {
                                await createProduct({
                                        name: fieldValidation.trimmedName,
                                        description: fieldValidation.trimmedDescription,
                                        projectUrl: fieldValidation.trimmedProjectUrl,
                                        richText: fieldValidation.trimmedRichText,
                                        price: 0,
                                        category: "مشاريع",
                                        images: fresh,
                                });
                                setFormState(createInitialFormState());
                        }
                } catch {
                        console.log("error saving product");
                }
        };

        const galleryItems = [
                ...formState.existingImages.map((image, index) => ({
                        type: "existing",
                        url: image.url,
                        index,
                        key: image.public_id || `${image.url}-${index}`,
                })),
                ...formState.newImages.map((image, index) => ({
                        type: "new",
                        url: image,
                        index,
                        key: `${image}-${index}`,
                })),
        ];

        const title = isEditing
                ? t("admin.createProduct.editTitle", { name: selectedProduct?.name ?? "" })
                : t("admin.createProduct.title");

        const submitLabel = isEditing
                ? t("admin.createProduct.buttons.update")
                : t("admin.createProduct.buttons.create");

        return (
                <motion.div
                        className='mx-auto mb-8 max-w-xl rounded-xl border border-payzone-indigo/40 bg-white/5 p-8 shadow-lg'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                >
                        <div className='mb-6 flex items-start justify-between gap-4'>
                                <h2 className='text-2xl font-semibold text-payzone-gold'>{title}</h2>
                                {isEditing && (
                                        <button
                                                type='button'
                                                onClick={resetForm}
                                                className='inline-flex items-center gap-2 rounded-md border border-payzone-indigo/40 px-3 py-1 text-sm text-white transition hover:border-payzone-gold'
                                        >
                                                <X className='h-4 w-4' />
                                                {t("common.actions.cancel")}
                                        </button>
                                )}
                        </div>

                        <form onSubmit={handleSubmit} className='space-y-4'>
                                <div>
                                        <label htmlFor='name' className='block text-sm font-medium text-white/80'>
                                                {t("admin.createProduct.fields.name")}
                                        </label>
                                        <input
                                                type='text'
                                                id='name'
                                                name='name'
                                                value={formState.name}
                                                onChange={(event) => setFormState({ ...formState, name: event.target.value })}
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
                                                value={formState.description}
                                                onChange={(event) =>
                                                        setFormState({ ...formState, description: event.target.value })
                                                }
                                                rows='3'
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        />
                                </div>

                                <div>
                                        <label htmlFor='projectUrl' className='block text-sm font-medium text-white/80'>
                                                {t("admin.createProduct.fields.projectUrl")}
                                        </label>
                                        <input
                                                type='url'
                                                id='projectUrl'
                                                name='projectUrl'
                                                value={formState.projectUrl}
                                                onChange={(event) =>
                                                        setFormState({ ...formState, projectUrl: event.target.value })
                                                }
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        />
                                </div>

                                <div>
                                        <label htmlFor='richText' className='block text-sm font-medium text-white/80'>
                                                {t("admin.createProduct.fields.richText")}
                                        </label>
                                        <textarea
                                                id='richText'
                                                name='richText'
                                                value={formState.richText}
                                                onChange={(event) =>
                                                        setFormState({ ...formState, richText: event.target.value })
                                                }
                                                rows='6'
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                placeholder={t("admin.createProduct.placeholders.richText")}
                                                required
                                        />
                                        <p className='mt-2 text-xs text-white/60'>
                                                {t("admin.createProduct.fields.richTextHint")}
                                        </p>
                                </div>

                                <div className='mt-1 flex items-center'>
                                        <input
                                                type='file'
                                                id='images'
                                                className='sr-only'
                                                accept='image/*'
                                                multiple
                                                onChange={handleImagesChange}
                                                disabled={totalImages >= MAX_IMAGES}
                                        />
                                        <label
                                                htmlFor='images'
                                                className={`inline-flex items-center gap-2 rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-sm font-medium text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-payzone-indigo ${
                                                        totalImages >= MAX_IMAGES
                                                                ? "cursor-not-allowed opacity-60"
                                                                : "cursor-pointer hover:border-payzone-gold hover:bg-payzone-navy/80"
                                                }`}
                                                aria-disabled={totalImages >= MAX_IMAGES}
                                        >
                                                <Upload className='h-5 w-5' />
                                                {t("admin.createProduct.buttons.uploadImages")}
                                        </label>
                                        <span className='mr-3 text-sm text-white/60'>
                                                {totalImages} / {MAX_IMAGES} {t("admin.createProduct.fields.images")}
                                        </span>
                                </div>

                                {galleryItems.length > 0 && (
                                        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
                                                {galleryItems.map((item) => {
                                                        const isCover =
                                                                formState.coverSource === item.type &&
                                                                formState.coverIndex === item.index;
                                                        const removeHandler =
                                                                item.type === "existing"
                                                                        ? () => handleRemoveExistingImage(item.index)
                                                                        : () => handleRemoveNewImage(item.index);

                                                        return (
                                                                <div
                                                                        key={item.key}
                                                                        className={`relative overflow-hidden rounded-lg border ${
                                                                                isCover
                                                                                        ? "border-payzone-gold"
                                                                                        : "border-payzone-indigo/40"
                                                                        } bg-payzone-navy/60`}
                                                                >
                                                                        <img
                                                                                src={item.url}
                                                                                alt={`معاينة ${item.index + 1}`}
                                                                                className='h-32 w-full object-cover'
                                                                        />
                                                                        <div className='absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1 text-xs text-white'>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => handleSetCover(item.type, item.index)}
                                                                                        className={`inline-flex items-center gap-1 ${
                                                                                                isCover
                                                                                                        ? "text-payzone-gold"
                                                                                                        : "text-white"
                                                                                        }`}
                                                                                >
                                                                                        <Star className='h-3 w-3' />
                                                                                        {isCover
                                                                                                ? t("admin.createProduct.fields.cover")
                                                                                                : t("admin.createProduct.fields.setAsCover")}
                                                                                </button>
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={removeHandler}
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
                                        disabled={loading || totalImages === 0}
                                >
                                        {loading ? (
                                                <>
                                                        <Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
                                                        {t("admin.createProduct.buttons.loading")}
                                                </>
                                        ) : (
                                                <>
                                                        {isEditing ? <Save className='h-5 w-5' /> : <PlusCircle className='h-5 w-5' />}
                                                        {submitLabel}
                                                </>
                                        )}
                                </button>
                        </form>
                </motion.div>
        );
};

export default CreateProductForm;
