import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const availabilitySchema = new Schema(
  {
    date: { type: String, required: true },
    choice: { type: String, enum: ["none", "lunch", "dinner", "both"], required: true },
  },
  { _id: false },
);

const voteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    availability: { type: [availabilitySchema], required: true },
  },
  { timestamps: true },
);

export const Vote = models.Vote ?? model("Vote", voteSchema);
