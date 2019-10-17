const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
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
      const ext = file.originalname.split('.').slice(1).join('.');
      console.log(file);
      const name = `${`${req.user.sub}/logo.${ext}`}`;
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

exports.getAccount = async (req, res, next) => {
  try {
    await auth0.getUser({ id: req.user.sub }, function (err, user) {
      res.json(user);
    });
  } catch (e) {
    return next(e);
  }
};

exports.editAccount = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.picture = req.file.location;
    }
    if (req.body.user_metadata.phone !== '' && req.body.user_metadata.phone !== null && req.body.user_metadata.phone !== undefined) {
      req.body.user_metadata.phone = formatPhoneNumber(req.body.user_metadata.phone);
    }
    var params = { id: req.user.sub };
    await auth0.updateUser(params, req.body, function (err, user) {
      res.json(user);
    });
  } catch (e) {
    return next(e);
  }
};
