CREATE TABLE "destination" (
  "id" TEXT NOT NULL,
  "slug" VARCHAR(48) NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "area" VARCHAR(100) NOT NULL,
  "category" VARCHAR(60) NOT NULL,
  "description" VARCHAR(500) NOT NULL DEFAULT '',
  "price" INTEGER NOT NULL,
  "image" VARCHAR(500) NOT NULL DEFAULT '/tourify-coast-hero.png',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "destination_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "destination_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "destination_ownerId_slug_key" ON "destination"("ownerId", "slug");
CREATE INDEX "destination_ownerId_createdAt_idx" ON "destination"("ownerId", "createdAt");
