import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/DATABASE_URL=(.+)/);
  if (match && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = match[1].trim();
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration006() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), 'migrations/006_add_unique_constraints.sql'), 'utf-8');
    
    console.log('🔄 Executando Migration 006 - Add UNIQUE Constraints...');
    await pool.query(sql);
    console.log('✅ Migration 006 executada com sucesso!');
    console.log('   ✓ Removidas carteiras duplicadas');
    console.log('   ✓ Removidos ativos duplicados');
    console.log('   ✓ Adicionado UNIQUE(nome) em carteiras');
    console.log('   ✓ Adicionado UNIQUE(ticker) em ativos');
    
  } catch (error: any) {
    console.error('❌ Erro na migration:', error.message);
    if (error.code) {
      console.error(`   Código de erro PostgreSQL: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration006();
