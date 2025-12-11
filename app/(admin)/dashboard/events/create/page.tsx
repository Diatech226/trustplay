import EventForm from '../event-form';
import { requireAdmin } from '@/lib/roles';

export const metadata = { title: 'Créer un événement' };

export default async function CreateEventPage() {
  await requireAdmin();
  return (
    <div className="section-card space-y-3">
      <h1 className="text-xl font-semibold">Nouvel événement</h1>
      <EventForm />
    </div>
  );
}
