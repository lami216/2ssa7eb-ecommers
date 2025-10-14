import { BarChart, PlusCircle, ShoppingBasket } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import { useProductStore } from "../stores/useProductStore";

const tabs = [
	{ id: "create", label: "Create Product", icon: PlusCircle },
	{ id: "products", label: "Products", icon: ShoppingBasket },
	{ id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const { fetchAllProducts } = useProductStore();

	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

        return (
                <div className='relative min-h-screen overflow-hidden'>
                        <div className='container relative z-10 mx-auto px-4 py-16'>
                                <motion.h1
                                        className='mb-8 text-center text-4xl font-bold text-payzone-gold'
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                >
                                        Admin Dashboard
                                </motion.h1>

                                <div className='flex justify-center mb-8'>
                                        {tabs.map((tab) => (
                                                <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={`mx-2 flex items-center rounded-md px-4 py-2 transition-colors duration-200 ${
                                                                activeTab === tab.id
                                                                        ? "bg-payzone-gold text-payzone-navy"
                                                                        : "bg-white/10 text-white/80 hover:bg-white/20"
                                                        }`}
                                                >
                                                        <tab.icon className='mr-2 h-5 w-5' />
                                                        {tab.label}
						</button>
					))}
				</div>
				{activeTab === "create" && <CreateProductForm />}
				{activeTab === "products" && <ProductsList />}
				{activeTab === "analytics" && <AnalyticsTab />}
			</div>
		</div>
	);
};
export default AdminPage;
