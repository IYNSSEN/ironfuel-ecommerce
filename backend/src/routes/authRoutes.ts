import { Router } from "express";
import bcrypt from "bcryptjs";
import { config } from "../config.js";
import { one, run } from "../db.js";
import { signToken } from "../auth.js";
import { loginSchema, registerSchema } from "../validators.js";

export const authRoutes = Router();

authRoutes.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  const { login, password } = parsed.data;
  const exists = one<{ id: number }>("SELECT id FROM users WHERE login = ?", [login]);
  if (exists) return res.status(409).json({ message: "Login already exists" });

  const passwordHash = bcrypt.hashSync(password, 10);
  const r = run("INSERT INTO users(login, password_hash, role) VALUES (?, ?, 'USER')", [login, passwordHash]);
  return res.status(201).json({ id: Number(r.lastInsertRowid), login });
});

authRoutes.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  const { login, password } = parsed.data;
  const user = one<{ id: number; login: string; password_hash: string; role: "USER" | "ADMIN" }>(
    "SELECT id, login, password_hash, role FROM users WHERE login = ?",
    [login]
  );
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user.id, login: user.login, role: user.role });

  (res as any).cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(200).json({ id: user.id, login: user.login, role: user.role });
});

authRoutes.post("/logout", (_req, res) => {
  (res as any).clearCookie(config.cookieName, { path: "/" });
  return res.status(204).send();
});
