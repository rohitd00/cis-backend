import { NormalizationService } from './normalization.service';

describe('NormalizationService', () => {
  const service = new NormalizationService();

  describe('normalizeCompanyName', () => {
    it.each([
      ['Google', 'google'],
      ['google', 'google'],
      ['GOOGLE', 'google'],
      ['Google Inc.', 'google'],
      ['Google, Inc.', 'google'],
      ['Google LLC', 'google'],
      [' Google ', 'google'],
      ['Google Corporation', 'google'],
    ])('normalizes "%s" -> "%s"', (input, expected) => {
      expect(service.normalizeCompanyName(input)).toBe(expected);
    });

    it('only strips suffixes as whole trailing tokens, not substrings', () => {
      expect(service.normalizeCompanyName('Costco')).toBe('costco');
    });

    it('strips multiple trailing suffixes', () => {
      expect(service.normalizeCompanyName('Acme Technologies Inc.')).toBe('acme');
    });

    it('does not strip a suffix word used mid-name', () => {
      expect(service.normalizeCompanyName('Corp Systems')).toBe('corp systems');
    });
  });

  describe('normalizeRoleName', () => {
    it('normalizes casing and whitespace without merging distinct roles', () => {
      expect(service.normalizeRoleName('Software Engineer')).toBe('software engineer');
      expect(service.normalizeRoleName('  SOFTWARE   Engineer ')).toBe('software engineer');
      expect(service.normalizeRoleName('Backend Engineer')).not.toBe(
        service.normalizeRoleName('Software Engineer'),
      );
    });
  });

  describe('normalizeLocationPart', () => {
    it('normalizes text and treats missing values as empty string', () => {
      expect(service.normalizeLocationPart('Bangalore')).toBe('bangalore');
      expect(service.normalizeLocationPart(undefined)).toBe('');
      expect(service.normalizeLocationPart(null)).toBe('');
    });
  });

  describe('slugify', () => {
    it('produces url-safe slugs', () => {
      expect(service.slugify('Google')).toBe('google');
      expect(service.slugify('Google, Inc.')).toBe('google-inc');
      expect(service.slugify('  Multi   Word  ')).toBe('multi-word');
    });
  });
});
