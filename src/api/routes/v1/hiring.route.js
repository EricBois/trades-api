const express = require('express');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const controller = require('../../controllers/hiring.controller');

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
  .route('/edit/:id')
  .post(checkJwt, controller.edit);

router
  .route('/status/:id')
  .post(checkJwt, controller.hired);

router
  .route('/delete/:id')
  .post(checkJwt, controller.delete);


module.exports = router;
