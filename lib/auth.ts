import { compare, hash } from "bcryptjs";
import { pool } from "@/lib/db";

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashed: string) {
  return await compare(password, hashed);
}

export async function findUserByEmail(email: string) {
  const query = `SELECT id, name, email, password_hash, role, avatar_url FROM users WHERE email = $1`;
  const result = await pool.query(query, [email.toLowerCase()]);
  return result.rows[0] ?? null;
}

export async function createUser(name: string, email: string, password: string, role = "CLIENT", avatar_url: string | null = null) {
  const password_hash = await hashPassword(password);
  const query = `
    INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, name, email, role, avatar_url
  `;
  const result = await pool.query(query, [name, email.toLowerCase(), password_hash, role, avatar_url]);
  return result.rows[0];
}
