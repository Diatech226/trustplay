import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RegistrationForm from './registration-form';

// Event registration logic
async function getEvent(slug: string) {
  try {
    return await prisma.event.findUnique({ where: { slug } });
  } catch (error) {
    return null;
  }
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);
  if (!event) return notFound();

  return (
    <div className="section-card space-y-4">
      <header>
        <p className="text-xs uppercase text-secondary">TrustEvent</p>
        <h1 className="text-2xl font-bold text-primary">{event.title}</h1>
        <p className="text-sm text-slate-700">{event.location}</p>
        <p className="text-sm text-slate-700">
          {new Date(event.eventDate).toLocaleDateString('fr-FR')} · {event.isPaid ? `${event.price ?? 0}€` : 'Gratuit'}
        </p>
      </header>
      {event.imageUrl ? <img src={event.imageUrl} alt={event.title} className="w-full rounded-soft" /> : null}
      <p className="text-slate-800">{event.description}</p>
      <RegistrationForm eventId={event.id} />
    </div>
  );
}
