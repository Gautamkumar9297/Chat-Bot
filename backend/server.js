import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Chat from "./models/chatModel.js";
import chatRoutes from "./routes/chatRoutes.js";
import { getGeminiReply } from "./geminiHelper.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST"],
}));
app.use(express.json());
app.use("/api", chatRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("chatMessage", async (data) => {
    try {
      const userChat = new Chat({
        user: data.user,
        message: data.message,
        role: "user",
      });
      await userChat.save();

const prompt = `You are S.C.U.R.O. - Smart Classroom Utilisation & Resource Optimisation Assistant.
Your role is to help administrators, faculty, and students with classroom and resource-related queries.

Provide clear, context-aware, and structured responses about:
- Classroom usage and real-time availability
- Scheduling conflicts and timetable adjustments
- Energy and resource optimisation (lights, AC, projectors, etc.)
- Booking or allocating rooms for lectures, events, or meetings
- Resource statistics, occupancy rates, and utilisation reports
- Maintenance requests or smart alerts

Keep responses concise, professional, and actionable.
If data is unavailable, explain how to find it or suggest next steps.
User: ${data.message}`;


      const reply = await getGeminiReply(prompt);

      const botChat = new Chat({
        user: "SHAMS Bot",
        message: reply,
        role: "bot",
      });
      await botChat.save();

      // ✅ Emit response to sender only
      socket.emit("botResponse", botChat);
      console.log("💬 Sent bot reply:", reply);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
