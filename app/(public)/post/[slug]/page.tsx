import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Prisma model for Post
async function getPost(slug: string) {
  try {
    return await prisma.post.findUnique({ where: { slug }, include: { author: true } });
  } catch (error) {
    return null;
  }
}

async function getSimilar(subCategory?: string, excludeId?: string) {
  if (!subCategory) return [];
  try {
    return await prisma.post.findMany({
      where: { subCategory, id: { not: excludeId }, isPublished: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    return [];
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return notFound();
  const related = await getSimilar(post.subCategory, post.id);

  return (
    <article className="section-card space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase text-secondary">{post.subCategory}</p>
        <h1 className="text-2xl font-bold text-primary">{post.title}</h1>
        <p className="text-sm text-slate-600">Mis à jour le {post.updatedAt?.toDateString?.() ?? ''}</p>
      </div>
      {post.imageUrl ? (
        <img src={post.imageUrl} alt={post.title} className="w-full rounded-soft object-cover" />
      ) : null}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

      {related.length ? (
        <div className="border-t border-subtle pt-4">
          <h2 className="text-lg font-semibold">Articles similaires</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={`/post/${item.slug}`} className="block rounded-soft border border-subtle p-3">
                <p className="text-xs uppercase text-secondary">{item.subCategory}</p>
                <p className="font-semibold text-primary">{item.title}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
