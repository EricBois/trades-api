const Bid = require('../models/bid.model');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

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
    const isFile = file.mimetype.startsWith('application/pdf');
    if (isFile) {
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

exports.uploadFile = async (req, res, next) => {
  try {
    const job = await Bid.findByIdAndUpdate({ _id: req.params.id, user: req.user.sub },
      { $push: { files: req.file.location } },
      { safe: true, upsert: true, new: true });
    res.json(job);
  } catch (e) {
    next(e);
  }
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
      const job = await Bid.findByIdAndUpdate({ _id: req.params.id, user: req.user.sub },
        { $pull: { files: req.body.file } },
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

exports.notified = async (req, res, next) => {
  try {
    if (req.body.meetingRequested) {
      const project = await Bid.findOneAndUpdate({  _id: req.body.bid.id, user: req.body.bid.user}, {meetingRequested: true}, {
        new: true, // return the new store instead of the old one
        runValidators: true,
      }).exec();
      if (!project) return next()
      res.json(project)
    } else {
      const project = await Bid.findOneAndUpdate({  _id: req.body.bid.id, user: req.body.bid.user}, {notified: true}, {
        new: true, // return the new store instead of the old one
        runValidators: true,
      }).exec();
      if (!project) return next()
      res.json(project)
    }
  } catch(e) {
    next(e)
  }
}

exports.delMeeting = async (req, res, next) => {
  const meeting = await Bid.findOneAndUpdate({  _id: req.body.id, host: req.user.sub}, 
    { $set: { 
      meeting: {dates: [], host: '', description: ''},
      request: false,
      meetingRequested: false,
      host: '',
      confirm: {
        status: false,
        date: '',
        description: ''
      },
      change: {
        status: false,
        uid: ''
      }
    }}, {
    new: true,
    runValidators: true,
  }).exec();
  if (!meeting) return next()
  res.json(meeting)
};

exports.meeting = (req, res, next) => {
  try {
    req.body.bid.forEach(async bid =>  {
      const project = await Bid.findOneAndUpdate({  _id: bid.id, user: bid.user}, req.body.meeting, {
        new: true, // return the new store instead of the old one
        runValidators: true,
      }).exec();
      if (!project) return next()
      res.json(project)
    })
  } catch (e) {
    return next(e)
  }
};

exports.getMeetings = async (req, res, next) => {
  try {
    const bidsPromise = Bid.find({ request: true, $or: [{ user : req.user.sub },
      { host: req.user.sub }] }).sort({ Created: -1 });
    const [bids] = await Promise.all([bidsPromise]);
    res.json(bids);
  } catch (e) {
    next(e);
  }
};