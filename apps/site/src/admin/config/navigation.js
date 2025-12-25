export const navSections = [
  {
    label: 'Aperçu',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'HiViewGrid', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
      { to: '/dashboard/analytics', label: 'Analytics', icon: 'HiChartSquareBar', roles: ['ADMIN', 'EDITOR'] },
    ],
  },
  {
    label: 'Content Studio',
    items: [
      { to: '/dashboard/posts', label: 'Articles', icon: 'HiDocumentText', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
      { to: '/dashboard/pages', label: 'Pages', icon: 'HiTemplate', roles: ['ADMIN', 'EDITOR'] },
      { to: '/dashboard/media', label: 'Médias', icon: 'HiOutlinePhotograph', roles: ['ADMIN', 'EDITOR'] },
      { to: '/dashboard/events', label: 'Événements', icon: 'HiCalendar', roles: ['ADMIN', 'EDITOR'] },
      { to: '/dashboard/comments', label: 'Commentaires', icon: 'HiAnnotation', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Agence',
    items: [
      { to: '/dashboard/clients', label: 'Clients', icon: 'HiUserGroup', roles: ['ADMIN'] },
      { to: '/dashboard/projects', label: 'Projets', icon: 'HiBriefcase', roles: ['ADMIN', 'EDITOR'] },
      { to: '/dashboard/campaigns', label: 'Campagnes', icon: 'HiSpeakerphone', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/dashboard/newsletter', label: 'Newsletter', icon: 'HiMail', roles: ['ADMIN'] },
      { to: '/dashboard/forms', label: 'Formulaires', icon: 'HiClipboardList', roles: ['ADMIN', 'EDITOR'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/dashboard/users', label: 'Utilisateurs', icon: 'HiShieldCheck', roles: ['ADMIN'] },
      { to: '/dashboard/settings', label: 'Paramètres', icon: 'HiOutlineCog', roles: ['ADMIN'] },
      { to: '/dashboard/activity', label: 'Logs & QA', icon: 'HiLightningBolt', roles: ['ADMIN'] },
      { to: '/dashboard/profile', label: 'Profil', icon: 'HiUserCircle', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
    ],
  },
];
