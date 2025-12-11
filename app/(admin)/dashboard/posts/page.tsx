import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export const metadata = { title: 'Posts CMS' };

export default async function PostsAdminPage() {
  await requireAdmin();
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => []);

  return (
    <div className="section-card space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Posts</h1>
        <Link href="/dashboard/posts/create" className="rounded-full bg-primary px-4 py-2 text-white">
          Nouveau
        </Link>
      </div>
      <div className="grid gap-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-soft border border-subtle p-4">
            <p className="text-xs uppercase text-secondary">{post.subCategory}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary">{post.title}</p>
                <p className="text-sm text-slate-600">{post.slug}</p>
              </div>
              <Link href={`/dashboard/posts/${post.id}/edit`} className="text-secondary underline">
                Éditer
              </Link>
            </div>
          </article>
        ))}
        {!posts.length && <p className="text-sm text-slate-600">Aucun post trouvé.</p>}
      </div>
    </div>
  );
}
