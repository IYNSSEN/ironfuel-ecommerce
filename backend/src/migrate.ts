import fs from "node:fs";
import path from "node:path";
import { db, all, run } from "./db.js";

function ensureMigrationsTable() {
  run(`CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
}

export function migrate() {
  ensureMigrationsTable();
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
  const applied = new Set(all<{ filename: string }>("SELECT filename FROM migrations").map(r => r.filename));

  db.transaction(() => {
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      db.exec(sql);
      run("INSERT INTO migrations(filename) VALUES (?)", [file]);
    }
  })();
}
