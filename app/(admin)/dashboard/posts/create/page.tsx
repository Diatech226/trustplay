import PostForm from '../post-form';
import { requireAdmin } from '@/lib/roles';

export const metadata = { title: 'Créer un post' };

export default async function CreatePostPage() {
  await requireAdmin();
  return (
    <div className="section-card space-y-3">
      <h1 className="text-xl font-semibold">Créer un article</h1>
      <PostForm />
    </div>
  );
}
