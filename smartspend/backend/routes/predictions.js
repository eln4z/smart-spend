const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/predictions/monthly
// @desc    Get monthly spending prediction
// @access  Private
router.get('/monthly', auth, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDay;

    // Get current month spending
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    const currentSpending = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: 'expense',
          date: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spentSoFar = currentSpending[0]?.total || 0;
    const dailyAverage = currentDay > 0 ? spentSoFar / currentDay : 0;

    // Get last 3 months for comparison
    const lastMonthsData = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: 'expense',
          date: {
            $gte: new Date(currentYear, currentMonth - 3, 1),
            $lt: currentMonthStart,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    const avgLastMonths =
      lastMonthsData.length > 0
        ? lastMonthsData.reduce((acc, m) => acc + m.total, 0) /
          lastMonthsData.length
        : dailyAverage * daysInMonth;

    // Get upcoming subscriptions for this month
    const subscriptions = await Subscription.find({
      user: req.userId,
      isActive: true,
      frequency: 'monthly',
    });

    const upcomingSubscriptionCost = subscriptions
      .filter((sub) => sub.billingDay > currentDay)
      .reduce((acc, sub) => acc + sub.amount, 0);

    // Calculate predictions
    const trendBasedPrediction = spentSoFar + dailyAverage * daysRemaining;
    const historicalPrediction = avgLastMonths;
    const subscriptionAdjustedPrediction =
      spentSoFar + dailyAverage * daysRemaining + upcomingSubscriptionCost;

    // Weighted prediction (60% trend, 30% historical, 10% subscriptions adjustment)
    const prediction =
      trendBasedPrediction * 0.6 +
      historicalPrediction * 0.3 +
      subscriptionAdjustedPrediction * 0.1;

    // Get current income
    const currentIncome = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: 'income',
          date: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const income = currentIncome[0]?.total || 0;

    res.json({
      currentMonth: {
        spent: Math.round(spentSoFar * 100) / 100,
        income: Math.round(income * 100) / 100,
        daysElapsed: currentDay,
        daysRemaining,
        dailyAverage: Math.round(dailyAverage * 100) / 100,
      },
      prediction: {
        estimated: Math.round(prediction * 100) / 100,
        trendBased: Math.round(trendBasedPrediction * 100) / 100,
        historicalBased: Math.round(historicalPrediction * 100) / 100,
        upcomingSubscriptions: Math.round(upcomingSubscriptionCost * 100) / 100,
      },
      comparison: {
        vsLastMonths: lastMonthsData.map((m) => ({
          month: m._id.month,
          year: m._id.year,
          total: Math.round(m.total * 100) / 100,
        })),
        averageLastMonths: Math.round(avgLastMonths * 100) / 100,
      },
      savingsOpportunity:
        income > 0 ? Math.round((income - prediction) * 100) / 100 : null,
    });
  } catch (error) {
    console.error('Get monthly prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/predictions/category
// @desc    Get category-wise spending predictions
// @access  Private
router.get('/category', auth, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get current month spending by category
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: 'expense',
          date: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { total: -1 } },
    ]);

    // Calculate predictions for each category
    const predictions = categorySpending.map((cat) => {
      const dailyAvg = currentDay > 0 ? cat.total / currentDay : 0;
      const predicted = dailyAvg * daysInMonth;

      return {
        category: {
          id: cat.category._id,
          name: cat.category.name,
          icon: cat.category.icon,
          color: cat.category.color,
        },
        spent: Math.round(cat.total * 100) / 100,
        transactionCount: cat.count,
        dailyAverage: Math.round(dailyAvg * 100) / 100,
        predictedTotal: Math.round(predicted * 100) / 100,
      };
    });

    res.json(predictions);
  } catch (error) {
    console.error('Get category predictions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/predictions/trends
// @desc    Get spending trends over time
// @access  Private
router.get('/trends', auth, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - parseInt(months) + 1,
      1
    );

    // Monthly spending trend
    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: 'expense',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Income trend
    const incomeTrend = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: 'income',
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Calculate savings trend
    const monthlyData = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    for (let i = 0; i < parseInt(months); i++) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (parseInt(months) - 1 - i),
        1
      );
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const expense = monthlyTrend.find(
        (m) => m._id.year === year && m._id.month === month
      );
      const income = incomeTrend.find(
        (m) => m._id.year === year && m._id.month === month
      );

      monthlyData.push({
        month: monthNames[date.getMonth()],
        year,
        expenses: expense?.total || 0,
        income: income?.total || 0,
        savings: (income?.total || 0) - (expense?.total || 0),
        transactionCount: expense?.count || 0,
      });
    }

    // Calculate overall trend direction
    const recentMonths = monthlyData.slice(-3);
    const previousMonths = monthlyData.slice(0, 3);
    const recentAvg =
      recentMonths.reduce((a, m) => a + m.expenses, 0) / recentMonths.length;
    const previousAvg =
      previousMonths.reduce((a, m) => a + m.expenses, 0) /
      previousMonths.length;

    const trendDirection =
      recentAvg > previousAvg
        ? 'increasing'
        : recentAvg < previousAvg
          ? 'decreasing'
          : 'stable';
    const trendPercentage =
      previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    res.json({
      monthlyData,
      trend: {
        direction: trendDirection,
        percentageChange: Math.round(trendPercentage * 10) / 10,
      },
      averages: {
        monthlyExpense:
          Math.round(
            (monthlyData.reduce((a, m) => a + m.expenses, 0) /
              monthlyData.length) *
              100
          ) / 100,
        monthlyIncome:
          Math.round(
            (monthlyData.reduce((a, m) => a + m.income, 0) /
              monthlyData.length) *
              100
          ) / 100,
        monthlySavings:
          Math.round(
            (monthlyData.reduce((a, m) => a + m.savings, 0) /
              monthlyData.length) *
              100
          ) / 100,
      },
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
