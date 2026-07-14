import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey(),
  reference: text("reference").notNull(),
  accessTokenHash: text("access_token_hash").notNull(),
  locale: text("locale").notNull().default("de"),
  service: text("service").notNull().default("data"),
  status: text("status").notNull().default("eingegangen"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentProvider: text("payment_provider"),
  paymentReference: text("payment_reference"),
  priceCents: integer("price_cents").notNull().default(2499),
  currency: text("currency").notNull().default("eur"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  company: text("company"),
  vin: text("vin").notNull(),
  make: text("make"),
  model: text("model"),
  firstRegistration: text("first_registration"),
  originCountry: text("origin_country"),
  vinLocation: text("vin_location").notNull(),
  notes: text("notes"),
  vinPhysicallyChecked: boolean("vin_physically_checked").notNull().default(true),
  consentData: jsonb("consent_data").notNull().default({}),
  deliveryDueAt: timestamp("delivery_due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("orders_reference_unique").on(table.reference),
  index("orders_status_idx").on(table.status),
  index("orders_email_idx").on(table.customerEmail),
]);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  originalName: text("original_name").notNull(),
  objectKey: text("object_key").notNull(),
  mediaType: text("media_type").notNull(),
  size: integer("size").notNull(),
  sha256: text("sha256").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("documents_order_idx").on(table.orderId), uniqueIndex("documents_object_key_unique").on(table.objectKey)]);

export const orderEvents = pgTable("order_events", {
  id: uuid("id").primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  detail: jsonb("detail").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("order_events_order_idx").on(table.orderId, table.createdAt)]);
