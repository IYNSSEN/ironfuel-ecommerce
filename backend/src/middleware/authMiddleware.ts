import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { verifyToken } from "../auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; login: string; role: "USER" | "ADMIN" };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = (req as any).cookies?.[config.cookieName];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
