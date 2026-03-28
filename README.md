# ◈ AI Flow — MERN App

A full-stack MERN application where users type prompts into a **React Flow** node, get AI responses powered by **OpenRouter**, and save conversations to **MongoDB**.

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + React Flow (`@xyflow/react`) |
| Backend | Node.js + Express |
| Database | MongoDB (via Mongoose) |
| AI | OpenRouter API (`mistralai/mistral-7b-instruct:free`) |

---

## 📁 Project Structure

```
mern-ai-flow/
├── backend/
│   ├── server.js          # Express server
│   ├── .env.example       # Environment variables template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx                        # Main app with React Flow
    │   ├── components/
    │   │   ├── InputNode.jsx              # Prompt input node
    │   │   └── ResultNode.jsx             # AI response node
    │   ├── index.css                      # Global styles
    │   └── main.jsx                       # React entry point
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## ⚙️ Setup & Run Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free) → [cloud.mongodb.com](https://cloud.mongodb.com)
- OpenRouter account (free) → [openrouter.ai](https://openrouter.ai)

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/mern-ai-flow.git
cd mern-ai-flow
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mern-ai-flow?retryWrites=true&w=majority
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
SITE_URL=http://localhost:5173
```

> **Get your OpenRouter API Key:** Go to [openrouter.ai/keys](https://openrouter.ai/keys) → Create a free key.
> 
> **Get your MongoDB URI:** Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create a free cluster → Connect → Drivers → Copy the connection string.

Start the backend:

```bash
npm run dev      # development (with nodemon)
# or
npm start        # production
```

Backend runs on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

The default `.env` content:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🚀 Usage

1. Open **http://localhost:5173**
2. Type a question in the **Prompt Input** node (e.g., *"What is the capital of France?"*)
3. Click **▶ Run Flow** — the AI response will appear in the **AI Response** node
4. Click **⬇ Save** to save the prompt + response to MongoDB

---

## 🌐 Deployment

### Deploy Backend → [Render.com](https://render.com)

1. Push your repo to GitHub
2. Go to Render → **New Web Service** → connect your repo
3. Set **Root Directory** to `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add environment variables (same as `.env`) in Render's dashboard

### Deploy Frontend → [Vercel](https://vercel.com)

1. Go to Vercel → **New Project** → import repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_BACKEND_URL` = your Render backend URL (e.g., `https://mern-ai-flow.onrender.com`)
4. Deploy!

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/ask-ai` | Send prompt, get AI response |
| `POST` | `/api/save` | Save prompt + response to MongoDB |
| `GET` | `/api/history` | Fetch last 20 saved conversations |
| `GET` | `/` | Health check |

### Example: POST `/api/ask-ai`

**Request:**
```json
{ "prompt": "What is the capital of France?" }
```

**Response:**
```json
{ "response": "The capital of France is Paris." }
```

---

## 📜 License

MIT
