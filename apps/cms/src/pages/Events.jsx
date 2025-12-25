import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deletePost } from '../services/posts.service';
import { fetchEvents } from '../services/events.service';
import { formatDate } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import { useToast } from '../components/ToastProvider';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const location = useLocation();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchEvents({ limit: 100, order: 'desc' });
      setEvents(response.events);
    } catch (err) {
      setError(err.message);
      addToast(`Erreur lors du chargement : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents, location.state?.refresh]);

  const filteredEvents = useMemo(() => {
    if (!query) return events;
    const lower = query.toLowerCase();
    return events.filter((event) => event.title?.toLowerCase().includes(lower));
  }, [events, query]);

  const handleDelete = async (eventId) => {
    const accepted = await confirm({
      title: "Supprimer l'événement",
      message: 'Cette action est définitive. Voulez-vous supprimer cet événement ?',
      confirmText: 'Supprimer',
    });
    if (!accepted) return;

    try {
      await deletePost(eventId);
      setEvents((prev) => prev.filter((eventItem) => eventItem._id !== eventId));
      addToast('Événement supprimé.', { type: 'success' });
    } catch (error) {
      addToast(`Suppression impossible : ${error.message}`, { type: 'error' });
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Événements</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Rechercher un événement"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Link className="button" to="/events/new">
            Nouvel événement
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loader">Chargement des événements…</div>
      ) : error ? (
        <div className="notice">{error}</div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">Aucun événement trouvé.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Date</th>
              <th>Lieu</th>
              <th>Gratuit / Payant</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event._id}>
                <td>{event.title}</td>
                <td>{formatDate(event.eventDate || event.publishedAt)}</td>
                <td>{event.location || '—'}</td>
                <td>{event.pricingType || '—'}</td>
                <td>{event.pricingType === 'paid' ? `${event.price ?? 0} €` : '—'}</td>
                <td>
                  <span className="status-pill">{event.status}</span>
                </td>
                <td>{event.slug}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link className="button secondary" to={`/events/${event._id}/edit`}>
                      Éditer
                    </Link>
                    <button className="button danger" onClick={() => handleDelete(event._id)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
