import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  role: { type: String, enum: ["user", "bot"], default: "user" },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", chatSchema);
