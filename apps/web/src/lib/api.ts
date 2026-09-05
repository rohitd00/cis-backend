import type {
  AnalyticsOverview,
  CompanyDetail,
  CompanyListResponse,
  CompareResult,
  CompensationListResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), { cache: 'no-store' });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(body.message ?? 'Request failed', res.status);
  }

  return res.json() as Promise<T>;
}

export function fetchCompensation(params: Record<string, string | number | undefined>) {
  return apiFetch<CompensationListResponse>('/compensation', params);
}

export function fetchCompanies(params?: Record<string, string | number | undefined>) {
  return apiFetch<CompanyListResponse>('/companies', params);
}

export function fetchCompanyDetail(slug: string, params?: Record<string, string | number | undefined>) {
  return apiFetch<{ data: CompanyDetail }>(`/companies/${slug}`, params).then((r) => r.data);
}

export function fetchOverview() {
  return apiFetch<{ data: AnalyticsOverview }>('/analytics/overview').then((r) => r.data);
}

export function fetchCompare(params: Record<string, string | number | undefined>) {
  return apiFetch<{ data: CompareResult }>('/compare', params).then((r) => r.data);
}
