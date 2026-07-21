CREATE TABLE "LaboModelWorkspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspace" JSONB,
    "customCards" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaboModelWorkspace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LaboTrainingState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaboTrainingState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LaboTokenizerState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaboTokenizerState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LaboPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaboPreferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LaboModelWorkspace_userId_key" ON "LaboModelWorkspace"("userId");
CREATE UNIQUE INDEX "LaboTrainingState_userId_key" ON "LaboTrainingState"("userId");
CREATE UNIQUE INDEX "LaboTokenizerState_userId_key" ON "LaboTokenizerState"("userId");
CREATE UNIQUE INDEX "LaboPreferences_userId_key" ON "LaboPreferences"("userId");

ALTER TABLE "LaboModelWorkspace" ADD CONSTRAINT "LaboModelWorkspace_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaboTrainingState" ADD CONSTRAINT "LaboTrainingState_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaboTokenizerState" ADD CONSTRAINT "LaboTokenizerState_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaboPreferences" ADD CONSTRAINT "LaboPreferences_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
