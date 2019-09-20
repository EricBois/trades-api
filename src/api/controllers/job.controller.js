const Job = require('../models/job.model');

exports.create = async (req, res, next) => {
    try {
        req.body.user = req.user.sub
        const job = await (new Job(req.body)).save();
        res.json(job);
    } catch (e) {
      next(e)
    }
  };