import { ApiError, fetchCompanies, fetchCompare } from '@/lib/api';
import { CompareForm } from '@/components/CompareForm';
import { formatMoney, formatNumber } from '@/lib/format';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { companySlugs?: string; role?: string; level?: string; city?: string; currency?: string };
}) {
  const companies = await fetchCompanies({ limit: 50 }).catch(() => ({ data: [], pagination: null }));

  const selectedSlugs = (searchParams.companySlugs ?? '').split(',').filter(Boolean);
  const canCompare = selectedSlugs.length > 0 && !!searchParams.currency;

  let compareError: string | null = null;
  let result: Awaited<ReturnType<typeof fetchCompare>> | null = null;

  if (canCompare) {
    try {
      result = await fetchCompare({
        companySlugs: searchParams.companySlugs,
        role: searchParams.role,
        level: searchParams.level,
        city: searchParams.city,
        currency: searchParams.currency,
      });
    } catch (error) {
      compareError =
        error instanceof ApiError ? error.message : "We couldn't run this comparison. Please try again.";
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Compare Companies</h1>
        <p className="mt-1 text-sm text-muted">
          Select two or more companies and a single currency. Compensation in different currencies is
          never mixed into one comparison — pick one currency to compare within.
        </p>
      </div>

      <CompareForm companies={companies.data} defaults={searchParams} />

      {compareError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {compareError}
        </div>
      )}

      {result && (
        <section>
          <h2 className="text-sm font-semibold text-ink">
            Results &middot; {result.criteria.currency}
            {result.criteria.role ? ` · ${result.criteria.role}` : ''}
            {result.criteria.level ? ` · ${result.criteria.level}` : ''}
            {result.criteria.city ? ` · ${result.criteria.city}` : ''}
          </h2>
          {result.unknownCompanySlugs && result.unknownCompanySlugs.length > 0 && (
            <p className="mt-1 text-xs text-amber-700">
              Unknown companies ignored: {result.unknownCompanySlugs.join(', ')}
            </p>
          )}
          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-border bg-gray-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3 text-right">Sample size</th>
                  <th className="px-4 py-3 text-right">Avg base</th>
                  <th className="px-4 py-3 text-right">Median base</th>
                  <th className="px-4 py-3 text-right">Avg total</th>
                  <th className="px-4 py-3 text-right">Median total</th>
                </tr>
              </thead>
              <tbody>
                {result.companies.map((c) => (
                  <tr key={c.slug} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-ink">{c.company}</td>
                    <td className="px-4 py-3 text-right text-muted">{formatNumber(c.sampleSize)}</td>
                    <td className="px-4 py-3 text-right text-ink">
                      {c.sampleSize > 0 ? formatMoney(c.averageBase, result.criteria.currency) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">
                      {c.sampleSize > 0 ? formatMoney(c.medianBase, result.criteria.currency) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {c.sampleSize > 0 ? formatMoney(c.averageTotal, result.criteria.currency) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">
                      {c.sampleSize > 0 ? formatMoney(c.medianTotal, result.criteria.currency) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
