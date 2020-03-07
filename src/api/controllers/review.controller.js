const Review = require('../models/review.model');
const Bid = require('../models/bid.model');

exports.create = async (req, res, next) => {
  try {
    req.body.reviewerUid = req.user.sub
    const review = await (new Review(req.body)).save();
    if (!review) return next()
    const bid = await Bid.findOneAndUpdate({ _id: req.body.bid}, {reviewed: true}, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    return res.json(bid)
  } catch (e) {
    next(e);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const review = await Review.findOneAndUpdate({ bid: req.params.id}, req.body, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    if (!review) return next()
    const bid = await Bid.findOneAndUpdate({ _id: req.body.bid}, {reviewed: true}, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    return res.json(bid)
  } catch (e) {
    next(e)
  }
}

exports.get = async (req, res, next) => {
  try {
    const reviewsPromise = await Review.find({ user: req.params.user }).sort({ Created: -1 });
    const [reviews] = await Promise.all([reviewsPromise]);
    res.json(reviews);
  } catch (e) {
    next(e);
  }
};

exports.delete = async (req, res, next) => {
    const review = await Review.deleteOne({ _id: req.params.id, reviewerUid: req.params.reviewer})
  res.json(review)
};