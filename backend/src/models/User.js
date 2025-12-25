// FILE: backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['student', 'proctor', 'mentor'],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ===================== STUDENT PROFILE ===================== */
    // These are REQUIRED for students to submit claims,
    // but NOT marked `required: true` at schema level
    // (we enforce completion in business logic)

    department: {
      type: String,
      trim: true,
    },

    year: {
      type: Number,
      min: 1,
      max: 5,
    },

    rollNo: {
      type: String,
      trim: true,
      index: true,
    },

    githubUrl: {
      type: String,
      trim: true,
    },

    linkedinUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
