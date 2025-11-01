const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'professor', 'admin']
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  // Student-specific fields
  branch: {
    type: String, // same as department
  },
  section: {
    type: String,
  },
  year: {
    type: Number,
  },
  programType: {
    type: String, // e.g., B.Tech, M.Tech
    enum: ['B.Tech', 'M.Tech', 'Other'],
    default: 'Other'
  },
  adminPermissions: {
    type: [String], // Array of permissions (e.g., ['manageUsers', 'viewReports'])
    default: [],    // Default to an empty array
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
