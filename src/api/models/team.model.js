const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const teamSchema = new mongoose.Schema({
  user: { // team Creator
    type: String,
    required: 'Must have user UID!',
  },
  team: [{
    user: String, // ID
    name: String,
  }],
});

module.exports = mongoose.model('Team', teamSchema);