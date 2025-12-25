const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },

    mentorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    /* ================= BASIC INFO ================= */

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    /* ================= EVENT DETAILS ================= */

    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    organizer: {
      type: String,
      required: true,
      trim: true,
    },

    eventStartDate: {
      type: Date,
      required: true,
    },

    eventEndDate: {
      type: Date,
      default: null,
    },

    verificationLink: {
      type: String,
      default: null,
      trim: true,
    },

    /* ================= PROOF FILE ================= */

    proofFile: {
      filePath: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
    },

    /* ================= REVIEW ================= */

    status: {
      type: String,
      enum: ['PENDING', 'ON_HOLD', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },

    reviewRemarks: {
      type: String,
      default: '',
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Claim', claimSchema);
