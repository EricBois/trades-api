const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const axios = require('axios')
const Account = require('../models/account.model');

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
      const ext = file.originalname.split('.').slice(1).join('.')
      console.log(file)
      const name = `${req.user.sub}/` + "logo."+ext;
      cb(null, name);
    }
  }),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
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
        errors: [{ title: "Image Upload Error", detail: err.message }]
      });
    }
    next();
  });
};

exports.getAccount = async (req, res, next) => {
  try {
    //console.log(req.headers.authorization)
    const account = await Account.findOne({ user: req.user.sub });
    if (!account) {
      let name = ""
      let email = ""
      let avatar = ""
      axios.defaults.headers.common['Authorization'] = req.headers.authorization;
      await axios.get('https://dev-2upadx1s.auth0.com/userinfo')
        .then(function (response) {
          name = response.data.name
          email = response.data.email
          avatar = response.data.avatar
        })
        .catch(function (error) {
          next(error)
        });

      const account = await (new Account({ user: req.user.sub, name, email, avatar })).save();
      res.json({ account });
    } else {
      res.json({ account });
    }
  } catch (e) { next(e) };
};

exports.editAccount = async (req, res, next) => {

  if (req.file) {
    req.body.avatar = req.file.location;
  }
  if (req.body.phone !== "" && req.body.phone !== null && req.body.phone !== undefined) {
    req.body.phone = formatPhoneNumber(req.body.phone);
  }
  
  try {
    const account = await Account.findOneAndUpdate({ user: req.user.sub }, req.body, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(account);
  } catch (e) {
    next(e)
  }
};