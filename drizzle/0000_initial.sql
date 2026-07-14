CREATE TABLE IF NOT EXISTS "orders" (
  "id" uuid PRIMARY KEY,
  "reference" text NOT NULL,
  "access_token_hash" text NOT NULL,
  "locale" text NOT NULL DEFAULT 'de',
  "service" text NOT NULL DEFAULT 'data',
  "status" text NOT NULL DEFAULT 'eingegangen',
  "payment_status" text NOT NULL DEFAULT 'pending',
  "payment_provider" text,
  "payment_reference" text,
  "price_cents" integer NOT NULL DEFAULT 2499,
  "currency" text NOT NULL DEFAULT 'eur',
  "customer_name" text NOT NULL,
  "customer_email" text NOT NULL,
  "customer_phone" text,
  "company" text,
  "vin" text NOT NULL,
  "make" text,
  "model" text,
  "first_registration" text,
  "origin_country" text,
  "vin_location" text NOT NULL,
  "notes" text,
  "vin_physically_checked" boolean NOT NULL DEFAULT true,
  "consent_data" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "delivery_due_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "orders_reference_unique" ON "orders" ("reference");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "orders_email_idx" ON "orders" ("customer_email");

-- Forward-compatible upgrade from the earlier portal prototype.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "locale" text NOT NULL DEFAULT 'de';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "vin_confirmed_by" text DEFAULT '';
ALTER TABLE "orders" ALTER COLUMN "service" SET DEFAULT 'data';
ALTER TABLE "orders" ALTER COLUMN "price_cents" SET DEFAULT 2499;
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'pending';
ALTER TABLE "orders" ALTER COLUMN "vin_confirmed_by" SET DEFAULT '';
UPDATE "orders" SET "payment_status" = 'pending' WHERE "payment_status" = 'unpaid';
UPDATE "orders" SET "payment_status" = 'paid' WHERE "payment_status" = 'demo_paid';

CREATE TABLE IF NOT EXISTS "documents" (
  "id" uuid PRIMARY KEY,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "kind" text NOT NULL,
  "original_name" text NOT NULL,
  "object_key" text NOT NULL,
  "media_type" text NOT NULL,
  "size" integer NOT NULL,
  "sha256" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "documents_order_idx" ON "documents" ("order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "documents_object_key_unique" ON "documents" ("object_key");

DO $$
BEGIN
  IF to_regclass('public.files') IS NOT NULL THEN
    INSERT INTO "documents" ("id", "order_id", "kind", "original_name", "object_key", "media_type", "size", "sha256", "created_at")
    SELECT "id", "order_id", "kind", "original_name", "object_key", "media_type", "size", "sha256", "created_at"
    FROM "files"
    ON CONFLICT ("object_key") DO NOTHING;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "order_events" (
  "id" uuid PRIMARY KEY,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "actor" text NOT NULL,
  "action" text NOT NULL,
  "detail" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "order_events_order_idx" ON "order_events" ("order_id", "created_at");
