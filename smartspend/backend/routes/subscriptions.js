const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

// @route   GET /api/subscriptions
// @desc    Get all subscriptions for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { active } = req.query;

    const filter = { user: req.userId };
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const subscriptions = await Subscription.find(filter)
      .populate('category', 'name icon color')
      .sort({ nextBillingDate: 1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscriptions/summary
// @desc    Get subscription summary
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.userId,
      isActive: true,
    });

    let monthlyTotal = 0;
    let yearlyTotal = 0;

    subscriptions.forEach((sub) => {
      if (sub.frequency === 'weekly') {
        monthlyTotal += sub.amount * 4.33;
        yearlyTotal += sub.amount * 52;
      } else if (sub.frequency === 'monthly') {
        monthlyTotal += sub.amount;
        yearlyTotal += sub.amount * 12;
      } else if (sub.frequency === 'yearly') {
        monthlyTotal += sub.amount / 12;
        yearlyTotal += sub.amount;
      }
    });

    // Get upcoming subscriptions (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming = subscriptions
      .filter(
        (sub) => sub.nextBillingDate >= now && sub.nextBillingDate <= nextWeek
      )
      .map((sub) => ({
        id: sub._id,
        name: sub.name,
        amount: sub.amount,
        nextBillingDate: sub.nextBillingDate,
        daysUntil: Math.ceil(
          (sub.nextBillingDate - now) / (1000 * 60 * 60 * 24)
        ),
      }));

    res.json({
      count: subscriptions.length,
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      yearlyTotal: Math.round(yearlyTotal * 100) / 100,
      upcoming,
    });
  } catch (error) {
    console.error('Get subscription summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Get single subscription
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.userId,
    }).populate('category', 'name icon color');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('frequency')
      .isIn(['weekly', 'monthly', 'yearly'])
      .withMessage('Invalid frequency'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        amount,
        category,
        frequency,
        billingDay,
        icon,
        color,
        notes,
      } = req.body;

      const subscription = new Subscription({
        user: req.userId,
        name,
        amount,
        category,
        frequency: frequency || 'monthly',
        billingDay: billingDay || 1,
        icon: icon || '📦',
        color: color || '#6c5ce7',
        notes,
      });

      await subscription.save();

      if (category) {
        await subscription.populate('category', 'name icon color');
      }

      res.status(201).json({
        message: 'Subscription created successfully',
        subscription,
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription
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

      const subscription = await Subscription.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { $set: req.body },
        { new: true }
      ).populate('category', 'name icon color');

      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }

      res.json({
        message: 'Subscription updated successfully',
        subscription,
      });
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/subscriptions/:id/toggle
// @desc    Toggle subscription active status
// @access  Private
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.isActive = !subscription.isActive;
    await subscription.save();

    res.json({
      message: `Subscription ${subscription.isActive ? 'activated' : 'paused'} successfully`,
      subscription,
    });
  } catch (error) {
    console.error('Toggle subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Delete subscription
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
