CREATE TABLE IF NOT EXISTS "LaboModelWorkspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspace" JSONB,
    "customCards" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaboModelWorkspace_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LaboModelWorkspace_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "LaboTrainingState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaboTrainingState_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LaboTrainingState_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "LaboTokenizerState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaboTokenizerState_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LaboTokenizerState_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "LaboPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LaboPreferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LaboPreferences_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "LaboModelWorkspace_userId_key" ON "LaboModelWorkspace"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "LaboTrainingState_userId_key" ON "LaboTrainingState"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "LaboTokenizerState_userId_key" ON "LaboTokenizerState"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "LaboPreferences_userId_key" ON "LaboPreferences"("userId");
