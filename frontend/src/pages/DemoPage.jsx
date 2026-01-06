import { useEffect, useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { motion } from "framer-motion";
import { useProductStore } from "../stores/useProductStore";

const normalizeImages = (project) => {
        const images = [];
        if (project?.image) {
                images.push(project.image);
        }
        if (Array.isArray(project?.images)) {
                project.images.forEach((img) => {
                        if (typeof img === "string") {
                                images.push(img);
                        } else if (img?.url) {
                                images.push(img.url);
                        }
                });
        }
        return Array.from(new Set(images)).filter(Boolean);
};

const DemoPage = () => {
        const { products, fetchPublicProjects, loading } = useProductStore();
        const [activeProject, setActiveProject] = useState(null);
        const whatsappNumber = "22249823328";

        useEffect(() => {
                fetchPublicProjects();
        }, [fetchPublicProjects]);

        const projects = useMemo(() => products || [], [products]);

        const buildWhatsappLink = (storeName) => {
                const message = `اريد طلب قالب جاهز لمتجر ${storeName}\nارسل لي التفاصيل والاسعار`;
                return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        };

        return (
                <div className='relative min-h-screen overflow-hidden text-payzone-white'>
                        <div className='relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
                                <div className='glass-card mx-auto max-w-3xl text-center sm:px-12'>
                                        <span className='inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm text-payzone-gold'>
                                                أعمال Payzone | بايزوون
                                        </span>
                                        <h1 className='mt-6 text-4xl font-bold sm:text-5xl'>أعمالنا</h1>
                                        <p className='mt-4 text-lg text-white/70'>
                                                نماذج لمتاجر قمنا بتنفيذها مع تفاصيل مختصرة وروابط مباشرة لعرض التجربة
                                        </p>
                                </div>

                                {loading && (
                                        <div className='mt-12 text-center text-white/70'>جاري تحميل الأعمال...</div>
                                )}

                                {!loading && projects.length === 0 && (
                                        <div className='mt-12 text-center text-white/70'>لا توجد أعمال مضافة حالياً.</div>
                                )}

                                <div className='mt-12 flex flex-col gap-10'>
                                        {projects.map((project) => {
                                                const images = normalizeImages(project);
                                                const cover = images[0];
                                                return (
                                                        <motion.article
                                                                key={project._id}
                                                                whileHover={{ y: -6 }}
                                                                className='flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg md:flex-row md:items-center md:gap-8'
                                                        >
                                                                <div className='relative h-60 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-md md:h-72 md:w-1/2'>
                                                                        {cover ? (
                                                                                <img
                                                                                        src={cover}
                                                                                        alt={project.name}
                                                                                        className='h-full w-full object-cover'
                                                                                />
                                                                        ) : (
                                                                                <div className='flex h-full items-center justify-center bg-payzone-navy/70 text-white/60'>
                                                                                        لا توجد صورة
                                                                                </div>
                                                                        )}
                                                                </div>
                                                                <div className='glass-card flex flex-1 flex-col gap-4 p-6'>
                                                                        <div>
                                                                                <h3 className='text-2xl font-semibold text-white'>{project.name}</h3>
                                                                                <p className='mt-3 text-sm text-white/70'>
                                                                                        {project.description}
                                                                                </p>
                                                                        </div>
                                                                        {images.length > 1 && (
                                                                                <div className='mt-4 flex flex-wrap gap-2'>
                                                                                        {images.slice(0, 3).map((img) => (
                                                                                                <img
                                                                                                        key={img}
                                                                                                        src={img}
                                                                                                        alt={project.name}
                                                                                                        className='h-12 w-12 rounded-lg object-cover ring-1 ring-payzone-indigo/40'
                                                                                                />
                                                                                        ))}
                                                                                </div>
                                                                        )}
                                                                        <div className='mt-auto flex flex-wrap gap-3'>
                                                                                {project.projectUrl && (
                                                                                        <a
                                                                                                href={project.projectUrl}
                                                                                                target='_blank'
                                                                                                rel='noreferrer'
                                                                                                className='inline-flex items-center gap-2 rounded-lg bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy transition hover:bg-[#b8873d]'
                                                                                        >
                                                                                                فتح المتجر
                                                                                                <ExternalLink size={16} />
                                                                                        </a>
                                                                                )}
                                                                                <button
                                                                                        type='button'
                                                                                        onClick={() => setActiveProject(project)}
                                                                                        className='rounded-lg border border-payzone-indigo/50 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-payzone-gold hover:text-payzone-gold'
                                                                                >
                                                                                        عرض التفاصيل
                                                                                </button>
                                                                                <a
                                                                                        href={buildWhatsappLink(project.name)}
                                                                                        target='_blank'
                                                                                        rel='noreferrer'
                                                                                        className='rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-payzone-gold hover:text-payzone-gold'
                                                                                >
                                                                                        اطلب الآن
                                                                                </a>
                                                                        </div>
                                                                </div>
                                                        </motion.article>
                                                );
                                        })}
                                </div>
                        </div>

                        {activeProject && (
                                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
                                        <div className='glass-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8'>
                                                <div className='flex items-center justify-between'>
                                                        <h2 className='text-2xl font-bold text-payzone-gold'>
                                                                {activeProject.name}
                                                        </h2>
                                                        <button
                                                                type='button'
                                                                onClick={() => setActiveProject(null)}
                                                                className='rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20'
                                                        >
                                                                <X size={18} />
                                                        </button>
                                                </div>
                                                {activeProject.richText ? (
                                                        <div
                                                                className='prose prose-invert mt-6 max-w-none text-white/80'
                                                                dangerouslySetInnerHTML={{ __html: activeProject.richText }}
                                                        />
                                                ) : (
                                                        <p className='mt-6 text-sm text-white/70'>
                                                                {activeProject.description}
                                                        </p>
                                                )}
                                        </div>
                                </div>
                        )}
                </div>
        );
};

export default DemoPage;
