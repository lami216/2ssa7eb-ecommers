import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../../stores/useProductStore";

const ProjectsSection = () => {
        const products = useProductStore((state) => state.products);
        const loading = useProductStore((state) => state.loading);
        const fetchPublicProjects = useProductStore((state) => state.fetchPublicProjects);

        useEffect(() => {
                if (!products.length) {
                        fetchPublicProjects();
                }
        }, [fetchPublicProjects, products.length]);

        const projects = useMemo(() => products.slice(0, 6), [products]);

        return (
                <section className='mt-16'>
                        <div className='mb-8 text-center'>
                                <h2 className='text-3xl font-bold text-payzone-gold'>نماذج من متاجر أطلقناها</h2>
                        </div>

                        <div className='hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-3'>
                                {projects.map((project) => (
                                        <motion.article
                                                key={project._id}
                                                initial={{ opacity: 0, y: 16 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                className='glass-card overflow-hidden'
                                        >
                                                <img
                                                        src={project.image || project.images?.[0]?.url || ""}
                                                        alt={project.name}
                                                        className='h-52 w-full object-cover'
                                                />
                                                <div className='p-4'>
                                                        <h3 className='text-xl font-semibold text-white'>{project.name}</h3>
                                                        <p className='mt-2 line-clamp-3 text-sm text-white/70'>
                                                                {project.description}
                                                        </p>
                                                </div>
                                        </motion.article>
                                ))}
                        </div>

                        <div className='flex gap-4 overflow-x-auto pb-3 md:hidden'>
                                {projects.map((project) => (
                                        <article key={`mobile-${project._id}`} className='glass-card min-w-[85%] overflow-hidden'>
                                                <img
                                                        src={project.image || project.images?.[0]?.url || ""}
                                                        alt={project.name}
                                                        className='h-44 w-full object-cover'
                                                />
                                                <div className='p-4'>
                                                        <h3 className='text-lg font-semibold text-white'>{project.name}</h3>
                                                        <p className='mt-1 line-clamp-2 text-sm text-white/70'>{project.description}</p>
                                                </div>
                                        </article>
                                ))}
                        </div>

                        {!loading && !projects.length && (
                                <p className='mt-4 text-center text-sm text-white/60'>سيتم عرض النماذج هنا قريبًا.</p>
                        )}

                        <p className='mt-8 text-center text-lg font-semibold text-white'>
                                هل تريد أن يكون متجرك التالي هنا؟
                        </p>
                </section>
        );
};

export default ProjectsSection;
