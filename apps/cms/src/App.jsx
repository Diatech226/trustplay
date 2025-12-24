import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Overview } from './pages/Overview';
import { Posts } from './pages/Posts';
import { PostEditor } from './pages/PostEditor';
import { Events } from './pages/Events';
import { EventEditor } from './pages/EventEditor';
import { MediaLibrary } from './pages/MediaLibrary';
import { Comments } from './pages/Comments';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/new" element={<PostEditor />} />
        <Route path="posts/:id/edit" element={<PostEditor />} />
        <Route path="events" element={<Events />} />
        <Route path="events/new" element={<EventEditor />} />
        <Route path="events/:id/edit" element={<EventEditor />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="comments" element={<Comments />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
