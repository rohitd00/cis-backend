-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "seniorityRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "city" TEXT,
    "normalizedCountry" TEXT NOT NULL,
    "normalizedRegion" TEXT NOT NULL DEFAULT '',
    "normalizedCity" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compensations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "baseSalary" DECIMAL(14,2) NOT NULL,
    "bonus" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "stock" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalCompensation" DECIMAL(14,2) NOT NULL,
    "experienceYears" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'synthetic',
    "sourceUrl" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compensations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_normalizedName_key" ON "companies"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_normalizedName_idx" ON "companies"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "roles_normalizedName_key" ON "roles"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE INDEX "roles_normalizedName_idx" ON "roles"("normalizedName");

-- CreateIndex
CREATE INDEX "levels_companyId_idx" ON "levels"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "levels_companyId_normalizedName_key" ON "levels"("companyId", "normalizedName");

-- CreateIndex
CREATE INDEX "locations_normalizedCountry_idx" ON "locations"("normalizedCountry");

-- CreateIndex
CREATE UNIQUE INDEX "locations_normalizedCountry_normalizedRegion_normalizedCity_key" ON "locations"("normalizedCountry", "normalizedRegion", "normalizedCity");

-- CreateIndex
CREATE UNIQUE INDEX "compensations_fingerprint_key" ON "compensations"("fingerprint");

-- CreateIndex
CREATE INDEX "compensations_companyId_idx" ON "compensations"("companyId");

-- CreateIndex
CREATE INDEX "compensations_roleId_idx" ON "compensations"("roleId");

-- CreateIndex
CREATE INDEX "compensations_levelId_idx" ON "compensations"("levelId");

-- CreateIndex
CREATE INDEX "compensations_locationId_idx" ON "compensations"("locationId");

-- CreateIndex
CREATE INDEX "compensations_currency_idx" ON "compensations"("currency");

-- CreateIndex
CREATE INDEX "compensations_totalCompensation_idx" ON "compensations"("totalCompensation");

-- CreateIndex
CREATE INDEX "compensations_baseSalary_idx" ON "compensations"("baseSalary");

-- CreateIndex
CREATE INDEX "compensations_companyId_roleId_levelId_locationId_idx" ON "compensations"("companyId", "roleId", "levelId", "locationId");

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensations" ADD CONSTRAINT "compensations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensations" ADD CONSTRAINT "compensations_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensations" ADD CONSTRAINT "compensations_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensations" ADD CONSTRAINT "compensations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
