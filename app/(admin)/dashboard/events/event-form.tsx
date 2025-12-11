'use client';

import { useState, FormEvent } from 'react';
import slugify from 'slugify';

interface Props {
  eventId?: string;
  initialData?: Partial<{
    title: string;
    description: string;
    eventDate: string;
    location: string;
    isPaid: boolean;
    price: number | null;
    imageUrl: string;
  }>;
}

export default function EventForm({ eventId, initialData }: Props) {
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    eventDate: initialData?.eventDate ?? '',
    location: initialData?.location ?? '',
    isPaid: initialData?.isPaid ?? false,
    price: initialData?.price ?? 0,
    imageUrl: initialData?.imageUrl ?? '',
  });
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Enregistrement...');
    const payload = {
      ...form,
      slug: slugify(form.title, { lower: true, strict: true }),
      price: Number(form.price) || 0,
    };
    const method = eventId ? 'PUT' : 'POST';
    const endpoint = eventId ? `/api/events/${eventId}` : '/api/events';
    try {
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('API error');
      setMessage('Événement sauvegardé.');
    } catch (error) {
      setMessage("Impossible d'enregistrer l'événement.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Titre</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          type="datetime-local"
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={form.eventDate}
          onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
          required
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Lieu</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            required
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            checked={form.isPaid}
            onChange={(e) => setForm((f) => ({ ...f, isPaid: e.target.checked }))}
          />
          <span>Payant</span>
        </div>
      </div>
      {form.isPaid && (
        <div>
          <label className="block text-sm font-medium">Tarif (€)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={form.price ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={5}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <button type="submit" className="rounded-full bg-primary px-4 py-2 text-white">
        {eventId ? 'Mettre à jour' : 'Créer'}
      </button>
      {message && <p className="text-sm text-secondary">{message}</p>}
    </form>
  );
}
