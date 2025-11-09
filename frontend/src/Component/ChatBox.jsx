import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "../style/chatbox.css";

const socket = io("http://localhost:5000");

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/chats")
      .then((res) => setChat(res.data))
      .catch((err) => console.error("Chat load error:", err));

    socket.on("botResponse", (data) => {
      console.log("📩 Bot message received:", data);
      setChat((prev) => [...prev, data]);
    });

    socket.on("connect", () => console.log("✅ Socket connected"));
    socket.on("disconnect", () => console.log("❌ Socket disconnected"));

    return () => socket.off("botResponse");
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg = { user: "Student", message, role: "user" };
    socket.emit("chatMessage", newMsg);
    setChat((prev) => [...prev, newMsg]);
    setMessage("");
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">🏫 SCURO - Smart Classroom Assistant</h2>
      <div className="chat-window">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === "bot" ? "bot" : "user"}`}
          >
            <strong>{msg.role === "bot" ? "Bot" : "You"}:</strong>{" "}
            {msg.message}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask your hostel question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
