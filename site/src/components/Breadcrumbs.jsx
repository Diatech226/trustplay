import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className='text-sm text-gray-600 dark:text-gray-300 mb-4' aria-label='Fil d’Ariane'>
      <ol className='flex flex-wrap gap-2 items-center'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className='flex items-center gap-2'>
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className='text-teal-600 hover:underline font-medium dark:text-teal-400'
                >
                  {item.label}
                </Link>
              ) : (
                <span className='font-semibold'>{item.label}</span>
              )}
              {!isLast && <span className='text-gray-400'>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
