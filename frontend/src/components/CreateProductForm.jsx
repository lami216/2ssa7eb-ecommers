import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const categories = ["jeans", "t-shirts", "shoes", "glasses", "perfumes", "jackets", "suits", "bags"];

const CreateProductForm = () => {
        const [newProduct, setNewProduct] = useState({
                name: "",
                description: "",
                price: "",
                category: "",
                image: "",
        });

        const { createProduct, loading } = useProductStore();

        const handleSubmit = async (e) => {
                e.preventDefault();
                try {
                        await createProduct(newProduct);
                        setNewProduct({ name: "", description: "", price: "", category: "", image: "" });
                } catch {
                        console.log("error creating a product");
                }
        };

        const handleImageChange = (e) => {
                const file = e.target.files[0];
                if (file) {
                        const reader = new FileReader();

                        reader.onloadend = () => {
                                setNewProduct({ ...newProduct, image: reader.result });
                        };

                        reader.readAsDataURL(file);
                }
        };

        return (
                <motion.div
                        className='mx-auto mb-8 max-w-xl rounded-xl border border-payzone-indigo/40 bg-white/5 p-8 shadow-lg backdrop-blur-sm'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                >
                        <h2 className='mb-6 text-2xl font-semibold text-payzone-gold'>Create New Product</h2>

                        <form onSubmit={handleSubmit} className='space-y-4'>
                                <div>
                                        <label htmlFor='name' className='block text-sm font-medium text-white/80'>
                                                Product Name
                                        </label>
                                        <input
                                                type='text'
                                                id='name'
                                                name='name'
                                                value={newProduct.name}
                                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        />
                                </div>

                                <div>
                                        <label htmlFor='description' className='block text-sm font-medium text-white/80'>
                                                Description
                                        </label>
                                        <textarea
                                                id='description'
                                                name='description'
                                                value={newProduct.description}
                                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                                rows='3'
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        />
                                </div>

                                <div>
                                        <label htmlFor='price' className='block text-sm font-medium text-white/80'>
                                                Price
                                        </label>
                                        <input
                                                type='number'
                                                id='price'
                                                name='price'
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                step='0.01'
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        />
                                </div>

                                <div>
                                        <label htmlFor='category' className='block text-sm font-medium text-white/80'>
                                                Category
                                        </label>
                                        <select
                                                id='category'
                                                name='category'
                                                value={newProduct.category}
                                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                                className='mt-1 block w-full rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-white focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                                required
                                        >
                                                <option value=''>Select a category</option>
                                                {categories.map((category) => (
                                                        <option key={category} value={category}>
                                                                {category}
                                                        </option>
                                                ))}
                                        </select>
                                </div>

                                <div className='mt-1 flex items-center'>
                                        <input type='file' id='image' className='sr-only' accept='image/*' onChange={handleImageChange} />
                                        <label
                                                htmlFor='image'
                                                className='inline-flex cursor-pointer items-center rounded-md border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 text-sm font-medium text-white transition duration-300 hover:border-payzone-gold hover:bg-payzone-navy/80 focus:outline-none focus:ring-2 focus:ring-payzone-indigo'
                                        >
                                                <Upload className='mr-2 h-5 w-5' />
                                                Upload Image
                                        </label>
                                        {newProduct.image && <span className='ml-3 text-sm text-white/60'>Image uploaded</span>}
                                </div>

                                <button
                                        type='submit'
                                        className='flex w-full items-center justify-center gap-2 rounded-md bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy transition duration-300 hover:bg-[#b8873d] focus:outline-none focus:ring-2 focus:ring-payzone-indigo/60 disabled:opacity-50'
                                        disabled={loading}
                                >
                                        {loading ? (
                                                <>
                                                        <Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
                                                        Loading...
                                                </>
                                        ) : (
                                                <>
                                                        <PlusCircle className='h-5 w-5' />
                                                        Create Product
                                                </>
                                        )}
                                </button>
                        </form>
                </motion.div>
        );
};
export default CreateProductForm;
