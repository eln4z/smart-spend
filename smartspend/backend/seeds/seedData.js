const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Subscription = require('../models/Subscription');

const defaultCategories = [
  {
    name: 'Salary',
    icon: '💰',
    color: '#2ecc71',
    type: 'income',
    isDefault: true,
  },
  {
    name: 'Freelance',
    icon: '💼',
    color: '#3498db',
    type: 'income',
    isDefault: true,
  },
  {
    name: 'Investments',
    icon: '📈',
    color: '#9b59b6',
    type: 'income',
    isDefault: true,
  },
  {
    name: 'Food & Dining',
    icon: '🍔',
    color: '#e74c3c',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Transportation',
    icon: '🚗',
    color: '#f39c12',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Shopping',
    icon: '🛒',
    color: '#e91e63',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Entertainment',
    icon: '🎬',
    color: '#9c27b0',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Bills & Utilities',
    icon: '📱',
    color: '#00bcd4',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Healthcare',
    icon: '🏥',
    color: '#4caf50',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Education',
    icon: '📚',
    color: '#ff9800',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Travel',
    icon: '✈️',
    color: '#03a9f4',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Subscriptions',
    icon: '📺',
    color: '#6c5ce7',
    type: 'expense',
    isDefault: true,
  },
  {
    name: 'Other',
    icon: '📁',
    color: '#95a5a6',
    type: 'both',
    isDefault: true,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/smartspend'
    );
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      Subscription.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create demo user
    const user = new User({
      name: 'Demo User',
      email: 'demo@smartspend.com',
      password: 'demo123',
      avatar: 'avatar1.png',
      currency: 'GBP',
      monthlyIncome: 3500,
    });
    await user.save();
    console.log('Created demo user');

    // Create categories
    const categories = await Category.insertMany(
      defaultCategories.map((cat) => ({ ...cat, user: user._id }))
    );
    console.log('Created categories');

    // Create category map for easy lookup
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Generate sample transactions for last 3 months
    const transactions = [];
    const now = new Date();

    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const month = new Date(
        now.getFullYear(),
        now.getMonth() - monthOffset,
        1
      );

      // Monthly income
      transactions.push({
        user: user._id,
        type: 'income',
        amount: 3500,
        category: categoryMap['Salary'],
        description: 'Monthly Salary',
        date: new Date(month.getFullYear(), month.getMonth(), 28),
      });

      // Random expenses
      const expenseData = [
        { category: 'Food & Dining', min: 200, max: 400, count: 15 },
        { category: 'Transportation', min: 50, max: 150, count: 8 },
        { category: 'Shopping', min: 30, max: 200, count: 5 },
        { category: 'Entertainment', min: 20, max: 80, count: 6 },
        { category: 'Bills & Utilities', min: 100, max: 200, count: 3 },
        { category: 'Healthcare', min: 20, max: 100, count: 2 },
        { category: 'Subscriptions', min: 10, max: 50, count: 4 },
      ];

      expenseData.forEach((exp) => {
        for (let i = 0; i < exp.count; i++) {
          const amount = Math.random() * (exp.max - exp.min) + exp.min;
          const day = Math.floor(Math.random() * 28) + 1;

          transactions.push({
            user: user._id,
            type: 'expense',
            amount: Math.round(amount * 100) / 100,
            category: categoryMap[exp.category],
            description: `${exp.category} expense`,
            date: new Date(month.getFullYear(), month.getMonth(), day),
          });
        }
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions`);

    // Create budgets
    const budgets = [
      {
        category: categoryMap['Food & Dining'],
        amount: 400,
        period: 'monthly',
        alertThreshold: 80,
      },
      {
        category: categoryMap['Transportation'],
        amount: 150,
        period: 'monthly',
        alertThreshold: 80,
      },
      {
        category: categoryMap['Shopping'],
        amount: 200,
        period: 'monthly',
        alertThreshold: 75,
      },
      {
        category: categoryMap['Entertainment'],
        amount: 100,
        period: 'monthly',
        alertThreshold: 80,
      },
      {
        category: categoryMap['Subscriptions'],
        amount: 80,
        period: 'monthly',
        alertThreshold: 90,
      },
    ].map((b) => ({ ...b, user: user._id }));

    await Budget.insertMany(budgets);
    console.log('Created budgets');

    // Create subscriptions
    const subscriptions = [
      {
        name: 'Netflix',
        amount: 15.99,
        icon: '🎬',
        color: '#e50914',
        billingDay: 15,
      },
      {
        name: 'Spotify',
        amount: 10.99,
        icon: '🎵',
        color: '#1db954',
        billingDay: 1,
      },
      {
        name: 'Amazon Prime',
        amount: 8.99,
        icon: '📦',
        color: '#ff9900',
        billingDay: 20,
      },
      {
        name: 'Gym Membership',
        amount: 29.99,
        icon: '💪',
        color: '#00bcd4',
        billingDay: 5,
      },
      {
        name: 'iCloud',
        amount: 2.99,
        icon: '☁️',
        color: '#3498db',
        billingDay: 10,
      },
    ].map((s) => ({
      ...s,
      user: user._id,
      category: categoryMap['Subscriptions'],
      frequency: 'monthly',
    }));

    await Subscription.insertMany(subscriptions);
    console.log('Created subscriptions');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Demo Login:');
    console.log('   Email: demo@smartspend.com');
    console.log('   Password: demo123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
