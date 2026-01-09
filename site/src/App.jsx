import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import { HelmetProvider } from "react-helmet-async";
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession, setUser } from './redux/user/userSlice';
import { apiRequest, getAuthToken } from './lib/apiClient';
import { logoutAndClearPersistedData } from './redux/store';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const SignIn = lazy(() => import('./pages/SignIn'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));
const AdminPages = lazy(() => import('./pages/admin/AdminPages'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminCampaigns = lazy(() => import('./pages/admin/AdminCampaigns'));
const AdminClients = lazy(() => import('./pages/admin/AdminClients'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminForms = lazy(() => import('./pages/admin/AdminForms'));
const AdminActivity = lazy(() => import('./pages/admin/AdminActivity'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
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
const NotFound = lazy(() => import('./pages/NotFound'));
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
const RubricPage = lazy(() => import('./pages/RubricPage'));
const Rubriques = lazy(() => import('./pages/Rubriques'));

export default function App() {
  const dispatch = useDispatch();
  const { currentUser, token, initialized } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (!initialized) return;
    const fetchProfile = async () => {
      const storedToken = token || (await getAuthToken());
      if (!storedToken) {
        dispatch(logoutAndClearPersistedData());
        return;
      }
      try {
        const me = await apiRequest('/api/user/me', { auth: true });
        const profile = me.user || me.data?.user || me;
        if (profile) {
          dispatch(setUser({ user: profile, token: storedToken }));
        }
      } catch (error) {
        dispatch(logoutAndClearPersistedData());
      }
    };

    fetchProfile();
  }, [dispatch, initialized, token]);

  return (
    <BrowserRouter>
      <HelmetProvider>
        <ScrollToTop />
        <AppShell />
      </HelmetProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <>
      {!isDashboard && <Header />}
      <Suspense fallback={<LoadingScreen label='Chargement de la page...' />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/search' element={<Search />} />
          <Route path='/events' element={<TrustEvent />} />
          <Route path='/event' element={<TrustEvent />} />
          <Route path='/production' element={<TrustProd />} />
          <Route path='/favorites' element={<Favorites />} />
          <Route path='/history' element={<History />} />
          <Route path='/notifications-preferences' element={<NotificationsPreferences />} />
          <Route path='/rubriques' element={<Rubriques />} />
          <Route path='/news' element={<NewsPage />} />
          <Route path='/politique' element={<PoliticsPage />} />
          <Route path='/science' element={<SciencePage />} />
          <Route path='/science-tech' element={<SciencePage />} />
          <Route path='/sport' element={<SportPage />} />
          <Route path='/cinema' element={<CinemaPage />} />
          <Route path='/:rubricSlug' element={<RubricPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route element={<OnlyAdminPrivateRoute />}>
            <Route path='/dashboard' element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path='posts' element={<AdminPosts />} />
              <Route path='posts/create' element={<CreatePost />} />
              <Route path='posts/:postId/edit' element={<UpdatePost />} />
              <Route path='pages' element={<AdminPages />} />
              <Route path='comments' element={<AdminComments />} />
              <Route path='events' element={<AdminEvents />} />
              <Route path='media' element={<AdminMedia />} />
              <Route path='campaigns' element={<AdminCampaigns />} />
              <Route path='clients' element={<AdminClients />} />
              <Route path='projects' element={<AdminProjects />} />
              <Route path='analytics' element={<AdminAnalytics />} />
              <Route path='newsletter' element={<AdminNewsletter />} />
              <Route path='forms' element={<AdminForms />} />
              <Route path='activity' element={<AdminActivity />} />
              <Route path='users' element={<AdminUsers />} />
              <Route path='settings' element={<AdminSettings />} />
              <Route path='profile' element={<DashProfile />} />
            </Route>
          </Route>
          <Route element={<OnlyAdminPrivateRoute />}>
            <Route path='/create-post' element={<CreatePost />} />
            <Route path='/update-post/:postId' element={<UpdatePost />} />
          </Route>

          <Route path='/projects' element={<Projects />} />
          <Route path='/post/:postSlug' element={<PostPage />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isDashboard && <Footer />}
    </>
  );
}
