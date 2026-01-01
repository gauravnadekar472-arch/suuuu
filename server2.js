// ================= SERVER2.JS =================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔒 Check if API key exists
if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY missing! Set it in Render Environment Variables.");
  process.exit(1);
}

// ================= MIDDLEWARE =================
app.use(express.json());

// ✅ CORS for Netlify frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://ts-eagleai.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ================= ROOT =================
app.get("/", (req, res) => res.send("✅ EagleAI server running"));

// ================= CHAT API =================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ reply: "Message missing" });
    }

    console.log("📨 Sending message to OpenAI:", message);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are EagleAI, a helpful assistant. Do NOT repeat the user's message. Reply naturally and conversationally." },
          { role: "user", content: message }
        ],
        temperature: 0.5,
        max_tokens: 200
      })
    });

    const data = await response.json();

    if (!data?.choices?.length) {
      console.error("❌ OpenAI API returned empty choices:", data);
      return res.status(500).json({ reply: "AI failed to respond" });
    }

    const reply = data.choices[0].message?.content || "AI returned empty message";
    console.log("🤖 EagleAI reply:", reply);

    res.json({ reply });

  } catch (err) {
    console.error("❌ CHAT ERROR:", err);
    res.status(500).json({ reply: "Server error" });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => console.log(`🚀 EagleAI running on port ${PORT}`));
