const Hiring = require('../models/hiring.model');
const Employ = require('../models/employ.model');

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
    const jobsPromise = Hiring.find().sort({ created: -1 });
    const [jobs] = await Promise.all([jobsPromise]);
    res.json(jobs);
  } catch (e) {
    next(e);
  }
};

exports.edit = async (req, res, next) => {
  try {
    req.body.user = req.user.sub;
    const job = await Hiring.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, req.body, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(job);
  } catch (e) {
    next(e);
  }
};

exports.apply = async (req, res, next) => {
  try {
    const job = await Hiring.findOneAndUpdate({ _id: req.params.id },
      {
        $push: { applicants: {
          uid: req.user.sub,
          name: req.body.name,
          experience: req.body.experience,
          references: req.body.references,
          wage: req.body.wage,
          skills: req.body.skills,
          tickets: req.body.tickets
        }
          
        }
      }, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(job);
  } catch (e) {
    next(e);
  }
};

exports.withdraw = async (req, res, next) => {
  try {
    const job = await Hiring.findOneAndUpdate({ _id: req.params.id },
      {
        $pull: { applicants: {uid: req.user.sub}
        }
      }, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(job);
  } catch (e) {
    next(e);
  }
};

exports.hired = async (req, res, next) => {
  try {
    if (req.body.status) {
      const job = await Hiring.findOneAndUpdate({ _id: req.params.id },
        { $push: { hired: req.user.sub },
          $pull: { notHired: req.user.sub }},
        { new: true, runValidators: true, upsert: true }).exec();
      return res.json(job)
    } else if (!req.body.status) {
        const job = await Hiring.findOneAndUpdate({ _id: req.params.id },
          { $push: { notHired: req.user.sub },
            $pull : { hired: req.user.sub } },
          { new: true, runValidators: true, upsert: true }).exec();
        return res.json(job)    
    }
  } catch(e) {
    next(e)
  }
}

exports.delete = async (req, res, next) => {
  try {
    await Hiring.deleteOne({ _id: req.params.id, user: req.user.sub });
    res.json('Successfully Removed job');
  } catch (e) {
    next(e);
  }
};

exports.getProfile = async (req, res, next) => {
  const profile = await Employ.findOne({ user: req.user.sub });
  if (!profile) {
    const profile = await (new Employ({user: req.user.sub, name: 'Undefined', available: false})).save();
    res.json(profile);
  }
  res.json(profile);
}

exports.saveProfile = async (req, res, next) => {
  try {
    req.body.user = req.user.sub;
    const profile = await Employ.findOneAndUpdate({user: req.user.sub }, req.body, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(profile)
  } catch (e) {
    next(e);
  }
};

// get contractors looking for work (lfw)
exports.getContractors = async (req, res, next) => {
  try {
    const lfwPromise = Employ.find({ available: true }).sort({ created: -1 });
    const [lfw] = await Promise.all([lfwPromise]);
    res.json(lfw);
  } catch(e) {
    next(e)
  }
}