-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detection" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "aiScore" DOUBLE PRECISION NOT NULL,
    "perplexity" DOUBLE PRECISION NOT NULL,
    "burstiness" DOUBLE PRECISION NOT NULL,
    "ttr" DOUBLE PRECISION NOT NULL,
    "mtld" DOUBLE PRECISION,
    "vocd" DOUBLE PRECISION,
    "mlt" DOUBLE PRECISION,
    "dct" DOUBLE PRECISION,
    "fleschKincaid" DOUBLE PRECISION NOT NULL,
    "gunningFog" DOUBLE PRECISION NOT NULL,
    "lexicalSophistication" DOUBLE PRECISION,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Detection_userId_idx" ON "Detection"("userId");

-- CreateIndex
CREATE INDEX "Detection_createdAt_idx" ON "Detection"("createdAt");

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
