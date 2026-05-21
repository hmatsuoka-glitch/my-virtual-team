import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

function createConnection(): Database.Database {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(path.join(dataDir, 'app.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 8000');

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      venue TEXT NOT NULL DEFAULT '',
      event_date TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 0,
      price_advance INTEGER NOT NULL DEFAULT 0,
      price_door INTEGER NOT NULL DEFAULT 0,
      bank_info TEXT NOT NULL DEFAULT '',
      is_invite_only INTEGER NOT NULL DEFAULT 0,
      invite_password TEXT NOT NULL DEFAULT '',
      images TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1,
      payment_type TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_event ON reservations(event_id);
  `);

  return db;
}

const globalForDb = globalThis as unknown as { __ebsDb?: Database.Database };

const db = globalForDb.__ebsDb ?? createConnection();
if (process.env.NODE_ENV !== 'production') {
  globalForDb.__ebsDb = db;
}

export default db;
