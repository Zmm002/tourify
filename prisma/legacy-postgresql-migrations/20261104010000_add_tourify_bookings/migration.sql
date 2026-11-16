CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');

CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "customerName" VARCHAR(100) NOT NULL,
    "customerEmail" VARCHAR(254) NOT NULL,
    "customerPhone" VARCHAR(30),
    "destinationSlug" VARCHAR(48) NOT NULL,
    "destinationName" VARCHAR(100) NOT NULL,
    "visitDate" TIMESTAMPTZ(3) NOT NULL,
    "ticketCount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "booking_code_key" ON "booking"("code");
CREATE INDEX "booking_ownerId_status_createdAt_idx" ON "booking"("ownerId", "status", "createdAt");
CREATE INDEX "booking_ownerId_visitDate_idx" ON "booking"("ownerId", "visitDate");

ALTER TABLE "booking" ADD CONSTRAINT "booking_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
