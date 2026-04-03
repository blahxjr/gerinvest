import { pool } from "../src/lib/db";
import { readdir, readFile } from "fs/promises";
import path from "path";

async function runMigrations() {
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log("Iniciando migrações em:", migrationsDir);
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    console.log(`> Executando: ${file}`);
    const sql = await readFile(filePath, "utf8");
    if (!sql.trim()) {
      console.log(`  - pula script vazio ${file}`);
      continue;
    }

    try {
      await pool.query(sql);
      console.log(`  - ok ${file}`);
    } catch (error) {
      console.error(`  - falha em ${file}:`, error);
      throw error;
    }
  }

  await pool.end();
  console.log("Migrações finalizadas com sucesso.");
}

runMigrations().catch((error) => {
  console.error("Erro de migração:", error);
  process.exit(1);
});
