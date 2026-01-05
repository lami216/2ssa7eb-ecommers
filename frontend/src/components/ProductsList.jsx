import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Trash, Edit3, ExternalLink } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useProductStore } from "../stores/useProductStore";

const ProductsList = ({ onEdit }) => {
        const { deleteProduct, products, setSelectedProduct } = useProductStore();
        const { t } = useTranslation();

        const handleEdit = (product) => {
                const confirmed = globalThis.window?.confirm(
                        t("admin.productsTable.confirmations.edit", { name: product.name })
                );

                if (!confirmed) return;

                setSelectedProduct(product);
                if (typeof onEdit === "function") {
                        onEdit();
                }
        };

        const handleDelete = (product) => {
                const confirmed = globalThis.window?.confirm(
                        t("admin.productsTable.confirmations.delete", { name: product.name })
                );

                if (!confirmed) return;

                deleteProduct(product._id);
        };

        return (
                <motion.div
                        className='mx-auto max-w-4xl rounded-xl border border-payzone-indigo/40 bg-white/5 shadow-lg backdrop-blur-sm'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                >
                        <div className='overflow-x-auto'>
                                <table className='min-w-full divide-y divide-white/10'>
                                <thead className='bg-payzone-navy/80'>
                                        <tr>
                                                {[
                                                        t("admin.productsTable.headers.project"),
                                                        t("admin.productsTable.headers.link"),
                                                        t("admin.productsTable.headers.images"),
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
                                                                {product.projectUrl ? (
                                                                        <a
                                                                                href={product.projectUrl}
                                                                                target='_blank'
                                                                                rel='noreferrer'
                                                                                className='inline-flex items-center gap-2 text-sm text-payzone-gold hover:text-white'
                                                                        >
                                                                                {t("admin.productsTable.actions.open")}
                                                                                <ExternalLink className='h-4 w-4' />
                                                                        </a>
                                                                ) : (
                                                                        <span className='text-sm text-white/60'>—</span>
                                                                )}
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-4'>
                                                                <span className='text-sm text-white/70'>
                                                                        {Array.isArray(product.images) ? product.images.length : 0}
                                                                </span>
                                                        </td>
                                                        <td className='whitespace-nowrap px-6 py-4 text-sm font-medium'>
                                                                <div className='flex items-center justify-end gap-4'>
                                                                        <button
                                                                                onClick={() => handleEdit(product)}
                                                                                className='inline-flex items-center text-white/80 transition-colors duration-200 hover:text-payzone-gold'
                                                                        >
                                                                                <Edit3 className='h-5 w-5' />
                                                                        </button>
                                                                        <button
                                                                                onClick={() => handleDelete(product)}
                                                                                className='text-red-400 transition-colors duration-200 hover:text-red-300'
                                                                        >
                                                                                <Trash className='h-5 w-5' />
                                                                        </button>
                                                                </div>
                                                        </td>
                                                </tr>
                                        ))}
                                </tbody>
                                </table>
                        </div>
                </motion.div>
        );
};
export default ProductsList;

ProductsList.propTypes = {
        onEdit: PropTypes.func,
};
