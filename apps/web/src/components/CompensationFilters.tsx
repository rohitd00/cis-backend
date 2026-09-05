const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'CAD', 'AUD'];
const SORT_FIELDS = [
  { value: 'reportedAt', label: 'Reported date' },
  { value: 'totalCompensation', label: 'Total compensation' },
  { value: 'baseSalary', label: 'Base salary' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'stock', label: 'Stock' },
  { value: 'experienceYears', label: 'Experience' },
];

interface Props {
  defaults: Record<string, string | undefined>;
}

export function CompensationFilters({ defaults }: Props) {
  return (
    <form action="/compensation" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Field label="Company" name="company" defaultValue={defaults.company} />
      <Field label="Role" name="role" defaultValue={defaults.role} />
      <Field label="Level" name="level" defaultValue={defaults.level} />
      <Field label="Country" name="country" defaultValue={defaults.country} />
      <Field label="City" name="city" defaultValue={defaults.city} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Currency</label>
        <select
          name="currency"
          defaultValue={defaults.currency ?? ''}
          className="rounded-md border border-border px-2 py-1.5 text-sm"
        >
          <option value="">Any</option>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <Field label="Min base salary" name="minBaseSalary" defaultValue={defaults.minBaseSalary} type="number" />
      <Field label="Max base salary" name="maxBaseSalary" defaultValue={defaults.maxBaseSalary} type="number" />
      <Field
        label="Min total comp"
        name="minTotalCompensation"
        defaultValue={defaults.minTotalCompensation}
        type="number"
      />
      <Field
        label="Max total comp"
        name="maxTotalCompensation"
        defaultValue={defaults.maxTotalCompensation}
        type="number"
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Sort by</label>
        <select
          name="sort"
          defaultValue={defaults.sort ?? 'reportedAt'}
          className="rounded-md border border-border px-2 py-1.5 text-sm"
        >
          {SORT_FIELDS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Order</label>
        <select
          name="order"
          defaultValue={defaults.order ?? 'desc'}
          className="rounded-md border border-border px-2 py-1.5 text-sm"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      <div className="col-span-2 flex items-end gap-2 sm:col-span-3 lg:col-span-6">
        <button
          type="submit"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Apply filters
        </button>
        <a href="/compensation" className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:text-ink">
          Clear
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
