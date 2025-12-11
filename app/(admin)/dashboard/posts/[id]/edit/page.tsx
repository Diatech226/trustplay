import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';
import PostForm from '../../post-form';

export const metadata = { title: 'Éditer un post' };

export default async function EditPostPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: params.id } });

  if (!post) {
    return <p className="section-card text-slate-700">Post introuvable.</p>;
  }

  return (
    <div className="section-card space-y-3">
      <h1 className="text-xl font-semibold">Éditer {post.title}</h1>
      <PostForm
        postId={post.id}
        initialData={{
          title: post.title,
          subCategory: post.subCategory ?? 'news',
          content: post.content,
          imageUrl: post.imageUrl ?? '',
          isPublished: post.isPublished,
        }}
      />
    </div>
  );
}
