import SocialLinks from "./SocialLinks";

const Footer = () => {
        const buildTime = new Date(import.meta.env.VITE_BUILD_TIME).toLocaleString();
        return (
                <footer className='mt-16 text-payzone-white'>
                        <div className='container mx-auto px-4'>
                                <div className='rounded-t-3xl border border-white/10 bg-gradient-to-br from-[#070b1a] via-[#10162a] to-[#1b1032] px-4 py-10 text-center shadow-xl shadow-black/20'>
                                        <div className='flex flex-col items-center'>
                                                <p className='text-sm text-white/70'>
                                                        Payzone حلول متاجر إلكترونية جاهزة مع بوابات دفع ولوحة تحكم ودعم عبر واتساب.
                                                </p>
                                                <SocialLinks />
                                                <small className='mt-6 text-xs text-white/60'>آخر تحديث للموقع: {buildTime}</small>
                                        </div>
                                </div>
                        </div>
                </footer>
        );
};

export default Footer;
