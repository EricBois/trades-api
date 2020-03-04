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
    type: String,
    required: 'Enter rating'
  },
  ratingB: {
    type: String,
    required: 'Enter rating'
  },
  ratingC: {
    type: String,
    required: 'Enter rating'
  },
  ratingD: {
    type: String,
    required: 'Enter rating'
  },
  ratingE: {
    type: String,
    required: 'Enter rating'
  },
  description: String,
  reviewerName: String,
  reviewerUid: String,

});

module.exports = mongoose.model('Review', reviewSchema);