import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">À Propos de Trust</h1>

      <p className="text-lg text-gray-700 text-center mb-8">
        **Trust** est un complexe regroupant **médias, événementiel et production audiovisuelle**, avec un studio situé à **Pissy**.  
        Nous produisons du contenu innovant et organisons des événements professionnels et culturels.
      </p>

      {/* Section: Trust - Un Complexe de Communication */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">🎬 Trust : Un Complexe de Communication</h2>
        <p className="text-gray-700">
          Trust est structuré autour de trois pôles :
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li><strong>📢 Trust Media :</strong> Un média digital qui produit des **articles, podcasts et émissions audiovisuelles** sur l’actualité, la culture et l’innovation.</li>
          <li><strong>🎉 Trust Event :</strong> Une agence spécialisée dans la **communication événementielle**, couvrant la conception, l’organisation et la gestion d’événements professionnels et culturels.</li>
          <li><strong>🎥 Trust Prod :</strong> Une société de **production audiovisuelle** qui réalise des films, documentaires, vidéos publicitaires et clips musicaux.</li>
        </ul>
      </div>

      {/* Section: Un Studio de Production Moderne */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">🏢 Un Studio de Production à Pissy</h2>
        <p className="text-gray-700">
          Situé à **Pissy**, notre studio est équipé de **matériel professionnel** pour répondre aux besoins de production vidéo et sonore.  
          Nous proposons :
        </p>
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>🎙 **Enregistrement et mixage audio**</li>
          <li>🎥 **Tournage de vidéos et émissions**</li>
          <li>💻 **Montage et post-production**</li>
        </ul>
      </div>

      {/* Section: Notre Vision */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">🚀 Notre Vision</h2>
        <p className="text-gray-700">
          Nous avons pour ambition de **révolutionner la communication et la production audiovisuelle**,  
          en mettant la créativité et l’expertise au service des entreprises, des artistes et des institutions.
        </p>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link to="/contact" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Contactez-nous
        </Link>
      </div>
    </div>
  );
};

export default About;
