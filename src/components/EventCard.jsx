import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img 
        src={event.image || "/default-event.jpg"} 
        alt={event.title} 
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{event.title}</h2>
        <p className="text-gray-600 text-sm">{event.date || "TBA"}</p>
        <p className="mt-2 text-gray-700">{event.description.substring(0, 100)}...</p>
        <Link to={`/post/${event.slug}`} className="mt-3 inline-block text-blue-500 hover:underline">Read More</Link>
      </div>
    </div>
  );
};

export default EventCard;
