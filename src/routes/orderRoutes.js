const express = require('express');
const { randomUUID } = require('crypto');
const { products, orders } = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ count: orders.length, orders });
});

router.post('/', (req, res) => {
  const { productId, quantity, customerName } = req.body || {};

  if (typeof productId !== 'string' || productId.trim() === '') {
    return res.status(400).json({ error: { message: 'productId is required and must be a string.' } });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: { message: 'quantity must be a positive integer.' } });
  }
  if (typeof customerName !== 'string' || customerName.trim() === '') {
    return res.status(400).json({ error: { message: 'customerName is required and must be a string.' } });
  }

  const product = products.find((item) => item.id === productId.trim());
  if (!product) {
    return res.status(404).json({ error: { message: `Product '${productId}' was not found.` } });
  }
  if (product.stock < quantity) {
    return res.status(409).json({
      error: { message: 'Insufficient stock for this product.', availableStock: product.stock }
    });
  }

  product.stock -= quantity;
  const order = {
    id: `o-${randomUUID()}`,
    productId: product.id,
    productName: product.name,
    quantity,
    customerName: customerName.trim(),
    total: Number((product.price * quantity).toFixed(2)),
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  return res.status(201).json({ order });
});

module.exports = router;
