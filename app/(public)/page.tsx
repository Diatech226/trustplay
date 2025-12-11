import Link from 'next/link';

// migrated from React+Vite to Next.js
const highlights = [
  {
    title: 'Trust Media continue sa mission',
    slug: 'trust-media-mission',
    subCategory: 'news',
    excerpt: 'Nouvelle architecture Next.js + Prisma pour unifier le média et son CMS.',
  },
  {
    title: 'TrustEvent arrive dans Next.js',
    slug: 'trustevenements',
    subCategory: 'evenement',
    excerpt: 'Gestion des événements et des inscriptions avec Prisma et App Router.',
  },
];

const teaserEvents = [
  {
    title: 'Sommet de la confiance',
    slug: 'sommet-de-la-confiance',
    location: 'Paris',
    eventDate: '2025-01-14',
    isPaid: false,
  },
  {
    title: 'Forum des innovations',
    slug: 'forum-des-innovations',
    location: 'Lyon',
    eventDate: '2025-02-28',
    isPaid: true,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="section-card">
        <h1 className="text-2xl font-bold text-primary">Trust Media x Trust Event</h1>
        <p className="mt-2 text-slate-700">
          Cette version Next.js centralise le média, les événements et le CMS admin avec Prisma comme
          source de vérité. Utilisez les API routes pour authentifier les utilisateurs, publier des
          articles et suivre les inscriptions aux événements.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/search" className="rounded-full bg-primary px-4 py-2 text-white">
            Explorer les articles
          </Link>
          <Link href="/events" className="rounded-full bg-secondary px-4 py-2 text-white">
            Voir les événements
          </Link>
          <Link href="/dashboard" className="rounded-full bg-accent px-4 py-2 text-ink">
            Accéder au CMS
          </Link>
        </div>
      </section>

      <section className="section-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dernières publications</h2>
          <Link className="text-sm text-secondary underline" href="/search">
            Recherche avancée
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {highlights.map((post) => (
            <article key={post.slug} className="rounded-soft border border-subtle p-4">
              <p className="text-xs uppercase text-secondary">{post.subCategory}</p>
              <Link href={`/post/${post.slug}`} className="mt-1 block text-lg font-semibold">
                {post.title}
              </Link>
              <p className="text-sm text-slate-700">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">À la une TrustEvent</h2>
          <Link className="text-sm text-secondary underline" href="/events">
            Tous les événements
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {teaserEvents.map((event) => (
            <article key={event.slug} className="rounded-soft border border-subtle p-4">
              <Link href={`/events/${event.slug}`} className="text-lg font-semibold text-primary">
                {event.title}
              </Link>
              <p className="text-sm text-slate-700">{event.location}</p>
              <p className="text-sm text-slate-700">{event.eventDate}</p>
              <span className="mt-1 inline-block rounded-full bg-mist px-3 py-1 text-xs text-secondary">
                {event.isPaid ? 'Payant' : 'Gratuit'}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
