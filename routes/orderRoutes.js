const express = require('express');
const Order = require('../models/order');
const Product = require('../models/order');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const customerMiddleware = require('../middleware/customerMiddleware');

const router = express.Router();

// Create order (customer only)
router.post('/', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items must be a non-empty array' });
    }

    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        ownerId: product.ownerId,
        quantity: item.quantity,
        totalCost: product.cost * item.quantity
      });
    }

    const order = new Order({ customerId: req.user.userId, items: orderItems });
    await order.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
});

// Get order history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') query.customerId = req.user.userId;

    const orders = await Order.find(query)
      .populate('customerId', 'fullName email')
      .populate('items.productId', 'productName cost');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin - get all orders
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'fullName email')
      .populate('items.productId', 'productName cost');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin - get single order
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'fullName email')
      .populate('items.productId', 'productName cost');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin - update shipping status + notify
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { shippingStatus } = req.body;
    if (!['pending', 'shipped', 'delivered'].includes(shippingStatus)) {
      return res.status(400).json({ message: 'Invalid shipping status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { shippingStatus },
      { new: true }
    ).populate('customerId', 'fullName email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Notify customer if online
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    const customerId = order.customerId._id.toString();
    const socketId = onlineUsers.get(customerId);

    if (socketId) {
      io.to(socketId).emit('notification', {
        title: "New shipping status",
        message: `Your last order shipping status has been updated to ${shippingStatus}`
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
