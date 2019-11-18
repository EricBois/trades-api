const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const Photos = require('../models/photos.model');
var ManagementClient = require('auth0').ManagementClient;

var auth0 = new ManagementClient({
  domain: 'dev-2upadx1s.auth0.com',
  clientId: `${process.env.AUTH0_MANAGEMENT_ID}`,
  clientSecret: `${process.env.AUTH0_MANAGEMENT_SECRET}`,
  scope: 'read:users update:users'
});



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
      const name = `${`${req.user.sub}/${file.originalname}`}`;
      cb(null, name);
    },
  }),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
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
        errors: [{ title: 'Image Upload Error', detail: err.message }],
      });
    }
    return next();
  });
};

exports.deleteLogo = async (req, res, next) => {
  const params = {
    Bucket: 'subhub01',
    Delete: { // required
      Objects: [ // required
        {
          Key: (`${`${req.user.sub}/${req.params.name}`}`), // required
        },
      ],
    },
  };
  await s3.deleteObjects(params, (err) => {
    if (err) next(err, err.stack); // an error occurred
  });
};

exports.deletePhoto = async (req, res, next) => {
  const params = {
    Bucket: 'subhub01',
    Delete: { // required
      Objects: [ // required
        {
          Key: (`${`${req.user.sub}/${req.params.name}`}`), // required
        },
      ],
    },
  };
  await s3.deleteObjects(params, (err) => {
    if (err) next(err, err.stack); // an error occurred
  });
  try {
    const photos = await Photos.findOneAndUpdate({ user: req.user.sub },
      { $pull: { photos: req.body.file } },
      { safe: true, upsert: true, new: true });
    return res.json(photos);
  } catch (e) {
    return next(e)
  }
};

exports.getAccount = async (req, res, next) => {
  try {
    const user = await auth0.getUser({ id: req.user.sub });
    const photos = await Photos.findOne({user: req.user.sub});
    return res.json({user, photos})
  } catch (e) {
    return next(e);
  }
};

exports.getPublicAccount = async (req, res, next) => {
  try {
    const sorted = []
    const userPromise = await auth0.getUsers({search_engine: 'v3', q: 'user_metadata.available:true'});
    const [users] = await Promise.all([userPromise]);
    for (const key in users) {
      const user = users[key]
      user._id = key
      sorted.push({
        name: user.name,
        uid: user.user_id,
        picture: user.picture,
        metadata: user.user_metadata
      })
    }
    return res.json(sorted)
  } catch (e) {
    return next(e);
  }
};

exports.editAccount = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.picture = req.file.location;
    }
    if ( !req.file && req.body.user_metadata.phone !== '' && req.body.user_metadata.phone !== null && req.body.user_metadata.phone !== undefined) {
      req.body.user_metadata.phone = formatPhoneNumber(req.body.user_metadata.phone);
    }
    await auth0.updateUser({ id: req.user.sub }, req.body, function (err, user) {
      res.json(user);
    });
  } catch (e) {
    return next(e);
  }
};

exports.uploadPhotos = async (req, res, next) => {
  try {
    const photos = await Photos.findOneAndUpdate({ user: req.user.sub },
      { $push: { photos: req.file.location } },
      { safe: true, upsert: true, new: true, runValidators: true });
    
    if (!photos) {
      req.body.user = req.user.sub
      req.body.photos = req.file.location
      const photos = await (new Photos(req.body)).save();
      return res.json(photos);
    }
    return res.json(photos);
  } catch (e) {
    return next(e)
  }
};

exports.getProfileBid = async (req, res, next) => {
  try {
    const user = await auth0.getUser({ id: req.params.id });
    const photos = await Photos.findOne({user: req.params.id});
    res.json({
      name: user.name,
      picture: user.picture,
      metadata: user.user_metadata,
      photos: photos,
      uid: user.user_id
    });
  } catch (e) {
    return next(e);
  }
};