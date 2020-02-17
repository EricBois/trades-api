const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const employSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: false
  },
  user: { // owner of the profile
    type: String,
    required: 'user uid'
  },
  name: {
    type: String,
    required: 'Need user name'
  },
  experience: String,
  reference: String,
  skills: [{
    type: String,
  }],
  tickets: [{
    type: String,
  }],
  location: [{
    type: String
  }],
  hourly: String

});

module.exports = mongoose.model('Employ', employSchema);