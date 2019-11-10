const express = require('express');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const controller = require('../../controllers/job.controller');

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

// router
//   .route('/get')
//   .get(checkJwt, controller.getAccount);

// router
//   .route('/edit')
//   .post(checkJwt, controller.upload, controller.editAccount);

router
  .route('/create')
  .post(checkJwt, controller.create);

router
  .route('/get')
  .get(checkJwt, controller.get);

router
  .route('/private')
  .get(checkJwt, controller.getPrivate);

router
  .route('/get/user')
  .get(checkJwt, controller.getFromUser);

router
  .route('/get/private')
  .get(checkJwt, controller.getAllowed);

router
  .route('/view/:id')
  .get(checkJwt, controller.getOne);

router
  .route('/edit/:id')
  .post(checkJwt, controller.upload, controller.edit);

router
  .route('/upload/:id')
  .post(checkJwt, controller.upload, controller.uploadFile);

router
  .route('/delete/:id')
  .post(checkJwt, controller.delete);

router
  .route('/deleteFile/:name/:id/:type')
  .post(checkJwt, controller.deleteFile);

router
  .route('/uploadPhoto/:id')
  .post(checkJwt, controller.upload, controller.uploadPhoto);

module.exports = router;
