import jwt from "jsonwebtoken";
import { AppConfig } from "./models/AppConfig.js";
import { DEFAULT_DATES, DEFAULT_DEADLINE, env } from "./config.js";

export function publicUser(user: any) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    secretSanta: user.secretSanta,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function createToken(user: any) {
  return jwt.sign({ userId: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: "14d" });
}

export async function getConfig() {
  return AppConfig.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: { key: "main", deadline: DEFAULT_DEADLINE, enabledDates: DEFAULT_DATES } },
    { upsert: true, new: true },
  );
}
