import { useRef } from "react";
import { useProductStore } from "../stores/useProductStore";
import HeroSection from "../components/home/HeroSection";
import ProjectsSection from "../components/home/ProjectsSection";
import PromoBanner from "../components/home/PromoBanner";
import HowItWorksSection from "../components/home/HowItWorksSection";
import PricingSection from "../components/home/PricingSection";
import CompareSection from "../components/home/CompareSection";
import ContactSection from "../components/home/ContactSection";
import SupportSection from "../components/home/SupportSection";
import FAQSection from "../components/home/FAQSection";
import FinalCTASection from "../components/home/FinalCTASection";

const HomePage = () => {
        const pricingRef = useRef(null);
        const projectsCount = useProductStore((state) => state.products.length);

        const scrollToPricing = () => {
                pricingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        };

        return (
                <div className='bg-[#050712]'>
                        <div className='mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8'>
                                <HeroSection projectsCount={projectsCount} onScrollToPricing={scrollToPricing} />
                                <PromoBanner />
                                <ProjectsSection />
                                <HowItWorksSection />
                                <PricingSection pricingRef={pricingRef} />
                                <CompareSection />
                                <ContactSection />
                                <SupportSection />
                                <FAQSection />
                                <FinalCTASection onScrollToPricing={scrollToPricing} />
                        </div>
                </div>
        );
};

export default HomePage;
