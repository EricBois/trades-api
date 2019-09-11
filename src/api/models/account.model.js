const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const slug = require('slugs');

const accountSchema = new mongoose.Schema({
  Created: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['user', 'company'],
    default: 'user'
  },
  hourly: Number,
  avatar: {
    type: String,
    trim: true
  },
  slug: String,
  user: {
    type: String,
    required: 'Must have user UID!',
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
  },
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
  },
  available: { 
    type: Boolean
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

accountSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  // make sure slugs are unique
  this.slug = slug(Math.random().toString(36).substr(2, 9));
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const accountsWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (accountsWithSlug.length) {
    this.slug = `${this.slug}-${accountsWithSlug.length + 1}`;
  }

  next();
});

module.exports = mongoose.model('Account', accountSchema);
