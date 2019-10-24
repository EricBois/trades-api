const Message = require('../models/message.model');

exports.create = async (req, res, next) => {
  try {
    if (req.params.id) {
      const message = await Message.findOneAndUpdate({ _id: req.params.id, $or: [{ to : req.user.sub },
        { from : req.user.sub }] },
        { 
          $set: {read: [req.user.sub]},
          $push: { messages: req.body.message } 
        },
        { new: true });
      return res.json(message);
    } else {
      req.body.from = req.user.sub;
      req.body.sender = req.body.messages.name
      req.body.read = [req.user.sub]
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