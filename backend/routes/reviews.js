// reviews.js
const express = require('express');
const r3 = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

r3.post('/:productId', protect, async (req, res) => {
  try {
    const existing = await Review.findOne({ user: req.user._id, product: req.params.productId });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });
    const review = await Review.create({ user: req.user._id, product: req.params.productId, ...req.body });
    await review.populate('user', 'name');
    res.status(201).json({ success: true, review });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r3.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r3.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false });
    await review.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = r3;
