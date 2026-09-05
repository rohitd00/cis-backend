import Link from 'next/link';
import { fetchCompanies, fetchOverview, ApiError } from '@/lib/api';
import { formatNumber } from '@/lib/format';

export default async function DashboardPage() {
  try {
    const [overview, companies] = await Promise.all([
      fetchOverview(),
      fetchCompanies({ limit: 8 }),
    ]);

    return (
      <div className="flex flex-col gap-8">
        <section>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            An overview of the compensation dataset currently in the system.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Companies" value={formatNumber(overview.totalCompanies)} />
          <StatCard label="Compensation records" value={formatNumber(overview.totalCompensationRecords)} />
          <StatCard label="Tracked roles" value={formatNumber(overview.popularRoles.length)} />
          <StatCard label="Tracked locations" value={formatNumber(overview.popularLocations.length)} />
        </section>

        <section>
          <form action="/compensation" className="flex max-w-lg gap-2">
            <input
              type="text"
              name="company"
              placeholder="Search a company (e.g. Google)"
              className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Search
            </button>
          </form>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Popular roles</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {overview.popularRoles.map((r) => (
                <li key={r.role} className="flex justify-between text-muted">
                  <span className="text-ink">{r.role}</span>
                  <span>{formatNumber(r.count)} records</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Popular locations</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {overview.popularLocations.map((l, i) => (
                <li key={i} className="flex justify-between text-muted">
                  <span className="text-ink">
                    {l.city ?? 'Unknown'}, {l.country ?? 'Unknown'}
                  </span>
                  <span>{formatNumber(l.count)} records</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink">Companies</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {companies.data.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="rounded-lg border border-border bg-surface p-4 hover:border-accent"
              >
                <p className="text-sm font-medium text-ink">{company.name}</p>
                <p className="mt-1 text-xs text-muted">{formatNumber(company.recordCount)} records</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    return <ErrorState error={error} />;
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof ApiError ? error.message : 'We could not load dashboard data.';
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {message}. Please make sure the API server is running and try again.
    </div>
  );
}
