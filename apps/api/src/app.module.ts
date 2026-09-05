import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { NormalizationModule } from './normalization/normalization.module';
import { CompensationModule } from './compensation/compensation.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { CompaniesModule } from './companies/companies.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        // Generous default for read-only endpoints; ingestion endpoints
        // override this with a stricter @Throttle() (see IngestionController
        // / CompensationController) since they are the more sensitive,
        // write-path routes per the spec.
        ttl: 60_000,
        limit: 300,
      },
    ]),
    PrismaModule,
    NormalizationModule,
    CompensationModule,
    IngestionModule,
    CompaniesModule,
    AnalyticsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
