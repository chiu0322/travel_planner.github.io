const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  time: String,
  notes: String,
  order: {
    type: Number,
    default: 0
  }
});

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  dayNumber: {
    type: Number,
    required: true
  },
  locations: [locationSchema],
  notes: String
});

const travelPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'My Travel Plan'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: [daySchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
travelPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
travelPlanSchema.index({ user: 1, createdAt: -1 });
travelPlanSchema.index({ user: 1, title: 'text' });

module.exports = mongoose.model('TravelPlan', travelPlanSchema); 