# SmartSpend — Backend API

> **Final Year Computing Project**
> Goldsmiths, University of London · 2025/26

**🌐 Live site:** [https://smartspend.chat](https://smartspend.chat)  
**🔗 Live API:** [https://smartspend-vt5x.onrender.com/api](https://smartspend-vt5x.onrender.com/api)  
**🏥 Health check:** [https://smartspend-vt5x.onrender.com/api/health](https://smartspend-vt5x.onrender.com/api/health)

A RESTful Node.js + Express + MongoDB backend for the SmartSpend personal finance tracker.

## Features

- 🔐 **Authentication** — JWT-based registration and login with secure password hashing
- 💰 **Transactions** — Full CRUD for income and expense tracking
- 📂 **Categories** — Custom spending categories with icons and colours
- 📊 **Budgets** — Set and monitor category budgets with overspend alerts
- 🔄 **Subscriptions** — Track recurring monthly payments
- 📈 **Predictions** — Spending forecasts and trend analysis
- 💡 **Smart Tips** — Personalised financial advice based on spending data

---

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Runtime    | Node.js 18+                   |
| Framework  | Express.js                    |
| Database   | MongoDB (Atlas in production) |
| ODM        | Mongoose                      |
| Auth       | JWT (JSON Web Tokens)         |
| Validation | express-validator             |
| Security   | bcryptjs (password hashing)   |
| Deployment | Render                        |

---

## Running Locally

### Prerequisites

- [Node.js 18+](https://nodejs.org/) installed
- A [MongoDB Atlas](https://www.mongodb.com/atlas) free account **or** MongoDB installed locally

### Step 1 — Install dependencies

```bash
cd smartspend/backend
npm install
```

### Step 2 — Configure environment variables

Create a `.env` file in the `backend/` folder:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartspend
JWT_SECRET=your_secret_key_here
PORT=5001
NODE_ENV=development
```

> **Using MongoDB Atlas?** Create a free M0 cluster, add a database user, allow network access from `0.0.0.0/0`, and paste the connection string above.  
> **Using local MongoDB?** Set `MONGODB_URI=mongodb://localhost:27017/smartspend`

### Step 3 — Start the server

```bash
node server.js
```

The API will be available at `http://localhost:5001/api`.

### Step 4 — (Optional) Seed demo data

```bash
node seeds/seedData.js
```

This creates a demo account you can log in with:

| Field    | Value               |
| -------- | ------------------- |
| Email    | demo@smartspend.com |
| Password | demo123             |

---

## API Endpoints

### Authentication

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| POST   | `/api/auth/register`        | Register new user |
| POST   | `/api/auth/login`           | Login user        |
| GET    | `/api/auth/me`              | Get current user  |
| POST   | `/api/auth/change-password` | Change password   |

### Users

| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| GET    | `/api/users/profile`  | Get user profile |
| PUT    | `/api/users/profile`  | Update profile   |
| PUT    | `/api/users/settings` | Update settings  |
| DELETE | `/api/users/account`  | Delete account   |

### Transactions

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/api/transactions`         | Get all transactions   |
| GET    | `/api/transactions/summary` | Get spending summary   |
| GET    | `/api/transactions/:id`     | Get single transaction |
| POST   | `/api/transactions`         | Create transaction     |
| PUT    | `/api/transactions/:id`     | Update transaction     |
| DELETE | `/api/transactions/:id`     | Delete transaction     |

### Categories

| Method | Endpoint                    | Description         |
| ------ | --------------------------- | ------------------- |
| GET    | `/api/categories`           | Get all categories  |
| GET    | `/api/categories/:id`       | Get single category |
| GET    | `/api/categories/:id/stats` | Get category stats  |
| POST   | `/api/categories`           | Create category     |
| PUT    | `/api/categories/:id`       | Update category     |
| DELETE | `/api/categories/:id`       | Delete category     |

### Budgets

| Method | Endpoint              | Description                   |
| ------ | --------------------- | ----------------------------- |
| GET    | `/api/budgets`        | Get all budgets with spending |
| GET    | `/api/budgets/alerts` | Get budget alerts             |
| POST   | `/api/budgets`        | Create budget                 |
| PUT    | `/api/budgets/:id`    | Update budget                 |
| DELETE | `/api/budgets/:id`    | Delete budget                 |

### Subscriptions

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/api/subscriptions`            | Get all subscriptions    |
| GET    | `/api/subscriptions/summary`    | Get subscription summary |
| POST   | `/api/subscriptions`            | Create subscription      |
| PUT    | `/api/subscriptions/:id`        | Update subscription      |
| PUT    | `/api/subscriptions/:id/toggle` | Toggle active status     |
| DELETE | `/api/subscriptions/:id`        | Delete subscription      |

### Predictions

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/predictions/monthly`  | Get monthly prediction   |
| GET    | `/api/predictions/category` | Get category predictions |
| GET    | `/api/predictions/trends`   | Get spending trends      |

### Smart Tips

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/api/tips`              | Get personalized tips   |
| GET    | `/api/tips/savings-goal` | Get savings goal advice |

## Environment Variables

| Variable      | Description               | Default                                |
| ------------- | ------------------------- | -------------------------------------- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smartspend` |
| `JWT_SECRET`  | Secret for JWT signing    | -                                      |
| `PORT`        | Server port               | `5001`                                 |
| `NODE_ENV`    | Environment               | `development`                          |

## Project Structure

```
backend/
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── Transaction.js
│   ├── Category.js
│   ├── Budget.js
│   └── Subscription.js
├── routes/           # Express routes
│   ├── auth.js
│   ├── users.js
│   ├── transactions.js
│   ├── categories.js
│   ├── budgets.js
│   ├── subscriptions.js
│   ├── predictions.js
│   └── tips.js
├── middleware/       # Custom middleware
│   └── auth.js
├── seeds/            # Database seeding
│   └── seedData.js
├── server.js         # Entry point
├── package.json
└── .env
```

---

## Author

Elnaz Mohammadi — Student Reference: 33829729  
Goldsmiths, University of London · 2025/26
