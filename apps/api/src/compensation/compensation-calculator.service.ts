import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Computes authoritative total compensation server-side.
 *
 * The client is never trusted to provide totalCompensation directly — the
 * DTO does not even accept such a field. All arithmetic uses Prisma.Decimal
 * (backed by decimal.js) rather than JS `number`, avoiding floating-point
 * rounding errors on monetary values.
 */
@Injectable()
export class CompensationCalculatorService {
  /**
   * Missing bonus/stock default to 0 (per spec) before summing.
   */
  calculateTotal(
    baseSalary: Prisma.Decimal | number | string,
    bonus?: Prisma.Decimal | number | string | null,
    stock?: Prisma.Decimal | number | string | null,
  ): Prisma.Decimal {
    const base = new Prisma.Decimal(baseSalary);
    const bonusAmount = new Prisma.Decimal(bonus ?? 0);
    const stockAmount = new Prisma.Decimal(stock ?? 0);

    return base.plus(bonusAmount).plus(stockAmount);
  }
}
