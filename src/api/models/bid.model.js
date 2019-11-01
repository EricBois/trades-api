const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const bidSchema = new mongoose.Schema({
  Created: {
    type: Date,
    default: Date.now,
  },
  meeting: {
    request: {
      type: Boolean,
      default: false
    },
    dates: [{
      type: String,
    }],
    host: String, // Project Creator
    description: String
  },
  address: String,
  addressUrl: String,
  projectName: String,
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: 'You must supply a job_id!',
  },
  createdBy: String,
  trade: [{
    type: String,
    default: 'Whole Project',
  }],
  phone: String,
  email: String,
  user: { // Bid Creator
    type: String,
    required: 'Must have user UID!',
  },
  description: {
    type: String,
    trim: true,
  },
  price: Number,
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Bid', bidSchema);
