export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CompanyRef {
  id: string;
  name: string;
  slug: string;
  website: string | null;
}

export interface RoleRef {
  id: string;
  name: string;
  slug: string;
}

export interface LevelRef {
  id: string;
  name: string;
  seniorityRank: number | null;
}

export interface LocationRef {
  id: string;
  country: string;
  region: string | null;
  city: string | null;
}

export interface CompensationRecord {
  id: string;
  currency: string;
  baseSalary: string;
  bonus: string;
  stock: string;
  totalCompensation: string;
  experienceYears: number | null;
  source: string;
  reportedAt: string;
  company: CompanyRef;
  role: RoleRef;
  level: LevelRef;
  location: LocationRef;
}

export interface CompensationListResponse {
  data: CompensationRecord[];
  pagination: Pagination;
}

export interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  recordCount: number;
}

export interface CompanyListResponse {
  data: CompanyListItem[];
  pagination: Pagination;
}

export interface CompensationStats {
  currency: string;
  sampleSize: number;
  averageBase: number;
  medianBase: number;
  averageBonus: number;
  averageStock: number;
  averageTotal: number;
  medianTotal: number;
  minTotal: number;
  maxTotal: number;
}

export interface CompanyDetail {
  company: CompanyRef;
  recordCount: number;
  statisticsByCurrency: CompensationStats[];
  roles: RoleRef[];
  levels: LevelRef[];
  locations: LocationRef[];
}

export interface AnalyticsOverview {
  totalCompanies: number;
  totalCompensationRecords: number;
  popularRoles: { role: string; count: number }[];
  popularLocations: { city: string | null; country: string | null; count: number }[];
  dataDisclaimer: string;
}

export interface CompareResult {
  criteria: {
    role: string | null;
    level: string | null;
    city: string | null;
    currency: string;
  };
  companies: ({ company: string; slug: string } & Omit<CompensationStats, 'currency'>)[];
  unknownCompanySlugs?: string[];
}
