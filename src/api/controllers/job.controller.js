const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const Job = require('../models/job.model');
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

aws.config.update({
  secretAccessKey: process.env.AWS_KEY,
  accessKeyId: process.env.AWS_KEYID,
  region: 'us-east-1', // region of your bucket
});

const s3 = new aws.S3();

const multerOptions = {
  storage: multerS3({
    s3,
    bucket: 'subhub01',
    acl: 'public-read',
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      const name = `${`${req.user.sub}/${req.params.id}/${file.originalname}`}`;
      cb(null, name);
    },
  }),
  fileFilter(req, file, next) {
    const isPdf = file.mimetype.startsWith('application/pdf');
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPdf || isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  },
};

const singleUpload = multer(multerOptions).single('file');

exports.upload = async (req, res, next) => {
  await singleUpload(req, res, (err) => {
    if (err) {
      return res.status(422).send({
        errors: [{ title: 'Upload Error', detail: err.message }],
      });
    }
    return next();
  });
};

exports.deleteFile = async (req, res, next) => {
  const params = {
    Bucket: 'subhub01',
    Delete: { // required
      Objects: [ // required
        {
          Key: (`${`${req.user.sub}/${req.params.id}/${req.params.name}`}`), // required
        },
      ],
    },
  };
  await s3.deleteObjects(params, (err) => {
    if (err) next(err, err.stack); // an error occurred
  });
  if (req.params.type === 'file') {
    try {
      const job = await Job.findByIdAndUpdate({ _id: req.params.id, user: req.user.sub },
        { $pull: { files: req.body.file } },
        { safe: true, upsert: true, new: true });
      return res.json(job);
    } catch (e) {
      return next(e);
    }
  } else {
    try {
      const job = await Job.findByIdAndUpdate({ _id: req.params.id, user: req.user.sub },
        { $pull: { photos: req.body.file } },
        { safe: true, upsert: true, new: true });
      return res.json(job);
    } catch (e) {
      return next(e);
    }
  }
  
};

exports.create = async (req, res, next) => {
  try {
    req.body.user = req.user.sub;
    if (req.body.phone !== '' && req.body.phone !== null && req.body.phone !== undefined) {
      req.body.phone = formatPhoneNumber(req.body.phone);
    }
    req.body.allowed = [req.user.sub]
    // const account = await Account.findOne({ user: req.user.sub });
    // req.body.createdBy = req.user.name;
    const job = await (new Job(req.body)).save();
    res.json(job);
  } catch (e) {
    next(e);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) return next();
    if (job.private && !job.allowed.includes(req.user.sub)) {
      return next()
    } 
    return res.json({
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
      bids: job.bids,
      files: job.files,
      photos: job.photos,
      phone: job.phone,
      email: job.email,
      private: job.private
    });
  } catch (e) {
    return next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const jobsPromise = Job.find({ private: false }).sort({ Created: -1 });
    const [jobs] = await Promise.all([jobsPromise]);
    res.json(jobs);
  } catch (e) {
    next(e);
  }
};

// Get private own job from user
exports.getPrivate = async (req, res, next) => {
  try {
    const jobsPromise = Job.find({ user: req.user.sub, private: true }).sort({ Created: -1 });
    const [jobs] = await Promise.all([jobsPromise]);
    res.json(jobs);
  } catch (e) {
    next(e);
  }
};

exports.getFromUser = async (req, res, next) => {
  try {
    const jobsPromise = Job.find({ user: req.user.sub }).sort({ Created: -1 });
    const [jobs] = await Promise.all([jobsPromise]);
    res.json(jobs);
  } catch (e) {
    next(e);
  }
};

// Get private jobs owned and invited
exports.getAllowed = async (req, res, next) => {
  try {
    const jobsPromise = Job.find({ allowed: req.user.sub, private: true }).sort({ Created: -1 });
    const [jobs] = await Promise.all([jobsPromise]);
    res.json(jobs);
  } catch (e) {
    next(e);
  }
};

exports.edit = async (req, res, next) => {
  if (req.file) {
    req.body.file = req.file.location;
  }
  if (req.body.phone !== '' && req.body.phone !== null && req.body.phone !== undefined) {
    req.body.phone = formatPhoneNumber(req.body.phone);
  }
  req.body.allowed = [req.user.sub]
  if (req.body.team) { // add the uid to the allowed list
    const list = []
    req.body.team.forEach((obj, i) => {
      list.push(obj.uid)
    })
    list.push(req.user.sub)
    req.body.allowed = list
  }
  try {
    const job = await Job.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, req.body, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(job);
  } catch (e) {
    next(e);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate({ _id: req.params.id, user: req.user.sub },
      { $push: { files: req.file.location } },
      { safe: true, upsert: true, new: true });
    res.json(job);
  } catch (e) {
    next(e);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await Bid.deleteMany({ project: req.params.id });
    await Job.deleteOne({ _id: req.params.id, user: req.user.sub });
    res.json('Successfully Removed Project');
  } catch (e) {
    next(e);
  }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate({ _id: req.params.id, user: req.user.sub },
      { $push: { photos: req.file.location } },
      { safe: true, upsert: true, new: true });
    res.json(job);
  } catch (e) {
    next(e);
  }
};