import express from "express";
import Chat from "../models/chatModel.js";

const router = express.Router();

router.get("/chats", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chats", error: err });
  }
});

export default router;
