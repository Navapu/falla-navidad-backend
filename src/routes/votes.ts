import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Vote } from "../models/Vote.js";
import { getConfig } from "../utils.js";

const router = Router();
const choiceSchema = z.enum(["none", "lunch", "dinner", "both"]);

router.get("/mine", requireAuth, async (req, res) => {
  const vote = await Vote.findOne({ user: req.auth!.userId });
  return res.json({ vote });
});

router.put("/mine", requireAuth, async (req, res) => {
  const config = await getConfig();
  if (Date.now() >= config.deadline.getTime()) {
    return res.status(403).json({ message: "La votación ya está cerrada" });
  }
  const schema = z.object({
    availability: z.array(z.object({ date: z.string(), choice: choiceSchema })),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Votación no válida" });
  const allowed = new Set(config.enabledDates);
  const uniqueDates = new Set(parsed.data.availability.map((item) => item.date));
  if (
    parsed.data.availability.length !== config.enabledDates.length ||
    uniqueDates.size !== config.enabledDates.length ||
    parsed.data.availability.some((item) => !allowed.has(item.date))
  ) {
    return res.status(400).json({ message: "Debes indicar tu disponibilidad para todos los días" });
  }
  const vote = await Vote.findOneAndUpdate(
    { user: req.auth!.userId },
    { availability: parsed.data.availability },
    { upsert: true, new: true, runValidators: true },
  );
  return res.json({ vote, message: "Disponibilidad guardada" });
});

export default router;
