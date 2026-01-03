const HeroSection = () => {
    return (
      <section className="relative bg-cover bg-center h-screen flex items-center justify-center text-white" 
        style={{ backgroundImage: "url('/assets/hero-banner.jpg')" }}>
        <div className="bg-black bg-opacity-50 p-10 rounded-lg text-center">
          <h1 className="text-5xl font-bold mb-4">Transformons vos idées en réalité visuelle</h1>
          <p className="text-lg mb-6">Spécialistes en production vidéo, effets spéciaux et montage</p>
          <a href="#projects" className="bg-red-500 px-6 py-3 rounded-md text-white font-semibold hover:bg-red-700 transition">
            Voir nos réalisations
          </a>
        </div>
      </section>
    );
  };
  
  export default HeroSection;
  