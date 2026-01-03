const services = [
    { title: "Production Vidéo", icon: "🎥" },
    { title: "Montage & Post-Production", icon: "✂️" },
    { title: "Effets Spéciaux", icon: "💥" },
    { title: "Photographie", icon: "📸" },
  ];
  
  const ServicesSection = () => {
    return (
      <section className="py-20 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Nos Services</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md w-64 text-center">
              <div className="text-5xl">{service.icon}</div>
              <h3 className="text-xl font-semibold mt-4">{service.title}</h3>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  export default ServicesSection;
  