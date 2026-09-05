import { notFound } from 'next/navigation';
import { ApiError, fetchCompanyDetail, fetchCompensation } from '@/lib/api';
import { CompensationTable } from '@/components/CompensationTable';
import { Pagination } from '@/components/Pagination';
import { formatMoney, formatNumber } from '@/lib/format';

export default async function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  let detail;
  try {
    detail = await fetchCompanyDetail(params.slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        We couldn&apos;t load this company. Please try again.
      </div>
    );
  }

  const page = Number(searchParams.page ?? '1');
  const records = await fetchCompensation({ company: detail.company.name, page, limit: 10 });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">{detail.company.name}</h1>
        <p className="mt-1 text-sm text-muted">{formatNumber(detail.recordCount)} compensation records</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-ink">Statistics by currency</h2>
        <p className="mt-1 text-xs text-muted">
          Compensation is never averaged across currencies — each currency observed at this company is
          reported separately.
        </p>
        {detail.statisticsByCurrency.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No compensation data available.</p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {detail.statisticsByCurrency.map((stat) => (
              <div key={stat.currency} className="rounded-lg border border-border bg-surface p-4">
                <p className="text-sm font-semibold text-ink">{stat.currency}</p>
                <dl className="mt-2 flex flex-col gap-1 text-sm text-muted">
                  <Row label="Sample size" value={formatNumber(stat.sampleSize)} />
                  <Row label="Avg base" value={formatMoney(stat.averageBase, stat.currency)} />
                  <Row label="Median base" value={formatMoney(stat.medianBase, stat.currency)} />
                  <Row label="Avg total" value={formatMoney(stat.averageTotal, stat.currency)} />
                  <Row label="Median total" value={formatMoney(stat.medianTotal, stat.currency)} />
                  <Row label="Range" value={`${formatMoney(stat.minTotal, stat.currency)} – ${formatMoney(stat.maxTotal, stat.currency)}`} />
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <TagList title="Roles" items={detail.roles.map((r) => r.name)} />
        <TagList title="Levels" items={detail.levels.map((l) => l.name)} />
        <TagList
          title="Locations"
          items={detail.locations.map((l) => [l.city, l.country].filter(Boolean).join(', '))}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">Compensation records</h2>
        <CompensationTable records={records.data} />
        <Pagination
          pagination={records.pagination}
          basePath={`/companies/${params.slug}`}
          params={{}}
        />
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function TagList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-xs text-muted">None</span>}
        {items.map((item, i) => (
          <span key={i} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-muted">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
