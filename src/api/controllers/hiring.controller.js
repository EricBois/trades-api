const Hiring = require('../models/hiring.model');

// create job
exports.create = async (req, res, next) => {
  try {
    req.body.user = req.user.sub;
    const job = await (new Hiring(req.body)).save();
    res.json(job);
  } catch (e) {
    next(e);
  }
};

// get all jobs
exports.get = async (req, res, next) => {
  try {
    const jobsPromise = Hiring.find().sort({ Created: -1 });
    const [jobs] = await Promise.all([jobsPromise]);
    res.json(jobs);
  } catch (e) {
    next(e);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const job = await Hiring.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, req.body, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(job);
  } catch (e) {
    next(e);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await Hiring.deleteOne({ _id: req.params.id, user: req.user.sub });
    res.json('Successfully Removed job');
  } catch (e) {
    next(e);
  }
};