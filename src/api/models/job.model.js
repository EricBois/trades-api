const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const slug = require('slugs');

const jobSchema = new mongoose.Schema({
  Created: {
    type: Date,
    default: Date.now,
  },
  slug: String,
  user: {
    type: String,
    required: 'Must have user UID!',
  },
  name: {
    type: String,
    trim: true,
    required: 'Must have a name!'
  },
  jobType: {
    type: String,
    enum: ['Contract', 'Hourly']
  },
  budget: Number,
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    enum: ['Calgary'],
    required: 'Must have a location'
  },
  private: { 
    type: Boolean,
    default: false
  },
  skills: [{
    text: {
      type: String
    }
  }],
  tickets: [{
    text: {
      type: String
    }
  }],
  wcb: Boolean,
  liability: Boolean,
  quality: {
    type: Number,
    max: 10,
    default: 0
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

jobSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running
  }
  // make sure slugs are unique
  this.slug = slug(Math.random().toString(36).substr(2, 9));
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const jobsWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (jobsWithSlug.length) {
    this.slug = `${this.slug}-${jobsWithSlug.length + 1}`;
  }

  next();
});

module.exports = mongoose.model('Job', jobSchema);
