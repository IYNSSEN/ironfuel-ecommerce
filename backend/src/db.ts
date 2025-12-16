import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "./config.js";

const dbPath = path.resolve(process.cwd(), config.dbFile);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function one<T>(sql: string, params: any[] = []): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}
export function all<T>(sql: string, params: any[] = []): T[] {
  return db.prepare(sql).all(...params) as T[];
}
export function run(sql: string, params: any[] = []) {
  return db.prepare(sql).run(...params);
}
