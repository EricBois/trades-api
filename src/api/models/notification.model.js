const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const notificationSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  recipientId: {
    type: String,
    required: "You need a recipient ID"
  },
  senderId: {
    type: String,
    required: "You need a sender ID"
  },
  activity: {
    type: String,
    enum: ['Message', 'Meeting', 'Bid', 'Project'],
    required: "You need an activity"
  },
  activityDesc: {
    type: String,
    trim: true
  },
  activityUrl: {
    type: String,
    trim: true
  },
  unread: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
