import { DuplicateDetectionService, FingerprintInput } from './duplicate-detection.service';

describe('DuplicateDetectionService', () => {
  const service = new DuplicateDetectionService();

  const base: FingerprintInput = {
    normalizedCompanyName: 'google',
    normalizedRoleName: 'software engineer',
    normalizedLevelName: 'l4',
    normalizedCountry: 'india',
    normalizedRegion: 'karnataka',
    normalizedCity: 'bangalore',
    currency: 'INR',
    baseSalary: '3500000',
    bonus: '500000',
    stock: '1000000',
    experienceYears: 3,
    source: 'synthetic',
  };

  it('produces the same fingerprint for identical normalized input', () => {
    expect(service.buildFingerprint(base)).toBe(service.buildFingerprint({ ...base }));
  });

  it('is insensitive to currency casing', () => {
    const a = service.buildFingerprint(base);
    const b = service.buildFingerprint({ ...base, currency: 'inr' });
    expect(a).toBe(b);
  });

  it('produces a different fingerprint when base salary differs', () => {
    const a = service.buildFingerprint(base);
    const b = service.buildFingerprint({ ...base, baseSalary: '3600000' });
    expect(a).not.toBe(b);
  });

  it('produces a different fingerprint when company differs', () => {
    const a = service.buildFingerprint(base);
    const b = service.buildFingerprint({ ...base, normalizedCompanyName: 'microsoft' });
    expect(a).not.toBe(b);
  });

  it('produces a different fingerprint when location differs', () => {
    const a = service.buildFingerprint(base);
    const b = service.buildFingerprint({ ...base, normalizedCity: 'pune' });
    expect(a).not.toBe(b);
  });
});
