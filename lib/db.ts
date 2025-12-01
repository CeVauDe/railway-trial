import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'db.sqlite')

// Ensure the directory exists
const dbDir = path.dirname(DB_PATH)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(DB_PATH)

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

export interface Entry {
  id: number
  text: string
  created_at: string
}

export function getLatestEntries(limit = 10): Entry[] {
  const stmt = db.prepare('SELECT id, text, created_at FROM entries ORDER BY created_at DESC LIMIT ?')
  return stmt.all(limit) as Entry[]
}

export function createEntry(text: string): Entry {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > 280) {
    throw new Error('Text must be between 1 and 280 characters')
  }

  const stmt = db.prepare('INSERT INTO entries (text) VALUES (?)')
  const info = stmt.run(trimmed)
  
  const getStmt = db.prepare('SELECT id, text, created_at FROM entries WHERE id = ?')
  return getStmt.get(info.lastInsertRowid) as Entry
}

export default db
