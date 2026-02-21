import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../../stores/useProductStore";

const getProjectImage = (project) => project.image || project.images?.[0]?.url || "/logo.png";

const ProjectCard = ({ project }) => (
        <article className='glass-card overflow-hidden'>
                <img src={getProjectImage(project)} alt={project.name} className='h-52 w-full object-cover' />
                <div className='p-4'>
                        <h3 className='text-xl font-semibold text-white'>{project.name}</h3>
                        <p className='mt-2 line-clamp-3 text-sm text-white/70'>{project.description}</p>
                        {project.link && (
                                <a
                                        href={project.link}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='btn-secondary mt-4 w-full text-sm'
                                >
                                        زيارة المتجر ↗
                                </a>
                        )}
                </div>
        </article>
);

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
                                        <motion.div
                                                key={project._id}
                                                initial={{ opacity: 0, y: 16 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                        >
                                                <ProjectCard project={project} />
                                        </motion.div>
                                ))}
                        </div>

                        <div className='flex gap-4 overflow-x-auto pb-3 md:hidden'>
                                {projects.map((project) => (
                                        <div key={`mobile-${project._id}`} className='min-w-[85%]'>
                                                <ProjectCard project={project} />
                                        </div>
                                ))}
                        </div>

                        {!loading && !projects.length && (
                                <p className='mt-4 text-center text-sm text-white/60'>سيتم عرض النماذج هنا قريبًا.</p>
                        )}
                </section>
        );
};

export default ProjectsSection;
