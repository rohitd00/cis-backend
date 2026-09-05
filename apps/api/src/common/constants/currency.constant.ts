/**
 * Supported currency codes for the MVP. Deliberately a small, explicit
 * allowlist rather than validating against the full ISO-4217 list — every
 * currency here is one the seed data / demo actually uses.
 */
export const SUPPORTED_CURRENCIES = [
  'USD',
  'INR',
  'EUR',
  'GBP',
  'SGD',
  'CAD',
  'AUD',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
