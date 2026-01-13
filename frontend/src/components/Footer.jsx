import SocialLinks from "./SocialLinks";

const Footer = () => {
        const buildTime = new Date(import.meta.env.VITE_BUILD_TIME).toLocaleString();
        return (
                <footer className='mt-16 text-payzone-white'>
                        <div className='container mx-auto px-4'>
                                <div className='glass-bar rounded-t-3xl px-4 py-10 text-center'>
                                        <div className='flex flex-col items-center'>
                                                <SocialLinks />
                                                <div className='mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/70'>
                                                        <a className='hover:text-white' href='/privacy'>
                                                                سياسة الخصوصية
                                                        </a>
                                                        <a className='hover:text-white' href='/refund-policy'>
                                                                سياسة الاسترجاع
                                                        </a>
                                                </div>
                                                <small className='mt-6 text-xs text-white/60'>آخر تحديث للموقع: {buildTime}</small>
                                        </div>
                                </div>
                        </div>
                </footer>
        );
};

export default Footer;
