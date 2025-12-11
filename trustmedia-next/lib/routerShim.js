"use client";

// migrated from Vite React route to Next.js app router
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams, useParams as useNextParams } from "next/navigation";

export { Link };

export function NavLink({ to, children, className, ...rest }) {
  const pathname = usePathname();
  const isActive = pathname === to;
  const computedClassName = typeof className === "function" ? className({ isActive }) : className;
  return (
    <Link href={to} className={computedClassName} {...rest}>
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
}

export function useNavigate() {
  const router = useRouter();
  return (to, options = {}) => {
    if (options.replace) return router.replace(to);
    return router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = useMemo(() => {
    const serialized = searchParams.toString();
    return serialized ? `?${serialized}` : "";
  }, [searchParams]);
  return { pathname, search };
}

export function useParams() {
  return useNextParams();
}

export function Navigate({ to, replace }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (to) {
      navigate(to, { replace });
    }
  }, [navigate, replace, to]);
  return null;
}

export function Outlet({ children }) {
  return children || null;
}

export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route({ element }) {
  return element || null;
}
