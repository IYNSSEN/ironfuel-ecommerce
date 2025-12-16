import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

export const meRoutes = Router();

meRoutes.get("/me", requireAuth, (req, res) => {
  return res.status(200).json(req.user);
});
