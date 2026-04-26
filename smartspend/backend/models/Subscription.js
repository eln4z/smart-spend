const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    frequency: {
      type: String,
      required: true,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    billingDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    nextBillingDate: {
      type: Date,
    },
    icon: {
      type: String,
      default: '📦',
    },
    color: {
      type: String,
      default: '#6c5ce7',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate next billing date before saving
subscriptionSchema.pre('save', function (next) {
  if (!this.nextBillingDate) {
    const now = new Date();
    const nextDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      this.billingDay
    );
    if (nextDate <= now) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    this.nextBillingDate = nextDate;
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
