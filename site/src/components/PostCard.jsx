import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { ResponsiveImage } from './ResponsiveImage';
import { MEDIA_CATEGORY, normalizeSubCategory } from '../utils/categories';
import { useRubrics } from '../hooks/useRubrics';
import { DEFAULT_MEDIA_PLACEHOLDER } from '../lib/mediaUrls';

export default function PostCard({ post }) {
  const { rubricMap } = useRubrics('TrustMedia');
  const normalizedSubCategory = normalizeSubCategory(post.subCategory);
  const rubric = normalizedSubCategory ? rubricMap[normalizedSubCategory] : null;
  let subCategoryLabel = rubric?.label || post.subCategory || post.category;
  if (post?.subCategory && !rubric && (!post.category || post.category === MEDIA_CATEGORY)) {
    subCategoryLabel = `Legacy: ${post.subCategory}`;
  }
  const readingTime = Math.max(1, Math.round((post?.content?.length || 0) / 800));
  return (
    <article className='group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle transition hover:-translate-y-1 hover:shadow-card dark:border-slate-700 dark:bg-slate-900'>
      {/* UI improvement: media forward layout */}
      <Link to={`/post/${post.slug}`} className='relative h-56 w-full overflow-hidden sm:h-64'>
        <ResponsiveImage
          media={post.featuredMedia}
          fallbackUrl={
            post.imageLegacy ||
            post.imageThumb ||
            post.imageMedium ||
            post.imageCover ||
            post.imageOriginal ||
            post.image ||
            DEFAULT_MEDIA_PLACEHOLDER
          }
          alt={post.title}
          variantPreference="card"
          sizes="(max-width: 768px) 100vw, 640px"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {subCategoryLabel && (
          <span className='absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-subtle dark:bg-slate-800/90'>
            {subCategoryLabel}
          </span>
        )}
        <div className='absolute right-4 top-4'>
          <FavoriteButton post={post} />
        </div>
      </Link>
      <div className='flex flex-1 flex-col gap-3 px-5 py-4'>
        <div className='flex items-center justify-between text-xs text-slate-500'>
          <span>{post?.author || 'Rédaction Trust'}</span>
          <span>{post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
        </div>
        <Link to={`/post/${post.slug}`} className='space-y-2'>
          <p className='text-lg font-semibold leading-tight text-slate-900 line-clamp-2 dark:text-slate-100'>
            {post.title}
          </p>
          <p className='text-sm text-slate-600 line-clamp-2 dark:text-slate-300'>
            {post?.content?.replace(/<[^>]+>/g, '').slice(0, 140)}...
          </p>
        </Link>
        <div className='mt-auto flex items-center justify-between'>
          <Link
            to={`/post/${post.slug}`}
            className='flex items-center gap-2 text-sm font-semibold text-primary hover:text-ocean'
          >
            Lire l'article
            <span aria-hidden className='transition group-hover:translate-x-1'>→</span>
          </Link>
          <span className='rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent'>
            {readingTime} min
          </span>
        </div>
      </div>
    </article>
  );
}
