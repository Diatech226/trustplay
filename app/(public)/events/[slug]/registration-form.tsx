'use client';

import { useState, FormEvent } from 'react';

interface Props {
  eventId: string;
}

export default function RegistrationForm({ eventId }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('Envoi en cours...');
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, eventId }),
      });
      if (!res.ok) throw new Error('Erreur API');
      setStatus('Inscription enregistrée.');
    } catch (error) {
      setStatus("Impossible d'enregistrer l'inscription.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-soft border border-subtle p-4">
      <div>
        <label className="block text-sm font-medium">Nom complet</label>
        <input
          required
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>
      <button type="submit" className="rounded-full bg-primary px-4 py-2 text-white">
        Participer
      </button>
      {status && <p className="text-sm text-secondary">{status}</p>}
    </form>
  );
}
