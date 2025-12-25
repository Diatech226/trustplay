import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { fetchSettings, updateSettings } from '../services/settings.service';

const DEFAULT_SETTINGS = {
  siteName: 'Trust Media',
  siteDescription: '',
  logoUrl: '',
  primaryColor: '#2563eb',
  socialLinks: {
    facebook: '',
    twitter: '',
    youtube: '',
    instagram: '',
    linkedin: '',
  },
  navigationCategories: ['news', 'politique', 'science-tech', 'sport', 'cinema'],
  commentsEnabled: true,
  maintenanceMode: false,
  emailSettings: {
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
  },
};

const TABS = [
  { id: 'general', label: 'Général', description: 'Identité du média et présentation.' },
  { id: 'branding', label: 'Branding', description: 'Logo, couleur primaire et réseaux sociaux.' },
  { id: 'navigation', label: 'Navigation', description: 'Rubriques principales du site.' },
  { id: 'email', label: 'Email/SMTP', description: 'Paramètres d’expéditeur pour les emails.' },
  { id: 'security', label: 'Sécurité & rôles', description: 'Contrôles d’accès et maintenance.' },
];

const mergeSettings = (payload) => ({
  ...DEFAULT_SETTINGS,
  ...payload,
  socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...(payload?.socialLinks || {}) },
  emailSettings: { ...DEFAULT_SETTINGS.emailSettings, ...(payload?.emailSettings || {}) },
  navigationCategories:
    payload?.navigationCategories?.length > 0
      ? payload.navigationCategories
      : DEFAULT_SETTINGS.navigationCategories,
});

export const Settings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSettings();
      setSettings(mergeSettings(data));
    } catch (err) {
      const message = err?.message || 'Impossible de charger les paramètres.';
      setError(message);
      addToast(message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!isAdmin) {
      addToast("Vous devez être administrateur pour sauvegarder.", { type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...settings,
      };
      const updated = await updateSettings(payload);
      setSettings(mergeSettings(updated));
      addToast('Paramètres sauvegardés avec succès.', { type: 'success' });
    } catch (err) {
      addToast(err?.message || 'Erreur lors de la sauvegarde.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => (event) => {
    const value = event.target.checked;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field) => (event) => {
    const value = event.target.value;
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));
  };

  const handleEmailChange = (field) => (event) => {
    const value = event.target.value;
    setSettings((prev) => ({
      ...prev,
      emailSettings: { ...prev.emailSettings, [field]: value },
    }));
  };

  const handleCategoryAdd = () => {
    const trimmed = categoryInput.trim();
    if (!trimmed) return;
    setSettings((prev) => {
      const nextCategories = new Set(prev.navigationCategories);
      nextCategories.add(trimmed);
      return { ...prev, navigationCategories: Array.from(nextCategories) };
    });
    setCategoryInput('');
  };

  const handleCategoryRemove = (category) => {
    setSettings((prev) => ({
      ...prev,
      navigationCategories: prev.navigationCategories.filter((item) => item !== category),
    }));
  };

  const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label || 'Paramètres';

  return (
    <div className="settings-shell">
      <div className="settings-sidebar">
        <h3>Paramètres</h3>
        <p className="helper">
          Configurez les réglages globaux du média. {isAdmin ? '' : 'Lecture seule (admin requis).'}
        </p>
        <div className="settings-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`settings-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div>
                <strong>{tab.label}</strong>
                <span>{tab.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="settings-content">
        <div className="section-header">
          <div>
            <h2>{activeTabLabel}</h2>
            <p className="helper">Enregistrez chaque section pour appliquer les changements.</p>
          </div>
          <button
            type="button"
            className="button"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>

        {loading ? (
          <div className="section">
            <div className="loader">Chargement des paramètres...</div>
          </div>
        ) : error ? (
          <div className="section">
            <div className="notice">{error}</div>
          </div>
        ) : (
          <div className="settings-panel">
            {activeTab === 'general' && (
              <div className="form-grid">
                <label>
                  Nom du site
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={handleFieldChange('siteName')}
                  />
                </label>
                <label>
                  Description du site
                  <textarea
                    value={settings.siteDescription}
                    onChange={handleFieldChange('siteDescription')}
                  />
                </label>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="form-grid">
                <label>
                  Logo principal (URL)
                  <input
                    type="url"
                    value={settings.logoUrl}
                    onChange={handleFieldChange('logoUrl')}
                  />
                </label>
                <label>
                  Couleur primaire
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={handleFieldChange('primaryColor')}
                  />
                </label>
                <div className="settings-subsection">
                  <h4>Réseaux sociaux</h4>
                  <div className="form-grid two-cols">
                    <label>
                      Facebook
                      <input
                        type="url"
                        value={settings.socialLinks.facebook}
                        onChange={handleSocialChange('facebook')}
                      />
                    </label>
                    <label>
                      Twitter/X
                      <input
                        type="url"
                        value={settings.socialLinks.twitter}
                        onChange={handleSocialChange('twitter')}
                      />
                    </label>
                    <label>
                      YouTube
                      <input
                        type="url"
                        value={settings.socialLinks.youtube}
                        onChange={handleSocialChange('youtube')}
                      />
                    </label>
                    <label>
                      Instagram
                      <input
                        type="url"
                        value={settings.socialLinks.instagram}
                        onChange={handleSocialChange('instagram')}
                      />
                    </label>
                    <label>
                      LinkedIn
                      <input
                        type="url"
                        value={settings.socialLinks.linkedin}
                        onChange={handleSocialChange('linkedin')}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'navigation' && (
              <div className="form-grid">
                <label>
                  Ajouter une rubrique
                  <div className="settings-inline">
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(event) => setCategoryInput(event.target.value)}
                      placeholder="ex: culture"
                    />
                    <button type="button" className="button secondary" onClick={handleCategoryAdd}>
                      Ajouter
                    </button>
                  </div>
                </label>
                <div className="settings-tags">
                  {settings.navigationCategories.length === 0 ? (
                    <div className="empty-state">Aucune rubrique configurée.</div>
                  ) : (
                    settings.navigationCategories.map((category) => (
                      <span key={category} className="tag">
                        {category}
                        <button type="button" onClick={() => handleCategoryRemove(category)}>
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="form-grid">
                <div className="notice">
                  Les identifiants SMTP sont définis dans les variables d’environnement du serveur. Ici vous gérez les
                  valeurs visibles dans les emails de réinitialisation.
                </div>
                <label>
                  Nom d’expéditeur
                  <input
                    type="text"
                    value={settings.emailSettings.senderName}
                    onChange={handleEmailChange('senderName')}
                    placeholder="Trust Media"
                  />
                </label>
                <label>
                  Email d’expéditeur
                  <input
                    type="email"
                    value={settings.emailSettings.senderEmail}
                    onChange={handleEmailChange('senderEmail')}
                    placeholder="no-reply@trustmedia.com"
                  />
                </label>
                <label>
                  Email de réponse (Reply-To)
                  <input
                    type="email"
                    value={settings.emailSettings.replyToEmail}
                    onChange={handleEmailChange('replyToEmail')}
                    placeholder="support@trustmedia.com"
                  />
                </label>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="form-grid">
                <div className="notice">
                  Les permissions avancées (roles personnalisés) sont gérées côté backend via le champ role de chaque
                  utilisateur.
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.commentsEnabled}
                    onChange={handleToggle('commentsEnabled')}
                  />
                  <span>Activer les commentaires sur le site</span>
                </label>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={handleToggle('maintenanceMode')}
                  />
                  <span>Activer le mode maintenance</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
