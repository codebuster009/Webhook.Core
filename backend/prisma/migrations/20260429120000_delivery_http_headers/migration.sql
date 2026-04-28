-- AlterTable
ALTER TABLE "DeliveryAttempt" ADD COLUMN "requestHeaders" JSONB,
ADD COLUMN "responseHeaders" JSONB;
