import { useEffect, useRef, useState } from 'react';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { apiRequest, uploadFile } from '../../lib/apiClient';

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planifiée' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'on_hold', label: 'En pause' },
  { value: 'archived', label: 'Archivée' },
];

const channelOptions = ['Paid ads', 'Email', 'Social', 'SEA', 'SEO', 'PR'];

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ searchTerm: '', projectId: '', status: '', channel: '', sort: 'desc', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [form, setForm] = useState({ title: '', projectId: '', channel: 'Paid ads', status: 'planned', budget: '', goal: '', start: '', end: '' });
  const [kpisText, setKpisText] = useState('');
  const [assets, setAssets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [assetTarget, setAssetTarget] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProjects = async () => {
    try {
      const response = await apiRequest('/api/projects?limit=100');
      const data = response.data || response;
      setProjects(data.items || []);
    } catch (err) {
      setError(err.message || 'Impossible de charger les projets');
    }
  };

  const fetchCampaigns = async (page = filters.page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: filters.limit, sort: filters.sort });
      if (filters.projectId) params.set('projectId', filters.projectId);
      if (filters.status) params.set('status', filters.status);
      if (filters.channel) params.set('channel', filters.channel);
      if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
      const response = await apiRequest(`/api/campaigns?${params.toString()}`);
      const data = response.data || response;
      setCampaigns(data.items || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0 });
    } catch (err) {
      setError(err.message || 'Impossible de charger les campagnes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async (id) => {
    try {
      const response = await apiRequest(`/api/campaigns/${id}`);
      setSelected(response.data?.campaign || response.campaign || null);
    } catch (err) {
      setError(err.message || 'Impossible de charger la campagne');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [filters.page, filters.projectId, filters.status, filters.channel, filters.sort]);

  const resetForm = () => {
    setForm({ title: '', projectId: '', channel: 'Paid ads', status: 'planned', budget: '', goal: '', start: '', end: '' });
    setKpisText('');
    setAssets([]);
    setEditingId(null);
  };

  const parseKpis = (text) =>
    text
      .split(/\n|,/)
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => ({ name: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.projectId) {
      setError('Merci de sélectionner un projet');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        projectId: form.projectId,
        channel: form.channel,
        status: form.status,
        budget: form.budget ? Number(form.budget) : undefined,
        goal: form.goal,
        assets,
        kpis: parseKpis(kpisText),
        schedule: {
          start: form.start || undefined,
          end: form.end || undefined,
        },
      };
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/campaigns/${editingId}` : '/api/campaigns';
      await apiRequest(url, { method, body: payload });
      resetForm();
      fetchCampaigns();
    } catch (err) {
      setError(err.message || 'Impossible de sauvegarder la campagne');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (campaign) => {
    setEditingId(campaign._id);
    setSelected(campaign);
    setForm({
      title: campaign.title || '',
      projectId: campaign.project?._id || campaign.projectId?._id || campaign.projectId || '',
      channel: campaign.channel || 'Paid ads',
      status: campaign.status || 'planned',
      budget: campaign.budget || '',
      goal: campaign.goal || '',
      start: campaign.schedule?.start ? campaign.schedule.start.substring(0, 10) : '',
      end: campaign.schedule?.end ? campaign.schedule.end.substring(0, 10) : '',
    });
    setKpisText((campaign.kpis || []).map((kpi) => kpi.name || `${kpi.target || ''}`.trim()).filter(Boolean).join('\n'));
    setAssets(campaign.assets || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette campagne ?')) return;
    setError('');
    try {
      await apiRequest(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (selected?._id === id) setSelected(null);
      fetchCampaigns();
    } catch (err) {
      setError(err.message || 'Suppression impossible');
    }
  };

  const triggerAssetUpload = (campaignId) => {
    setAssetTarget(campaignId);
    fileInputRef.current?.click();
  };

  const handleAssetChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !assetTarget) return;
    setAssetLoading(true);
    setError('');
    try {
      const upload = await uploadFile(file);
      const current = campaigns.find((item) => item._id === assetTarget);
      const nextAssets = [...(current?.assets || []), upload];
      await apiRequest(`/api/campaigns/${assetTarget}`, { method: 'PUT', body: { assets: nextAssets } });
      fetchCampaigns();
      if (selected?._id === assetTarget) {
        fetchCampaignDetails(assetTarget);
      }
    } catch (err) {
      setError(err.message || 'Impossible de lier le média');
    } finally {
      setAssetLoading(false);
      setAssetTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const quickStatusUpdate = async (id, status) => {
    try {
      await apiRequest(`/api/campaigns/${id}`, { method: 'PUT', body: { status } });
      fetchCampaigns();
    } catch (err) {
      setError(err.message || 'Impossible de mettre à jour le statut');
    }
  };

  const quickSchedule = async (id) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 30);
    try {
      await apiRequest(`/api/campaigns/${id}`, {
        method: 'PUT',
        body: { schedule: { start, end }, status: 'in_progress' },
      });
      fetchCampaigns();
    } catch (err) {
      setError(err.message || 'Impossible de planifier la campagne');
    }
  };

  const columns = [
    {
      header: 'Campagne',
      accessor: 'title',
      cell: (row) => (
        <div className='space-y-1'>
          <button
            type='button'
            className='font-semibold text-primary hover:underline'
            onClick={() => {
              setSelected(row);
              fetchCampaignDetails(row._id);
            }}
          >
            {row.title || row.goal || row.channel}
          </button>
          <p className='text-xs text-slate-500'>
            {row.project?.title || 'Sans projet'} · {row.client?.name || row.project?.clientId?.name || '–'}
          </p>
        </div>
      ),
    },
    {
      header: 'Budget',
      accessor: 'budget',
      cell: (row) => <span className='font-semibold text-slate-900'>{row.budget ? `${row.budget} €` : '—'}</span>,
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
      header: 'Actions rapides',
      accessor: 'actions',
      cell: (row) => (
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => quickSchedule(row._id)}
            className='rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary'
          >
            Planifier
          </button>
          <button
            type='button'
            onClick={() => triggerAssetUpload(row._id)}
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
      title='Campagnes'
      description='Social, ads, email : objectifs, budgets, KPIs et planning.'
      actions={
        <div className='flex flex-wrap items-center gap-2'>
          <select
            value={filters.projectId}
            onChange={(e) => setFilters((prev) => ({ ...prev, projectId: e.target.value, page: 1 }))}
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none'
          >
            <option value=''>Tous les projets</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
          <select
            value={filters.channel}
            onChange={(e) => setFilters((prev) => ({ ...prev, channel: e.target.value, page: 1 }))}
            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none'
          >
            <option value=''>Tous les canaux</option>
            {channelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
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
      <input ref={fileInputRef} type='file' className='hidden' onChange={handleAssetChange} />
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <div className='mb-4 flex flex-wrap items-center gap-3'>
            <input
              type='search'
              placeholder='Objectif ou canal'
              value={filters.searchTerm}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && fetchCampaigns(1)}
              className='w-full flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
            />
            <button
              type='button'
              onClick={() => fetchCampaigns(1)}
              className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary'
            >
              Appliquer
            </button>
          </div>

          <ResourceTable columns={columns} data={campaigns} loading={loading || assetLoading} />

          <div className='mt-3 flex items-center justify-between text-sm text-slate-600'>
            <span>
              Page {pagination.page} / {pagination.pages} — {pagination.total} campagnes
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
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Nouvelle campagne</h3>
            {editingId && (
              <button onClick={resetForm} className='text-xs font-semibold text-primary hover:underline'>
                Réinitialiser
              </button>
            )}
          </div>
          <form className='space-y-3' onSubmit={handleSubmit}>
            <div>
              <label className='text-sm font-medium text-slate-700'>Nom / intitulé</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <label className='text-sm font-medium text-slate-700'>Projet *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                >
                  <option value=''>Sélectionner</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='text-sm font-medium text-slate-700'>Canal</label>
                <select
                  value={form.channel}
                  onChange={(e) => setForm((prev) => ({ ...prev, channel: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                >
                  {channelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
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
              <div>
                <label className='text-sm font-medium text-slate-700'>Budget (€)</label>
                <input
                  type='number'
                  min='0'
                  value={form.budget}
                  onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                />
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-slate-700'>Objectif</label>
              <textarea
                rows={3}
                value={form.goal}
                onChange={(e) => setForm((prev) => ({ ...prev, goal: e.target.value }))}
                className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <label className='text-sm font-medium text-slate-700'>Début</label>
                <input
                  type='date'
                  value={form.start}
                  onChange={(e) => setForm((prev) => ({ ...prev, start: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-slate-700'>Fin</label>
                <input
                  type='date'
                  value={form.end}
                  onChange={(e) => setForm((prev) => ({ ...prev, end: e.target.value }))}
                  className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
                />
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-slate-700'>KPIs (liste ou séparés par des sauts de ligne)</label>
              <textarea
                rows={3}
                value={kpisText}
                onChange={(e) => setKpisText(e.target.value)}
                className='mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none'
              />
            </div>
            <div className='space-y-2 rounded-lg border border-dashed border-slate-300 bg-white p-3'>
              <div className='flex items-center justify-between text-sm font-semibold text-slate-700'>
                <span>Médias liés</span>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='text-primary hover:underline'
                >
                  Importer depuis la médiathèque
                </button>
              </div>
              {(assets || []).length ? (
                <ul className='space-y-2 text-xs text-slate-600'>
                  {assets.map((asset, index) => (
                    <li key={`${asset.url}-${index}`} className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1'>
                      <div>
                        <p className='font-semibold text-slate-900'>{asset.name || asset.url}</p>
                        <p className='text-[10px] uppercase text-slate-500'>{asset.mime || asset.type}</p>
                      </div>
                      <button
                        type='button'
                        onClick={() => setAssets((prev) => prev.filter((_, assetIndex) => assetIndex !== index))}
                        className='text-rose-600 hover:underline'
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-xs text-slate-500'>Aucun média pour l'instant. Ajoutez un upload ou un lien externe.</p>
              )}
            </div>
            <button
              type='submit'
              disabled={saving}
              className='w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer la campagne'}
            </button>
          </form>

          {selected && (
            <div className='space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/50'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>Détails</h4>
                <span className='text-xs text-slate-500'>ID: {selected._id}</span>
              </div>
              <p className='text-sm text-slate-700'>Projet : {selected.projectId?.title || projects.find((p) => p._id === selected.projectId)?.title || '—'}</p>
              {selected.goal && <p className='text-xs text-slate-600'>{selected.goal}</p>}
              {(selected.kpis || []).length ? (
                <div className='space-y-1 text-xs text-slate-600'>
                  <p className='font-semibold uppercase text-slate-500'>KPIs</p>
                  {selected.kpis.map((kpi, index) => (
                    <p key={index}>{kpi.name || `${kpi.target}`}</p>
                  ))}
                </div>
              ) : null}
              {(selected.assets || []).length ? (
                <div className='space-y-1'>
                  <p className='text-xs font-semibold uppercase text-slate-500'>Médias</p>
                  <ul className='space-y-2'>
                    {selected.assets.map((asset, index) => (
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
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
