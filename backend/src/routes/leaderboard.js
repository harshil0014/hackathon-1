// FILE: backend/routes/leaderboard.js

const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middleware/requireAuth');
const Claim = require('../models/Claim');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /leaderboard/me/mentors
 * Returns unique mentorIds for logged-in student (approved claims only)
 */
router.get('/me/mentors', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.json({ mentorIds: [] });
    }

    const claims = await Claim.find({
      studentId: req.user.id,
      status: 'APPROVED',
    }).select('mentorIds');

    const mentorSet = new Set();

    claims.forEach((c) => {
      (c.mentorIds || []).forEach((m) =>
        mentorSet.add(m.toString())
      );
    });

    return res.json({
      mentorIds: Array.from(mentorSet),
    });
  } catch (err) {
    console.error('[MY MENTORS ERROR]', err);
    res.status(500).json({ message: 'Failed to load mentors' });
  }
});

/**
 * GET /leaderboard
 * Query params:
 *  - department
 *  - year
 *  - commonMentors (number)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { department, year, commonMentors } = req.query;
    const viewerId = req.user.id;
    const viewerRole = req.user.role;

    // 1️⃣ Aggregate approved claims
    const raw = await Claim.aggregate([
      {
        $match: {
          status: 'APPROVED',
          reviewedAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$studentId',
          approvedCount: { $sum: 1 },
          latestApprovedAt: { $max: '$reviewedAt' },
          mentorSets: { $push: '$mentorIds' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
    ]);

    // 2️⃣ Normalize mentor list + apply filters
    let leaderboard = raw.map((entry) => {
      const flatMentors = [
        ...new Set(entry.mentorSets.flat().map((id) => id.toString())),
      ];

      return {
        studentId: entry._id.toString(),
        name: entry.student.name,
        email: entry.student.email,
        department: entry.student.department,
        year: entry.student.year,
        approvedCount: entry.approvedCount,
        latestApprovedAt: entry.latestApprovedAt,
        mentorIds: flatMentors,
      };
    });

    // Filter: department
    if (department) {
      leaderboard = leaderboard.filter(
        (s) => s.department === department
      );
    }

    // Filter: year
    if (year) {
      leaderboard = leaderboard.filter(
        (s) => String(s.year) === String(year)
      );
    }

    // Filter: common mentors (only meaningful for students)
    if (commonMentors && viewerRole === 'student') {
      const viewerMentors = new Set();

      raw
        .filter((r) => r._id.toString() === viewerId)
        .forEach((r) => {
          r.mentorSets.flat().forEach((m) =>
            viewerMentors.add(m.toString())
          );
        });

      leaderboard = leaderboard.filter((s) => {
        const common = s.mentorIds.filter((m) =>
          viewerMentors.has(m)
        );
        return common.length >= Number(commonMentors);
      });
    }

    // 3️⃣ Sort (approved desc, latest approved desc)
    leaderboard.sort((a, b) => {
      if (b.approvedCount !== a.approvedCount) {
        return b.approvedCount - a.approvedCount;
      }
      return new Date(b.latestApprovedAt) - new Date(a.latestApprovedAt);
    });

    // 4️⃣ Assign ranks
    leaderboard = leaderboard.map((s, idx) => ({
      ...s,
      rank: idx + 1,
    }));

    // 5️⃣ Shape response by role
    if (viewerRole === 'student') {
      const myEntry = leaderboard.find(
        (s) => s.studentId === viewerId
      );

      return res.json({
        leaderboard,
        myRank: myEntry ? myEntry.rank : null,
      });
    }

    // mentor / proctor
    const sanitized = leaderboard.map(
      ({ rank, ...rest }) => rest
    );

    return res.json({ leaderboard: sanitized });
  } catch (err) {
    console.error('[LEADERBOARD ERROR]', err);
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

module.exports = router;