import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Vote } from "../models/Vote.js";
import { User } from "../models/User.js";
import { getConfig } from "../utils.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const config = await getConfig();
  if (Date.now() < config.deadline.getTime() && req.auth!.role !== "admin") {
    return res.status(403).json({ message: "Los resultados estarán disponibles cuando termine la votación" });
  }
  const [votes, secretSantaCount] = await Promise.all([
    Vote.find().select("availability"),
    User.countDocuments({ secretSanta: true }),
  ]);
  const results = config.enabledDates.map((date: string) => {
    let lunch = 0;
    let dinner = 0;
    let both = 0;
    for (const vote of votes) {
      const choice = vote.availability.find((item: any) => item.date === date)?.choice;
      if (choice === "lunch" || choice === "both") lunch += 1;
      if (choice === "dinner" || choice === "both") dinner += 1;
      if (choice === "both") both += 1;
    }
    return { date, lunch, dinner, both, total: Math.max(lunch, dinner) };
  });
  return res.json({ results, totalVoters: votes.length, secretSantaCount });
});

export default router;
