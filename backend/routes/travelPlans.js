const express = require('express');
const { body, validationResult } = require('express-validator');
const TravelPlan = require('../models/TravelPlan');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/travel-plans
// @desc    Get all travel plans for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.$text = { $search: search };
    }

    const travelPlans = await TravelPlan.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await TravelPlan.countDocuments(query);

    res.json({
      success: true,
      data: {
        travelPlans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get travel plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching travel plans'
    });
  }
});

// @route   GET /api/travel-plans/:id
// @desc    Get a specific travel plan
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const travelPlan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    res.json({
      success: true,
      data: {
        travelPlan
      }
    });
  } catch (error) {
    console.error('Get travel plan error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel plan ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching travel plan'
    });
  }
});

// @route   POST /api/travel-plans
// @desc    Create a new travel plan
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('days').optional().isArray().withMessage('Days must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, startDate, endDate, days, description, tags } = req.body;

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const travelPlan = new TravelPlan({
      title,
      user: req.user._id,
      startDate,
      endDate,
      days: days || [],
      description,
      tags
    });

    await travelPlan.save();

    res.status(201).json({
      success: true,
      message: 'Travel plan created successfully',
      data: {
        travelPlan
      }
    });
  } catch (error) {
    console.error('Create travel plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating travel plan'
    });
  }
});

// @route   PUT /api/travel-plans/:id
// @desc    Update a travel plan
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('days').optional().isArray().withMessage('Days must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, startDate, endDate, days, description, tags } = req.body;

    // Find the travel plan
    const travelPlan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    // Validate date range if both dates are provided
    const newStartDate = startDate || travelPlan.startDate;
    const newEndDate = endDate || travelPlan.endDate;
    
    if (new Date(newStartDate) >= new Date(newEndDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Update fields
    if (title !== undefined) travelPlan.title = title;
    if (startDate !== undefined) travelPlan.startDate = startDate;
    if (endDate !== undefined) travelPlan.endDate = endDate;
    if (days !== undefined) travelPlan.days = days;
    if (description !== undefined) travelPlan.description = description;
    if (tags !== undefined) travelPlan.tags = tags;

    await travelPlan.save();

    res.json({
      success: true,
      message: 'Travel plan updated successfully',
      data: {
        travelPlan
      }
    });
  } catch (error) {
    console.error('Update travel plan error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel plan ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating travel plan'
    });
  }
});

// @route   DELETE /api/travel-plans/:id
// @desc    Delete a travel plan
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const travelPlan = await TravelPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Travel plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete travel plan error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel plan ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting travel plan'
    });
  }
});

// @route   POST /api/travel-plans/:id/days
// @desc    Add a day to a travel plan
// @access  Private
router.post('/:id/days', [
  auth,
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('dayNumber').isInt({ min: 1 }).withMessage('Day number must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { date, dayNumber, locations = [], notes } = req.body;

    const travelPlan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    // Check if day already exists
    const existingDay = travelPlan.days.find(day => day.dayNumber === dayNumber);
    if (existingDay) {
      return res.status(400).json({
        success: false,
        message: 'Day already exists'
      });
    }

    travelPlan.days.push({
      date,
      dayNumber,
      locations,
      notes
    });

    await travelPlan.save();

    res.status(201).json({
      success: true,
      message: 'Day added successfully',
      data: {
        travelPlan
      }
    });
  } catch (error) {
    console.error('Add day error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding day'
    });
  }
});

module.exports = router; 