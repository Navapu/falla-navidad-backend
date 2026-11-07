import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";
import { User } from "../models/User.js";

type TokenPayload = { userId: string; role: "user" | "admin" };

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Debes iniciar sesión" });
  try {
    if (!env.jwtSecret) throw new Error("Falta JWT_SECRET");
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "Cuenta eliminada o sesión no válida" });
    req.auth = { userId: user._id.toString(), role: user.role };
    next();
  } catch {
    return res.status(401).json({ message: "Sesión no válida o caducada" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== "admin") return res.status(403).json({ message: "Acceso solo para administración" });
  next();
}
