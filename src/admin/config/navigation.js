export const navSections = [
  {
    label: 'Aperçu',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'HiViewGrid', roles: ['ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'] },
    ],
  },
  {
    label: 'Content Studio',
    items: [
      { to: '/dashboard/posts', label: 'Articles', icon: 'HiDocumentText', roles: ['ADMIN', 'MANAGER', 'EDITOR'] },
      { to: '/dashboard/pages', label: 'Pages', icon: 'HiTemplate', roles: ['ADMIN', 'MANAGER', 'EDITOR'] },
      { to: '/dashboard/media', label: 'Médias', icon: 'HiOutlinePhotograph', roles: ['ADMIN', 'MANAGER', 'EDITOR'] },
      { to: '/dashboard/events', label: 'Événements', icon: 'HiCalendar', roles: ['ADMIN', 'MANAGER', 'EDITOR'] },
      { to: '/dashboard/comments', label: 'Commentaires', icon: 'HiAnnotation', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    label: 'Agence',
    items: [
      { to: '/dashboard/clients', label: 'Clients', icon: 'HiUserGroup', roles: ['ADMIN', 'MANAGER'] },
      { to: '/dashboard/projects', label: 'Projets', icon: 'HiBriefcase', roles: ['ADMIN', 'MANAGER', 'EDITOR'] },
      { to: '/dashboard/campaigns', label: 'Campagnes', icon: 'HiSpeakerphone', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/dashboard/newsletter', label: 'Newsletter', icon: 'HiMail', roles: ['ADMIN', 'MANAGER'] },
      { to: '/dashboard/forms', label: 'Formulaires', icon: 'HiClipboardList', roles: ['ADMIN', 'MANAGER', 'EDITOR'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/dashboard/users', label: 'Utilisateurs', icon: 'HiShieldCheck', roles: ['ADMIN'] },
      { to: '/dashboard/settings', label: 'Paramètres', icon: 'HiOutlineCog', roles: ['ADMIN', 'MANAGER'] },
      { to: '/dashboard/activity', label: 'Logs & QA', icon: 'HiLightningBolt', roles: ['ADMIN', 'MANAGER'] },
      { to: '/dashboard/profile', label: 'Profil', icon: 'HiUserCircle', roles: ['ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'] },
    ],
  },
];
