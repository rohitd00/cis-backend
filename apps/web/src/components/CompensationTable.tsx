import Link from 'next/link';
import type { CompensationRecord } from '@/lib/types';
import { formatMoney } from '@/lib/format';

export function CompensationTable({ records }: { records: CompensationRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
        No compensation records match your filters. Try removing some filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-gray-50 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Level</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3 text-right">Base</th>
            <th className="px-4 py-3 text-right">Bonus</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Currency</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <Link href={`/companies/${record.company.slug}`} className="text-accent hover:underline">
                  {record.company.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink">{record.role.name}</td>
              <td className="px-4 py-3 text-ink">{record.level.name}</td>
              <td className="px-4 py-3 text-muted">
                {[record.location.city, record.location.country].filter(Boolean).join(', ')}
              </td>
              <td className="px-4 py-3 text-right text-ink">
                {formatMoney(record.baseSalary, record.currency)}
              </td>
              <td className="px-4 py-3 text-right text-muted">
                {formatMoney(record.bonus, record.currency)}
              </td>
              <td className="px-4 py-3 text-right text-muted">
                {formatMoney(record.stock, record.currency)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-ink">
                {formatMoney(record.totalCompensation, record.currency)}
              </td>
              <td className="px-4 py-3 text-muted">{record.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
