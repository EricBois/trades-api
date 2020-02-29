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
  applicants: [{
    uid: {
      type: String,
      required: 'Need a uid'
    },
    name: {
      type: String,
      require: 'You need a name'
    },
    experience: String,
    references: String,
    wage: String,
    skills: [{
      type: String
    }],
    tickets: [{
      type: String
    }],
    contact: {
      phone: String,
      email: String
    }
  }],
  skills: [{
    type: String,
  }],
  tickets: [{
    type: String,
  }],
  hired: [{
    type: String
  }],
  notHired: [{
    type: String
  }],
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    lat: {
      type: Number,
      default: 0,
    },
    lng: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
    },
    country: {
      type: String
    },
    city: {
      type: String
    },
    province: {
      type: String
    },
    url: {
      type: String
    }
  }

});

module.exports = mongoose.model('Hiring', hiringSchema);