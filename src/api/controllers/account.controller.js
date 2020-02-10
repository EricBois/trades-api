const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const Photos = require('../models/photos.model');
const Code = require('../models/code.model');

var ManagementClient = require('auth0').ManagementClient;

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var auth0 = new ManagementClient({
  domain: 'dev-2upadx1s.auth0.com',
  clientId: `${process.env.AUTH0_MANAGEMENT_ID}`,
  clientSecret: `${process.env.AUTH0_MANAGEMENT_SECRET}`,
  scope: 'read:users update:users create:users'
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
    const userPromise = await auth0.getUsers({search_engine: 'v3', q: 'user_metadata.available:true', sort: 'last_logint:-1'});
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

// code generator
const generateRandomCode = (() => {
  const USABLE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789".split("");

  return length => {
    return new Array(length).fill(null).map(() => {
      return USABLE_CHARACTERS[Math.floor(Math.random() * USABLE_CHARACTERS.length)];
    }).join("");
  }
})();

exports.createCode = async (req, res, next) => {
  try {
    const user = await auth0.getUser({ id: req.user.sub });
    // if no app metadata or no admin flag deny access
    if (!user.app_metadata || !user.app_metadata.admin) return next()
    const gencode = generateRandomCode(5)
    const code = await (new Code({user: req.body.name, userUid: req.user.sub, code: gencode})).save();
    if (!code) return next()
    res.json(code)
  } catch (e) {
    next(e)
  }
}

exports.verifyCode = async (req, res, next) => {
  try {
    const code = await Code.findOne({ code: req.body.code });
    if (!code) return next()
    res.json(code)
  } catch(e) {
    next(e)
  }
}

exports.usedCode = async (req, res, next) => {
  try {
    const user = await auth0.getUser({ id: req.user.sub });
    // if no app metadata or no admin flag deny access
    if (!user.app_metadata || !user.app_metadata.admin) return next()
    const code = await Code.findOneAndUpdate({ code: req.body.code }, { used: true }, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(code)
  } catch(e) {
    next(e)
  }
}

//get codes
exports.getCodes = async (req, res, next) => {
  try {
    const user = await auth0.getUser({ id: req.user.sub });
    // if no app metadata or no admin flag deny access
    if (!user.app_metadata || !user.app_metadata.admin) return next()
    const codesPromise = Code.find().sort({ created: -1 });
    const [codes] = await Promise.all([codesPromise]);
    res.json(codes);
  } catch (e) {
    next(e);
  }
};

// Create account if code is OK
exports.createAccount = async (req, res, next) => {
  try {
    const code = await Code.findOne({ code: req.body.code });
    if (!code) return next()
    await auth0.createUser({
      verify_email: true,
      connection: 'Username-Password-Authentication',
      name: req.body.name,
      user_metadata: {
        phone: req.body.user_metadata.phone,
        invitedBy: code.user
      },
      email: req.body.email,
      password: req.body.password
    }, async function (err, user) {
      if (err) {
        res.json(err);
      } else {
        await Code.deleteOne({ code: req.body.code });
      
        res.json('User Created')
      }
      
    })
  } catch (e) {
    return next(e)
  }
};

exports.inquire = async (req, res, next) => {
  try {
    const inquiries = {
      to: 'burn4live@gmail.com',
      from: 'support@sub-hub.ca',
      subject: 'Account Application form',
      text: `Name: ${req.body.name}, Email: ${req.body.email}, Phone: ${req.body.phone}, Employment: ${req.body.status}, Experience: ${req.body.experience}, Skills: ${req.body.skills}, References: ${req.body.references}`,
      html: `Name: ${req.body.name}<br> Email: ${req.body.email}<br> Phone: ${req.body.phone}<br> Employment: ${req.body.status}<br> Experience: ${req.body.experience}<br> Skills: ${req.body.skills}<br> References: ${req.body.references}`,
    };
    sgMail.send(inquiries);
    res.json('Application Sent!')
  } catch(e) {
    next(e)
  }
}