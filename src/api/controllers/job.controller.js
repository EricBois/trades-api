const Job = require('../models/job.model');
const Account = require('../models/account.model');

const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

aws.config.update({
    secretAccessKey: process.env.AWS_KEY,
    accessKeyId: process.env.AWS_KEYID,
    region: "us-east-1" // region of your bucket
});

const s3 = new aws.S3();

const multerOptions = {
    storage: multerS3({
        s3,
        bucket: "subhub01",
        acl: "public-read",
        metadata(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key(req, file, cb) {
            const name = `${req.user.sub}/` + `${req.params.id}/`+ file.originalname;
            cb(null, name);
        }
    }),
    fileFilter(req, file, next) {
        const isPdf = file.mimetype.startsWith("application/pdf");
        if (isPdf) {
            next(null, true);
        } else {
            next({ message: "That filetype isn't allowed!" }, false);
        }
    }
};

const singleUpload = multer(multerOptions).single("file");

exports.upload = async (req, res, next) => {
    await singleUpload(req, res, (err, some) => {
        if (err) {
            return res.status(422).send({
                errors: [{ title: "Upload Error", detail: err.message }]
            });
        }
        next();
    });
};

exports.deleteFile = async (req, res) => {
    const params = {
      Bucket: 'subhub01',
      Delete: { // required
        Objects: [ // required
          {
            Key: (`${req.user.sub}/` + `${req.params.id}/`+`${req.params.name}`), // required
          },
        ],
      },
    };
    await s3.deleteObjects(params, (err, data) => {
      if (err) next(err, err.stack); // an error occurred
    });
    try {
        const job = await Job.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, {file: ''}, {
            new: true, // return the new store instead of the old one
            runValidators: true,
        }).exec();
        res.json('Done')
    } catch (e) {
        next(e)
    }
  };
  
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
            bids: job.bids,
            file: job.file
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
    if (req.file) {
        req.body.file = req.file.location;
    }
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
    ;
}