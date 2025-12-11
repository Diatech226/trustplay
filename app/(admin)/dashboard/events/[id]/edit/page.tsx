import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';
import EventForm from '../../event-form';

export const metadata = { title: 'Éditer un événement' };

export default async function EditEventPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id: params.id } });

  if (!event) {
    return <p className="section-card text-slate-700">Événement introuvable.</p>;
  }

  return (
    <div className="section-card space-y-3">
      <h1 className="text-xl font-semibold">Éditer {event.title}</h1>
      <EventForm
        eventId={event.id}
        initialData={{
          title: event.title,
          description: event.description,
          eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
          location: event.location,
          isPaid: event.isPaid,
          price: event.price,
          imageUrl: event.imageUrl ?? '',
        }}
      />
    </div>
  );
}
