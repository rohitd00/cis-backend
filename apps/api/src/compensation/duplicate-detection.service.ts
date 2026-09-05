import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

export interface FingerprintInput {
  normalizedCompanyName: string;
  normalizedRoleName: string;
  normalizedLevelName: string;
  normalizedCountry: string;
  normalizedRegion: string;
  normalizedCity: string;
  currency: string;
  baseSalary: string;
  bonus: string;
  stock: string;
  experienceYears: number | null;
  source: string;
}

/**
 * Deterministic duplicate strategy: two ingested records are duplicates if
 * they produce the same fingerprint. The fingerprint is a SHA-256 hash of
 * the normalized identifying fields (company/role/level/location/currency/
 * base/bonus/stock/experience/source), so "Google"/"GOOGLE"/"Google, Inc."
 * submissions for the same role+level+location+comp collapse to one hash.
 *
 * The fingerprint is stored in a unique DB column (Compensation.fingerprint)
 * so duplicate rejection is enforced at the database level, not only in
 * application code — a second application instance racing against this one
 * still cannot create a duplicate row.
 */
@Injectable()
export class DuplicateDetectionService {
  buildFingerprint(input: FingerprintInput): string {
    const canonical = [
      input.normalizedCompanyName,
      input.normalizedRoleName,
      input.normalizedLevelName,
      input.normalizedCountry,
      input.normalizedRegion,
      input.normalizedCity,
      input.currency.toLowerCase(),
      input.baseSalary,
      input.bonus,
      input.stock,
      input.experienceYears ?? '',
      input.source.toLowerCase(),
    ].join('|');

    return createHash('sha256').update(canonical).digest('hex');
  }
}
