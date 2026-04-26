# SmartSpend — Frontend

> **Final Year Computing Project** · Goldsmiths, University of London · 2025/26

**🌐 Live site:** [https://smartspend.chat](https://smartspend.chat)

A web-based personal finance tracker designed for students and young adults. SmartSpend helps users monitor spending, manage budgets, track subscriptions, and get AI-powered insights — all in one place.

---

## Features

- **Dashboard** — Financial health score, spending overview, AI pattern detection, and monthly insights
- **Breakdown** — Spending by category with pie charts, bar charts, and weekly trends
- **Prediction** — Projected end-of-month balance based on subscriptions and weekly spend
- **Categories** — Review and reassign automatically categorised transactions
- **Smart Tips** — Financial education articles tailored to your spending habits
- **Profile** — Set your monthly budget, income, and personalise your avatar
- **Settings** — Dark mode, import/export data, quick-add transactions

---

## Tech Stack

| Layer        | Technology                 |
| ------------ | -------------------------- |
| UI Framework | React 19                   |
| Build Tool   | Vite                       |
| Routing      | React Router v7            |
| Charts       | Chart.js + react-chartjs-2 |
| Deployment   | Vercel                     |

---

## Running Locally

### Prerequisites

- [Node.js 16+](https://nodejs.org/) installed
- The backend server running (see `backend/README.md`)

### Step 1 — Install dependencies

```bash
cd smartspend/frontend
npm install
```

### Step 2 — Configure environment variables

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5001/api
```

> If you want to use the live deployed API instead, set:
>
> ```env
> VITE_API_URL=https://smartspend-vt5x.onrender.com/api
> ```

### Step 3 — Start the development server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Demo account

If using the live API or after seeding local data:

| Field    | Value               |
| -------- | ------------------- |
| Email    | demo@smartspend.com |
| Password | demo123             |

---

## Project Structure

```
frontend/src/
├── pages/         # Route-level page components
├── components/    # Reusable UI components
├── context/       # Global state (Auth, Data)
├── services/      # API communication layer
└── assets/        # Images and static files
```

---

## Author

Elnaz Mohammadi — Student Reference: 33829729
