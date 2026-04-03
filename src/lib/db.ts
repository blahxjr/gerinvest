import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Carregar .env.local se existir
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const match = content.match(/DATABASE_URL=(.+)/);
  if (match && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = match[1].trim();
  }
}

const globalForDb = globalThis as unknown as {
  pool?: Pool;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}