const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { ContactQuery } = require('../models/LayoutContact');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalQueries] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      ContactQuery.countDocuments()
    ]);
    const [revenueData, recentOrders, newQueries] = await Promise.all([
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
      ContactQuery.countDocuments({ status: 'New' })
    ]);
    const revenue = revenueData[0]?.total || 0;
    res.json({ success: true, stats: { totalUsers, totalProducts, totalOrders, totalQueries, revenue, newQueries }, recentOrders });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/users', protect, adminOnly, async (req, res) => {
  try { res.json({ success: true, users: await User.find().sort({ createdAt: -1 }) }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/inventory', protect, adminOnly, async (req, res) => {
  try {
    const [lowStock, outOfStock] = await Promise.all([
      Product.find({ isActive: true, stock: { $gt: 0, $lt: 10 } }).sort({ stock: 1 }),
      Product.find({ isActive: true, stock: 0 })
    ]);
    res.json({ success: true, lowStock, outOfStock });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
