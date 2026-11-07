import { Schema, model, models } from "mongoose";
import { DEFAULT_DATES, DEFAULT_DEADLINE } from "../config.js";

const appConfigSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    deadline: { type: Date, default: DEFAULT_DEADLINE },
    enabledDates: { type: [String], default: DEFAULT_DATES },
  },
  { timestamps: true },
);

export const AppConfig = models.AppConfig ?? model("AppConfig", appConfigSchema);
