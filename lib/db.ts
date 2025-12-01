import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

// Use Railway's mounted volume, fallback to temp directory, then current dir
const DB_PATH = process.env.SQLITE_DB_PATH || path.join(os.tmpdir(), 'db.sqlite')

let db: Database.Database | null = null

function initDb() {
  if (db) return db

  console.log('[DB] Initializing database at:', DB_PATH)
  console.log('[DB] Volume mount exists:', fs.existsSync(path.dirname(DB_PATH)))

  // Ensure the directory exists
  const dbDir = path.dirname(DB_PATH)
  try {
    if (!fs.existsSync(dbDir)) {
      console.log('[DB] Creating directory:', dbDir)
      fs.mkdirSync(dbDir, { recursive: true })
    }
  } catch (err) {
    console.error('[DB] Failed to create directory:', dbDir, err)
    throw new Error(`Cannot create database directory: ${dbDir}`)
  }

  try {
    db = new Database(DB_PATH)
    console.log('[DB] Database opened successfully')

    // Enable WAL mode for better concurrency (optional but recommended)
    db.pragma('journal_mode = WAL')

    // Create table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL CHECK(length(text) > 0 AND length(text) <= 280),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('[DB] Table initialized')
  } catch (err) {
    console.error('[DB] Failed to open database:', err)
    throw err
  }

  return db
}

export interface Entry {
  id: number
  text: string
  created_at: string
}

export function getLatestEntries(limit = 10): Entry[] {
  const database = initDb()
  const stmt = database.prepare('SELECT id, text, created_at FROM entries ORDER BY created_at DESC LIMIT ?')
  return stmt.all(limit) as Entry[]
}

export function createEntry(text: string): Entry {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > 280) {
    throw new Error('Text must be between 1 and 280 characters')
  }

  const database = initDb()
  const stmt = database.prepare('INSERT INTO entries (text) VALUES (?)')
  const info = stmt.run(trimmed)
  
  const getStmt = database.prepare('SELECT id, text, created_at FROM entries WHERE id = ?')
  return getStmt.get(info.lastInsertRowid) as Entry
}

export function getDb() {
  return initDb()
}
