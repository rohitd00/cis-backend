import { ApiError, fetchCompensation } from '@/lib/api';
import { CompensationFilters } from '@/components/CompensationFilters';
import { CompensationTable } from '@/components/CompensationTable';
import { Pagination } from '@/components/Pagination';

type SearchParams = Record<string, string | string[] | undefined>;

function normalizeParams(searchParams: SearchParams): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    result[key] = Array.isArray(value) ? value[0] : value;
  }
  return result;
}

export default async function CompensationExplorerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = normalizeParams(searchParams);

  try {
    const result = await fetchCompensation(params);

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">Compensation Explorer</h1>
          <p className="mt-1 text-sm text-muted">
            Filter, sort, and page through compensation records. Filtering, sorting, and pagination all
            happen on the server.
          </p>
        </div>

        <CompensationFilters defaults={params} />
        <CompensationTable records={result.data} />
        <Pagination pagination={result.pagination} basePath="/compensation" params={params} />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "We couldn't load compensation data. Please try again.";
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-ink">Compensation Explorer</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>
      </div>
    );
  }
}
