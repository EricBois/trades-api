const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const messageSchema = new mongoose.Schema({
  Created: {
    type: Date,
    default: Date.now,
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: 'You must supply a job_id!',
  },
  project_name: String,
  from: {
    type: String,
    required: 'Must have user UID!',
  },
  to: {
    type: String,
    required: 'Must have user UID!',
  },
  sender: String,
  messages: [
    {
      Created: {
        type: Date,
        default: Date.now,
      },
      name: String,
      text: {
        type: String,
        trim: true
      }
    }
  ],
  read: [{
    type: String
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Message', messageSchema);
