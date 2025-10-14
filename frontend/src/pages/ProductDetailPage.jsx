import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatMRU } from "../lib/formatMRU";
import PeopleAlsoBought from "../components/PeopleAlsoBought";

const resolveCoverImage = (product) => {
        if (!product) return null;

        if (product.image) {
                return product.image;
        }

        if (Array.isArray(product.images) && product.images.length > 0) {
                const [firstImage] = product.images;
                return typeof firstImage === "string" ? firstImage : firstImage?.url || null;
        }

        return null;
};

const mapGalleryImages = (product) => {
        if (!product) return [];

        if (Array.isArray(product.images) && product.images.length > 0) {
                return product.images
                        .map((image) => (typeof image === "string" ? image : image?.url))
                        .filter(Boolean);
        }

        return product.image ? [product.image] : [];
};

const ProductDetailPage = () => {
        const { id } = useParams();
        const { selectedProduct, fetchProductById, productDetailsLoading, clearSelectedProduct } = useProductStore(
                (state) => ({
                        selectedProduct: state.selectedProduct,
                        fetchProductById: state.fetchProductById,
                        productDetailsLoading: state.productDetailsLoading,
                        clearSelectedProduct: state.clearSelectedProduct,
                })
        );
        const addToCart = useCartStore((state) => state.addToCart);
        const [activeImage, setActiveImage] = useState(null);

        useEffect(() => {
                let isMounted = true;

                fetchProductById(id)
                        .then((product) => {
                                if (isMounted) {
                                        setActiveImage(resolveCoverImage(product));
                                }
                        })

                return () => {
                        isMounted = false;
                        clearSelectedProduct();
                };
        }, [fetchProductById, id, clearSelectedProduct]);

        useEffect(() => {
                if (selectedProduct && !activeImage) {
                        setActiveImage(resolveCoverImage(selectedProduct));
                }
        }, [selectedProduct, activeImage]);

        if (productDetailsLoading && !selectedProduct) {
                return <LoadingSpinner />;
        }

        if (!selectedProduct) {
                return (
                        <div className='relative min-h-screen text-payzone-white'>
                                <div className='relative z-10 mx-auto max-w-4xl px-4 py-24 text-center'>
                                        <h1 className='text-3xl font-semibold text-payzone-gold'>Product not found</h1>
                                        <p className='mt-4 text-white/70'>The product you are looking for might have been removed or is temporarily unavailable.</p>
                                </div>
                        </div>
                );
        }

        const galleryImages = mapGalleryImages(selectedProduct);

        return (
                <div className='relative min-h-screen overflow-hidden text-payzone-white'>
                        <div className='relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8'>
                                <div className='grid gap-10 lg:grid-cols-2'>
                                        <div>
                                                <div className='flex h-96 items-center justify-center overflow-hidden rounded-2xl border border-payzone-indigo/40 bg-payzone-navy/60'>
                                                        {activeImage ? (
                                                                <img
                                                                        src={activeImage}
                                                                        alt={selectedProduct.name}
                                                                        className='h-full w-full object-contain'
                                                                />
                                                        ) : (
                                                                <div className='text-white/60'>No image available</div>
                                                        )}
                                                </div>
                                                {galleryImages.length > 1 && (
                                                        <div className='mt-4 flex gap-3 overflow-x-auto pb-2'>
                                                                {galleryImages.map((imageUrl, index) => {
                                                                        const isActive = imageUrl === activeImage;
                                                                        return (
                                                                                <button
                                                                                        key={`${imageUrl}-${index}`}
                                                                                        type='button'
                                                                                        onClick={() => setActiveImage(imageUrl)}
                                                                                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-colors duration-200 ${
                                                                                                isActive
                                                                                                        ? "border-payzone-gold"
                                                                                                        : "border-transparent"
                                                                                        }`}
                                                                                        aria-label={`View product image ${index + 1}`}
                                                                                >
                                                                                        <img src={imageUrl} alt='' className='h-full w-full object-cover' />
                                                                                </button>
                                                                        );
                                                                })}
                                                        </div>
                                                )}
                                        </div>

                                        <div className='flex flex-col gap-6 rounded-2xl border border-payzone-indigo/40 bg-white/5 p-8 backdrop-blur-sm'>
                                                <div>
                                                        <p className='uppercase tracking-wide text-payzone-gold/80'>{selectedProduct.category}</p>
                                                        <h1 className='mt-2 text-3xl font-bold text-payzone-gold'>{selectedProduct.name}</h1>
                                                </div>

                                                <p className='text-base leading-relaxed text-white/80'>{selectedProduct.description}</p>

                                                <div className='text-3xl font-semibold text-payzone-gold'>{formatMRU(selectedProduct.price)}</div>

                                                <button
                                                        onClick={() => addToCart(selectedProduct)}
                                                        className='mt-4 inline-flex items-center justify-center rounded-lg bg-payzone-gold px-6 py-3 text-lg font-semibold text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-4 focus:ring-payzone-indigo/40'
                                                >
                                                        Add to cart
                                                </button>
                                        </div>
                                </div>

                                <div className='mt-16'>
                                        <PeopleAlsoBought />
                                </div>
                        </div>
                </div>
        );
};

export default ProductDetailPage;
