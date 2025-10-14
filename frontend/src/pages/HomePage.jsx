import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
	{ href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
	{ href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
	{ href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
	{ href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
	{ href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
	{ href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
	{ href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
    { href: "/perfumes", name: "Perfumes", imageUrl: "/perfumes.png" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

        return (
                <div className='relative min-h-screen overflow-hidden text-payzone-white'>
                        <div className='relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
                                <h1 className='mb-4 text-center text-5xl font-bold sm:text-6xl'>
                                        <span className='block text-white'>Explore Our</span>
                                        <span className='bg-gradient-to-r from-payzone-gold via-payzone-gold/80 to-payzone-indigo bg-clip-text text-transparent'>
                                                Featured Categories
                                        </span>
                                </h1>
                                <p className='mb-12 text-center text-lg text-white/70'>
                                        Discover the latest trends in digital services with a seamless Payzone experience
                                </p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;
