import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Props {
  query: string;
  category?: string;
}

export default async function SearchResults({ query, category }: Props) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        isPublished: true,
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { content: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {},
          category ? { subCategory: category } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (!posts.length) {
      return <p className="text-sm text-slate-600">Aucun article trouvé pour cette recherche.</p>;
    }

    return (
      <div className="grid gap-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-soft border border-subtle p-4">
            <p className="text-xs uppercase text-secondary">{post.subCategory}</p>
            <Link href={`/post/${post.slug}`} className="block text-lg font-semibold text-primary">
              {post.title}
            </Link>
            <p className="text-sm text-slate-700 line-clamp-2">{post.content.slice(0, 180)}...</p>
          </article>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <p className="text-sm text-red-700">
        Impossible de charger les résultats pour le moment. Vérifiez votre connexion à la base de données Prisma.
      </p>
    );
  }
}
