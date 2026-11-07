import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Vote } from "../models/Vote.js";
import { AppConfig } from "../models/AppConfig.js";
import { getConfig, publicUser } from "../utils.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const voters = new Set((await Vote.find().select("user")).map((vote: any) => vote.user.toString()));
  return res.json({ users: users.map((user: any) => ({ ...publicUser(user), hasVoted: voters.has(user._id.toString()) })) });
});

router.delete("/users/:id", async (req, res) => {
  if (req.params.id === req.auth!.userId) return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "Cuenta no encontrada" });
  await Vote.deleteOne({ user: user._id });
  return res.json({ message: "Cuenta y voto eliminados" });
});

router.get("/config", async (_req, res) => res.json({ config: await getConfig() }));

router.put("/config", async (req, res) => {
  const parsed = z.object({
    deadline: z.coerce.date(),
    enabledDates: z.array(z.string().regex(/^2026-12-(1[89]|2\d|30)$/)).min(1).max(13),
  }).safeParse(req.body);
  if (!parsed.success || new Set(parsed.data?.enabledDates).size !== parsed.data?.enabledDates.length) {
    return res.status(400).json({ message: "Configuración no válida" });
  }
  const config = await AppConfig.findOneAndUpdate(
    { key: "main" },
    { ...parsed.data, key: "main" },
    { upsert: true, new: true, runValidators: true },
  );
  return res.json({ config, message: "Configuración actualizada" });
});

export default router;
