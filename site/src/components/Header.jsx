import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { logoutAndClearPersistedData } from '../redux/store';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/apiClient';
import { useRubrics } from '../hooks/useRubrics';
import { resolveMediaUrl } from '../lib/mediaUrls';

export default function Header() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const { unread } = useSelector((state) => state.notifications);
  const [searchTerm, setSearchTerm] = useState('');
  const cmsUrl = import.meta.env?.VITE_CMS_URL || 'http://localhost:5174';
  const { rubrics: trustMediaRubrics } = useRubrics('TrustMedia');
  const profileImage = resolveMediaUrl(currentUser?.profilePicture);
  const isAdmin = currentUser?.role === 'ADMIN';
  const navItems = useMemo(() => {
    const baseNav = [
      { path: '/', label: 'Accueil' },
      { path: '/rubriques', label: 'Rubriques' },
      ...trustMediaRubrics.map((rubric) => ({
        path: rubric.path || `/${rubric.slug}`,
        label: rubric.label,
      })),
      { path: '/events', label: 'Trust Events' },
      { path: '/production', label: 'Trust Prod' },
      { path: '/favorites', label: 'Favoris' },
      { path: '/history', label: 'Historique' },
      { path: '/notifications-preferences', label: 'Notifications' },
      { path: '/about', label: 'À propos' },
    ];

    return baseNav;
  }, [trustMediaRubrics]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      await apiRequest('/api/auth/signout', { method: 'POST', auth: true });
    } catch (error) {
      console.log(error.message);
    } finally {
      dispatch(logoutAndClearPersistedData());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <Navbar
      fluid
      className='sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/90'
    >
      <div className='flex w-full items-center justify-between gap-4'>
        <Link
          to='/'
          className='flex items-center gap-3 whitespace-nowrap text-lg font-semibold text-slate-900 dark:text-white'
        >
          <span className='rounded-xl bg-gradient-to-r from-ocean via-primary to-secondary px-3 py-1 text-sm font-semibold uppercase tracking-wide text-white shadow-subtle'>
            Trustplay
          </span>
          <span className='hidden sm:inline text-sm font-medium text-slate-500 dark:text-slate-300'>
            Média & insights
          </span>
        </Link>
        <form onSubmit={handleSubmit} className='hidden lg:flex w-full max-w-xl'>
          <TextInput
            type='text'
            placeholder='Rechercher un article, une rubrique…'
            rightIcon={AiOutlineSearch}
            className='w-full'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <div className='flex items-center gap-2 md:order-2'>
          <Button
            className='h-10 w-10 lg:hidden border border-slate-200 dark:border-slate-700'
            color='gray'
            pill
            onClick={() => navigate('/search')}
            aria-label='Rechercher'
          >
            <AiOutlineSearch />
          </Button>
          <Button
            className='hidden h-10 w-10 sm:inline-flex border border-slate-200 dark:border-slate-700'
            color='gray'
            pill
            onClick={() => dispatch(toggleTheme())}
            aria-label='Basculer le thème'
          >
            {theme === 'light' ? <FaSun /> : <FaMoon />}
          </Button>
          {isAdmin && (
            <div className='hidden items-center gap-2 md:flex'>
              <Link to='/dashboard'>
                <Button color='light' className='border border-slate-200 dark:border-slate-700'>
                  Dashboard
                </Button>
              </Link>
              <Button
                as='a'
                href={cmsUrl}
                target='_blank'
                rel='noreferrer'
                color='gray'
                className='border border-slate-200 dark:border-slate-700'
              >
                Ouvrir le CMS
              </Button>
            </div>
          )}
          {currentUser ? (
            <Dropdown
              arrowIcon={false}
              inline
              label={<Avatar alt='user' img={profileImage} rounded />}
            >
              <Dropdown.Header>
                <span className='block text-sm'>@{currentUser.username}</span>
                <span className='block text-sm font-medium truncate'>
                  {currentUser.email}
                </span>
              </Dropdown.Header>
              {isAdmin && (
                <Link to={'/dashboard'}>
                  <Dropdown.Item>Dashboard</Dropdown.Item>
                </Link>
              )}
              {isAdmin && (
                <Dropdown.Item as='a' href={cmsUrl} target='_blank' rel='noreferrer'>
                  Accéder au CMS
                </Dropdown.Item>
              )}
              <Link to={'/dashboard/profile'}>
                <Dropdown.Item>Profile</Dropdown.Item>
              </Link>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleSignout}>Se déconnecter</Dropdown.Item>
            </Dropdown>
          ) : (
            <div className='flex items-center gap-2'>
              <Link to='/sign-in'>
                <Button gradientDuoTone='purpleToBlue' outline>
                  Se connecter
                </Button>
              </Link>
              <Link to='/sign-up'>
                <Button
                  color='gray'
                  outline
                  className='border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-100'
                >
                  Créer un compte
                </Button>
              </Link>
            </div>
          )}
          <Navbar.Toggle />
        </div>
      </div>
      <Navbar.Collapse>
        {navItems.map((item) => {
          const isActive = path === item.path;
          const linkClasses = `relative inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition ${
            isActive
              ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
          }`;
          return (
            <Navbar.Link key={item.path} active={isActive} as={'div'}>
              {item.external ? (
                <a
                  href={item.path}
                  className={linkClasses}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
              ) : (
                <Link to={item.path} className={linkClasses}>
                  {item.label}
                  {item.path === '/notifications-preferences' && unread > 0 && (
                    <span className='absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500'></span>
                  )}
                </Link>
              )}
            </Navbar.Link>
          );
        })}
      </Navbar.Collapse>
    </Navbar>
  );
}
