export const navSections = [
  {
    label: 'Aperçu',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'HiViewGrid', roles: ['ADMIN'] },
      { to: '/dashboard/analytics', label: 'Analytics', icon: 'HiChartSquareBar', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Content Studio',
    items: [
      { to: '/dashboard/posts', label: 'Articles', icon: 'HiDocumentText', roles: ['ADMIN'] },
      { to: '/dashboard/pages', label: 'Pages', icon: 'HiTemplate', roles: ['ADMIN'] },
      { to: '/dashboard/media', label: 'Médias', icon: 'HiOutlinePhotograph', roles: ['ADMIN'] },
      { to: '/dashboard/events', label: 'Événements', icon: 'HiCalendar', roles: ['ADMIN'] },
      { to: '/dashboard/comments', label: 'Commentaires', icon: 'HiAnnotation', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Agence',
    items: [
      { to: '/dashboard/clients', label: 'Clients', icon: 'HiUserGroup', roles: ['ADMIN'] },
      { to: '/dashboard/projects', label: 'Projets', icon: 'HiBriefcase', roles: ['ADMIN'] },
      { to: '/dashboard/campaigns', label: 'Campagnes', icon: 'HiSpeakerphone', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/dashboard/newsletter', label: 'Newsletter', icon: 'HiMail', roles: ['ADMIN'] },
      { to: '/dashboard/forms', label: 'Formulaires', icon: 'HiClipboardList', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/dashboard/users', label: 'Utilisateurs', icon: 'HiShieldCheck', roles: ['ADMIN'] },
      { to: '/dashboard/settings', label: 'Paramètres', icon: 'HiOutlineCog', roles: ['ADMIN'] },
      { to: '/dashboard/activity', label: 'Logs & QA', icon: 'HiLightningBolt', roles: ['ADMIN'] },
      { to: '/dashboard/profile', label: 'Profil', icon: 'HiUserCircle', roles: ['ADMIN'] },
    ],
  },
];
