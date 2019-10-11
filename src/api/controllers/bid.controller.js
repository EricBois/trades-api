const Bid = require('../models/bid.model');
const Account = require('../models/account.model');

exports.create = async (req, res, next) => {
  try {
    req.body.user = req.user.sub;
    const account = await Account.findOne({ user: req.user.sub });
    req.body.createdBy = account.name;
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
