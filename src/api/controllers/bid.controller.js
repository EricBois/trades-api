const Bid = require('../models/bid.model');
const Account = require('../models/account.model');

exports.create = async (req, res, next) => {
    try {
        req.body.user = req.user.sub
        const account = await Account.findOne({ user: req.user.sub });
        req.body.createdBy = account.name
        const bid = await (new Bid(req.body)).save();
        res.json(bid);
    } catch (e) {
      next(e)
    }
};