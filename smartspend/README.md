# SmartSpend — User Guide

> **Final Year Computing Project** · Goldsmiths, University of London · 2025/26  
> **Author:** Elnaz Mohammadi · Student Reference: 33829729

---

## What the Software Does

SmartSpend is a web-based personal finance tracker designed for students and young adults. It allows users to log income and expenses, monitor spending by category, track subscriptions, and receive AI-powered insights and financial tips — all through a clean, accessible browser interface.

---

## Live Deployment (Recommended — No Setup Required)

The easiest way to use SmartSpend is via the hosted version:

|                      |                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **Website**          | [https://smartspend.chat](https://smartspend.chat)                                                 |
| **API**              | [https://smartspend-vt5x.onrender.com/api](https://smartspend-vt5x.onrender.com/api)               |
| **API health check** | [https://smartspend-vt5x.onrender.com/api/health](https://smartspend-vt5x.onrender.com/api/health) |

> **Note:** The backend is hosted on Render's free tier, which spins down after inactivity. If the site takes 10–20 seconds to load on first visit, wait for the server to wake up and then refresh.

### Test / Demo Account

| Field    | Value                 |
| -------- | --------------------- |
| Email    | `demo@smartspend.com` |
| Password | `demo123`             |

This account is pre-loaded with realistic sample transactions across multiple categories, subscriptions, and spending history so all features can be explored immediately.

You can also register a new account using any email and password.

---

## Core Features Implemented

- **Dashboard** — Financial health score (0–100), spending overview cards, pie chart by category, recent transactions, AI pattern detection, monthly reflection, and personalised SmartTips recommendation
- **Add Expense** — Add a new expense transaction directly from the Dashboard with date, description, amount, and category
- **Breakdown** — Spending breakdown by category with pie chart, sortable table, and week-by-week bar chart
- **Prediction** — End-of-month balance forecast based on weekly spend and upcoming subscriptions; subscription management (add, toggle active, delete)
- **Categories** — View all transactions grouped by category; reassign categories per transaction
- **Smart Tips** — Six financial education articles covering budgeting, saving, the 50/30/20 rule, subscriptions, and more
- **Profile** — Set monthly budget, monthly income, bio, and choose an avatar
- **Settings** — Quick-add transaction, dark mode toggle, export transactions to CSV
- **Authentication** — Secure JWT-based register/login; all data is private per user
- **ChatBot** — Built-in assistant that answers questions about your spending data

---

## Running Locally

Follow these steps only if you want to run SmartSpend on your own machine instead of using the live site.

### Prerequisites

| Requirement | Version                            | Download                                           |
| ----------- | ---------------------------------- | -------------------------------------------------- |
| Node.js     | 18 or higher                       | [nodejs.org](https://nodejs.org/)                  |
| npm         | comes with Node.js                 | —                                                  |
| MongoDB     | Atlas (cloud) **or** local install | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

---

### Step 1 — Get the code

If you received the project as a ZIP, extract it. Otherwise clone from GitHub:

```bash
git clone https://github.com/eln4z/smart-spend.git
cd smart-spend/smartspend
```

---

### Step 2 — Set up the Backend

```bash
cd backend
npm install
```

Create a file called `.env` inside the `backend/` folder with the following content:

```env
MONGODB_URI=mongodb+srv://ellemo203_db_user:Elnaz2003@smartspend.ybzrmxl.mongodb.net/smartspend?retryWrites=true&w=majority
JWT_SECRET=smartspend_jwt_secret_2024
PORT=5001
NODE_ENV=development
```

> This uses the same MongoDB Atlas database as the live site. If you prefer a local MongoDB instance, replace `MONGODB_URI` with `mongodb://localhost:27017/smartspend` and run `node seeds/seedData.js` to populate it.

Start the backend server:

```bash
node server.js
```

You should see:

```
Server running on port 5001
✅ Connected to MongoDB
```

Leave this terminal running.

---

### Step 3 — Set up the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
```

Create a file called `.env` inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Open the URL shown in the terminal — usually **http://localhost:5173**

---

### Step 4 — Log in

Use the demo account or register a new one:

| Field    | Value                 |
| -------- | --------------------- |
| Email    | `demo@smartspend.com` |
| Password | `demo123`             |

---

## Dependencies

### Backend (`backend/package.json`)

| Package           | Purpose                       |
| ----------------- | ----------------------------- |
| express           | Web server framework          |
| mongoose          | MongoDB object modelling      |
| jsonwebtoken      | JWT authentication            |
| bcryptjs          | Password hashing              |
| express-validator | Request validation            |
| cors              | Cross-origin resource sharing |
| dotenv            | Environment variable loading  |

Install all with: `npm install` inside `backend/`

### Frontend (`frontend/package.json`)

| Package                    | Purpose                   |
| -------------------------- | ------------------------- |
| react / react-dom          | UI framework              |
| react-router-dom           | Client-side routing       |
| chart.js / react-chartjs-2 | Charts and visualisations |
| vite                       | Build tool and dev server |

Install all with: `npm install` inside `frontend/`

---

## Known Limitations

| Limitation                    | Detail                                                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cold start delay**          | The Render free tier spins down the backend after ~15 min of inactivity. First load may take 10–20 seconds. Refresh if the page appears blank. |
| **No real bank sync**         | Transactions must be entered manually or imported via CSV. There is no Open Banking / Plaid integration.                                       |
| **No push notifications**     | Subscription and budget alerts are shown inside the app only — no email or mobile push notifications.                                          |
| **No recurring transactions** | Transactions must be added individually; there is no automatic recurring entry system.                                                         |
| **No offline support**        | The app requires an internet connection to the backend API at all times.                                                                       |
| **Single currency**           | The app displays amounts in GBP (£) only. Currency conversion is not implemented.                                                              |
| **No multi-user sharing**     | Each account is fully isolated. Shared household budgets are not supported.                                                                    |
| **CSV import format**         | The import expects a specific CSV column order: `Date, Description, Amount, Category, Type`. Other formats will not parse correctly.           |

---

## Project Structure

```
smartspend/
├── backend/              # Node.js + Express API
│   ├── models/           # Mongoose schemas (User, Transaction, Category, Budget, Subscription)
│   ├── routes/           # REST API route handlers
│   ├── middleware/        # JWT auth middleware
│   ├── seeds/            # Demo data seed script
│   └── server.js         # Entry point
├── frontend/             # React + Vite app
│   └── src/
│       ├── pages/        # Route-level components (Dashboard, Breakdown, etc.)
│       ├── components/   # Reusable UI (Navbar, ChatBot, AlertsPanel)
│       ├── context/      # Global state (AuthContext, DataContext)
│       └── services/     # API communication layer
└── README.md             # This file
```
