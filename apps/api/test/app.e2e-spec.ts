import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Compensation Intelligence API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const validRecord = {
    company: 'Google, Inc.',
    role: 'Software Engineer',
    level: 'L4',
    country: 'India',
    region: 'Karnataka',
    city: 'Bangalore',
    currency: 'INR',
    baseSalary: 3500000,
    bonus: 500000,
    stock: 1000000,
    experienceYears: 3,
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE compensations, levels, locations, roles, companies RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/compensation', () => {
    it('creates a record and calculates total compensation server-side', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send(validRecord)
        .expect(201);

      expect(res.body.data.totalCompensation).toBe('5000000');
      expect(res.body.data.company.slug).toBe('google');
    });

    it('defaults missing bonus and stock to 0', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send({
          company: 'Netflix',
          role: 'Data Scientist',
          level: 'Senior',
          country: 'United States',
          currency: 'USD',
          baseSalary: 180000,
        })
        .expect(201);

      expect(res.body.data.bonus).toBe('0');
      expect(res.body.data.stock).toBe('0');
      expect(res.body.data.totalCompensation).toBe('180000');
    });

    it('rejects a negative base salary', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send({ ...validRecord, baseSalary: -100 })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('rejects a missing company', async () => {
      const { company, ...rest } = validRecord;
      await request(app.getHttpServer()).post('/api/v1/compensation').send(rest).expect(400);
    });

    it('rejects an unsupported currency', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send({ ...validRecord, currency: 'XXX' })
        .expect(400);
    });

    it('rejects a client-supplied totalCompensation as an unknown field', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send({ ...validRecord, totalCompensation: 999999999 })
        .expect(400);
    });

    it('rejects an exact duplicate with 409', async () => {
      await request(app.getHttpServer()).post('/api/v1/compensation').send(validRecord).expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send({
          ...validRecord,
          company: 'GOOGLE',
          role: 'software engineer',
          level: 'l4',
        })
        .expect(409);
    });
  });

  describe('POST /api/v1/ingestion/compensation/bulk', () => {
    it('reports inserted/duplicates/rejected counts without aborting the batch', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ingestion/compensation/bulk')
        .send({
          records: [
            validRecord,
            { ...validRecord, company: 'GOOGLE' }, // duplicate of the above
            { company: '', role: '', level: '', country: '', currency: 'XXX', baseSalary: -1 }, // invalid
            { ...validRecord, company: 'Meta', baseSalary: 4000000 }, // valid, distinct
          ],
        })
        .expect(200);

      expect(res.body.total).toBe(4);
      expect(res.body.inserted).toBe(2);
      expect(res.body.duplicates).toBe(1);
      expect(res.body.rejected).toBe(1);
      expect(res.body.errors).toHaveLength(1);
    });
  });

  describe('GET /api/v1/compensation', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/api/v1/compensation').send(validRecord);
      await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send({ ...validRecord, company: 'Meta', baseSalary: 5000000, bonus: 0, stock: 0 });
    });

    it('filters by company at the database level', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/compensation')
        .query({ company: 'Google' })
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('sorts by totalCompensation', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/compensation')
        .query({ sort: 'totalCompensation', order: 'asc' })
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(Number(res.body.data[0].totalCompensation)).toBeLessThanOrEqual(
        Number(res.body.data[1].totalCompensation),
      );
    });

    it('rejects an unknown sort field instead of passing it through', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/compensation')
        .query({ sort: 'id; DROP TABLE compensations;' })
        .expect(400);
    });

    it('caps page size at the maximum', async () => {
      await request(app.getHttpServer()).get('/api/v1/compensation').query({ limit: 1000 }).expect(400);
    });
  });

  describe('GET /api/v1/companies/:slug', () => {
    it('returns 404 for an unknown company', async () => {
      await request(app.getHttpServer()).get('/api/v1/companies/does-not-exist').expect(404);
    });

    it('returns statistics broken out per currency, never blended', async () => {
      await request(app.getHttpServer()).post('/api/v1/compensation').send(validRecord);
      await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send({ ...validRecord, currency: 'USD', baseSalary: 200000, bonus: 0, stock: 0 });

      const res = await request(app.getHttpServer()).get('/api/v1/companies/google').expect(200);

      const currencies = res.body.data.statisticsByCurrency.map((s: { currency: string }) => s.currency);
      expect(currencies.sort()).toEqual(['INR', 'USD']);
    });
  });

  describe('GET /api/v1/analytics/overview', () => {
    it('returns aggregate counts', async () => {
      await request(app.getHttpServer()).post('/api/v1/compensation').send(validRecord);

      const res = await request(app.getHttpServer()).get('/api/v1/analytics/overview').expect(200);

      expect(res.body.data.totalCompanies).toBe(1);
      expect(res.body.data.totalCompensationRecords).toBe(1);
    });
  });

  describe('GET /api/v1/compare', () => {
    it('requires a currency and never mixes currencies across companies', async () => {
      await request(app.getHttpServer()).post('/api/v1/compensation').send(validRecord);
      await request(app.getHttpServer())
        .post('/api/v1/compensation')
        .send({ ...validRecord, company: 'Meta', currency: 'USD', baseSalary: 200000 });

      await request(app.getHttpServer())
        .get('/api/v1/compare')
        .query({ companySlugs: 'google,meta' })
        .expect(400); // currency is required

      const res = await request(app.getHttpServer())
        .get('/api/v1/compare')
        .query({ companySlugs: 'google,meta', currency: 'INR' })
        .expect(200);

      const meta = res.body.data.companies.find((c: { slug: string }) => c.slug === 'meta');
      expect(meta.sampleSize).toBe(0); // Meta's record is USD, not INR
    });
  });
});
