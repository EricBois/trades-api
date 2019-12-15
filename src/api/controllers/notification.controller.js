// const Notify = require('../models/notification.model');
const Notification = require('../models/notification.model');
var OneSignal = require('onesignal-node');
var ManagementClient = require('auth0').ManagementClient;
var twilio = require('twilio');

var accountSid = process.env.TWILLIO_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILLIO_TOKEN;   // Your Auth Token from www.twilio.com/console

var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

var auth0 = new ManagementClient({
  domain: 'dev-2upadx1s.auth0.com',
  clientId: `${process.env.AUTH0_MANAGEMENT_ID}`,
  clientSecret: `${process.env.AUTH0_MANAGEMENT_SECRET}`,
  scope: 'read:users update:users'
});
      
var myClient = new OneSignal.Client({      
    userAuthKey: process.env.onesignalAuthKey,      
    app: { appAuthKey: process.env.onesignalAuthKey, appId: process.env.onesignalAppID }      
});

// create push notification
const messagePush = async (user, text) => {
  try {
    const messageNotification = await new OneSignal.Notification({      
      contents: {      
          en: text     
      } 
    });
    messageNotification.postBody["include_external_user_ids"] = [user];
    await myClient.sendNotification(messageNotification);

  } catch(e) {
    throw new Error(e)
  }
}

// create notification
exports.create = async (req, res, next) => {
  try {
    const notification = await (new Notification(
      {
        senderId: req.body.senderId,
        recipientId: req.body.recipientId,
        activity: req.body.activity,
        activityDesc: req.body.activityDesc,
        link: req.body.link
      })).save();
    const user = await auth0.getUser({ id: req.body.recipientId });
    // if (user.user_metadata.emailNotification) {
    //   // Send Email
    // }
    if (user.user_metadata.smsNotification) {
      client.messages.create({
        body: req.body.activityDesc,
        to: user.user_metadata.phone,  // Text this number
        from: '+15873276684' // From a valid Twilio number
      })
    }
    // Send push notification
    await messagePush(req.body.recipientId, req.body.activityDesc);
    res.json(notification)
  } catch(e) {
    next(e);
  }
}

exports.get = async (req, res, next) => {
  try {
    const notificationPromise = await Notification.find({ recipientId: req.user.sub }).sort({ Created: -1 });
    const [notifications] = await Promise.all([notificationPromise]);
    res.json(notifications);
  } catch(e) {
    next(e);
  }
}

exports.delete = async (req, res, next) => {
  try {
    const notifications = await Notification.deleteMany({ recipientId: req.user.sub });
    const response =  (notifications) ? res.status(200).end() : res.status(404).end()
    return response
  } catch(e) {
    next(e);
  }
}

exports.deleteBulk = async (req, res, next) => {
  try {
    const notifications = await Notification.deleteMany({ recipientId: req.user.sub, link: req.body.links });
    const response =  (notifications) ? res.status(200).end() : res.status(404).end()
    return response
  } catch(e) {
    next(e);
  }
}