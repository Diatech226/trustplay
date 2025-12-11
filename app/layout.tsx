import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Trust Media',
  description: 'Migrated from React+Vite to Next.js with Prisma.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-mist text-ink antialiased">
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
