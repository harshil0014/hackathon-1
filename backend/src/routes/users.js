// FILE: backend/routes/users.js

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');

/* ===================== PROFILE ===================== */

// Get my profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'name email role department year rollNo githubUrl linkedinUrl'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Failed to fetch profile', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update my profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const {
      name,
      department,
      year,
      rollNo,
      githubUrl,
      linkedinUrl,
    } = req.body;

    const updatePayload = {
      name,
      department,
      year,
      rollNo,
      githubUrl,
      linkedinUrl,
    };

    // Remove undefined fields (important)
    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updatePayload,
      { new: true }
    ).select('name email role department year rollNo githubUrl linkedinUrl');

    res.json({ user });
  } catch (err) {
    console.error('Failed to update profile', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
