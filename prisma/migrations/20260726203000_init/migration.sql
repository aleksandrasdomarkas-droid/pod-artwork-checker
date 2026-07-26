CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "isOnline" BOOLEAN NOT NULL DEFAULT false,
  "scope" TEXT,
  "expires" TIMESTAMP(3),
  "accessToken" TEXT NOT NULL,
  "userId" BIGINT,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "accountOwner" BOOLEAN NOT NULL DEFAULT false,
  "locale" TEXT,
  "collaborator" BOOLEAN DEFAULT false,
  "emailVerified" BOOLEAN DEFAULT false,
  "refreshToken" TEXT,
  "refreshTokenExpires" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Session_shop_idx" ON "Session"("shop");

CREATE TABLE "Artwork" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "originalKey" TEXT NOT NULL,
  "processedKey" TEXT,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "bytes" INTEGER NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "hasAlpha" BOOLEAN NOT NULL,
  "score" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "report" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Artwork_shop_createdAt_idx" ON "Artwork"("shop", "createdAt");

CREATE TABLE "UsageEvent" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UsageEvent_shop_type_createdAt_idx" ON "UsageEvent"("shop", "type", "createdAt");
