import { useEffect, useMemo, useState } from 'react';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { apiRequest } from '../../lib/apiClient';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'active', label: 'Actif' },
  { value: 'paused', label: 'En pause' },
  { value: 'archived', label: 'Archivé' },
];

const buildContact = (form) => {
  const contact = {
    name: form.contactName?.trim(),
    email: form.contactEmail?.trim(),
    phone: form.contactPhone?.trim(),
    role: form.contactRole?.trim(),
  };
  if (!contact.name && !contact.email && !contact.phone) return [];
  return [contact];
};

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ searchTerm: '', status: '', sort: 'desc', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [form, setForm] = useState({ name: '', status: 'prospect', notes: '', contactName: '', contactEmail: '' });
  const [editingId, setEditingId] = useState(null);

  const primaryContact = useMemo(
    () => selectedClient?.contacts?.find((contact) => contact.email || contact.phone) || selectedClient?.contacts?.[0],
    [selectedClient]
  );

  const fetchClients = async (page = filters.page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page,
        limit: filters.limit,
        sort: filters.sort,
      });
      if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
      if (filters.status) params.set('status', filters.status);
      const response = await apiRequest(`/api/clients?${params.toString()}`);
      const data = response.data || response;
      setClients(data.items || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0 });
    } catch (err) {
      setError(err.message || 'Impossible de charger les clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    try {
      const response = await apiRequest(`/api/clients/${clientId}`);
      setSelectedClient(response.data?.client || response.client || null);
      if (response.data?.projects) {
        setSelectedClient((prev) => ({
          ...(prev || {}),
          projects: response.data.projects,
        }));
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger le client');
    }
  };

  useEffect(() => {
    fetchClients();
  }, [filters.page, filters.status, filters.sort]);

  const resetForm = () => {
    setForm({ name: '', status: 'prospect', notes: '', contactName: '', contactEmail: '', contactPhone: '', contactRole: '' });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        status: form.status,
        notes: form.notes,
        contacts: buildContact(form),
      };
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/clients/${editingId}` : '/api/clients';
      await apiRequest(url, { method, body: payload });
      resetForm();
      fetchClients();
    } catch (err) {
      setError(err.message || 'Impossible de sauvegarder le client');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (client) => {
    setEditingId(client._id);
    setForm({
      name: client.name || '',
      status: client.status || 'prospect',
      notes: client.notes || '',
      contactName: client.contacts?.[0]?.name || '',
      contactEmail: client.contacts?.[0]?.email || '',
      contactPhone: client.contacts?.[0]?.phone || '',
      contactRole: client.contacts?.[0]?.role || '',
    });
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Supprimer ce client et ses projets ?')) return;
    setError('');
    try {
      await apiRequest(`/api/clients/${clientId}`, { method: 'DELETE' });
      if (selectedClient?._id === clientId) setSelectedClient(null);
      fetchClients();
    } catch (err) {
      setError(err.message || 'Suppression impossible');
    }
  };

  const statusBadge = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700',
      onboarding: 'bg-blue-100 text-blue-700',
      paused: 'bg-amber-100 text-amber-700',
      archived: 'bg-slate-100 text-slate-600',
      prospect: 'bg-indigo-100 text-indigo-700',
    };
    return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
  };

  const columns = [
    {
      header: 'Client',
      accessor: 'name',
      cell: (row) => (
        <div className='space-y-1'>
          <button
            type='button'
            onClick={() => {
              setSelectedClient(row);
              fetchClientDetails(row._id);
            }}
            className='font-semibold text-primary hover:underline'
          >
            {row.name}
          </button>
          <div className='flex flex-wrap items-center gap-2 text-xs text-slate-500'>
            {statusBadge(row.status)}
            <span>Dernière MAJ : {new Date(row.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      cell: (row) => {
        const contact = row.contacts?.[0];
        if (!contact) return <span className='text-slate-400'>–</span>;
        return (
          <div className='space-y-1'>
            <div className='font-medium text-slate-800'>{contact.name || contact.email}</div>
            <div className='text-xs text-slate-500'>{contact.email || contact.phone}</div>
          </div>
        );
      },
    },
    {
      header: 'Projets',
      accessor: 'projectCount',
      cell: (row) => <span className='font-semibold text-slate-900'>{row.projectCount || 0}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => handleEdit(row)}
            className='rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary'
          >
            Éditer
          </button>
          <button
            type='button'
            onClick={() => handleDelete(row._id)}
            className='rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:border-rose-400'
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title='Clients'
      description='Gestion des comptes clients, contacts et notes clés. Les statuts pilotent le pipeline agence.'
      actions={
        <div className='flex flex-wrap items-center gap-2'>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none'
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none'
          >
            <option value='desc'>Tri : récents</option>
            <option value='asc'>Tri : anciens</option>
          </select>
        </div>
      }
    >
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <div className='mb-4 flex flex-wrap items-center gap-3'>
            <input
              type='search'
              placeholder='Rechercher un client ou une note'
              value={filters.searchTerm}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && fetchClients(1)}
              className='w-full flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
            />
            <button
              type='button'
              onClick={() => fetchClients(1)}
              className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary'
            >
              Appliquer
            </button>
          </div>

          <ResourceTable columns={columns} data={clients} loading={loading} />

          <div className='mt-3 flex items-center justify-between text-sm text-slate-600'>
            <span>
              Page {pagination.page} / {pagination.pages} — {pagination.total} clients
            </span>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page <= 1}
                className='rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60'
              >
                Précédent
              </button>
              <button
                type='button'
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                disabled={pagination.page >= pagination.pages}
                className='rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60'
              >
                Suivant
              </button>
            </div>
          </div>
          {error && <p className='mt-2 text-sm text-rose-600'>{error}</p>}
        </div>

        <div className='space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Créer / éditer</h3>
            {editingId && (
              <button onClick={resetForm} className='text-xs font-semibold text-primary hover:underline'>
                Réinitialiser
              </button>
            )}
          </div>
          <form className='space-y-3' onSubmit={handleSubmit}>
            <div>
              <label className='text-sm font-medium text-slate-700'>Nom du client *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <label className='text-sm font-medium text-slate-700'>Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                >
                  {STATUS_OPTIONS.filter((option) => option.value !== '').map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='text-sm font-medium text-slate-700'>Contact principal</label>
                <input
                  value={form.contactName}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
                  placeholder='Prénom Nom'
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                />
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <input
                type='email'
                value={form.contactEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                placeholder='email@client.com'
                className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
              <input
                value={form.contactPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                placeholder='Téléphone'
                className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
            </div>
            <input
              value={form.contactRole}
              onChange={(e) => setForm((prev) => ({ ...prev, contactRole: e.target.value }))}
              placeholder='Rôle (CMO, Responsable comm...)'
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
            />
            <div>
              <label className='text-sm font-medium text-slate-700'>Notes internes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
            </div>
            <button
              type='submit'
              disabled={saving}
              className='w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer le client'}
            </button>
          </form>

          {selectedClient && (
            <div className='space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/50'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>Détails</h4>
                <span className='text-xs text-slate-500'>ID: {selectedClient._id}</span>
              </div>
              <div className='text-sm text-slate-600'>
                {primaryContact ? (
                  <div className='space-y-1'>
                    <p className='font-semibold text-slate-900'>{primaryContact.name || primaryContact.email}</p>
                    <p>{primaryContact.email}</p>
                    {primaryContact.phone && <p>{primaryContact.phone}</p>}
                  </div>
                ) : (
                  <p>Aucun contact renseigné.</p>
                )}
                {selectedClient.notes && <p className='mt-2 rounded-md bg-slate-100 p-2 text-xs'>{selectedClient.notes}</p>}
              </div>
              {selectedClient.projects?.length ? (
                <div className='space-y-2'>
                  <p className='text-xs font-semibold uppercase text-slate-500'>Projets liés</p>
                  <ul className='space-y-2'>
                    {selectedClient.projects.map((project) => (
                      <li key={project._id} className='rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm'>
                        <div className='flex items-center justify-between'>
                          <span className='font-semibold text-slate-900'>{project.title}</span>
                          <span className='text-xs text-slate-500'>{project.status}</span>
                        </div>
                        <p className='text-xs text-slate-500'>Campagnes : {project.campaignCount || 0}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className='text-xs text-slate-500'>Aucun projet rattaché pour l'instant.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
