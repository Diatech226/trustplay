import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.replace('/dashboard', '').split('/').filter(Boolean);

  const crumbs = [
    { label: 'Dashboard', to: '/dashboard' },
    ...segments.map((segment, index) => ({
      label: segment[0]?.toUpperCase() + segment.slice(1),
      to: `/dashboard/${segments.slice(0, index + 1).join('/')}`,
    })),
  ];

  return (
    <nav className='mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500'>
      {crumbs.map((crumb, index) => (
        <span key={crumb.to} className='flex items-center gap-2'>
          {index !== 0 && <span className='text-slate-400'>/</span>}
          {index === crumbs.length - 1 ? (
            <span className='text-primary'>{crumb.label}</span>
          ) : (
            <Link to={crumb.to} className='hover:text-primary'>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
