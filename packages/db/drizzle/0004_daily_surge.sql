ALTER TABLE "sessions"
ADD COLUMN "family_id" uuid;

UPDATE "sessions"
SET "family_id" = "id"
WHERE "family_id" IS NULL;

ALTER TABLE "sessions"
ALTER COLUMN "family_id" SET NOT NULL;