import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Vote } from "../models/Vote.js";
import { AppConfig } from "../models/AppConfig.js";
import { getConfig, publicUser } from "../utils.js";
import { DEFAULT_DATES } from "../config.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const votes = new Map((await Vote.find().select("user availability updatedAt")).map((vote: any) => [vote.user.toString(), vote]));
  return res.json({ users: users.map((user: any) => {
    const vote = votes.get(user._id.toString());
    return { ...publicUser(user), hasVoted: Boolean(vote), availability: vote?.availability ?? [], voteUpdatedAt: vote?.updatedAt ?? null };
  }) });
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
    enabledDates: z.array(z.string().refine(date => DEFAULT_DATES.includes(date))).min(1).max(DEFAULT_DATES.length),
  }).safeParse(req.body);
  if (!parsed.success || new Set(parsed.data?.enabledDates).size !== parsed.data?.enabledDates.length) {
    return res.status(400).json({ message: "Configuración no válida" });
  }
  const config = await AppConfig.findOneAndUpdate(
    { key: "main" },
    { ...parsed.data, enabledDates: [...parsed.data.enabledDates].sort(), key: "main", dateRangeVersion: 2 },
    { upsert: true, new: true, runValidators: true },
  );
  return res.json({ config, message: "Configuración actualizada" });
});

export default router;
