require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Schema ───────────────────────────────────────────────────────────────────
const conversationSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/ask-ai — send prompt to OpenRouter, return AI response
app.post("/api/ask-ai", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:5173",
        "X-Title": "MERN AI Flow",
      },
      body: JSON.stringify({
        model: "google/gemma-3-4b-it:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const errData = await aiRes.json();
      console.error("OpenRouter error:", errData);
      return res.status(500).json({ error: "AI API request failed.", details: errData });
    }

    const data = await aiRes.json();
    const answer = data.choices?.[0]?.message?.content || "No response from AI.";
    res.json({ response: answer });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/save — save prompt + response to MongoDB
app.post("/api/save", async (req, res) => {
  const { prompt, response } = req.body;

  if (!prompt || !response) {
    return res.status(400).json({ error: "Both prompt and response are required." });
  }

  try {
    const doc = new Conversation({ prompt, response });
    await doc.save();
    res.json({ success: true, id: doc._id });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Failed to save conversation." });
  }
});

// GET /api/history — get saved conversations
app.get("/api/history", async (req, res) => {
  try {
    const history = await Conversation.find().sort({ createdAt: -1 }).limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

// Health check
app.get("/", (req, res) => res.json({ status: "ok", message: "MERN AI Flow API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
