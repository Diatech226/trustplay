const projects = [
    { id: 1, title: "Clip Musical", image: "/assets/project1.jpg" },
    { id: 2, title: "Publicité TV", image: "/assets/project2.jpg" },
    { id: 3, title: "Documentaire", image: "/assets/project3.jpg" },
  ];
  
  const ProjectsGallery = () => {
    return (
      <section id="projects" className="py-20">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Nos Réalisations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {projects.map((project) => (
            <div key={project.id} className="relative group">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-60 object-cover rounded-lg shadow-lg"
                loading='lazy'
                decoding='async'
                width='640'
                height='240'
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <h3 className="text-white text-xl font-semibold">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  export default ProjectsGallery;
  