const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const hiringSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  user: { // owner of the code
    type: String,
    required: 'user uid'
  },
  company: {
    type: String,
    required: 'Need company name'
  },
  description: String,
  skills: [{
    type: String,
  }],
  tickets: [{
    type: String,
  }],
  profile: Object

});

module.exports = mongoose.model('Hiring', hiringSchema);