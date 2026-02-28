const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

// Smart tip generators
const generateTips = async (userId) => {
  const tips = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get current month data
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

  // Get last month data for comparison
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // 1. Analyze spending patterns
  const [currentSpending, lastMonthSpending] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: currentMonthStart, $lte: currentMonthEnd },
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
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  // 2. Check for categories with significant increase
  currentSpending.forEach((curr) => {
    const lastMonth = lastMonthSpending.find(
      (l) => l._id.toString() === curr._id.toString()
    );
    if (lastMonth) {
      const increase = ((curr.total - lastMonth.total) / lastMonth.total) * 100;
      if (increase > 30) {
        tips.push({
          id: `spending-increase-${curr.category.name}`,
          type: 'warning',
          category: curr.category.name,
          icon: curr.category.icon,
          title: `${curr.category.name} spending is up ${Math.round(increase)}%`,
          description: `You've spent £${curr.total.toFixed(2)} on ${curr.category.name} this month, compared to £${lastMonth.total.toFixed(2)} last month.`,
          potentialSavings:
            Math.round((curr.total - lastMonth.total) * 100) / 100,
          action: `Try to reduce ${curr.category.name} spending to last month's level`,
          priority: increase > 50 ? 'high' : 'medium',
        });
      }
    }
  });

  // 3. Check budget status
  const budgets = await Budget.find({ user: userId, isActive: true }).populate(
    'category',
    'name icon'
  );

  for (const budget of budgets) {
    const spending = currentSpending.find(
      (s) => s._id.toString() === budget.category._id.toString()
    );
    if (spending) {
      const percentage = (spending.total / budget.amount) * 100;
      const daysLeft =
        new Date(currentYear, currentMonth + 1, 0).getDate() - now.getDate();

      if (percentage >= 90 && daysLeft > 7) {
        tips.push({
          id: `budget-warning-${budget.category.name}`,
          type: 'alert',
          category: budget.category.name,
          icon: budget.category.icon,
          title: `${budget.category.name} budget almost exhausted`,
          description: `You've used ${Math.round(percentage)}% of your £${budget.amount} budget with ${daysLeft} days left.`,
          potentialSavings: Math.round(budget.amount * 0.1 * 100) / 100,
          action: `Limit ${budget.category.name} spending for the rest of the month`,
          priority: 'high',
        });
      }
    }
  }

  // 4. Subscription analysis
  const subscriptions = await Subscription.find({
    user: userId,
    isActive: true,
  });
  const monthlySubCost = subscriptions.reduce((acc, sub) => {
    if (sub.frequency === 'monthly') return acc + sub.amount;
    if (sub.frequency === 'yearly') return acc + sub.amount / 12;
    if (sub.frequency === 'weekly') return acc + sub.amount * 4.33;
    return acc;
  }, 0);

  if (subscriptions.length > 5 && monthlySubCost > 100) {
    tips.push({
      id: 'subscription-review',
      type: 'insight',
      category: 'Subscriptions',
      icon: '📺',
      title: 'Review your subscriptions',
      description: `You have ${subscriptions.length} active subscriptions costing £${monthlySubCost.toFixed(2)}/month. Consider reviewing which ones you actually use.`,
      potentialSavings: Math.round(monthlySubCost * 0.2 * 100) / 100,
      action: 'Cancel unused subscriptions to save up to 20%',
      priority: 'medium',
    });
  }

  // 5. Frequent small transactions
  const smallTransactions = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        amount: { $lt: 10 },
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (smallTransactions.length > 0 && smallTransactions[0].count > 20) {
    tips.push({
      id: 'small-purchases',
      type: 'insight',
      category: 'General',
      icon: '💡',
      title: 'Watch your small purchases',
      description: `You've made ${smallTransactions[0].count} purchases under £10, totaling £${smallTransactions[0].total.toFixed(2)}. These add up quickly!`,
      potentialSavings:
        Math.round(smallTransactions[0].total * 0.3 * 100) / 100,
      action:
        'Try to batch small purchases or use the 24-hour rule before buying',
      priority: 'low',
    });
  }

  // 6. Weekend spending pattern
  const weekendSpending = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $addFields: {
        dayOfWeek: { $dayOfWeek: '$date' },
      },
    },
    {
      $group: {
        _id: { $in: ['$dayOfWeek', [1, 7]] }, // 1 = Sunday, 7 = Saturday
        total: { $sum: '$amount' },
      },
    },
  ]);

  const weekendTotal = weekendSpending.find((w) => w._id === true)?.total || 0;
  const weekdayTotal = weekendSpending.find((w) => w._id === false)?.total || 0;
  const totalSpending = weekendTotal + weekdayTotal;

  if (totalSpending > 0 && weekendTotal / totalSpending > 0.4) {
    tips.push({
      id: 'weekend-spending',
      type: 'insight',
      category: 'General',
      icon: '📅',
      title: 'Weekend spending is high',
      description: `${Math.round((weekendTotal / totalSpending) * 100)}% of your spending happens on weekends. Plan budget-friendly weekend activities.`,
      potentialSavings: Math.round(weekendTotal * 0.15 * 100) / 100,
      action: 'Set a weekend spending limit or plan free activities',
      priority: 'medium',
    });
  }

  // 7. Positive reinforcement
  const totalCurrentSpending = currentSpending.reduce(
    (acc, c) => acc + c.total,
    0
  );
  const totalLastMonthSpending = lastMonthSpending.reduce(
    (acc, l) => acc + l.total,
    0
  );

  if (
    totalLastMonthSpending > 0 &&
    totalCurrentSpending < totalLastMonthSpending * 0.9
  ) {
    const savings = totalLastMonthSpending - totalCurrentSpending;
    tips.push({
      id: 'great-progress',
      type: 'success',
      category: 'General',
      icon: '🎉',
      title: 'Great progress this month!',
      description: `You've spent ${Math.round((1 - totalCurrentSpending / totalLastMonthSpending) * 100)}% less than last month so far. Keep it up!`,
      potentialSavings: Math.round(savings * 100) / 100,
      action: 'Maintain your current spending habits',
      priority: 'low',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tips.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return tips;
};

// @route   GET /api/tips
// @desc    Get personalized smart tips
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tips = await generateTips(req.userId);

    const totalPotentialSavings = tips.reduce(
      (acc, tip) => acc + (tip.potentialSavings || 0),
      0
    );

    res.json({
      tips,
      summary: {
        totalTips: tips.length,
        highPriority: tips.filter((t) => t.priority === 'high').length,
        potentialMonthlySavings: Math.round(totalPotentialSavings * 100) / 100,
        potentialYearlySavings:
          Math.round(totalPotentialSavings * 12 * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tips/savings-goal
// @desc    Get savings goal recommendations
// @access  Private
router.get('/savings-goal', auth, async (req, res) => {
  try {
    const { targetAmount, targetMonths } = req.query;

    if (!targetAmount || !targetMonths) {
      return res
        .status(400)
        .json({ message: 'Target amount and months are required' });
    }

    const monthlyTarget = parseFloat(targetAmount) / parseInt(targetMonths);

    // Get average monthly spending
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Calculate averages
    const incomeMonths = monthlyData.filter((m) => m._id.type === 'income');
    const expenseMonths = monthlyData.filter((m) => m._id.type === 'expense');

    const avgIncome =
      incomeMonths.reduce((a, m) => a + m.total, 0) /
      Math.max(incomeMonths.length, 1);
    const avgExpense =
      expenseMonths.reduce((a, m) => a + m.total, 0) /
      Math.max(expenseMonths.length, 1);
    const currentSavings = avgIncome - avgExpense;

    const recommendations = [];

    if (currentSavings >= monthlyTarget) {
      recommendations.push({
        type: 'success',
        message: `Great news! Your current savings rate of £${currentSavings.toFixed(2)}/month already meets your goal.`,
      });
    } else {
      const gap = monthlyTarget - currentSavings;
      const gapPercentage = (gap / avgExpense) * 100;

      recommendations.push({
        type: 'info',
        message: `You need to save an additional £${gap.toFixed(2)}/month (${gapPercentage.toFixed(1)}% of current spending) to reach your goal.`,
      });

      // Get top spending categories for reduction suggestions
      const topCategories = await Transaction.aggregate([
        {
          $match: {
            user: req.userId,
            type: 'expense',
            date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
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
        { $limit: 3 },
      ]);

      topCategories.forEach((cat) => {
        const avgMonthly = cat.total / 6;
        const suggestedReduction = avgMonthly * 0.2;
        recommendations.push({
          type: 'suggestion',
          category: cat.category.name,
          icon: cat.category.icon,
          message: `Reduce ${cat.category.name} spending by 20% to save £${suggestedReduction.toFixed(2)}/month`,
        });
      });
    }

    res.json({
      goal: {
        targetAmount: parseFloat(targetAmount),
        targetMonths: parseInt(targetMonths),
        monthlyRequired: Math.round(monthlyTarget * 100) / 100,
      },
      current: {
        avgMonthlyIncome: Math.round(avgIncome * 100) / 100,
        avgMonthlyExpense: Math.round(avgExpense * 100) / 100,
        avgMonthlySavings: Math.round(currentSavings * 100) / 100,
      },
      feasible: currentSavings >= monthlyTarget * 0.8,
      recommendations,
    });
  } catch (error) {
    console.error('Get savings goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
