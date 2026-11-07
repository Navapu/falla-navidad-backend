import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config.js";
import { connectDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";
import voteRoutes from "./routes/votes.js";
import resultRoutes from "./routes/results.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origen no permitido"));
  },
}));
app.use(express.json({ limit: "50kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }));
app.use(async (_req, _res, next) => {
  try { await connectDatabase(); next(); } catch (error) { next(error); }
});

app.use("/api", publicRoutes);
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => res.status(404).json({ message: "Ruta no encontrada" }));
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  const duplicate = error?.code === 11000;
  return res.status(duplicate ? 409 : 500).json({ message: duplicate ? "Ese dato ya existe" : "Ha ocurrido un error inesperado" });
});

export default app;
