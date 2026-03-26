const mongoose = require('mongoose');

const recommendationSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, required: true },

  // Room Input
  room: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    type: { type: String, required: true },
    windows: [{ wall: String, position: Number, width: Number }],
    doors: [{ wall: String, position: Number, width: Number }]
  },

  // User Preferences
  lifestyle: { type: String, enum: ['Minimalist', 'WorkFromHome', 'Family', 'Luxury'], default: 'Family' },
  budget: { type: Number, default: null },
  style: { type: String, default: 'modern' },
  members: { type: Number, default: 2 },

  // Furniture Input (what user has / wants to place)
  furnitureInput: [{
    name: String,
    category: String,
    length: Number,
    width: Number,
    height: Number,
    x: Number,
    y: Number,
    rotation: Number
  }],

  // AI Analysis Results
  analysis: {
    // Per-furniture fit results
    furnitureFit: [{
      name: String,
      fits: Boolean,
      reason: String,
      suggestedAlternative: String
    }],

    // Space metrics
    roomArea: Number,
    usedArea: Number,
    freeAreaPct: Number,
    utilizationScore: Number,

    // Issues detected
    overlaps: [{ item1: String, item2: String }],
    blockages: [{ item: String, issue: String }],

    // Scores (0-100)
    movementComfortScore: Number,
    aestheticScore: Number,
    naturalLightScore: Number,
    overallScore: Number,

    // Recommendations
    bestLayout: String,
    layoutSuggestions: [String],
    themeRecommendation: String,
    alternativeFurnitureSizes: [{ original: String, suggested: String, reason: String }],
    budgetSuggestions: [{ name: String, price: Number, reason: String }],

    // AI reasoning
    aiReasoning: String,
    improvementSteps: [String]
  },

  // Products recommended from DB
  recommendedProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    score: Number,
    reason: String,
    priority: String
  }],

  estimatedTotal: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('RecommendationSession', recommendationSessionSchema);
