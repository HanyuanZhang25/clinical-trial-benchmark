const express = require('express');
const siteContent = require('../content/siteContent');

const router = express.Router();

router.get('/home', (req, res) => {
  res.json({
    success: true,
    content: siteContent
  });
});

module.exports = router;
