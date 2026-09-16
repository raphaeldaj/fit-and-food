ALTER TABLE "ActivityLog" RENAME COLUMN "userId" TO "userIdEnc";
ALTER TABLE "ActivityLog" ALTER COLUMN "userIdEnc" TYPE TEXT;