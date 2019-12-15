const Bid = require('../models/bid.model');

function formatPhoneNumber(phoneNumberString) {
  const cleaned = (`${phoneNumberString}`).replace(/\D/g, '');
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    const intlCode = (match[1] ? '+1 ' : '');
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
  }
  return null;
}

exports.create = async (req, res, next) => {
  try {
    req.body.user = req.user.sub;
    if (req.body.phone !== '' && req.body.phone !== null && req.body.phone !== undefined) {
      req.body.phone = formatPhoneNumber(req.body.phone);
    }
    // const account = await Account.findOne({ user: req.user.sub });
    // req.body.createdBy = account.name;
    const bid = await (new Bid(req.body)).save();
    res.json(bid);
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const bidsPromise = Bid.find({ project: req.params.id }).sort({ Created: -1 });
    const [bids] = await Promise.all([bidsPromise]);
    res.json(bids);
  } catch (e) {
    next(e);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await Bid.deleteOne({ _id: req.body.id, user: req.user.sub });
    res.json('Successfully deleted');
  } catch (e) {
    next(e);
  }
};

exports.notified = async (req, res, next) => {
  try {
    if (req.body.meetingRequested) {
      const project = await Bid.findOneAndUpdate({  _id: req.body.bid.id, user: req.body.bid.user}, {meetingRequested: true}, {
        new: true, // return the new store instead of the old one
        runValidators: true,
      }).exec();
      if (!project) return next()
      res.json(project)
    } else {
      const project = await Bid.findOneAndUpdate({  _id: req.body.bid.id, user: req.body.bid.user}, {notified: true}, {
        new: true, // return the new store instead of the old one
        runValidators: true,
      }).exec();
      if (!project) return next()
      res.json(project)
    }
  } catch(e) {
    next(e)
  }
}

exports.meeting = (req, res, next) => {
  try {
    req.body.bid.forEach(async bid =>  {
      const project = await Bid.findOneAndUpdate({  _id: bid.id, user: bid.user}, req.body.meeting, {
        new: true, // return the new store instead of the old one
        runValidators: true,
      }).exec();
      if (!project) return next()
      res.json(project)
    })
  } catch (e) {
    return next(e)
  }
};

exports.getMeetings = async (req, res, next) => {
  try {
    const bidsPromise = Bid.find({ request: true, $or: [{ user : req.user.sub },
      { host: req.user.sub }] }).sort({ Created: -1 });
    const [bids] = await Promise.all([bidsPromise]);
    res.json(bids);
  } catch (e) {
    next(e);
  }
};