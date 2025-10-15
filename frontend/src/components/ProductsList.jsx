import { motion } from "framer-motion";
import { Trash, Star, Edit3 } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useProductStore } from "../stores/useProductStore";
import { formatMRU } from "../lib/formatMRU";

const ProductsList = () => {
        const { deleteProduct, toggleFeaturedProduct, products, setSelectedProduct } = useProductStore();
        const { t } = useTranslation();

        return (
                <motion.div
                        className='mx-auto max-w-4xl overflow-hidden rounded-xl border border-payzone-indigo/40 bg-white/5 shadow-lg backdrop-blur-sm'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                >
                        <table className='min-w-full divide-y divide-white/10'>
                                <thead className='bg-payzone-navy/80'>
                                        <tr>
                                                {[
                                                        t("admin.productsTable.headers.product"),
                                                        t("admin.productsTable.headers.price"),
                                                        t("admin.productsTable.headers.category"),
                                                        t("admin.productsTable.headers.featured"),
                                                        t("admin.productsTable.headers.actions"),
                                                ].map((heading) => (
                                                        <th
                                                                key={heading}
                                                                scope='col'
                                                                className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/70'
                                                        >
                                                                {heading}
                                                        </th>
                                                ))}
                                        </tr>
                                </thead>

                                <tbody className='divide-y divide-white/10 bg-white/5'>
                                        {products?.map((product) => (
                                                <tr key={product._id} className='transition-colors duration-200 hover:bg-payzone-navy/40'>
                                                        <td className='whitespace-nowrap px-6 py-4'>
                                                                <div className='flex items-center gap-3'>
                                                                        <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-payzone-indigo/40'>
                                                                                <img className='h-full w-full object-cover' src={product.image} alt={product.name} />
                                                                        </div>
                                                                        <div>
                                                                                <div className='text-sm font-medium text-white'>{product.name}</div>
                                                                        </div>
                                                                </div>
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-4'>
                                                                <div className='text-sm text-payzone-gold'>{formatMRU(product.price)}</div>
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-4'>
                                                                <div className='text-sm text-white/70'>{product.category}</div>
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-4'>
                                                                <button
                                                                        onClick={() => toggleFeaturedProduct(product._id)}
                                                                        className={`rounded-full p-1 transition-colors duration-200 ${
                                                                                product.isFeatured
                                                                                        ? "bg-payzone-gold text-payzone-navy"
                                                                                        : "bg-payzone-navy/60 text-white/70"
                                                                        } hover:ring-2 hover:ring-payzone-indigo/40`}
                                                                >
                                                                        <Star className='h-5 w-5' />
                                                                </button>
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-4 text-sm font-medium'>
                                                                <button
                                                                        onClick={() => setSelectedProduct(product)}
                                                                        className='mr-3 inline-flex items-center text-white/80 transition-colors duration-200 hover:text-payzone-gold'
                                                                >
                                                                        <Edit3 className='h-5 w-5' />
                                                                </button>
                                                                <button
                                                                        onClick={() => deleteProduct(product._id)}
                                                                        className='text-red-400 transition-colors duration-200 hover:text-red-300'
                                                                >
                                                                        <Trash className='h-5 w-5' />
                                                                </button>
                                                        </td>
                                                </tr>
                                        ))}
                                </tbody>
                        </table>
                </motion.div>
        );
};
export default ProductsList;
