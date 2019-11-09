const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const teamSchema = new mongoose.Schema({
  user: { // team Creator
    type: String,
    required: 'Must have user UID!',
  },
  team: [{
    uid: String, // ID
    name: String,
    picture: String,
    metadata: Object
  }],
});

module.exports = mongoose.model('Team', teamSchema);