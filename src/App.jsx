import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import { HelmetProvider } from "react-helmet-async";
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession, setUser, signoutSuccess } from './redux/user/userSlice';
import { apiRequest, getAuthToken } from './lib/apiClient';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const SignIn = lazy(() => import('./pages/SignIn'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const DashProfile = lazy(() => import('./components/DashProfile'));
const Projects = lazy(() => import('./pages/Projects'));
const SignUp = lazy(() => import('./pages/SignUp'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const UpdatePost = lazy(() => import('./pages/UpdatePost'));
const PostPage = lazy(() => import('./pages/PostPage'));
const Search = lazy(() => import('./pages/Search'));
const TrustEvent = lazy(() => import('./pages/Event'));
const TrustProd = lazy(() => import('./pages/TrustProd'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PoliticsPage = lazy(() => import('./pages/PoliticsPage'));
const SciencePage = lazy(() => import('./pages/SciencePage'));
const SportPage = lazy(() => import('./pages/SportPage'));
const CinemaPage = lazy(() => import('./pages/CinemaPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const Favorites = lazy(() => import('./pages/Favorites'));
const History = lazy(() => import('./pages/History'));
const NotificationsPreferences = lazy(() => import('./pages/NotificationsPreferences'));

export default function App() {
  const dispatch = useDispatch();
  const { currentUser, token } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = token || (await getAuthToken());
      const shouldRefresh = storedToken && (!currentUser || !currentUser.role);
      if (!shouldRefresh) return;
      try {
        const me = await apiRequest('/api/user/me', { auth: true });
        const profile = me.user || me.data?.user || me;
        if (profile) {
          dispatch(setUser({ user: profile, token: storedToken }));
        }
      } catch (error) {
        console.error('Unable to refresh session', error.message);
        dispatch(signoutSuccess());
      }
    };

    fetchProfile();
  }, [currentUser, dispatch, token]);

  return (
    <BrowserRouter>
      <HelmetProvider>
        <ScrollToTop />
        <Header />
        <Suspense fallback={<LoadingScreen label='Chargement de la page...' />}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/sign-in' element={<SignIn />} />
            <Route path='/sign-up' element={<SignUp />} />
            <Route path='/search' element={<Search />} />
            <Route path='/event' element={<TrustEvent />} />
            <Route path='/production' element={<TrustProd />} />
            <Route path='/favorites' element={<Favorites />} />
            <Route path='/history' element={<History />} />
            <Route path='/notifications-preferences' element={<NotificationsPreferences />} />
            <Route path='/news' element={<NewsPage />} />
            <Route path='/politique' element={<PoliticsPage />} />
            <Route path='/science' element={<SciencePage />} />
            <Route path='/sport' element={<SportPage />} />
            <Route path='/cinema' element={<CinemaPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/Terms" element={<TermsConditions />} />
            <Route element={<PrivateRoute />}>
              <Route path='/dashboard' element={<AdminLayout />}>
                <Route element={<OnlyAdminPrivateRoute />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path='posts' element={<AdminPosts />} />
                  <Route path='posts/create' element={<CreatePost />} />
                  <Route path='posts/:postId/edit' element={<UpdatePost />} />
                  <Route path='comments' element={<AdminComments />} />
                  <Route path='media' element={<AdminMedia />} />
                  <Route path='users' element={<AdminUsers />} />
                  <Route path='settings' element={<AdminSettings />} />
                </Route>
                <Route path='profile' element={<DashProfile />} />
              </Route>
            </Route>
            <Route element={<OnlyAdminPrivateRoute />}>
              <Route path='/create-post' element={<CreatePost />} />
              <Route path='/update-post/:postId' element={<UpdatePost />} />
            </Route>

            <Route path='/projects' element={<Projects />} />
            <Route path='/post/:postSlug' element={<PostPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </HelmetProvider>
    </BrowserRouter>
  );
}
