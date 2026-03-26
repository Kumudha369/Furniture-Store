const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  category: { type: String, required: true, enum: ['Sofa','Chair','Table','Bed','Wardrobe','Shelf','Desk','Cabinet','Dining','Outdoor','Industrial','Other'] },
  description: { type: String, required: true },
  dimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  material: String, color: String,
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text' });
module.exports = mongoose.model('Product', productSchema);
