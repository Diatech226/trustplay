import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ProjectsGallery from "../components/ProjectsGallery";
import ServicesSection from "../components/ServicesSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet-async";

const TrustProdPage = () => {
  return (
    <>
      <Helmet>
        <title>TrustProd - Production Audiovisuelle</title>
      </Helmet>
      <HeroSection />
      <AboutSection />
      <ProjectsGallery />
      <ServicesSection />
      <ContactSection />

    </>
  );
};

export default TrustProdPage;
