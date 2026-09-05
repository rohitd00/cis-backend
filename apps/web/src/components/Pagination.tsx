import Link from 'next/link';
import type { Pagination as PaginationMeta } from '@/lib/types';

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  search.set('page', String(page));
  return `${basePath}?${search.toString()}`;
}

export function Pagination({
  pagination,
  basePath,
  params,
}: {
  pagination: PaginationMeta;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const { page, totalPages, total } = pagination;

  return (
    <div className="flex items-center justify-between text-sm text-muted">
      <span>
        Page {page} of {totalPages} &middot; {total} result{total === 1 ? '' : 's'}
      </span>
      <div className="flex gap-2">
        <Link
          href={buildHref(basePath, params, Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-md border border-border px-3 py-1.5 ${
            page <= 1 ? 'pointer-events-none opacity-40' : 'hover:text-ink'
          }`}
        >
          Previous
        </Link>
        <Link
          href={buildHref(basePath, params, Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`rounded-md border border-border px-3 py-1.5 ${
            page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:text-ink'
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
