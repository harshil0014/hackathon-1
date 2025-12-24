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
        required: true,
      },
    ],


    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    proofUrl: {
      type: String,
      required: true,
    },

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
