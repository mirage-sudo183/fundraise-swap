/**
 * Database Connection (sql.js - Pure JavaScript SQLite)
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

const dbPath = process.env.DATABASE_PATH || './data/fundraise.db';

/**
 * Initialize sql.js and load or create database
 */
export async function initializeDb(): Promise<void> {
  if (db) return;

  // Initialize sql.js
  SQL = await initSqlJs();

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log(`[DB] Loaded existing database from ${dbPath}`);
  } else {
    db = new SQL.Database();
    console.log(`[DB] Created new database`);
  }

  // Run schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db!.run(schema);

  // Enable foreign keys
  db!.run('PRAGMA foreign_keys = ON');

  // Run seed data
  const seedPath = path.join(__dirname, 'seed.sql');
  if (fs.existsSync(seedPath)) {
    const seed = fs.readFileSync(seedPath, 'utf-8');
    db!.run(seed);
    console.log('[DB] Seed data applied');
  }

  // Save to disk
  saveDb();

  console.log('[DB] Schema initialized');
}

/**
 * Get database instance (must call initializeDb first)
 */
export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDb() first.');
  }
  return db;
}

/**
 * Save database to disk
 */
export function saveDb(): void {
  if (!db) return;

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

/**
 * Close database connection
 */
export function closeDb(): void {
  if (db) {
    saveDb();
    db.close();
    db = null;
    console.log('[DB] Connection closed');
  }
}

/**
 * Execute a query and return all results
 */
export function queryAll<T>(sql: string, params: any[] = []): T[] {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);

  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as T;
    results.push(row);
  }
  stmt.free();

  return results;
}

/**
 * Execute a query and return first result
 */
export function queryOne<T>(sql: string, params: any[] = []): T | undefined {
  const results = queryAll<T>(sql, params);
  return results[0];
}

/**
 * Execute a statement (INSERT, UPDATE, DELETE)
 */
export function execute(sql: string, params: any[] = []): void {
  getDb().run(sql, params);
  saveDb(); // Auto-save after writes
}
