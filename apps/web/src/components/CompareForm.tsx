'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CompanyListItem } from '@/lib/types';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'CAD', 'AUD'];

interface Props {
  companies: CompanyListItem[];
  defaults: {
    companySlugs?: string;
    role?: string;
    level?: string;
    city?: string;
    currency?: string;
  };
}

export function CompareForm({ companies, defaults }: Props) {
  const router = useRouter();
  const initialSelected = new Set((defaults.companySlugs ?? '').split(',').filter(Boolean));
  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    params.set('companySlugs', Array.from(selected).join(','));

    for (const key of ['currency', 'role', 'level', 'city']) {
      const value = formData.get(key);
      if (typeof value === 'string' && value) params.set(key, value);
    }

    router.push(`/compare?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-medium text-muted">Companies</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {companies.map((company) => (
            <label key={company.id} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={selected.has(company.slug)}
                onChange={() => toggle(company.slug)}
              />
              {company.name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Currency (required)</label>
          <select
            name="currency"
            defaultValue={defaults.currency ?? ''}
            required
            className="rounded-md border border-border px-2 py-1.5 text-sm"
          >
            <option value="" disabled>
              Select currency
            </option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Role</label>
          <input
            name="role"
            defaultValue={defaults.role}
            className="rounded-md border border-border px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Level</label>
          <input
            name="level"
            defaultValue={defaults.level}
            className="rounded-md border border-border px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">City</label>
          <input
            name="city"
            defaultValue={defaults.city}
            className="rounded-md border border-border px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={selected.size === 0}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-40"
        >
          Compare
        </button>
      </div>
    </form>
  );
}
