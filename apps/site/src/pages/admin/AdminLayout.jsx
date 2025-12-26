import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AdminSidebar from '../../admin/components/AdminSidebar';
import AdminHeader from '../../admin/components/AdminHeader';
import Breadcrumbs from '../../admin/components/Breadcrumbs';
import { logoutAndClearPersistedData } from '../../redux/store';
import { apiRequest } from '../../lib/apiClient';
import { navSections } from '../../admin/config/navigation';

export default function AdminLayout() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const isAdminArea = location.pathname.startsWith('/dashboard');
    const isAllowed = navSections.some((section) =>
      section.items.some((item) =>
        location.pathname.startsWith(item.to) && item.roles.includes(currentUser.role)
      )
    );
    if (isAdminArea && !isAllowed && location.pathname !== '/dashboard/profile') {
      navigate('/dashboard/profile', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignout = async () => {
    try {
      await apiRequest('/api/auth/signout', { method: 'POST', auth: true });
    } catch (error) {
      // ignore
    } finally {
      dispatch(logoutAndClearPersistedData());
      navigate('/sign-in');
    }
  };

  const quickLinks = useMemo(
    () => [
      { label: 'Nouvel article', to: '/dashboard/posts/create' },
      { label: 'Uploader un média', to: '/dashboard/media' },
      { label: 'Créer une page', to: '/dashboard/pages' },
    ],
    []
  );

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white'>
      <div className='flex min-h-screen'>
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          role={currentUser?.role}
        />

        <main className='flex-1 overflow-y-auto'>
          <AdminHeader user={currentUser} onThemeToggle={() => setDarkMode((v) => !v)} darkMode={darkMode} />

          <div className='p-6'>
            <div className='mb-4 flex flex-wrap items-center gap-2'>
              <Breadcrumbs />
              <div className='ml-auto flex items-center gap-2'>
                {quickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800'
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleSignout}
                  className='rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30'
                >
                  Déconnexion
                </button>
              </div>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
