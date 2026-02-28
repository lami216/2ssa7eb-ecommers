import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../../stores/useProductStore";

const getProjectImage = (project) => project.image || project.images?.[0]?.url || "/logo.png";
const getProjectLink = (project) => project.projectUrl?.trim();

const ProjectCard = ({ project }) => (
        <article className='glass-card overflow-hidden'>
                <img src={getProjectImage(project)} alt={project.name} className='h-52 w-full object-cover' />
                <div className='p-4'>
                        <h3 className='text-xl font-semibold text-white'>{project.name}</h3>
                        <p className='mt-3 line-clamp-3 text-sm text-white/70'>{project.description}</p>
                        {getProjectLink(project) && (
                                <a
                                        href={getProjectLink(project)}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='mt-4 inline-flex items-center justify-center rounded-xl border border-payzone-gold/60 bg-[#080d1c] px-4 py-2 text-sm font-medium text-white/90 transition duration-300 hover:border-payzone-gold hover:text-payzone-gold hover:shadow-[0_0_18px_rgba(210,156,74,0.25)]'
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

        const hasFetchedRef = useRef(false);

        useEffect(() => {
                if (hasFetchedRef.current) {
                        return;
                }

                hasFetchedRef.current = true;
                fetchPublicProjects();
        }, [fetchPublicProjects]);

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
