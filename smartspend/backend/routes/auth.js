const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Default categories to create for new users
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

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ message: 'User already exists with this email' });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
      });

      await user.save();

      // Create default categories for the user
      const categoryPromises = defaultCategories.map((cat) =>
        new Category({ ...cat, user: user._id }).save()
      );
      await Promise.all(categoryPromises);

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          currency: user.currency,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          currency: user.currency,
          settings: user.settings,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
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
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post(
  '/change-password',
  auth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.userId).select('+password');

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
