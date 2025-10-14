import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";

const ProductCard = ({ product }) => {
        const { addToCart } = useCartStore();

        return (
                <div className='group relative flex aspect-square w-full flex-col overflow-hidden rounded-xl border border-payzone-indigo/30 bg-white/5 shadow-lg transition-all duration-300 hover:border-payzone-gold/60 hover:shadow-xl'>
                        <div className='relative mx-3 mt-3 flex flex-1 overflow-hidden rounded-xl'>
                                <img className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110' src={product.image} alt='product image' />
                                <div className='absolute inset-0 bg-gradient-to-t from-payzone-navy/60 via-payzone-navy/20 to-transparent' />
                        </div>

                        <div className='mt-4 flex flex-1 flex-col px-5 pb-5'>
                                <h5 className='text-lg font-semibold tracking-tight text-white'>{product.name}</h5>
                                <p className='mt-2 text-lg font-semibold leading-tight text-payzone-gold'>{formatMRU(product.price)}</p>
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
