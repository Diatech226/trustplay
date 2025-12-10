/*import React from "react";

const TrustEvent = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-bold text-primary mb-6">Trust Event</h1>
        
        <p className="text-lg text-gray-700 mb-4">
          Bienvenue chez Trust Event, votre agence spécialisée dans l'organisation d'événements professionnels, culturels et privés.
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Nos Services</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Organisation de conférences et séminaires</li>
            <li>Événements d'entreprise et team-building</li>
            <li>Festivals et concerts</li>
            <li>Lancements de produits</li>
            <li>Gestion de logistique et scénographie</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Galerie</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-300 rounded-lg"></div>
            <div className="h-32 bg-gray-300 rounded-lg"></div>
            <div className="h-32 bg-gray-300 rounded-lg"></div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Contactez-nous</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Votre nom" className="w-full p-2 border border-gray-300 rounded" />
            <input type="email" placeholder="Votre email" className="w-full p-2 border border-gray-300 rounded" />
            <textarea placeholder="Votre message" className="w-full p-2 border border-gray-300 rounded h-32"></textarea>
            <button className="bg-primary text-white py-2 px-4 rounded">Envoyer</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default TrustEvent;
*/
import { useEffect, useState } from "react";
import axios from "axios";

export default function TrustEvent() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/post/getPosts`, { params: { category: "TrustEvent", limit: 10 } });
        setEvents(res.data.posts);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <main className="p-5 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Evénement à venir</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {events.map((event) => (
          <div key={event._id} className="border p-4 rounded shadow-md">
            <img src={event.image} alt={event.title} className="w-full h-40 object-cover rounded" />
            <h2 className="text-xl font-semibold mt-2">{event.title}</h2>
            <p className="text-sm text-gray-500">{new Date(event.eventDate).toDateString()}</p>
            <p className="text-sm text-gray-700">{event.location}</p>
            <a href={`/post/${event.slug}`} className="text-blue-500 hover:underline">Lire plus</a>
          </div>
        ))}
      </div>
    </main>
  );
}
