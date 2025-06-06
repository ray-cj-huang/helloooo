-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('INBOX', 'TRASH', 'JUNK', 'DRAFT', 'ARCHIVE', 'SENT');

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'INBOX',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "labels" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Email_email_idx" ON "Email"("email");

-- CreateIndex
CREATE INDEX "Email_date_idx" ON "Email"("date");

-- CreateIndex
CREATE INDEX "Email_status_idx" ON "Email"("status");
