# SmartSpend — Personal Finance Tracker

SmartSpend is a web-based personal finance tracker designed for students, helping them log expenses, track budgets, manage subscriptions, and forecast their end-of-month balance.

---

## Core Features Implemented

- **User Authentication** — Register and log in with email/password; sessions secured with JWT tokens
- **Onboarding Flow** — New users set their monthly income, preferred currency, an avatar, and initial budgets before reaching the dashboard
- **Dashboard** — Shows a financial health score (0–100), total spent this month, remaining budget, a spending pie chart, and live budget alerts
- **Transaction Management** — Add, view, edit, and delete income and expense transactions; each linked to a category with an icon and colour
- **Spending Breakdown** — Pie chart and weekly line chart visualising where money goes across all categories
- **Category Manager** — View all transactions grouped by category and re-assign any transaction to a different category
- **Budget Tracker** — Set a monthly spending limit per category; the dashboard alerts when a budget is close to or over the limit
- **Subscription Tracker** — Log recurring payments (Netflix, gym, etc.) with a billing day; the prediction page shows upcoming charges
- **Spending Predictor** — Forecasts your end-of-month balance based on your starting income, weekly spend, and upcoming subscriptions
- **Smart Tips** — A library of financial education articles tailored for students (budgeting rules, impulse spending, savings goals, etc.)
- **AI Budget Chatbot** — A built-in chatbot that answers questions about your own spending data (e.g. "How much did I spend this week?")
- **Profile Management** — Update name, email, date of birth, occupation, and choose from 10 illustrated avatars
- **Dark Mode** — Toggle between light and dark themes; preference saved across sessions

---

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | React 19, Vite, React Router v7, Chart.js |
| Backend    | Node.js, Express.js                       |
| Database   | MongoDB (Mongoose ODM)                    |
| Auth       | JWT (JSON Web Tokens), bcryptjs           |
| Validation | express-validator                         |

---

## Project Structure

```
smartspend/
├── backend/              # Express API server
│   ├── models/           # Mongoose schemas (User, Transaction, Category, Budget, Subscription)
│   ├── routes/           # REST API routes
│   ├── middleware/        # JWT auth middleware
│   ├── seeds/            # Demo data seeder
│   └── server.js         # Entry point
└── frontend/             # React + Vite app
    └── src/
        ├── pages/        # Dashboard, Breakdown, Categories, Prediction, SmartTips, Profile, Settings
        ├── components/   # Shared UI (Navbar, Layout, AlertsPanel, ChatBot, Card)
        ├── context/      # AuthContext, DataContext (global state)
        └── services/     # api.js — all HTTP calls to the backend
```

---

## Setup and Run Instructions

> **Prerequisites:** Node.js 18+, npm, and either MongoDB installed locally **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.

### 1. Clone the Repository

```bash
git clone <your-github-repo-url>
cd smartspend
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
MONGODB_URI=mongodb://localhost:27017/smartspend   # or your Atlas connection string
JWT_SECRET=replace_with_a_long_random_string
PORT=5001
NODE_ENV=development
```

> **Important:** The frontend's API client defaults to `http://localhost:5001/api`. Set `PORT=5001` in the backend `.env` to match, **or** set `VITE_API_URL=http://localhost:5000/api` in the frontend `.env` if you prefer port 5000.

Start the backend:

```bash
npm run dev     # development (auto-reload with nodemon)
# or
npm start       # production
```

You should see:

```
✅ Connected to MongoDB
🚀 Server running on port 5001
```

### 3. (Optional) Seed Demo Data

This creates a demo user account and sample transactions:

```bash
npm run seed
```

### 4. Set Up the Frontend

Open a **new terminal tab**:

```bash
cd frontend
npm install
```

Create a `.env` file:

```bash
# frontend/.env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Open your browser at **http://localhost:5173**

---

## Test Credentials (Demo Account)

After running the seed script (`npm run seed` in the backend folder), you can log in with:

| Field    | Value                 |
| -------- | --------------------- |
| Email    | `demo@smartspend.com` |
| Password | `demo123`             |

The demo account has pre-loaded transactions, budgets, and subscriptions so all features can be demonstrated immediately.

Alternatively, click **"Sign up"** on the login page to create your own account and go through the onboarding flow.

---

## How to Use the App

1. **Log in or register** at `/login`
2. **Complete onboarding** — enter your monthly income, pick a currency and avatar, and set initial budgets (new accounts only)
3. **Dashboard** — your financial overview; click "Add Transaction" to log a new expense
4. **Breakdown** — visualise spending by category and by week
5. **Categories** — re-assign transactions that were miscategorised
6. **Prediction** — adjust your weekly spend estimate; add/remove subscriptions to see your projected end-of-month balance
7. **Smart Tips** — browse financial education articles
8. **Chatbot** (floating button, bottom-right) — ask questions like "How much did I spend on food?" or "What's my biggest expense?"
9. **Profile** — update personal info and avatar
10. **Settings** — toggle dark mode and change currency

---

## Running Tests / Health Check

Once the backend is running, visit:

```
http://localhost:5001/api/health
```

Expected response:

```json
{ "status": "ok", "message": "SmartSpend API is running" }
```

---

## Known Limitations

- **No bank import** — transactions must be entered manually; there is no CSV import or open banking integration
- **Predictions are rule-based** — the forecast uses a linear extrapolation of current daily spending, not a trained machine learning model
- **No email notifications** — budget alerts appear only inside the app; there are no email or push notifications
- **Single currency per session** — currency is set at onboarding; switching it later updates the symbol but does not convert stored transaction amounts
- **No multi-user collaboration** — each account is fully isolated; there is no shared household budget feature
- **Chatbot is local only** — the chatbot answers using your own transaction data with keyword matching; it does not call an external AI API

---

## Dependencies

### Backend

| Package           | Purpose                       |
| ----------------- | ----------------------------- |
| express           | HTTP server framework         |
| mongoose          | MongoDB object modelling      |
| bcryptjs          | Password hashing              |
| jsonwebtoken      | JWT creation and verification |
| express-validator | Request input validation      |
| dotenv            | Environment variable loading  |
| cors              | Cross-origin request handling |
| nodemon _(dev)_   | Auto-restart on file changes  |

### Frontend

| Package                    | Purpose                   |
| -------------------------- | ------------------------- |
| react / react-dom          | UI library                |
| react-router-dom           | Client-side routing       |
| chart.js / react-chartjs-2 | Pie and line charts       |
| vite                       | Build tool and dev server |

---

## Final Commit

The final submitted version is tagged `v1.0-final` in the repository.

```bash
git show v1.0-final
```
