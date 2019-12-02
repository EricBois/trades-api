const Message = require('../models/message.model');
const Notify = require('../controllers/notification.controller');

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
      // get the right user to send notification to
      const user = (message.to === req.user.sub) ? message.from : message.to
      // await (new Notification({ senderId: req.user.sub, recipientId: user, activity: 'Message', activityDesc: 'You have a new message!' })).save();
      await Notify.create(req.user.sub, user, 'Message', 'You have a new message')
      return res.json(message);
    } else {
      req.body.from = req.user.sub;
      req.body.read = [req.user.sub];
      const message = await (new Message(req.body)).save();
      await Notify.create(req.user.sub, message.to, 'Message', 'You have a new message')
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
};