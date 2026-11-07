import { Router } from "express";
import { Vote } from "../models/Vote.js";
import { getConfig } from "../utils.js";

const router = Router();

router.get("/config", async (_req, res) => {
  const [config, voterCount] = await Promise.all([getConfig(), Vote.countDocuments()]);
  const resultsAvailable = Date.now() >= config.deadline.getTime();
  return res.json({
    eventName: "Nadal Trifàsics 2026",
    commissionName: "Falla Maestro Bellver – Mariano Ribera",
    deadline: config.deadline,
    enabledDates: config.enabledDates,
    resultsAvailable,
    voterCount,
  });
});

router.get("/health", (_req, res) => res.json({ ok: true, service: "falla-navidad-backend" }));

export default router;
