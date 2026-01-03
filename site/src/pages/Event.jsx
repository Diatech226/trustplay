import { useEffect, useState } from "react";
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Seo from '../components/Seo';
import { getEvents } from '../services/events.service';
import { logEventSignup } from '../lib/analytics';
import { resolveMediaUrl } from '../lib/mediaUrls';

export default function TrustEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupForm, setSignupForm] = useState({ name: '', email: '', eventId: '' });
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { events: fetchedEvents } = await getEvents({ order: 'desc', limit: 12 });
        const sortedEvents = [...fetchedEvents].sort(
          (a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0)
        );
        setEvents(sortedEvents);
      } catch (err) {
        setError("Erreur lors du chargement des événements.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    if (!signupForm.eventId || !signupForm.name || !signupForm.email) {
      setSignupError("Merci de renseigner l'événement, votre nom et votre email.");
      return;
    }

    try {
      setSignupLoading(true);
      // Backend does not expose a registration endpoint yet
      setSignupSuccess('Merci ! Votre intérêt a été enregistré. Nous reviendrons vers vous prochainement.');
      setSignupForm({ name: '', email: '', eventId: '' });
        const eventInfo = events.find((evt) => evt._id === signupForm.eventId);
        logEventSignup({
          eventId: signupForm.eventId,
          eventName: eventInfo?.title,
          page: '/events',
          metadata: { email: signupForm.email },
        });
    } catch (err) {
      setSignupError(err.message || "Impossible de soumettre votre participation.");
    } finally {
      setSignupLoading(false);
    }
  };

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
          {!loading && events.map((event) => {
            const priceValue = Number(event.price || 0);
            const isPaid = Boolean(event.isPaid || event.paid) || priceValue > 0;
            const eventDate = event.eventDate ? new Date(event.eventDate) : null;
            return (
            <div key={event._id} className="flex h-full flex-col rounded-2xl bg-white shadow-card ring-1 ring-subtle transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800">
              <img
                src={resolveMediaUrl(event.image)}
                alt={event.title}
                loading="lazy"
                decoding="async"
                width="640"
                height="256"
                className="h-48 w-full rounded-t-2xl object-cover"
              />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="text-xl font-semibold text-primary">{event.title}</h2>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <p>{eventDate ? eventDate.toLocaleDateString() : 'Date à confirmer'}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isPaid ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100'
                  }`}>
                    {isPaid ? `Payant${priceValue ? ` · ${priceValue}€` : ''}` : 'Gratuit'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-3 dark:text-slate-200">
                  {event.description || event.location || event.content?.replace(/<[^>]+>/g, '').slice(0, 120)}
                </p>
                {event.location && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {event.location}
                  </p>
                )}
                <a href={`/post/${event.slug}`} className="mt-auto text-sm font-semibold text-ocean hover:underline">Lire plus</a>
              </div>
            </div>
            );
          })}
          {!loading && events.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-subtle bg-subtle/30 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
              Aucun événement disponible pour le moment.
            </p>
          )}
        </div>

        <section className="rounded-2xl border border-dashed border-subtle bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-lg font-semibold text-primary">Participer à un événement</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Sélectionnez un événement puis laissez vos coordonnées pour être recontacté.</p>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSignup}>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Événement</label>
              <select
                className="mt-1 w-full rounded-lg border border-subtle bg-white p-2 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                value={signupForm.eventId}
                onChange={(e) => setSignupForm((prev) => ({ ...prev, eventId: e.target.value }))}
              >
                <option value=''>Choisir un événement</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title} · {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Date à confirmer'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nom et prénom</label>
              <input
                className="mt-1 w-full rounded-lg border border-subtle bg-white p-2 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                type="text"
                value={signupForm.name}
                onChange={(e) => setSignupForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <input
                className="mt-1 w-full rounded-lg border border-subtle bg-white p-2 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="vous@domaine.com"
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={signupLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signupLoading ? 'Enregistrement...' : 'Je participe'}
              </button>
              {signupError && <span className="text-sm text-red-600">{signupError}</span>}
              {signupSuccess && <span className="text-sm text-emerald-600">{signupSuccess}</span>}
            </div>
          </form>
        </section>
      </PageContainer>
    </main>
  );
}
