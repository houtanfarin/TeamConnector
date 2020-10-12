const express = require('express');
const router = express.Router();

// @roue GET api/Posts
// @desc test route
// @access public
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;