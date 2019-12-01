// const Notify = require('../models/notification.model');
var OneSignal = require('onesignal-node');      
      
var myClient = new OneSignal.Client({      
    userAuthKey: process.env.onesignalAuthKey,      
    app: { appAuthKey: process.env.onesignalAuthKey, appId: process.env.onesignalAppID }      
});


exports.Message = async (user, text) => {
  const messageNotification = await new OneSignal.Notification({      
    contents: {      
        en: text     
    } 
  });
  messageNotification.postBody["include_external_user_ids"] = [user];
  await myClient.sendNotification(messageNotification, function (err, httpResponse,data) {      
    if (err) {      
      console.log('Something went wrong...');      
    } else {      
      console.log(data, httpResponse.statusCode);      
    }      
  });      
}