const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const photosSchema = new mongoose.Schema({
  photos: [{
    type: String,
    required: 'You need a photo',
  }],
  user: {
    type: String,
    required: 'Must have user UID!',
  }
});

module.exports = mongoose.model('Photos', photosSchema);
