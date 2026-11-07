import mongoose from "mongoose";
import { env } from "./config.js";

let connection: Promise<typeof mongoose> | null = null;

export function connectDatabase() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!env.mongoUri) throw new Error("Falta la variable MONGODB_URI");
  connection ??= mongoose.connect(env.mongoUri, { bufferCommands: false }).catch(error => { connection = null; throw error; });
  return connection;
}
