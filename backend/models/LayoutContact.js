const mongoose = require('mongoose');

const layoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, default: 'My Room Layout' },
  room: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  furniture: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    category: String,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    depth: { type: Number, required: true },
    height: Number,
    rotation: { type: Number, default: 0 },
    color: { type: String, default: '#8b6f47' }
  }],
  spaceUtilization: { totalArea: Number, usedArea: Number, percentage: Number }
}, { timestamps: true });

const Layout = mongoose.model('Layout', layoutSchema);

const contactQuerySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: String,
  subject: String,
  message: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ['New','Read','Responded','Closed'], default: 'New' },
  adminNotes: String
}, { timestamps: true });

const ContactQuery = mongoose.model('ContactQuery', contactQuerySchema);

module.exports = { Layout, ContactQuery };
