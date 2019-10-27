const Message = require('../models/message.model');
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

const Email = async (to, from, text) => {
  // Create the promise and SES service object
  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail({
    Destination: { /* required */
      ToAddresses: [
        to,
      ]
    },
    Source: from, /* required */
    Template: 'TEMPLATE_NAME', /* required */
    TemplateData: '{ \"REPLACEMENT_TAG_NAME\":\"REPLACEMENT_VALUE\" }', /* required */
    ReplyToAddresses: [
      'EMAIL_ADDRESS'
    ]
  }).promise();
}

exports.create = async (req, res, next) => {
  try {
    if (req.params.id) {
      const message = await Message.findOneAndUpdate({ _id: req.params.id, $or: [{ to : req.user.sub },
        { from : req.user.sub }] },
        { 
          $set: {read: [req.user.sub], delete: []},
          $push: { messages: req.body.message } 
        },
        { new: true });
      return res.json(message);
    } else {
      req.body.from = req.user.sub;
      req.body.read = [req.user.sub];
      const message = await (new Message(req.body)).save();
      return res.json(message)
    }
  } catch (e) {
    next(e);
  }
};

exports.read = async (req, res, next) => {
  const message = await Message.findOneAndUpdate({ _id: req.params.id, $or: [{ to : req.user.sub },
    { from : req.user.sub }] }, { $push: { read: req.user.sub } }, {
    new: true, // return the new store instead of the old one
    runValidators: true,
  }).exec();
  res.json(message)
}

exports.get = async (req, res, next) => {
  try {
    const messagesPromise = await Message.find({ $or: [{ to : req.user.sub },
      { from : req.user.sub }] }).sort({ Created: -1 });
    const [messages] = await Promise.all([messagesPromise]);
    res.json(messages);
  } catch (e) {
    next(e);
  }
};

exports.delete = async (req, res, next) => {
  //hide message from user
  const message = await Message.findOneAndUpdate({ _id: req.params.id, $or: [{ to : req.user.sub },
    { from : req.user.sub }] }, { $push: { delete: req.user.sub, read: req.user.sub } }, {
    new: true, // return the new store instead of the old one
    runValidators: true,
  }).exec();
  if (message.delete.length >= 2) {
    await Message.deleteOne({ _id: req.params.id, $or: [{ to : req.user.sub },
      { from : req.user.sub }] });
  }
  res.json(message)
}