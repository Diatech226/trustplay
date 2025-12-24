import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Overview', icon: '📊' },
  { to: '/posts', label: 'Posts', icon: '📰' },
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/media', label: 'Media Library', icon: '🗂️' },
  { to: '/comments', label: 'Comments', icon: '💬' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

const labelMap = {
  posts: 'Posts',
  events: 'Events',
  media: 'Media Library',
  comments: 'Comments',
  users: 'Users',
  settings: 'Settings',
  new: 'Nouveau',
  edit: 'Éditer',
};

const buildBreadcrumbs = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) return ['Overview'];
  return segments.map((segment) => labelMap[segment] || 'Éditeur');
};

export const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const breadcrumbs = buildBreadcrumbs(location.pathname);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>Trust Media · CMS v2</h1>
          <p className="helper" style={{ marginTop: 6 }}>
            Backoffice dédié aux équipes éditoriales.
          </p>
        </div>
        <nav className="nav-group">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <p className="breadcrumbs">{breadcrumbs.join(' / ')}</p>
            <h2 className="title">{breadcrumbs[breadcrumbs.length - 1]}</h2>
          </div>
          <div className="user">
            <span>{user?.username || user?.email || 'Utilisateur'}</span>
            <button type="button" onClick={() => logout()}>
              Se déconnecter
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
