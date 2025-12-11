// CMS: admin dashboard
import Link from 'next/link';
import { requireAdmin } from '@/lib/roles';

export const metadata = { title: 'Dashboard admin' };

export default async function DashboardHome() {
  await requireAdmin();
  return (
    <div className="section-card space-y-3">
      <h1 className="text-2xl font-bold text-primary">Espace administrateur</h1>
      <p className="text-slate-700">Protégez cet espace avec requireAdmin et vos emails ADMIN.</p>
      <div className="grid gap-3 md:grid-cols-3">
        <Link className="rounded-soft border border-subtle p-4" href="/dashboard/posts">
          Gestion des posts
        </Link>
        <Link className="rounded-soft border border-subtle p-4" href="/dashboard/events">
          Gestion des événements
        </Link>
        <Link className="rounded-soft border border-subtle p-4" href="/dashboard/posts/create">
          Nouveau post
        </Link>
      </div>
    </div>
  );
}
