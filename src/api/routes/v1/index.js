const express = require('express');
const accountRoutes = require('./account.route');
const jobRoutes = require('./job.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/account', accountRoutes);

router.use('/job', jobRoutes);


module.exports = router;
