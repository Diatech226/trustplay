import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export const metadata = { title: 'Événements' };

export default async function EventsAdminPage() {
  await requireAdmin();
  const events = await prisma.event.findMany({ orderBy: { eventDate: 'desc' }, take: 50 }).catch(() => []);

  return (
    <div className="section-card space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Événements</h1>
        <Link href="/dashboard/events/create" className="rounded-full bg-primary px-4 py-2 text-white">
          Nouvel événement
        </Link>
      </div>
      <div className="grid gap-3">
        {events.map((event) => (
          <article key={event.id} className="rounded-soft border border-subtle p-4">
            <p className="text-xs uppercase text-secondary">{event.location}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary">{event.title}</p>
                <p className="text-sm text-slate-600">{new Date(event.eventDate).toLocaleString('fr-FR')}</p>
              </div>
              <Link href={`/dashboard/events/${event.id}/edit`} className="text-secondary underline">
                Éditer
              </Link>
            </div>
          </article>
        ))}
        {!events.length && <p className="text-sm text-slate-600">Aucun événement.</p>}
      </div>
    </div>
  );
}
