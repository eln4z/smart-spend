# SmartSpend Backend API

A Node.js + Express + MongoDB backend for the SmartSpend personal finance tracker.

## Features

- 🔐 **Authentication** - JWT-based user registration and login
- 💰 **Transactions** - Full CRUD for income/expense tracking
- 📂 **Categories** - Custom spending categories with icons and colors
- 📊 **Budgets** - Set and track category budgets with alerts
- 🔄 **Subscriptions** - Track recurring payments
- 📈 **Predictions** - AI-powered spending forecasts
- 💡 **Smart Tips** - Personalized savings recommendations

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** express-validator
- **Security:** bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or a MongoDB Atlas account

### Installation

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. Start the server:

   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

4. (Optional) Seed demo data:
   ```bash
   npm run seed
   ```

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

## Demo Account

After running the seed script:

- **Email:** demo@smartspend.com
- **Password:** demo123

## Environment Variables

| Variable      | Description               | Default                                |
| ------------- | ------------------------- | -------------------------------------- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smartspend` |
| `JWT_SECRET`  | Secret for JWT signing    | -                                      |
| `PORT`        | Server port               | `5000`                                 |
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

## License

ISC
