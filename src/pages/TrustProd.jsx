import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ProjectsGallery from "../components/ProjectsGallery";
import ServicesSection from "../components/ServicesSection";
import ContactSection from "../components/ContactSection";
import Seo from '../components/Seo';

const TrustProdPage = () => {
  return (
    <>
      <Seo
        title='TrustProd - Production Audiovisuelle'
        description='Découvrez les services TrustProd : production audiovisuelle, tournage, montage et accompagnement créatif.'
      />
      <HeroSection />
      <AboutSection />
      <ProjectsGallery />
      <ServicesSection />
      <ContactSection />

    </>
  );
};

export default TrustProdPage;
