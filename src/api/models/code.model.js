const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const codeSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  code: {
    type: String,
    required: 'Need an access code'
  },
  user: { // owner of the code
    type: String,
    required: 'Need an ambassador name'
  },
  userUid: { // uid owner of code
    type: String,
    required: 'enter user uid'
  },
  used: {
    type: Boolean,
    default: false
  },
  note: String
});

module.exports = mongoose.model('Code', codeSchema);