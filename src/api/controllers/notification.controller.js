// const Notify = require('../models/notification.model');
const Notification = require('../models/notification.model');
var OneSignal = require('onesignal-node');      
      
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
exports.create = async (fromUser, toUser, activity, activityDesc) => {
  try {
    await (new Notification({ senderId: fromUser, recipientId: toUser, activity: activity, activityDesc: activityDesc })).save();
    await messagePush(toUser, activityDesc);
  } catch(e) {
    throw new Error(e)
  }
}