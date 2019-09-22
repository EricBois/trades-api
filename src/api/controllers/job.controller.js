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

exports.get = async (req, res, next) => {
    try {
        const jobsPromise = Job.find({ private: false }).sort({ Created: -1 });
        const [jobs] = await Promise.all([jobsPromise]);
        res.json(jobs);
    } catch (e) {
      next(e)
    }
};
