const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  Created: {
    type: Date,
    default: Date.now,
  },
  project: {
    type: String,
    required: 'Need a project uid!'
  },
  bid: {
    type: String,
    required: 'Must have bid UID!',
  },
  user: { // Reviewed contractor
    type: String,
    required: 'Must have user UID!',
  },
  ratingA: {
    type: Number,
    default: 1,
    required: 'Enter rating'
  },
  ratingB: {
    type: Number,
    default: 1,
    required: 'Enter rating'
  },
  ratingC: {
    type: Number,
    default: 1,
    required: 'Enter rating'
  },
  ratingD: {
    type: Number,
    default: 1,
    required: 'Enter rating'
  },
  ratingE: {
    type: Number,
    default: 1,
    required: 'Enter rating'
  },
  description: String,
  reviewerName: String,
  projectName: String,
  reviewerUid: String,

});

module.exports = mongoose.model('Review', reviewSchema);