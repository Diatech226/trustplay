"use client";

// migrated from Vite React route to Next.js app router
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CallToAction from "@/components/CallToAction";
import CommentSection from "@/components/CommentSection";
import PostCard from "@/components/PostCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButtons from "@/components/ShareButtons";
import PageContainer from "@/components/layout/PageContainer";
import Seo from "@/components/Seo";
import ArticleHeroSkeleton from "@/components/skeletons/ArticleHeroSkeleton";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import { logReading } from "@/redux/history/historySlice";
import { fetchJson } from "@/utils/apiClient";

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await fetchJson(`/api/post/getposts?slug=${postSlug}`);
        const foundPost = data.posts?.[0];
        setPost(foundPost);
        if (!foundPost) {
          setError(true);
        }
      } catch (requestError) {
        setError(true);
      }
      setLoading(false);
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    if (!post?.subCategory) return;
    const fetchRecentPosts = async () => {
      try {
        const data = await fetchJson(`/api/post/getposts?subCategory=${post.subCategory}&limit=4`);
        const filtered = (data.posts || []).filter((p) => p.slug !== post.slug);
        setRecentPosts(filtered);
      } catch (recentError) {
        console.warn("[Articles similaires] Impossible de charger les articles.", recentError);
      }
    };
    fetchRecentPosts();
  }, [post]);

  useEffect(() => {
    if (post) {
      dispatch(
        logReading({
          _id: post._id,
          slug: post.slug,
          title: post.title,
          image: post.image,
          subCategory: post.subCategory,
        }),
      );
    }
  }, [dispatch, post]);

  const metaDescription = useMemo(
    () => post?.content?.replace(/<[^>]+>/g, "").slice(0, 180) || "Article Trust Media",
    [post],
  );
  const articleUrl = useMemo(
    () => (post ? `${window?.location?.origin || ""}/post/${post.slug}` : undefined),
    [post],
  );
  const structuredData = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        image: [post.image],
        datePublished: post.createdAt,
        author: post.author || "Rédaction Trust",
        url: articleUrl,
      }
    : null;

  const subCategoryPaths = {
    news: { label: "News", href: "/news" },
    politique: { label: "Politique", href: "/politique" },
    economie: { label: "Économie", href: "/search?subCategory=economie" },
    culture: { label: "Culture", href: "/search?subCategory=culture" },
    technologie: { label: "Technologie", href: "/search?subCategory=technologie" },
    portraits: { label: "Portraits", href: "/search?subCategory=portraits" },
    science: { label: "Science & Tech", href: "/science" },
    sport: { label: "Sport", href: "/sport" },
    cinema: { label: "Cinéma", href: "/cinema" },
  };
  const readingTime = Math.max(1, Math.round((post?.content?.length || 0) / 900));
  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    post?.subCategory && subCategoryPaths[post.subCategory]
      ? subCategoryPaths[post.subCategory]
      : { label: post?.category || "Article" },
    { label: post?.title || "Article" },
  ].filter(Boolean);

  if (loading)
    return (
      <main className="min-h-screen bg-white/60 pb-16 dark:bg-slate-950">
        <PageContainer className="flex flex-col gap-8 py-8">
          <ArticleHeroSkeleton />
          <article className="animate-pulse rounded-3xl bg-white p-6 shadow-subtle ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800">
            <div className="space-y-3">
              <div className="h-6 w-3/4 rounded-full bg-subtle dark:bg-slate-800" />
              <div className="h-4 w-full rounded-full bg-subtle dark:bg-slate-800" />
              <div className="h-4 w-5/6 rounded-full bg-subtle dark:bg-slate-800" />
            </div>
          </article>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        </PageContainer>
      </main>
    );

  return (
    <main className="min-h-screen bg-white/60 pb-16 dark:bg-slate-950">
      <Seo
        title={`${post?.title || "Article"} | Trust Media`}
        description={metaDescription}
        image={post?.image}
        url={articleUrl}
        type="article"
      >
        {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
      </Seo>
      <PageContainer className="flex flex-col gap-8 py-6">
        <Breadcrumbs items={breadcrumbItems} />
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800">
            Impossible de charger cet article pour le moment. Merci de réessayer plus tard.
          </div>
        )}
        <section className="overflow-hidden rounded-3xl border border-subtle bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-0 lg:grid-cols-5">
            <div className="relative lg:col-span-3">
              <img
                src={post && post.image}
                alt={post && post.title}
                loading="lazy"
                decoding="async"
                width="960"
                height="540"
                className="h-full w-full object-cover"
              />
              {post?.subCategory && subCategoryPaths[post.subCategory] && (
                <Link
                  href={subCategoryPaths[post.subCategory].href}
                  className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-subtle dark:bg-slate-800/80"
                >
                  {subCategoryPaths[post.subCategory].label}
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-4 p-6 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Reportage</p>
              <h1 className="text-3xl font-extrabold leading-tight text-primary lg:text-4xl dark:text-white">{post && post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <span className="rounded-full bg-subtle px-3 py-1 text-primary dark:bg-slate-800">
                  {post &&
                    new Date(post.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent">
                  {readingTime} min de lecture
                </span>
              </div>
              <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">{metaDescription}</p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-primary">
                {currentUser && <span>Signé · {currentUser?.username}</span>}
                <FavoriteButton post={post} />
              </div>
              <ShareButtons title={post?.title} />
            </div>
          </div>
        </section>

        <article className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-6 shadow-subtle ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800">
          <div
            className="post-content space-y-4 text-lg leading-8 text-slate-800 dark:text-slate-100"
            dangerouslySetInnerHTML={{ __html: post && post.content }}
          ></div>
        </article>

        <div className="max-w-5xl self-center">
          <CallToAction />
        </div>

        <CommentSection postId={post?._id} />

        <section className="mt-4 rounded-3xl bg-gradient-to-r from-primary/5 via-secondary/5 to-ocean/5 p-6 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
          <div className="flex items-center justify-between gap-4 pb-4">
            <h2 className="text-2xl font-extrabold text-primary dark:text-white">Articles similaires</h2>
            <Link href="/search" className="text-sm font-semibold text-ocean hover:underline">
              Voir plus
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts && recentPosts.length > 0 ? (
              recentPosts.map((item) => <PostCard key={item._id} post={item} />)
            ) : (
              <div className="col-span-full grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <PostCardSkeleton key={`recent-${index}`} />
                ))}
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
