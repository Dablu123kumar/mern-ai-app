import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Schema ──────────────────────────────────────────
const conversationSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

// ─── API Routes ──────────────────────────────────────

// AI
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
        "HTTP-Referer": process.env.SITE_URL,
        "X-Title": "MERN AI Flow",
      },
      body: JSON.stringify({
        model: "google/gemma-3-4b-it:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await aiRes.json();

    if (!aiRes.ok) {
      console.error("OpenRouter error:", data);
      return res.status(500).json({ error: "AI API request failed.", details: data });
    }

    const answer = data.choices?.[0]?.message?.content || "No response from AI.";
    res.json({ response: answer });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Save
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

// History
app.get("/api/history", async (req, res) => {
  try {
    const history = await Conversation.find().sort({ createdAt: -1 }).limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

// Health (keep this)
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", message: "API running" })
);

// ─── SERVE FRONTEND ───────────────────────────────────
const __dirname = path.resolve();

// FIXED PATH for Render
const frontendPath = path.join(__dirname, "src/frontend/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ─── START SERVER ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});