import { readFile } from "node:fs/promises";
import postgres from "postgres";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ist nicht konfiguriert");
const migration = await readFile(new URL("../drizzle/0000_initial.sql", import.meta.url), "utf8");
const db = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

try {
  await db.begin(async (transaction) => {
    await transaction.unsafe(migration).simple();
  });
  console.log("Database migration completed.");
} finally {
  await db.end();
}
