const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const slug = require('slugs');

const jobSchema = new mongoose.Schema({
  Created: {
    type: Date,
    default: Date.now,
  },
  createdBy: String,
  slug: String,
  user: {
    type: String,
    required: 'Must have user UID!',
  },
  name: {
    type: String,
    trim: true,
    maxlength: 40,
    required: 'Must have a name!',
  },
  jobType: {
    type: String,
    enum: ['Contract', 'Hourly'],
  },
  budget: {
    type: String,
    required: 'Please enter a budget'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 400,
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
  },
  private: {
    type: Boolean,
    default: false,
  },
  allowed: [{
    type: String
  }],
  team: [{
    uid: String, // ID
    name: String,
    notified: {
      type: Boolean,
      default: false
    }
  }],
  skills: [{
    type: String,
  }],
  tickets: [{
    type: String,
  }],
  wcb: Boolean,
  liability: Boolean,
  quality: {
    type: Number,
    max: 10,
    default: 0,
  },
  bidding: {
    type: Boolean,
    default: true
  },
  files: [{
    type: String,
    trim: true,
  }],
  photos: [{
    type: String,
    trim: true
  }],
  phone: String,
  email: String,
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

jobSchema.virtual('bids', {
  ref: 'Bid', // what model to link?
  localField: '_id', // which field on the job?
  foreignField: 'project', // which field on the item?
});

function autopopulate(next) {
  this.populate('bids');
  next();
}


jobSchema.pre('find', autopopulate);
jobSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Job', jobSchema);
