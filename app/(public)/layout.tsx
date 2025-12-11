import type { ReactNode } from 'react';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between rounded-soft bg-white px-4 py-3 shadow-subtle">
        <Link href="/" className="text-lg font-semibold text-primary">
          Trust Media
        </Link>
        <nav className="flex items-center gap-4 text-sm text-secondary">
          <Link href="/events">Événements</Link>
          <Link href="/search">Recherche</Link>
          <Link href="/api/auth/me">Profil API</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
