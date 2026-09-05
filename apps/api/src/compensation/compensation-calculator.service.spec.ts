import { CompensationCalculatorService } from './compensation-calculator.service';

describe('CompensationCalculatorService', () => {
  const service = new CompensationCalculatorService();

  it('sums base + bonus + stock', () => {
    const total = service.calculateTotal(3_000_000, 500_000, 1_000_000);
    expect(total.toNumber()).toBe(4_500_000);
  });

  it('defaults missing bonus to 0', () => {
    const total = service.calculateTotal(3_000_000, undefined, 500_000);
    expect(total.toNumber()).toBe(3_500_000);
  });

  it('defaults missing stock to 0', () => {
    const total = service.calculateTotal(3_000_000, 500_000, undefined);
    expect(total.toNumber()).toBe(3_500_000);
  });

  it('defaults both missing bonus and stock to 0', () => {
    const total = service.calculateTotal(3_000_000);
    expect(total.toNumber()).toBe(3_000_000);
  });

  it('treats null the same as missing', () => {
    const total = service.calculateTotal(3_000_000, null, null);
    expect(total.toNumber()).toBe(3_000_000);
  });

  it('avoids floating point drift on decimal values', () => {
    const total = service.calculateTotal('30000.10', '0.20', '0.05');
    expect(total.toString()).toBe('30000.35');
  });
});
