const Job = require('../models/job.model');
const Account = require('../models/account.model');

exports.create = async (req, res, next) => {
    try {
        req.body.user = req.user.sub
        const account = await Account.findOne({ user: req.user.sub });
        req.body.createdBy = account.name
        const job = await (new Job(req.body)).save();
        res.json(job);
    } catch (e) {
      next(e)
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, private: false });
        if (!job) return next();
        res.json({
            name: job.name, 
            description: job.description, 
            budget: job.budget, 
            skills: job.skills, 
            tickets: job.tickets,
            jobType: job.jobType,
            liability: job.liability,
            wcb: job.wcb,
            location: job.location,
            createdBy: job.createdBy,
            Created: job.Created,
            user: job.user,
            id: job._id,
            oneBid: job.oneBid,
            bids: job.bids
        });
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

exports.getFromUser = async (req, res, next) => {
    try {
        const jobsPromise = Job.find({ user: req.user.sub }).sort({ Created: -1 });
        const [jobs] = await Promise.all([jobsPromise]);
        res.json(jobs);
    } catch (e) {
      next(e)
    }
};

exports.edit = async (req, res, next) => {
    try {
        const job = await Job.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, req.body, {
            new: true, // return the new store instead of the old one
            runValidators: true,
          }).exec();
        res.json(job)
    } catch (e) {
        next(e)
    }
};

exports.delete = async (req, res, next) => {
    try {
        await Job.deleteOne({ _id: req.params.id, user: req.user.sub });
        res.json("Successfully Removed Project")
    } catch (e) {
        next(e)
    }
;}