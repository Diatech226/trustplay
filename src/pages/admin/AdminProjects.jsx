import { useEffect, useRef, useState } from 'react';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { apiRequest, uploadFile } from '../../lib/apiClient';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'À planifier' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'delivered', label: 'Livré' },
  { value: 'on_hold', label: 'En pause' },
  { value: 'archived', label: 'Archivé' },
];

const briefTemplate = `Objectif :
Public cible :
Messages clés :
Livrables attendus :
Canaux prioritaires :`;

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filters, setFilters] = useState({ searchTerm: '', clientId: '', status: '', sort: 'desc', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [form, setForm] = useState({ title: '', clientId: '', status: 'planning', deadline: '', brief: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attachmentTarget, setAttachmentTarget] = useState(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchClients = async () => {
    try {
      const response = await apiRequest('/api/clients?limit=100');
      const data = response.data || response;
      setClients(data.items || []);
    } catch (err) {
      setError(err.message || 'Impossible de charger les clients');
    }
  };

  const fetchProjects = async (page = filters.page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: filters.limit, sort: filters.sort });
      if (filters.clientId) params.set('clientId', filters.clientId);
      if (filters.status) params.set('status', filters.status);
      if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
      const response = await apiRequest(`/api/projects?${params.toString()}`);
      const data = response.data || response;
      setProjects(data.items || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0 });
    } catch (err) {
      setError(err.message || 'Impossible de charger les projets');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await apiRequest(`/api/projects/${projectId}`);
      setSelectedProject(response.data?.project || response.project || null);
      if (response.data?.campaigns) {
        setSelectedProject((prev) => ({ ...(prev || {}), campaigns: response.data.campaigns }));
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger le projet');
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [filters.page, filters.clientId, filters.status, filters.sort]);

  const resetForm = () => {
    setForm({ title: '', clientId: '', status: 'planning', deadline: '', brief: '' });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.clientId) {
      setError('Merci de sélectionner un client');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        clientId: form.clientId,
        status: form.status,
        deadline: form.deadline || undefined,
        brief: form.brief,
      };
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/projects/${editingId}` : '/api/projects';
      await apiRequest(url, { method, body: payload });
      resetForm();
      fetchProjects();
    } catch (err) {
      setError(err.message || 'Impossible de sauvegarder le projet');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setSelectedProject(project);
    setForm({
      title: project.title || '',
      clientId: project.client?._id || project.clientId || '',
      status: project.status || 'planning',
      deadline: project.deadline ? project.deadline.substring(0, 10) : '',
      brief: project.brief || '',
    });
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Supprimer ce projet et ses campagnes ?')) return;
    setError('');
    try {
      await apiRequest(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (selectedProject?._id === projectId) setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      setError(err.message || 'Suppression impossible');
    }
  };

  const triggerAttachmentUpload = (projectId) => {
    setAttachmentTarget(projectId);
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !attachmentTarget) return;
    setAttachmentLoading(true);
    setError('');
    try {
      const upload = await uploadFile(file);
      const current = projects.find((project) => project._id === attachmentTarget);
      const nextAttachments = [...(current?.attachments || []), upload];
      await apiRequest(`/api/projects/${attachmentTarget}`, { method: 'PUT', body: { attachments: nextAttachments } });
      fetchProjects();
      if (selectedProject?._id === attachmentTarget) {
        fetchProjectDetails(attachmentTarget);
      }
    } catch (err) {
      setError(err.message || 'Impossible de lier le média');
    } finally {
      setAttachmentLoading(false);
      setAttachmentTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const quickStatusUpdate = async (projectId, status) => {
    try {
      await apiRequest(`/api/projects/${projectId}`, { method: 'PUT', body: { status } });
      fetchProjects();
    } catch (err) {
      setError(err.message || 'Impossible de mettre à jour le statut');
    }
  };

  const columns = [
    {
      header: 'Projet',
      accessor: 'title',
      cell: (row) => (
        <div className='space-y-1'>
          <button
            type='button'
            className='font-semibold text-primary hover:underline'
            onClick={() => {
              setSelectedProject(row);
              fetchProjectDetails(row._id);
            }}
          >
            {row.title}
          </button>
          <p className='text-xs text-slate-500'>
            Client : {row.client?.name || row.clientId?.name || '—'}
          </p>
        </div>
      ),
    },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (row) => (
        <select
          value={row.status}
          onChange={(e) => quickStatusUpdate(row._id, e.target.value)}
          className='rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold shadow-sm focus:border-primary focus:outline-none'
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Échéance',
      accessor: 'deadline',
      cell: (row) => (
        <span className='text-sm text-slate-700'>
          {row.deadline ? new Date(row.deadline).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: 'Actions rapides',
      accessor: 'actions',
      cell: (row) => (
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setForm((prev) => ({ ...prev, brief: briefTemplate, title: row.title, clientId: row.clientId?._id || row.client?._id || row.clientId }))}
            className='rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary'
          >
            Créer brief
          </button>
          <button
            type='button'
            onClick={() => triggerAttachmentUpload(row._id)}
            className='rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary'
          >
            Joindre média
          </button>
          <button
            type='button'
            onClick={() => handleEdit(row)}
            className='rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary'
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
      title='Projets'
      description='Briefs, statuts, échéances et livrables associés pour chaque client.'
      actions={
        <div className='flex flex-wrap items-center gap-2'>
          <select
            value={filters.clientId}
            onChange={(e) => setFilters((prev) => ({ ...prev, clientId: e.target.value, page: 1 }))}
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none'
          >
            <option value=''>Tous les clients</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none'
          >
            <option value=''>Tous les statuts</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <input ref={fileInputRef} type='file' className='hidden' onChange={handleAttachmentChange} />
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <div className='mb-4 flex flex-wrap items-center gap-3'>
            <input
              type='search'
              placeholder='Rechercher un projet ou un brief'
              value={filters.searchTerm}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && fetchProjects(1)}
              className='w-full flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
            />
            <button
              type='button'
              onClick={() => fetchProjects(1)}
              className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary'
            >
              Appliquer
            </button>
          </div>

          <ResourceTable columns={columns} data={projects} loading={loading || attachmentLoading} />

          <div className='mt-3 flex items-center justify-between text-sm text-slate-600'>
            <span>
              Page {pagination.page} / {pagination.pages} — {pagination.total} projets
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
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Nouveau projet</h3>
            {editingId && (
              <button onClick={resetForm} className='text-xs font-semibold text-primary hover:underline'>
                Réinitialiser
              </button>
            )}
          </div>
          <form className='space-y-3' onSubmit={handleSubmit}>
            <div>
              <label className='text-sm font-medium text-slate-700'>Titre *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <label className='text-sm font-medium text-slate-700'>Client *</label>
                <select
                  required
                  value={form.clientId}
                  onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                >
                  <option value=''>Sélectionner un client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='text-sm font-medium text-slate-700'>Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <label className='text-sm font-medium text-slate-700'>Échéance</label>
                <input
                  type='date'
                  value={form.deadline}
                  onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                />
              </div>
              <div className='flex items-end'>
                <button
                  type='button'
                  onClick={() => setForm((prev) => ({ ...prev, brief: briefTemplate }))}
                  className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary'
                >
                  Générer un brief
                </button>
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-slate-700'>Brief</label>
              <textarea
                rows={5}
                value={form.brief}
                onChange={(e) => setForm((prev) => ({ ...prev, brief: e.target.value }))}
                className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
            </div>
            <button
              type='submit'
              disabled={saving}
              className='w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer le projet'}
            </button>
          </form>

          {selectedProject && (
            <div className='space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/50'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>Détails</h4>
                <span className='text-xs text-slate-500'>ID: {selectedProject._id}</span>
              </div>
              <p className='text-sm text-slate-700'>
                Client : {selectedProject.clientId?.name || clients.find((c) => c._id === selectedProject.clientId)?.name || '—'}
              </p>
              {selectedProject.brief && <p className='text-xs text-slate-600 whitespace-pre-line'>{selectedProject.brief}</p>}
              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase text-slate-500'>Médias liés</p>
                {(selectedProject.attachments || []).length ? (
                  <ul className='space-y-2'>
                    {selectedProject.attachments.map((asset, index) => (
                      <li key={`${asset.url}-${index}`} className='rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs shadow-sm'>
                        <div className='flex items-center justify-between'>
                          <span className='font-semibold text-slate-900'>{asset.name || asset.url}</span>
                          <span className='text-[10px] uppercase text-slate-500'>{asset.mime || asset.type}</span>
                        </div>
                        <a href={asset.url} target='_blank' rel='noreferrer' className='text-primary hover:underline'>
                          Ouvrir
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-xs text-slate-500'>Aucun média attaché. Utilisez « Joindre média » pour relier la médiathèque.</p>
                )}
              </div>
              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase text-slate-500'>Campagnes</p>
                {selectedProject.campaigns?.length ? (
                  <ul className='space-y-2'>
                    {selectedProject.campaigns.map((campaign) => (
                      <li key={campaign._id} className='rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs shadow-sm'>
                        <div className='flex items-center justify-between'>
                          <span className='font-semibold text-slate-900'>{campaign.title || campaign.channel}</span>
                          <span className='text-[10px] uppercase text-slate-500'>{campaign.status}</span>
                        </div>
                        <p className='text-slate-600'>{campaign.goal}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-xs text-slate-500'>Aucune campagne associée.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
