/**
 * layouts.js
 */
const express = require('express');
const r1 = express.Router();
const { Layout } = require('../models/LayoutContact');
const { protect } = require('../middleware/auth');

r1.post('/', protect, async (req, res) => {
  try {
    const layout = await Layout.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, layout });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r1.get('/my', protect, async (req, res) => {
  try { res.json({ success: true, layouts: await Layout.find({ user: req.user._id }).sort({ updatedAt: -1 }) }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r1.get('/:id', protect, async (req, res) => {
  try {
    const layout = await Layout.findById(req.params.id);
    if (!layout || layout.user.toString() !== req.user._id.toString()) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, layout });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r1.put('/:id', protect, async (req, res) => {
  try {
    const layout = await Layout.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    res.json({ success: true, layout });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r1.delete('/:id', protect, async (req, res) => {
  try {
    await Layout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = r1;
