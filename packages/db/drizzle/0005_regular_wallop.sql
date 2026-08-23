ALTER TABLE "users"
ADD COLUMN "name" varchar(100);

UPDATE "users"
SET "name" = 'User'
WHERE "name" IS NULL;

ALTER TABLE "users"
ALTER COLUMN "name" SET NOT NULL;