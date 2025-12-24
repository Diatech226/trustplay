import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/apiClient';

export default function Header() {
  const path = useLocation().pathname;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const { unread } = useSelector((state) => state.notifications);
  const [searchTerm, setSearchTerm] = useState('');
  const cmsUrl = import.meta.env?.VITE_CMS_URL || 'http://localhost:5174';
  const navItems = useMemo(() => {
    const baseNav = [
      { path: '/', label: 'Accueil' },
      { path: '/news', label: 'News' },
      { path: '/politique', label: 'Politique' },
      { path: '/science', label: 'Science & Tech' },
      { path: '/sport', label: 'Sport' },
      { path: '/cinema', label: 'Cinéma' },
      { path: '/event', label: 'Trust Events' },
      { path: '/production', label: 'Trust Prod' },
      { path: '/favorites', label: 'Favoris' },
      { path: '/history', label: 'Historique' },
      { path: '/notifications-preferences', label: 'Notifications' },
      { path: '/about', label: 'À propos' },
    ];

    const canAccessDashboard = currentUser && ['ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'].includes(currentUser.role);
    if (canAccessDashboard) {
      baseNav.push({ path: '/dashboard', label: 'Dashboard' });
    }

    return baseNav;
  }, [currentUser]);

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
      dispatch(signoutSuccess());
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
      className='sticky top-0 z-50 border-b bg-white/90 backdrop-blur dark:bg-slate-900/90'
    >
      <Link
        to='/'
        className='self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white flex items-center gap-2'
      >
        <span className='px-3 py-1 bg-gradient-to-r from-ocean via-primary to-secondary rounded-xl text-white shadow-subtle'>
          Trust
        </span>
        <span className='hidden sm:inline text-slate-600 dark:text-slate-200 tracking-tight'>Média</span>
      </Link>
      <form onSubmit={handleSubmit} className='hidden lg:flex items-center w-full max-w-lg mx-8'>
        <TextInput
          type='text'
          placeholder='Rechercher un article, une rubrique…'
          rightIcon={AiOutlineSearch}
          className='w-full'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
      <div className='flex gap-2 md:order-2 items-center'>
        <Button
          className='w-11 h-10 lg:hidden border border-slate-200 dark:border-slate-700'
          color='gray'
          pill
          onClick={() => navigate('/search')}
        >
          <AiOutlineSearch />
        </Button>
        <Button
          className='w-12 h-10 hidden sm:inline'
          color='gray'
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt='user' img={currentUser.profilePicture} rounded />
            }
          >
            <Dropdown.Header>
              <span className='block text-sm'>@{currentUser.username}</span>
              <span className='block text-sm font-medium truncate'>
                {currentUser.email}
              </span>
            </Dropdown.Header>
            {currentUser.role === 'ADMIN' && (
              <Link to={'/dashboard'}>
                <Dropdown.Item>Dashboard</Dropdown.Item>
              </Link>
            )}
            {currentUser.role === 'ADMIN' && (
              <Dropdown.Item as="a" href={cmsUrl} target="_blank" rel="noreferrer">
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
          <Link to='/sign-in'>
            <Button gradientDuoTone='purpleToBlue' outline>
              Se connecter
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        {navItems.map((item) => {
          const isActive = path === item.path;
          return (
            <Navbar.Link key={item.path} active={isActive} as={'div'}>
              <Link
                to={item.path}
                className={`relative pb-1 transition-colors ${
                  isActive
                    ? 'text-primary dark:text-white'
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {item.label}
                {item.path === '/notifications-preferences' && unread > 0 && (
                  <span className='absolute -right-3 -top-1 h-2.5 w-2.5 rounded-full bg-red-500'></span>
                )}
                {isActive && (
                  <span className='absolute left-0 -bottom-1 h-0.5 w-full bg-accent'></span>
                )}
              </Link>
            </Navbar.Link>
          );
        })}
      </Navbar.Collapse>
    </Navbar>
  );
}
