const CURRENCY_LOCALE: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  SGD: 'en-SG',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

export function formatMoney(value: string | number, currency: string): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(amount)) return '-';
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
