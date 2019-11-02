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

exports.email = async (req, res, next) => {
  res.json(req.body)
};

exports.meeting = async (req, res, next) => {
  try {
    req.body.bid.forEach( bid =>  {
      const check = Bid.findOneAndUpdate({  _id: bid.id, user: bid.user}, {host: req.user.sub, meeting: req.body.meeting, confirm: {status: false}}, {
          new: true, // return the new store instead of the old one
          runValidators: true,
        }).exec();
        if (!check) return next()
    })
    res.json('Done')
  } catch (e) {
    return next(e)
  }
};

exports.confirmMeeting = async (req, res, next) => {
  try {
    const check = await Bid.findOneAndUpdate({  _id: req.body.bid.id, user: req.body.bid.user }, {confirm: req.body.confirm}, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    if (!check) return next()
    res.json(check)
  } catch (e) {
    return next(e)
  }
};

exports.getMeetings = async (req, res, next) => {
  try {
    const bidsPromise = Bid.find({ $or: [{ user : req.user.sub },
      { host: req.user.sub }] }).sort({ Created: -1 });
    const [bids] = await Promise.all([bidsPromise]);
    res.json(bids);
  } catch (e) {
    next(e);
  }
};