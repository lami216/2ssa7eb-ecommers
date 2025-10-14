import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";

const ProductCard = ({ product }) => {
        const { addToCart } = useCartStore();
        const coverImage =
                product.image ||
                (Array.isArray(product.images) && product.images.length > 0
                        ? typeof product.images[0] === "string"
                                ? product.images[0]
                                : product.images[0]?.url
                        : "");

        return (
                <div className='group relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-xl border border-payzone-indigo/30 bg-white/5 shadow-lg transition-all duration-300 hover:border-payzone-gold/60 hover:shadow-xl sm:aspect-square'>
                        <Link
                                to={`/products/${product._id}`}
                                className='relative mx-3 mt-3 flex flex-1 overflow-hidden rounded-xl min-h-[16rem] sm:min-h-0'
                                aria-label={`View details for ${product.name}`}
                        >
                                {coverImage ? (
                                        <img
                                                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                                                src={coverImage}
                                                alt={product.name}
                                        />
                                ) : (
                                        <div className='flex h-full w-full items-center justify-center bg-payzone-navy/70 text-sm text-white/60'>
                                                No image available
                                        </div>
                                )}
                                <div className='absolute inset-0 bg-gradient-to-t from-payzone-navy/60 via-payzone-navy/20 to-transparent' />
                        </Link>

                        <div className='mt-4 flex flex-1 flex-col px-5 pb-5'>
                                <Link to={`/products/${product._id}`} className='block transition-colors duration-300 hover:text-payzone-gold'>
                                        <h5 className='text-lg font-semibold tracking-tight text-white'>{product.name}</h5>
                                        {product.description && (
                                                <p className='mt-2 text-sm text-white/70'>
                                                        {product.description.length > 110
                                                                ? `${product.description.slice(0, 107)}...`
                                                                : product.description}
                                                </p>
                                        )}
                                </Link>
                                <p className='mt-3 text-lg font-semibold leading-tight text-payzone-gold'>{formatMRU(product.price)}</p>
                                <button
                                        className='mt-auto flex items-center justify-center gap-2 rounded-lg bg-payzone-gold px-5 py-2 text-sm font-medium text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-4 focus:ring-payzone-indigo/40'
                                        onClick={() => addToCart(product)}
                                >
                                        <ShoppingCart size={20} />
                                        Add to cart
                                </button>
                        </div>
                </div>
        );
};
export default ProductCard;
