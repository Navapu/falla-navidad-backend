import "dotenv/config";

export const env = {
  mongoUri: process.env.MONGODB_URI ?? process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  adminSetupKey: process.env.ADMIN_SETUP_KEY ?? "",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminEmail: (process.env.ADMIN_EMAIL ?? "drojannp@gmail.com").toLowerCase(),
  port: Number(process.env.PORT ?? 3000),
};

export const DEFAULT_DATES = Array.from({ length: 19 }, (_, index) =>
  new Date(Date.UTC(2026, 11, 18 + index)).toISOString().slice(0, 10),
);
export const NEW_JANUARY_RANGE_DATES = DEFAULT_DATES.slice(13);

export const DEFAULT_DEADLINE = new Date("2026-12-11T22:59:00.000Z");
