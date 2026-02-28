const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      currency: user.currency,
      monthlyIncome: user.monthlyIncome,
      settings: user.settings,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  auth,
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('monthlyIncome')
      .optional()
      .isNumeric()
      .withMessage('Monthly income must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, avatar, currency, monthlyIncome } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;
      if (currency) updateData.currency = currency;
      if (monthlyIncome !== undefined) updateData.monthlyIncome = monthlyIncome;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updateData },
        { new: true }
      );

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          currency: user.currency,
          monthlyIncome: user.monthlyIncome,
          settings: user.settings,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const { theme, notifications, currency } = req.body;

    const updateData = {};
    if (theme) updateData['settings.theme'] = theme;
    if (notifications) {
      if (notifications.email !== undefined)
        updateData['settings.notifications.email'] = notifications.email;
      if (notifications.push !== undefined)
        updateData['settings.notifications.push'] = notifications.push;
      if (notifications.budgetAlerts !== undefined)
        updateData['settings.notifications.budgetAlerts'] =
          notifications.budgetAlerts;
      if (notifications.weeklyReport !== undefined)
        updateData['settings.notifications.weeklyReport'] =
          notifications.weeklyReport;
    }
    if (currency) updateData.currency = currency;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    );

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings,
      currency: user.currency,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    // Delete user and all related data
    const Transaction = require('../models/Transaction');
    const Category = require('../models/Category');
    const Budget = require('../models/Budget');
    const Subscription = require('../models/Subscription');

    await Promise.all([
      Transaction.deleteMany({ user: req.userId }),
      Category.deleteMany({ user: req.userId }),
      Budget.deleteMany({ user: req.userId }),
      Subscription.deleteMany({ user: req.userId }),
      User.findByIdAndDelete(req.userId),
    ]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
