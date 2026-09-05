import { Injectable } from '@nestjs/common';

/**
 * Trailing legal-entity suffixes stripped from company names during
 * normalization. Matched as whole tokens only (never as substrings) so that
 * e.g. "Costco" is never mistaken for "Co" + "sto".
 */
const COMPANY_SUFFIXES = new Set([
  'inc',
  'ltd',
  'limited',
  'llc',
  'corp',
  'corporation',
  'co',
  'company',
  'technologies',
  'technology',
]);

/**
 * Deterministic, rule-based normalization for company/role/level/location
 * text and for generating URL slugs.
 *
 * Deliberately NOT fuzzy or AI-based (per spec): normalization only
 * neutralizes whitespace, casing, punctuation, and known legal suffixes.
 * It does not attempt semantic matching (e.g. it will never treat
 * "Software Engineer" and "Backend Engineer" as the same role).
 */
@Injectable()
export class NormalizationService {
  /**
   * "  Google, Inc. " -> "google"
   * "GOOGLE"          -> "google"
   * "Google LLC"      -> "google"
   *
   * Suffixes are stripped repeatedly from the end of the token list so that
   * "Google Technologies Inc." still resolves to "google".
   */
  normalizeCompanyName(raw: string): string {
    let tokens = this.tokenize(raw);

    let stripped = true;
    while (stripped && tokens.length > 1) {
      stripped = false;
      const last = tokens[tokens.length - 1];
      if (COMPANY_SUFFIXES.has(last)) {
        tokens = tokens.slice(0, -1);
        stripped = true;
      }
    }

    return tokens.join(' ');
  }

  /** Casing/punctuation/whitespace normalization only — no suffix stripping. */
  normalizeRoleName(raw: string): string {
    return this.tokenize(raw).join(' ');
  }

  /** Level labels retain their raw form on the record; this is only for
   *  per-company duplicate matching (e.g. "L4" vs " l4 "). */
  normalizeLevelName(raw: string): string {
    return this.tokenize(raw).join(' ');
  }

  normalizeLocationPart(raw: string | null | undefined): string {
    if (!raw) return '';
    return this.tokenize(raw).join(' ');
  }

  /** URL-safe slug: lowercase, alphanumeric tokens joined by single hyphens. */
  slugify(raw: string): string {
    return raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  /** trim -> lowercase -> strip punctuation -> collapse whitespace -> tokens */
  private tokenize(raw: string): string[] {
    return raw
      .trim()
      .toLowerCase()
      .replace(/[.,'’`]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }
}
