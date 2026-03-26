const mongoose = require('mongoose');
require('dotenv').config();
const User    = require('./models/User');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jothi-furniture';

// Real Unsplash furniture images — one per product
const products = [
  {
    name: 'Royal Teak Wood Sofa Set (3+1+1)',
    price: 45000, originalPrice: 55000, category: 'Sofa',
    description: 'Premium 3+1+1 teak wood sofa set with high-density foam cushions. Handcrafted by skilled artisans at Jothi Industrial And Furniture, Ilampillai, Salem. Durable, elegant and built to last generations.',
    dimensions: { length: 220, width: 85, height: 95 },
    material: 'Teak Wood', color: 'Brown', stock: 8, featured: true,
    averageRating: 4.5, reviewCount: 12,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80']
  },
  {
    name: 'Industrial Metal & Wood Dining Table',
    price: 22000, originalPrice: 28000, category: 'Dining',
    description: 'Sturdy 6-seater industrial dining table with powder-coated metal frame and solid wood top. Perfect for modern and rustic interiors.',
    dimensions: { length: 180, width: 90, height: 76 },
    material: 'Iron + Solid Wood', color: 'Rustic Brown', stock: 15, featured: true,
    averageRating: 4.3, reviewCount: 8,
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80']
  },
  {
    name: 'Sheesham Wood King Bed with Storage',
    price: 38000, originalPrice: 45000, category: 'Bed',
    description: 'Elegant king-size bed crafted from premium sheesham wood with hydraulic storage drawers and ornate headboard.',
    dimensions: { length: 220, width: 200, height: 120 },
    material: 'Sheesham Wood', color: 'Walnut', stock: 5, featured: true,
    averageRating: 4.7, reviewCount: 15,
    images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80']
  },
  {
    name: 'Executive High-Back Office Chair',
    price: 12000, originalPrice: 15000, category: 'Chair',
    description: 'High-back executive office chair with lumbar support, adjustable height and padded armrests. Genuine leather upholstery.',
    dimensions: { length: 70, width: 70, height: 125 },
    material: 'Leather + Metal', color: 'Black', stock: 20, featured: false,
    averageRating: 4.2, reviewCount: 22,
    images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80']
  },
  {
    name: '4-Door Sliding Mirror Wardrobe',
    price: 35000, originalPrice: 42000, category: 'Wardrobe',
    description: '4-door sliding wardrobe with full-length mirror panels, internal shelves, hanging space and drawer units.',
    dimensions: { length: 240, width: 60, height: 210 },
    material: 'HDF Board', color: 'White Oak', stock: 6, featured: true,
    averageRating: 4.4, reviewCount: 9,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80']
  },
  {
    name: 'Solid Wood Study Desk with Drawer Unit',
    price: 8500, originalPrice: 11000, category: 'Desk',
    description: 'Spacious study desk with 3-drawer pedestal unit. Made from solid rubberwood with smooth natural finish.',
    dimensions: { length: 120, width: 60, height: 75 },
    material: 'Rubberwood', color: 'Natural', stock: 25, featured: false,
    averageRating: 4.0, reviewCount: 18,
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80']
  },
  {
    name: 'L-Shaped Corner Sectional Sofa',
    price: 55000, originalPrice: 68000, category: 'Sofa',
    description: 'Luxurious L-shaped sectional sofa with chaise lounge. Premium woven fabric upholstery over solid wood frame.',
    dimensions: { length: 280, width: 180, height: 85 },
    material: 'Fabric + Solid Wood', color: 'Charcoal Grey', stock: 4, featured: true,
    averageRating: 4.6, reviewCount: 7,
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80']
  },
  {
    name: '5-Tier Bookshelf with Bottom Cabinet',
    price: 9800, originalPrice: 12500, category: 'Shelf',
    description: '5-tier open bookshelf with lockable bottom cabinet. Engineered wood with wenge finish.',
    dimensions: { length: 90, width: 35, height: 180 },
    material: 'Engineered Wood', color: 'Wenge', stock: 18, featured: false,
    averageRating: 4.1, reviewCount: 14,
    images: ['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80']
  },
  {
    name: 'Industrial Pipe Bookcase',
    price: 15000, originalPrice: 18000, category: 'Shelf',
    description: 'Vintage industrial-style bookcase with black metal pipe frame and solid mango wood shelves.',
    dimensions: { length: 120, width: 40, height: 200 },
    material: 'Iron Pipe + Mango Wood', color: 'Black + Natural', stock: 10, featured: false,
    averageRating: 4.3, reviewCount: 6,
    images: ['https://images.unsplash.com/photo-1572373672978-0b9b74d05fba?w=600&q=80']
  },
  {
    name: 'Solid Wood Dining Chairs Set of 4',
    price: 14000, originalPrice: 18000, category: 'Chair',
    description: 'Set of 4 solid teak wood dining chairs with cushioned fabric seats. Classic design for any dining table.',
    dimensions: { length: 45, width: 45, height: 95 },
    material: 'Teak Wood + Fabric', color: 'Brown', stock: 12, featured: false,
    averageRating: 4.4, reviewCount: 11,
    images: ['https://images.unsplash.com/photo-1549497538-303791108f95?w=600&q=80']
  },
  {
    name: 'Modern TV Unit Cabinet 65"',
    price: 18000, originalPrice: 22000, category: 'Cabinet',
    description: 'Contemporary TV unit with cable management, sliding doors and open display shelves. Fits TVs up to 65 inches.',
    dimensions: { length: 180, width: 45, height: 55 },
    material: 'Plywood + HDF', color: 'White', stock: 9, featured: false,
    averageRating: 4.2, reviewCount: 16,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80']
  },
  {
    name: 'Lift-Top Coffee Table with Storage',
    price: 11500, originalPrice: 14000, category: 'Table',
    description: 'Smart coffee table with hydraulic lift-top mechanism revealing hidden storage compartment.',
    dimensions: { length: 110, width: 65, height: 45 },
    material: 'Engineered Wood', color: 'Espresso', stock: 14, featured: false,
    averageRating: 4.3, reviewCount: 20,
    images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600&q=80']
  },
  {
    name: 'Wooden Double Bed with Box Storage',
    price: 28000, originalPrice: 34000, category: 'Bed',
    description: 'Solid wood double bed with hydraulic box storage. Smooth finish, strong joints and premium quality.',
    dimensions: { length: 200, width: 160, height: 110 },
    material: 'Solid Wood', color: 'Teak Brown', stock: 7, featured: true,
    averageRating: 4.5, reviewCount: 19,
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80']
  },
  {
    name: 'Recliner Sofa Chair with Ottoman',
    price: 25000, originalPrice: 32000, category: 'Sofa',
    description: 'Premium recliner sofa chair with matching ottoman footrest. Leatherette finish, adjustable backrest.',
    dimensions: { length: 95, width: 90, height: 100 },
    material: 'Leatherette + Wood', color: 'Dark Brown', stock: 11, featured: true,
    averageRating: 4.6, reviewCount: 14,
    images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80']
  },
  {
    name: 'Wooden Dining Table 4 Seater',
    price: 16000, originalPrice: 20000, category: 'Dining',
    description: 'Classic 4-seater wooden dining table with smooth top and sturdy legs. Ideal for small families.',
    dimensions: { length: 120, width: 75, height: 76 },
    material: 'Solid Wood', color: 'Natural', stock: 13, featured: false,
    averageRating: 4.2, reviewCount: 9,
    images: ['https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80']
  },
  {
    name: 'Metal Frame Industrial Wardrobe',
    price: 19000, originalPrice: 24000, category: 'Wardrobe',
    description: 'Industrial style open wardrobe with metal frame and wooden shelves. Perfect for modern loft interiors.',
    dimensions: { length: 120, width: 50, height: 180 },
    material: 'Metal + Wood', color: 'Black + Walnut', stock: 8, featured: false,
    averageRating: 4.1, reviewCount: 7,
    images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80']
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🌱  Jothi Furniture — Database Seeder');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅  MongoDB Connected');
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('  🗑️   Cleared old data');
    await User.create({ name:'Sathish - Admin', email:'admin@jothifurniture.com', password:'admin123', role:'admin', phone:'9999999999' });
    await User.create({ name:'Test Customer', email:'customer@test.com', password:'customer123', role:'customer', phone:'8888888888' });
    const created = await Product.insertMany(products);
    console.log(`  👤  2 users created`);
    console.log(`  📦  ${created.length} products inserted with images`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅  Database seeded successfully!');
    console.log('');
    console.log('  👑  Admin:    admin@jothifurniture.com / admin123');
    console.log('  👤  Customer: customer@test.com / customer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (error) {
    console.error('  ❌  Seed error:', error.message);
    process.exit(1);
  }
}
seed();
