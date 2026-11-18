const express = require('express');
const { products } = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ count: products.length, products });
});

module.exports = router;
