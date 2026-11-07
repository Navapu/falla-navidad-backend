import mongoose from "mongoose";
import { DEFAULT_DATES, DEFAULT_DEADLINE } from "../config.js";
const { Schema, model, models } = mongoose;

const appConfigSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    deadline: { type: Date, default: DEFAULT_DEADLINE },
    enabledDates: { type: [String], default: DEFAULT_DATES },
    dateRangeVersion: { type: Number, default: 2 },
  },
  { timestamps: true },
);

export const AppConfig = models.AppConfig ?? model("AppConfig", appConfigSchema);
