const express = require('express');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const controller = require('../../controllers/message.controller');

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
  .route('/send')
  .post(checkJwt, controller.create);

router
  .route('/send/:id')
  .post(checkJwt, controller.create);

router
  .route('/delete/:id')
  .post(checkJwt, controller.delete);

router
  .route('/read/:id')
  .get(checkJwt, controller.read);

router
  .route('/get')
  .get(checkJwt, controller.get);

module.exports = router;
