const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const Claim = require('../models/Claim');
const User = require('../models/User');
const uploadProof = require('../middleware/uploadProof');

/* ===================== STUDENT ===================== */

// student fetches own claims
router.get(
  '/student',
  requireAuth,
  requireRole(['student']),
  async (req, res) => {
    try {
      const claims = await Claim.find({
        studentId: req.user.id,
      }).sort({ createdAt: -1 });

      res.json({ claims });
    } catch (err) {
      console.error('Failed to fetch student claims');
      res.status(500).json({ message: 'Failed to fetch student claims' });
    }
  }
);

// student submits a new claim
router.post(
  '/student',
  requireAuth,
  requireRole(['student']),
  uploadProof.single('proof'),
  async (req, res) => {
    try {
      // 🔒 PROFILE COMPLETION CHECK (HARD GATE)
      const student = await User.findById(req.user.id);

      if (
        !student.department ||
        !student.year ||
        !student.rollNo ||
        !student.githubUrl ||
        !student.linkedinUrl
      ) {
        return res.status(400).json({
          message: 'Complete your profile before submitting a claim',
          code: 'PROFILE_INCOMPLETE',
        });
      }

      const {
        title,
        category,
        description,
        mentorEmails = [],
        eventName,
        organizer,
        eventStartDate,
        eventEndDate,
        verificationLink,
      } = req.body;

      if (!title || !category) {
        return res.status(400).json({ message: 'Title and category required' });
      }

      if (!eventName || !organizer || !eventStartDate) {
        return res.status(400).json({
          message: 'Event name, organizer, and start date are required',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: 'Proof file is required',
        });
      }

      // ✅ FIX: Normalize mentorEmails to always be an array
      let mentorEmailsArray = [];
      if (mentorEmails) {
        mentorEmailsArray = Array.isArray(mentorEmails)
          ? mentorEmails
          : [mentorEmails];
      }

      let mentorIds = [];

      // If student provided mentor emails
      if (mentorEmailsArray.length > 0) {
        const mentors = await User.find({
          email: { $in: mentorEmailsArray },
          role: { $in: ['mentor', 'proctor'] },
        });

        if (mentors.length !== mentorEmailsArray.length) {
          return res.status(400).json({
            message:
              'One or more mentor emails are invalid or not authorized mentors',
          });
        }

        mentorIds = mentors.map((m) => m._id);
      }

      // TEMP fallback: auto-assign Deven if none provided
      if (mentorIds.length === 0) {
        const defaultMentor = await User.findOne({
          email: 'deven.m@somaiya.edu',
          role: { $in: ['mentor', 'proctor'] },
        });

        if (!defaultMentor) {
          return res.status(500).json({
            message: 'Default mentor not found in system',
          });
        }

        mentorIds = [defaultMentor._id];
      }

      const claim = await Claim.create({
        title,
        category,
        description: description || '',
        eventName,
        organizer,
        eventStartDate,
        eventEndDate: eventEndDate || null,
        verificationLink: verificationLink || null,
        proofFile: {
          filePath: req.file.path,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        },
        status: 'PENDING',
        studentId: req.user.id,
        mentorIds,
      });

      res.status(201).json({ claim });
    } catch (err) {
      console.error('Failed to submit claim', err);
      res.status(500).json({ message: 'Failed to submit claim' });
    }
  }
);

/* ===================== PROCTOR ===================== */

// proctor reviews pending claims
router.get(
  '/proctor',
  requireAuth,
  requireRole(['proctor']),
  async (req, res) => {
    try {
      const claims = await Claim.find({
        status: 'PENDING',
      })
      .populate(
        'studentId',
        'name email department year rollNo githubUrl linkedinUrl'
      )
      .sort({ createdAt: -1 });

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

      // base update payload
      let updatePayload = {
        status,
        reviewRemarks: reviewRemarks || '',
        reviewedBy: new mongoose.Types.ObjectId(req.user.id),
        reviewedAt: new Date(),
      };

      // auto-assign mentor ONLY on approval
      // and ONLY if no mentor already assigned (future-safe)
      if (status === 'APPROVED') {
        const existingClaim = await Claim.findById(req.params.claimId);

        if (
          !existingClaim.mentorIds ||
          existingClaim.mentorIds.length === 0
        ) {
          const mentor = await User.findOne({
            email: 'deven.m@somaiya.edu',
            role: { $in: ['mentor', 'proctor'] },
          });

          if (!mentor) {
            return res.status(500).json({
              message: 'Default mentor not found in system',
            });
          }

          updatePayload.mentorIds = [mentor._id];
        }
      }

      const updatedClaim = await Claim.findByIdAndUpdate(
        req.params.claimId,
        updatePayload,
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

/* ===================== MENTOR ===================== */

// mentor views approved claims
router.get(
  '/mentor',
  requireAuth,
  requireRole(['mentor', 'proctor']),
  async (req, res) => {
    try {
      const mentorObjectId = new mongoose.Types.ObjectId(req.user.id);

      const claims = await Claim.find({
        mentorIds: { $in: [mentorObjectId] },
        status: 'APPROVED',
      })
      .populate(
        'studentId',
        'name email department year rollNo githubUrl linkedinUrl'
      )
      .sort({ createdAt: -1 });

      res.json({ claims });
    } catch (error) {
      console.error('Failed to fetch mentor claims');
      res.status(500).json({
        message: 'Failed to fetch mentor claims',
      });
    }
  }
);

/* ===================== DOWNLOAD PROOF ===================== */

// mentor/proctor downloads proof file (secured)
router.get(
  '/:claimId/proof/download',
  requireAuth,
  requireRole(['mentor', 'proctor']),
  async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.claimId);

      if (!claim || !claim.proofFile || !claim.proofFile.filePath) {
        return res.status(404).json({ message: 'Proof not found' });
      }

      // ✅ Authorization hardening:
      // - proctor: allow
      // - mentor: allow only if assigned to this claim
      if (req.user.role === 'mentor') {
        const mentorObjectId = new mongoose.Types.ObjectId(req.user.id);
        const assigned =
          Array.isArray(claim.mentorIds) &&
          claim.mentorIds.some((id) => id.toString() === mentorObjectId.toString());

        if (!assigned) {
          return res.status(403).json({ message: 'Not authorized to access this proof' });
        }
      }

      const filePath = path.resolve(claim.proofFile.filePath);
      const originalName = claim.proofFile.originalName || 'proof';

      // ✅ Clear logging for fast debug (do not remove until demo is done)
      console.log('[PROOF DOWNLOAD]', {
        claimId: req.params.claimId,
        role: req.user.role,
        userId: req.user.id,
        filePath,
        originalName,
      });

      return res.download(filePath, originalName, (err) => {
        if (err) {
          console.error('[PROOF DOWNLOAD ERROR]', err);
          // Important: if headers already sent, just end
          if (res.headersSent) return;
          return res.status(500).json({ message: 'Download failed', error: err.message });
        }
      });
    } catch (err) {
      console.error('Failed to download proof', err);
      res.status(500).json({ message: 'Download failed' });
    }
  }
);

module.exports = router;