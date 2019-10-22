const Message = require('../models/message.model');

exports.create = async (req, res, next) => {
  try {
    const message = await Message.findOne({ project: req.body.project });
    if (!message) {
      req.body.from = req.user.sub;
      const message = await (new Message(req.body)).save();
      return res.json(message)
    } else {
      const message = await Message.findOneAndUpdate({ project: req.body.project },
        { $push: { messages: req.body.messages } },
        { safe: true, upsert: true, new: true });
      return res.json(message);
    }
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const messagesPromise = Message.find({ from: req.user.sub, project: req.params.project }).sort({ Created: -1 });
    const [messages] = await Promise.all([messagesPromise]);
    res.json(messages);
  } catch (e) {
    next(e);
  }
};