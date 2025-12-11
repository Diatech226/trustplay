import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HiCollection, HiDocumentText, HiOutlineCog, HiOutlinePhotograph, HiOutlineUserGroup, HiSparkles, HiUserCircle } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../../redux/user/userSlice';
import { apiRequest } from '../../utils/apiClient';

// CMS: admin layout
export default function AdminLayout() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) return;
    if (!currentUser.isAdmin && location.pathname.startsWith('/dashboard') && location.pathname !== '/dashboard/profile') {
      navigate('/dashboard/profile', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  const handleSignout = async () => {
    try {
      await apiRequest('/api/auth/signout', { method: 'POST', auth: true });
    } catch (error) {
      console.log(error.message);
    } finally {
      dispatch(signoutSuccess());
      navigate('/sign-in');
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Tableau de bord', icon: HiSparkles, adminOnly: true },
    { to: '/dashboard/posts', label: 'Articles', icon: HiDocumentText, adminOnly: true },
    { to: '/dashboard/media', label: 'Médias', icon: HiOutlinePhotograph, adminOnly: true },
    { to: '/dashboard/comments', label: 'Commentaires', icon: HiCollection, adminOnly: true },
    { to: '/dashboard/users', label: 'Utilisateurs', icon: HiOutlineUserGroup, adminOnly: true },
    { to: '/dashboard/settings', label: 'Paramètres', icon: HiOutlineCog, adminOnly: true },
    { to: '/dashboard/profile', label: 'Profil', icon: HiUserCircle, adminOnly: false },
  ];

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <div className='flex min-h-screen'>
        <aside className='w-64 shrink-0 border-r border-slate-200 bg-white/80 px-4 py-6 dark:border-slate-800 dark:bg-slate-900/80'>
          <div className='mb-8'>
            <p className='text-xs uppercase tracking-[0.25em] text-slate-500'>Trust Media</p>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-white'>CMS Admin</h1>
          </div>
          <nav className='space-y-1'>
            {navItems
              .filter((item) => (item.adminOnly ? currentUser?.isAdmin : true))
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <item.icon className='h-5 w-5' />
                  {item.label}
                </NavLink>
              ))}
            <button
              onClick={handleSignout}
              className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30'
            >
              Déconnexion
            </button>
          </nav>
        </aside>

        <main className='flex-1 overflow-y-auto'>
          <header className='flex items-center justify-between border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70'>
            <div>
              <p className='text-xs uppercase tracking-[0.25em] text-slate-500'>Administration</p>
              <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>Espace de gestion éditoriale</h2>
            </div>
            <div className='flex items-center gap-3 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
              {currentUser?.profilePicture && (
                <img src={currentUser.profilePicture} alt={currentUser.username} className='h-8 w-8 rounded-full object-cover' />
              )}
              <div>
                <p className='font-semibold text-slate-900 dark:text-white'>{currentUser?.username}</p>
                <p className='text-xs uppercase tracking-[0.25em] text-slate-500'>{currentUser?.isAdmin ? 'Administrateur' : 'Membre'}</p>
              </div>
            </div>
          </header>

          <div className='p-6'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
