const httpStatus = require('http-status');
const { omit } = require('lodash');
const crypto = require('crypto');
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

exports.getAccount = async (req, res, next) => {
  try {
    //console.log(req.headers.authorization)
    const account = await Account.findOne({ user: req.user.sub });
    if (!account) {
      let name = ""
      let email = ""
      let picture = ""
      axios.defaults.headers.common['Authorization'] = req.headers.authorization;
      await axios.get('https://dev-2upadx1s.auth0.com/userinfo')
        .then(function (response) {
          name = response.data.name
          email = response.data.email
          picture = response.data.picture
        })
        .catch(function (error) {
          next(error)
        });

      const account = await (new Account({ user: req.user.sub, name, email, picture })).save();
      res.json({ account });
    } else {
      res.json({ account });
    }
  } catch (e) { next(e) };
};

exports.editAccount = async (req, res, next) => {

  let name = req.body.name
  let phone = ""
  if (req.body.phone !== "") {
    phone = formatPhoneNumber(req.body.phone);
  }
  let description = req.body.description
  let hourly = req.body.hourly
  let available = req.body.available
  try {
    const account = await Account.findOneAndUpdate({ user: req.user.sub }, {name, phone, description, hourly, available}, {
      new: true, // return the new store instead of the old one
      runValidators: true,
    }).exec();
    res.json(account);
  } catch (e) {
    next(e)
  }
};