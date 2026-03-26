// contact.js
const express = require('express');
const r2 = express.Router();
const { ContactQuery } = require('../models/LayoutContact');
const { protect, adminOnly } = require('../middleware/auth');

r2.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Name, email and message required' });
    const query = await ContactQuery.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, message: 'Query submitted! We will contact you soon.', query });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r2.get('/', protect, adminOnly, async (req, res) => {
  try {
    const q = req.query.status ? { status: req.query.status } : {};
    res.json({ success: true, queries: await ContactQuery.find(q).sort({ createdAt: -1 }) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
r2.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const q = await ContactQuery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, query: q });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = r2;
