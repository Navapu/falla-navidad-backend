import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { env } from "../config.js";
import { createToken, publicUser } from "../utils.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const emailSchema = z.string().trim().email().max(160).transform((value) => value.toLowerCase());
const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: z.string().min(8).max(100),
  secretSanta: z.boolean().default(false),
  adminSetupKey: z.string().optional(),
});
const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(100) });

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Revisa los datos del registro", errors: parsed.error.flatten() });
  const exists = await User.exists({ email: parsed.data.email });
  if (parsed.data.email === env.adminEmail && (!env.adminSetupKey || parsed.data.adminSetupKey !== env.adminSetupKey)) {
    return res.status(403).json({ message: "Introduce la clave privada de creación del administrador" });
  }
  if (exists) return res.status(409).json({ message: "Ya existe una cuenta con ese correo" });
  const user = await User.create({
    ...parsed.data,
    passwordHash: await bcrypt.hash(parsed.data.password, 12),
    password: undefined,
    role: parsed.data.email === env.adminEmail ? "admin" : "user",
  });
  return res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Correo o contraseña no válidos" });
  const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ message: "Correo o contraseña incorrectos" });
  }
  if (user.email === env.adminEmail && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }
  return res.json({ token: createToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.auth!.userId);
  if (!user) return res.status(404).json({ message: "Cuenta no encontrada" });
  return res.json({ user: publicUser(user) });
});

router.patch("/me", requireAuth, async (req, res) => {
  const parsed = z.object({ secretSanta: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dato no válido" });
  const user = await User.findByIdAndUpdate(req.auth!.userId, parsed.data, { new: true });
  if (!user) return res.status(404).json({ message: "Cuenta no encontrada" });
  return res.json({ user: publicUser(user) });
});

export default router;
