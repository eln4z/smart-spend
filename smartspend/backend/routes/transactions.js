const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get all transactions for user (with filtering)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      limit = 50,
      page = 1,
      sort = '-date',
    } = req.query;

    // Build filter
    const filter = { user: req.userId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('category', 'name icon color')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/summary
// @desc    Get transaction summary (totals, by category, etc.)
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (period === 'month') {
      dateFilter = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
    } else if (period === 'year') {
      dateFilter = {
        $gte: new Date(now.getFullYear(), 0, 1),
        $lte: new Date(now.getFullYear(), 11, 31),
      };
    }

    // Get totals
    const totals = await Transaction.aggregate([
      { $match: { user: req.userId, date: dateFilter } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get by category
    const byCategory = await Transaction.aggregate([
      { $match: { user: req.userId, date: dateFilter, type: 'expense' } },
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

    // Get daily spending for chart
    const dailySpending = await Transaction.aggregate([
      { $match: { user: req.userId, date: dateFilter, type: 'expense' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const income = totals.find((t) => t._id === 'income')?.total || 0;
    const expenses = totals.find((t) => t._id === 'expense')?.total || 0;

    res.json({
      income,
      expenses,
      balance: income - expenses,
      transactionCount: totals.reduce((acc, t) => acc + t.count, 0),
      byCategory,
      dailySpending,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId,
    }).populate('category', 'name icon color');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post(
  '/',
  auth,
  [
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('category').notEmpty().withMessage('Category is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        type,
        amount,
        category,
        description,
        date,
        isRecurring,
        recurringFrequency,
        tags,
        notes,
      } = req.body;

      const transaction = new Transaction({
        user: req.userId,
        type,
        amount,
        category,
        description,
        date: date || new Date(),
        isRecurring,
        recurringFrequency,
        tags,
        notes,
      });

      await transaction.save();

      // Populate category before returning
      await transaction.populate('category', 'name icon color');

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction,
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put(
  '/:id',
  auth,
  [
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const transaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { $set: req.body },
        { new: true }
      ).populate('category', 'name icon color');

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({
        message: 'Transaction updated successfully',
        transaction,
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
