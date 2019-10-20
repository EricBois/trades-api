const Bid = require('../models/bid.model');
var ManagementClient = require('auth0').ManagementClient;

var auth0 = new ManagementClient({
  domain: 'dev-2upadx1s.auth0.com',
  clientId: `${process.env.AUTH0_MANAGEMENT_ID}`,
  clientSecret: `${process.env.AUTH0_MANAGEMENT_SECRET}`,
  scope: 'read:users update:users'
});

exports.create = async (req, res, next) => {
  try {
    req.body.user = req.user.sub;
    if (!req.user.phone || !req.user.email) {
      const user = await auth0.getUser({ id: req.user.sub });
      req.body.phone = user.user_metadata.phone
      req.body.email = user.email
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
