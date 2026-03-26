/**
 * orders.js — routes/orders.js
 */
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'No items' });
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      subtotal += product.price * item.quantity;
      orderItems.push({ product: product._id, name: product.name, quantity: item.quantity, price: product.price });
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }
    const shippingCost = subtotal > 10000 ? 0 : 500;
    const order = await Order.create({ user: req.user._id, items: orderItems, shippingAddress, subtotal, shippingCost, total: subtotal + shippingCost, paymentMethod: paymentMethod || 'COD', notes });
    res.status(201).json({ success: true, order });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product', 'name images').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images').populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, order });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip((page-1)*20).limit(20);
    const total = await Order.countDocuments(query);
    res.json({ success: true, total, orders });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, order });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
