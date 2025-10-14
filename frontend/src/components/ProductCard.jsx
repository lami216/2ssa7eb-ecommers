import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";

const ProductCard = ({ product }) => {
        const { addToCart } = useCartStore();

        return (
                <div className='relative flex w-full flex-col overflow-hidden rounded-xl border border-payzone-indigo/30 bg-white/5 shadow-lg transition-all duration-300 hover:border-payzone-gold/60 hover:shadow-xl'>
                        <div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
                                <img className='h-full w-full object-cover transition-transform duration-500 hover:scale-110' src={product.image} alt='product image' />
                                <div className='absolute inset-0 bg-gradient-to-t from-payzone-navy/60 via-payzone-navy/20 to-transparent' />
                        </div>

                        <div className='mt-4 px-5 pb-5'>
                                <h5 className='text-xl font-semibold tracking-tight text-white'>{product.name}</h5>
                                <div className='mt-2 mb-5 flex items-center justify-between'>
                                        <p>
                                                <span className='text-3xl font-bold text-payzone-gold'>{formatMRU(product.price)}</span>
                                        </p>
                                </div>
                                <button
                                        className='flex items-center justify-center gap-2 rounded-lg bg-payzone-gold px-5 py-2.5 text-sm font-medium text-payzone-navy transition-colors duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-4 focus:ring-payzone-indigo/40'
                                        onClick={() => addToCart(product)}
                                >
                                        <ShoppingCart size={22} />
                                        Add to cart
                                </button>
                        </div>
                </div>
        );
};
export default ProductCard;
