#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script de diagnóstico de PostgreSQL
 * Uso: npm run db:diagnose
 */

const { Pool } = require('pg');
const fs = require('fs');

// Tentar ler .env.local
let DATABASE_URL = process.env.DATABASE_URL;

// Se não tiver, tenta padrão
if (!DATABASE_URL) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    const match = envContent.match(/DATABASE_URL=(.+)/);
    if (match) {
      DATABASE_URL = match[1].trim();
    }
  } catch (e) {
    // Arquivo pode não existir
  }
}

console.log('\n🔍 DIAGNÓSTICO DE POSTGRESQL\n');

// 1. Verificar se DATABASE_URL existe
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada em .env.local');
  console.log('\n📝 Instruções:');
  console.log('1. Copie o arquivo .env.local.example para .env.local');
  console.log('2. Configure DATABASE_URL conforme sua instância PostgreSQL');
  console.log('3. Execute novamente: node scripts/diagnose-postgres.js\n');
  process.exit(1);
}

console.log('✅ DATABASE_URL encontrada');
console.log(`   ${DATABASE_URL.replace(/:[^@]+@/, ':***@')}\n`);

// 2. Tentar conectar
const pool = new Pool({ connectionString: DATABASE_URL });

pool
  .query('SELECT NOW()')
  .then(() => {
    console.log('✅ Conexão PostgreSQL OK');
    console.log('   Database respondendo corretamente\n');
    
    // 3. Verificar se tabelas existem
    return pool.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
  })
  .then((result) => {
    const tableCount = parseInt(result.rows[0].table_count);
    
    if (tableCount === 0) {
      console.warn('⚠️  Nenhuma tabela encontrada');
      console.log('   Migrations ainda não foram executadas');
      console.log('   Execute: npm run db:migrate\n');
    } else {
      console.log(`✅ ${tableCount} tabelas encontradas`);
      console.log('   Database schema OK\n');
    }
    
    // 4. Listar tabelas
    return pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
  })
  .then((result) => {
    if (result.rows.length > 0) {
      console.log('📋 Tabelas presentes:');
      result.rows.forEach((row) => {
        console.log(`   • ${row.tablename}`);
      });
    }
    console.log('\n✅ DIAGNÓSTICO COMPLETO - Tudo OK!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar:');
    console.error(`   ${err.message}\n`);
    
    if (err.message.includes('password')) {
      console.log('💡 Dica: Verifique usuario:senha em DATABASE_URL');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.log('💡 Dica: PostgreSQL não está rodando?');
      console.log('   Windows: psql -U postgres');
      console.log('   macOS: brew services start postgresql');
      console.log('   Linux: sudo service postgresql start');
    } else if (err.message.includes('database')) {
      console.log('💡 Dica: Banco de dados não existe');
      console.log('   Execute: createdb gerinvest');
    }
    console.log('\n📖 Leia: docs/SETUP_POSTGRESQL.md\n');
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
