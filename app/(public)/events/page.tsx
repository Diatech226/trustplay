import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'TrustEvent' };

export default async function EventsPage() {
  const events = await prisma.event.findMany({ orderBy: { eventDate: 'asc' } }).catch(() => []);

  return (
    <div className="section-card space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-secondary">TrustEvent</p>
          <h1 className="text-xl font-semibold">Programmation</h1>
        </div>
        <Link href="/events?filter=upcoming" className="text-sm text-secondary underline">
          Trier par date
        </Link>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <article key={event.id} className="rounded-soft border border-subtle p-4">
            <Link href={`/events/${event.slug}`} className="text-lg font-semibold text-primary">
              {event.title}
            </Link>
            <p className="text-sm text-slate-700">{new Date(event.eventDate).toLocaleDateString('fr-FR')}</p>
            <p className="text-sm text-slate-700">{event.location}</p>
            <span className="mt-1 inline-block rounded-full bg-mist px-3 py-1 text-xs text-secondary">
              {event.isPaid ? `Payant · ${event.price ?? 0}€` : 'Gratuit'}
            </span>
          </article>
        ))}
        {!events.length && <p className="text-sm text-slate-600">Aucun événement pour le moment.</p>}
      </div>
    </div>
  );
}
