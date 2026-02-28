const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   GET /api/budgets
// @desc    Get all budgets for user with current spending
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId }).populate(
      'category',
      'name icon color'
    );

    // Calculate current spending for each budget
    const now = new Date();
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        let startDate, endDate;

        if (budget.period === 'weekly') {
          const dayOfWeek = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - dayOfWeek);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
        } else if (budget.period === 'monthly') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
        } else if (budget.period === 'yearly') {
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        }

        const spending = await Transaction.aggregate([
          {
            $match: {
              user: req.userId,
              category: budget.category._id,
              type: 'expense',
              date: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]);

        const spent = spending[0]?.total || 0;
        const percentage =
          budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        const remaining = budget.amount - spent;

        return {
          ...budget.toObject(),
          spent,
          remaining,
          percentage: Math.round(percentage * 10) / 10,
          isOverBudget: spent > budget.amount,
          isNearLimit: percentage >= budget.alertThreshold && percentage < 100,
        };
      })
    );

    res.json(budgetsWithSpending);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/budgets/alerts
// @desc    Get budget alerts (near limit or over budget)
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.userId,
      isActive: true,
    }).populate('category', 'name icon color');

    const now = new Date();
    const alerts = [];

    for (const budget of budgets) {
      let startDate, endDate;

      if (budget.period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
      } else if (budget.period === 'weekly') {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      }

      const spending = await Transaction.aggregate([
        {
          $match: {
            user: req.userId,
            category: budget.category._id,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const spent = spending[0]?.total || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      if (percentage >= budget.alertThreshold) {
        alerts.push({
          budgetId: budget._id,
          category: budget.category,
          budgetAmount: budget.amount,
          spent,
          percentage: Math.round(percentage),
          type: percentage >= 100 ? 'exceeded' : 'warning',
          message:
            percentage >= 100
              ? `You've exceeded your ${budget.category.name} budget by £${(spent - budget.amount).toFixed(2)}`
              : `You've used ${Math.round(percentage)}% of your ${budget.category.name} budget`,
        });
      }
    }

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/budgets/:id
// @desc    Get single budget
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId,
    }).populate('category', 'name icon color');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/budgets
// @desc    Create new budget
// @access  Private
router.post(
  '/',
  auth,
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('period')
      .isIn(['weekly', 'monthly', 'yearly'])
      .withMessage('Invalid period'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { category, amount, period, alertThreshold } = req.body;

      // Check if budget already exists for this category
      const existing = await Budget.findOne({ user: req.userId, category });
      if (existing) {
        return res
          .status(400)
          .json({ message: 'Budget already exists for this category' });
      }

      const budget = new Budget({
        user: req.userId,
        category,
        amount,
        period: period || 'monthly',
        alertThreshold: alertThreshold || 80,
      });

      await budget.save();
      await budget.populate('category', 'name icon color');

      res.status(201).json({
        message: 'Budget created successfully',
        budget,
      });
    } catch (error) {
      console.error('Create budget error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put(
  '/:id',
  auth,
  [
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, period, alertThreshold, isActive } = req.body;

      const updateData = {};
      if (amount !== undefined) updateData.amount = amount;
      if (period) updateData.period = period;
      if (alertThreshold !== undefined)
        updateData.alertThreshold = alertThreshold;
      if (isActive !== undefined) updateData.isActive = isActive;

      const budget = await Budget.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { $set: updateData },
        { new: true }
      ).populate('category', 'name icon color');

      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }

      res.json({
        message: 'Budget updated successfully',
        budget,
      });
    } catch (error) {
      console.error('Update budget error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
