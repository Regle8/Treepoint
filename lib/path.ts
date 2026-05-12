/**
 * Prepend the deployment basePath to a public-asset URL.
 * Used for next/image and plain <img> tags whose src starts with "/",
 * because Next.js does NOT auto-prefix those (only <Link> + pages).
 *
 * In dev / Vercel builds NEXT_PUBLIC_BASE_PATH is empty, so this is a no-op.
 * On GitHub Pages it resolves to "/Treepoint/logo/foo.svg" etc.
 */
export const withBasePath = (path: string): string => {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${bp}${path}`;
};
