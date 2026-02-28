const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;

    const filter = { user: req.userId };
    if (type) {
      filter.$or = [{ type }, { type: 'both' }];
    }

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id/stats
// @desc    Get category statistics
// @access  Private
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();
    const dateFilter = {
      $gte: startDate
        ? new Date(startDate)
        : new Date(now.getFullYear(), now.getMonth(), 1),
      $lte: endDate
        ? new Date(endDate)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };

    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          category: req.params.id,
          date: dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' },
        },
      },
    ]);

    // Get monthly trend
    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          category: req.params.id,
          date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
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

    res.json({
      stats: stats[0] || { totalAmount: 0, count: 0, avgAmount: 0 },
      monthlyTrend,
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('type')
      .isIn(['income', 'expense', 'both'])
      .withMessage('Invalid category type'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, icon, color, type } = req.body;

      // Check if category already exists for user
      const existing = await Category.findOne({ user: req.userId, name });
      if (existing) {
        return res
          .status(400)
          .json({ message: 'Category with this name already exists' });
      }

      const category = new Category({
        user: req.userId,
        name,
        icon: icon || '📁',
        color: color || '#6c5ce7',
        type: type || 'expense',
      });

      await category.save();

      res.status(201).json({
        message: 'Category created successfully',
        category,
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, icon, color, type } = req.body;

    // Check if trying to rename to an existing category name
    if (name) {
      const existing = await Category.findOne({
        user: req.userId,
        name,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res
          .status(400)
          .json({ message: 'Category with this name already exists' });
      }
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { name, icon, color, type } },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.isDefault) {
      return res
        .status(400)
        .json({ message: 'Cannot delete default categories' });
    }

    // Check if category has transactions
    const transactionCount = await Transaction.countDocuments({
      user: req.userId,
      category: req.params.id,
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${transactionCount} transactions. Please reassign or delete transactions first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
