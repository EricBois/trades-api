const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const bidSchema = new mongoose.Schema({
  Created: {
    type: Date,
    default: Date.now,
  },
  reviewed: {
    type: Boolean,
    default: false
  },
  notified: {
    type: Boolean,
    default: false
  },
  meetingRequested: {
    type: Boolean,
    default: false
  },
  confirm: {
    status: {
      type: Boolean,
      default: false
    },
    date: String,
    description: String
  },
  change: { // meeting change
    status: {
      type: Boolean,
      default: false
    },
    uid: String
  },
  request: {
    type: Boolean,
    default: false
  },
  meeting: {
    dates: [{
      type: String,
    }],
    host: String, // Project Creator uid
    description: String,
    time: String
  },
  address: String,
  addressUrl: String,
  projectName: String,
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: 'You must supply a job_id!',
  },
  contractor: String, // project creator name
  createdBy: String, // bidder
  items: [{
    trade: {
      type: String,
      default: 'Whole Project',
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: String,
      default: '0'
    }
  }],
  notes: String,
  phone: String,
  email: String,
  user: { // Bid Creator
    type: String,
    required: 'Must have user UID!',
  },
  files: [{
    type: String,
    trim: true,
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Bid', bidSchema);
