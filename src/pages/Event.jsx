import { useEffect, useState } from "react";
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Seo from '../components/Seo';
import { fetchJson } from '../utils/apiClient';

export default function TrustEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchJson(`${API_URL}/api/post/getPosts?category=TrustEvent&limit=6`);
        setEvents(data.posts || []);
      } catch (err) {
        setError("Erreur lors du chargement des événements.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [API_URL]);

  return (
    <main className="bg-mist/60 py-10 dark:bg-slate-950">
      <Seo
        title="Trust Event | Agenda"
        description="Découvrez les prochains événements organisés par Trust Event : conférences, festivals et lancements."
      />
      <PageContainer className="space-y-8">
        <PageHeader
          kicker="Agenda"
          title="Trust Event"
          description="Votre agence spécialisée dans l'organisation d'événements professionnels, culturels et privés."
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800">{error}</p>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div key={`event-skel-${index}`} className="h-64 animate-pulse rounded-2xl bg-white shadow-subtle ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800" />
            ))}
          {!loading && events.map((event) => (
            <div key={event._id} className="flex h-full flex-col rounded-2xl bg-white shadow-card ring-1 ring-subtle transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800">
              <img
                src={event.image}
                alt={event.title}
                loading="lazy"
                decoding="async"
                width="640"
                height="256"
                className="h-48 w-full rounded-t-2xl object-cover"
              />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="text-xl font-semibold text-primary">{event.title}</h2>
                <p className="text-sm text-slate-500">{new Date(event.eventDate).toLocaleDateString()}</p>
                <p className="text-sm text-slate-700 line-clamp-3 dark:text-slate-200">{event.description || event.location}</p>
                <a href={`/post/${event.slug}`} className="mt-auto text-sm font-semibold text-ocean hover:underline">Lire plus</a>
              </div>
            </div>
          ))}
          {!loading && events.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-subtle bg-subtle/30 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
              Aucun événement disponible pour le moment.
            </p>
          )}
        </div>
      </PageContainer>
    </main>
  );
}
