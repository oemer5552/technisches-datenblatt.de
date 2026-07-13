import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;
const globalDatabase = globalThis as unknown as { portalSql?: Sql; portalDb?: Database };

export function getSql(): Sql {
  if (globalDatabase.portalSql) return globalDatabase.portalSql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ist nicht konfiguriert");
  globalDatabase.portalSql = postgres(url, { max: Number(process.env.DB_POOL_SIZE || 10), idle_timeout: 20, connect_timeout: 15, prepare: false });
  return globalDatabase.portalSql;
}

export function getDb(): Database {
  if (!globalDatabase.portalDb) globalDatabase.portalDb = drizzle(getSql(), { schema });
  return globalDatabase.portalDb;
}

