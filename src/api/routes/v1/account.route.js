const express = require('express');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const controller = require('../../controllers/account.controller');

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw Error('Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file');
}

const checkJwt = jwt({
  // Dynamically provide a signing key based on the [Key ID](https://tools.ietf.org/html/rfc7515#section-4.1.4) header parameter ("kid") and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});


const router = express.Router();

router
  .route('/get')
  .get(checkJwt, controller.getAccount);

router
  .route('/public')
  .get(checkJwt, controller.getPublicAccount);

router
  .route('/edit')
  .post(checkJwt, controller.upload, controller.editAccount);

router
  .route('/getProfile/:id')
  .get(checkJwt, controller.getProfileBid);

router
  .route('/deleteLogo/:name')
  .post(checkJwt, controller.deleteLogo);

router
  .route('/deletePhoto/:name')
  .post(checkJwt, controller.deletePhoto);

router
  .route('/uploadPhoto')
  .post(checkJwt, controller.upload, controller.uploadPhotos);

router
  .route('/gencode')
  .post(checkJwt, controller.createCode);

router
  .route('/usedCode')
  .post(checkJwt, controller.usedCode);

router
  .route('/codes')
  .get(checkJwt, controller.getCodes);

router
  .route('/delCode')
  .post(checkJwt, controller.delCode);

router
  .route('/create')
  .post(controller.createAccount);

router
  .route('/verifyCode')
  .post(controller.verifyCode);

router
  .route('/inquire')
  .post(controller.inquire);

module.exports = router;
