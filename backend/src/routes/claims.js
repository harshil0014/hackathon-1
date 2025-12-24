const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const Claim = require('../models/Claim');

// proctor will review pending claims
router.get(
  '/proctor',
  requireAuth,
  requireRole(['proctor']),
  async (req, res) => {
    try {
      const claims = await Claim.find({
        status: 'PENDING',
      }).sort({ createdAt: -1 });

      res.json({ claims });
    } catch (err) {
      console.error('Failed to fetch claims');
      res.status(500).json({ message: 'Failed to fetch claims' });
    }
  }
);

// proctor approves or rejects a claim
router.patch(
  '/proctor/:claimId',
  requireAuth,
  requireRole(['proctor']),
  async (req, res) => {
    try {
      const { status, reviewRemarks } = req.body;

      if (!['APPROVED', 'REJECTED', 'ON_HOLD'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const updatedClaim = await Claim.findByIdAndUpdate(
        req.params.claimId,
        {
          status,
          reviewRemarks: reviewRemarks || '',
          reviewedBy: new mongoose.Types.ObjectId(req.user.id),
          reviewedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedClaim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      res.json({ claim: updatedClaim });
    } catch (err) {
      console.error('Failed to review claim');
      res.status(500).json({ message: 'Failed to review claim' });
    }
  }
);

// mentor views approved claims
router.get(
  '/mentor',
  requireAuth,
  requireRole(['mentor']),
  async (req, res) => {
    try {
      const mentorObjectId = new mongoose.Types.ObjectId(req.user.id);

      const claims = await Claim.find({
        mentorIds: { $in: [mentorObjectId] },
        status: 'APPROVED',
      }).sort({ createdAt: -1 });

      return res.json({ claims });
    } catch (error) {
      console.error('Failed to fetch mentor claims');
      return res.status(500).json({
        message: 'Failed to fetch mentor claims',
      });
    }
  }
);

module.exports = router;
