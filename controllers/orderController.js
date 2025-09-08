const Order = require('../models/Order');
const Product = require('../models/Product');

// Create order (customer only)
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items must be a non-empty array' });
    }

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        ownerId: product.ownerId,
        quantity: item.quantity,
        totalCost: product.cost * item.quantity
      });
    }

    const order = new Order({
      customerId: req.user.userId,
      items: orderItems,
      shippingStatus: 'pending'
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'fullName email')
      .populate('items.productId', 'productName cost');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single order (admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'fullName email')
      .populate('items.productId', 'productName cost');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order history (customer or admin)
exports.getOrderHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user.userId;
    }
    const orders = await Order.find(query)
      .populate('customerId', 'fullName email')
      .populate('items.productId', 'productName cost');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update shipping status (admin only + socket notification)
exports.updateShippingStatus = async (req, res) => {
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

    const customerId = order.customerId._id.toString();
    const socketId = onlineUsers.get(customerId);

    if (socketId) {
      req.io.to(socketId).emit('notification', {
        title: "New shipping status",
        message: `Your last order shipping status has been updated to ${shippingStatus}`
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
