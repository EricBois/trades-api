const express = require('express');
const controller = require('../../controllers/job.controller');

const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

const checkJwt = jwt({
  // Dynamically provide a signing key based on the [Key ID](https://tools.ietf.org/html/rfc7515#section-4.1.4) header parameter ("kid") and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
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
    .route('/get/user')
    .get(checkJwt, controller.getFromUser);

router
    .route('/view/:id')
    .get(checkJwt, controller.getOne);

router
    .route('/edit/:id')
    .post(checkJwt, controller.upload, controller.edit);

router
    .route('/delete/:id')
    .post(checkJwt, controller.delete);

module.exports = router;
