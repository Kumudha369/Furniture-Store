const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const RecommendationSession = require('../models/RecommendationSession');

// uuid fallback
function uuidv4() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

const ROOM_RULES = {
  living:   { essential:['Sofa','Table','Cabinet'], optional:['Chair','Shelf'], avoid:[] },
  bedroom:  { essential:['Bed','Wardrobe'], optional:['Desk','Chair','Shelf'], avoid:['Dining'] },
  dining:   { essential:['Dining','Chair'], optional:['Cabinet','Shelf'], avoid:['Bed'] },
  study:    { essential:['Desk','Chair'], optional:['Shelf','Cabinet'], avoid:[] },
  office:   { essential:['Desk','Chair'], optional:['Shelf','Cabinet','Sofa'], avoid:[] },
  kids:     { essential:['Bed','Desk','Shelf'], optional:['Chair','Wardrobe'], avoid:['Dining'] }
};

const LIFESTYLE_RULES = {
  Minimalist:   { maxUtil:40, preferFunctional:true },
  WorkFromHome: { prioritize:['Desk','Chair','Shelf'] },
  Family:       { prioritize:['Sofa','Dining','Bed'] },
  Luxury:       { preferPremium:true }
};

function checkFurnitureFit(item, roomL, roomW) {
  const fits = (item.length <= roomL && item.width <= roomW) || (item.width <= roomL && item.length <= roomW);
  const usagePct = Math.round(((item.length * item.width) / (roomL * roomW)) * 100);
  const alt = fits ? null : getSmallerAlt(item.name, roomL, roomW);
  return {
    name: item.name,
    fits,
    reason: fits
      ? `Fits well — occupies ~${usagePct}% of floor area.`
      : `${item.name} (${item.length}×${item.width}cm) is too large for a ${roomL}×${roomW}cm room.`,
    suggestedAlternative: alt || ''
  };
}

function getSmallerAlt(name, roomL, roomW) {
  const n = name.toLowerCase();
  if (n.includes('sofa')) return `Consider a 2-seater sofa (${Math.floor(roomL*0.4)}×80cm) or a love seat instead.`;
  if (n.includes('bed')) return `A queen bed (160×200cm) or single bed (90×200cm) would fit better.`;
  if (n.includes('wardrobe')) return `A 2-door wardrobe (120×60cm) instead of 4-door would free significant space.`;
  if (n.includes('dining')) return `A 4-seater table (120×80cm) suits this room better than a 6-seater.`;
  if (n.includes('desk')) return `A compact corner desk (90×50cm) maximizes space in smaller rooms.`;
  return `Look for a compact version (max ${Math.floor(roomL*0.35)}×${Math.floor(roomW*0.35)}cm).`;
}

function calcSpaceMetrics(furniture, roomL, roomW) {
  const roomArea = roomL * roomW;
  const usedArea = furniture.reduce((s, f) => s + (f.length * f.width), 0);
  const utilizationPct = Math.min(100, Math.round((usedArea / roomArea) * 100));
  const freeAreaPct = 100 - utilizationPct;
  let utilizationScore;
  if (utilizationPct < 20) utilizationScore = 40;
  else if (utilizationPct <= 40) utilizationScore = 95;
  else if (utilizationPct <= 55) utilizationScore = 80;
  else if (utilizationPct <= 70) utilizationScore = 60;
  else utilizationScore = 30;
  return { roomArea, usedArea, freeAreaPct, utilizationScore, utilizationPct };
}

function detectOverlaps(furniture) {
  const overlaps = [];
  for (let i = 0; i < furniture.length; i++) {
    for (let j = i + 1; j < furniture.length; j++) {
      const a = furniture[i], b = furniture[j];
      const ax = a.x||0, ay = a.y||0, bx = b.x||0, by = b.y||0;
      if (ax < bx+b.length && ax+a.length > bx && ay < by+b.width && ay+a.width > by) {
        overlaps.push({ item1: a.name, item2: b.name });
      }
    }
  }
  return overlaps;
}

function detectBlockages(furniture, roomL, roomW) {
  const blockages = [];
  const MIN = 90;
  furniture.forEach(f => {
    const x = f.x||0, y = f.y||0;
    const cX = roomL/2, cY = roomW/2;
    if (x < cX+MIN && x+f.length > cX-MIN && y < cY+MIN && y+f.width > cY-MIN) {
      blockages.push({ item: f.name, issue: 'Placed in main circulation path — may restrict movement.' });
    }
  });
  return blockages;
}

function calcMovementScore(furniture, roomL, roomW, doors) {
  let score = 100;
  const overlaps = detectOverlaps(furniture);
  const blockages = detectBlockages(furniture, roomL, roomW);
  score -= overlaps.length * 20;
  score -= blockages.length * 15;
  for (let i = 0; i < furniture.length; i++) {
    for (let j = i+1; j < furniture.length; j++) {
      const a = furniture[i], b = furniture[j];
      const gapX = Math.abs((b.x||0) - ((a.x||0) + a.length));
      const gapY = Math.abs((b.y||0) - ((a.y||0) + a.width));
      if (gapX > 0 && gapX < 90) score -= 5;
      if (gapY > 0 && gapY < 90) score -= 5;
    }
  }
  return Math.max(0, Math.min(100, score));
}

function calcNaturalLightScore(furniture, windows) {
  if (!windows || windows.length === 0) return 70;
  let score = 100;
  furniture.forEach(f => {
    (windows || []).forEach(win => {
      if (win.wall === 'top' && (f.y||0) < 80) score -= 15;
      if (win.wall === 'left' && (f.x||0) < 80) score -= 10;
    });
  });
  return Math.max(30, Math.min(100, score));
}

function suggestLayout(furniture, roomL, roomW, lifestyle) {
  const suggestions = [];
  const metrics = calcSpaceMetrics(furniture, roomL, roomW);
  if (metrics.utilizationPct > 65) {
    suggestions.push('Room feels crowded. Remove 1–2 non-essential items to open up flow.');
    suggestions.push('Move larger items against walls to free the center for movement.');
  }
  if (metrics.utilizationPct < 20) suggestions.push('Room has too much empty space — add a rug, shelf or accent chair to fill zones.');
  if (lifestyle === 'WorkFromHome') {
    suggestions.push('Place desk near window for natural light — reduces eye strain during long work hours.');
    suggestions.push('Keep desk area separate from relaxation zone to improve focus.');
  }
  if (lifestyle === 'Family') {
    suggestions.push('Arrange seating to face each other — L-shaped or U-shaped layout works best.');
    suggestions.push('Leave 120cm+ walkway around dining table for children to move freely.');
  }
  if (lifestyle === 'Minimalist') {
    suggestions.push('Keep only functional pieces — remove duplicate seating or decorative-only items.');
    suggestions.push('Align all furniture parallel to walls for a clean, structured look.');
  }
  if (lifestyle === 'Luxury') {
    suggestions.push('Add a focal point — statement sofa, artwork, or accent lighting as centerpiece.');
    suggestions.push('Layer textures: wood surface, fabric upholstery, metal accents for premium feel.');
  }
  suggestions.push('Place most-used furniture within easy reach of the entry point.');
  suggestions.push('Ensure at least 90cm of clear walkway around every major piece.');
  return suggestions;
}

function buildAIReasoning(analysis, lifestyle, roomType, style) {
  const { utilizationPct, overallScore, overlaps, blockages } = analysis;
  let r = `Your ${roomType} room analysis (${lifestyle} lifestyle, ${style} style):\n\n`;
  r += `📐 Space: ${utilizationPct}% utilized — `;
  if (utilizationPct > 65) r += `too dense. Remove 1–2 items for comfortable movement.\n\n`;
  else if (utilizationPct < 25) r += `under-furnished. A few accent pieces will complete the space.\n\n`;
  else r += `ideal range (30–60%). Well balanced.\n\n`;
  if (overlaps.length > 0) r += `⚠️ ${overlaps.length} furniture overlap(s) detected: ${overlaps.map(o=>`${o.item1} & ${o.item2}`).join(', ')}. Resolve before ordering.\n\n`;
  if (blockages.length > 0) r += `🚶 Movement blocked by: ${blockages.map(b=>b.item).join(', ')}. Allow 90cm clearance.\n\n`;
  r += `🎨 For ${lifestyle}: `;
  if (lifestyle==='WorkFromHome') r += `Ergonomics and desk placement near natural light is the top priority.\n\n`;
  else if (lifestyle==='Family') r += `Durability and open pathways are key — choose robust materials.\n\n`;
  else if (lifestyle==='Minimalist') r += `Every piece must earn its place — remove anything non-functional.\n\n`;
  else r += `Invest in statement pieces that are both beautiful and functional.\n\n`;
  r += `Overall Score: ${overallScore}/100. `;
  if (overallScore >= 80) r += `Excellent layout — only minor refinements needed.`;
  else if (overallScore >= 60) r += `Good foundation with a few key improvements needed.`;
  else r += `Significant rearrangement recommended to optimize this space.`;
  return r;
}

function scoreProductFn(product, roomType, lifestyle, budget, roomL, roomW) {
  let score = 0;
  const rules = ROOM_RULES[roomType] || ROOM_RULES.living;
  const lRules = LIFESTYLE_RULES[lifestyle] || {};
  if (rules.essential.includes(product.category)) score += 40;
  else if (rules.optional.includes(product.category)) score += 20;
  else if (rules.avoid.includes(product.category)) return -1;
  if (lRules.prioritize && lRules.prioritize.includes(product.category)) score += 15;
  if (budget) {
    if (product.price <= budget * 0.3) score += 30;
    else if (product.price <= budget * 0.6) score += 20;
    else if (product.price <= budget) score += 10;
    else score -= 15;
  } else { score += 15; }
  if (product.averageRating >= 4.5) score += 15; else if (product.averageRating >= 4) score += 10;
  if ((product.dimensions?.length||100)*(product.dimensions?.width||80) <= roomL*roomW*0.15) score += 10;
  if (product.stock > 0) score += 5; if (product.featured) score += 5;
  if (lRules.preferPremium && product.price > 30000) score += 10;
  return score;
}

function getReason(category, roomType, lifestyle) {
  const m = {
    Sofa:`Essential seating — defines the gathering zone in your ${roomType}.`,
    Bed:`Centerpiece of any bedroom. Properly sized for comfort and flow.`,
    Dining:`A proper dining setup is essential for family use in your ${roomType}.`,
    Chair:`Flexible seating that complements main furniture and suits ${lifestyle} lifestyle.`,
    Wardrobe:`Organized storage keeps clothes and room clutter-free.`,
    Table:`Surface space for daily use — coffee, work, or display.`,
    Shelf:`Open shelving keeps items accessible and adds visual interest.`,
    Cabinet:`Closed storage for a clean, organized look.`,
    Desk:`A dedicated work surface improves productivity and posture.`,
    Industrial:`Adds character and durability — signature modern/industrial look.`,
    Outdoor:`Extends your living area outdoors.`,
    Other:`Versatile piece that adds both function and style.`
  };
  return m[category] || `Recommended for your ${roomType} room.`;
}

// ── POST /api/recommendations/analyze — Full AI analysis ──
router.post('/analyze', async (req, res) => {
  try {
    const {
      room = { length:400, width:300, height:270 },
      roomType = 'living',
      furniture = [],
      lifestyle = 'Family',
      budget = null,
      style = 'modern',
      members = 2,
      windows = [],
      doors = [],
      sessionId = null
    } = req.body;

    const { length:roomL, width:roomW, height:roomH } = room;
    const furnitureFit = furniture.map(f => checkFurnitureFit(f, roomL, roomW));
    const spaceMetrics = calcSpaceMetrics(furniture, roomL, roomW);
    const overlaps = detectOverlaps(furniture);
    const blockages = detectBlockages(furniture, roomL, roomW);
    const movementComfortScore = calcMovementScore(furniture, roomL, roomW, doors);
    const naturalLightScore = calcNaturalLightScore(furniture, windows);
    const themeMap = { Minimalist:'Minimal', WorkFromHome:'Modern', Family:'Traditional', Luxury:'Luxury' };
    const themeRecommendation = themeMap[lifestyle] || style || 'Modern';
    const layoutSuggestions = suggestLayout(furniture, roomL, roomW, lifestyle);
    const alternativeFurnitureSizes = furnitureFit.filter(f => !f.fits).map(f => ({ original:f.name, suggested:f.suggestedAlternative, reason:f.reason }));
    const aestheticScore = Math.min(100, 60 + (overlaps.length===0?15:0) + (spaceMetrics.utilizationPct>=30&&spaceMetrics.utilizationPct<=55?15:0));
    const overallScore = Math.round(spaceMetrics.utilizationScore*0.3 + movementComfortScore*0.3 + aestheticScore*0.2 + naturalLightScore*0.2);

    const fullAnalysis = {
      furnitureFit, ...spaceMetrics, overlaps, blockages,
      movementComfortScore, aestheticScore, naturalLightScore, overallScore,
      themeRecommendation, layoutSuggestions, alternativeFurnitureSizes,
      bestLayout: themeRecommendation,
      improvementSteps: layoutSuggestions.slice(0, 5),
      aiReasoning: ''
    };
    fullAnalysis.aiReasoning = buildAIReasoning({ ...fullAnalysis, utilizationPct:spaceMetrics.utilizationPct, overallScore }, lifestyle, roomType, style);

    // Products from DB
    const allProducts = await Product.find({ isActive:true, stock:{$gt:0} });
    const scored = allProducts
      .map(p => ({ product:p, score:scoreProductFn(p, roomType, lifestyle, budget, roomL, roomW) }))
      .filter(({score}) => score > 0)
      .sort((a,b) => b.score - a.score);

    const rules = ROOM_RULES[roomType] || ROOM_RULES.living;
    const essentialRecs=[], optionalRecs=[];
    const seenCats = new Set();
    for (const {product, score} of scored) {
      if (rules.essential.includes(product.category) && !seenCats.has(product.category) && essentialRecs.length < 6) {
        essentialRecs.push({ product, score, reason:getReason(product.category, roomType, lifestyle), priority:'essential' });
        seenCats.add(product.category);
      }
    }
    for (const {product, score} of scored) {
      if (rules.optional.includes(product.category) && !seenCats.has(product.category) && optionalRecs.length < 4) {
        optionalRecs.push({ product, score, reason:getReason(product.category, roomType, lifestyle), priority:'optional' });
        seenCats.add(product.category);
      }
    }

    const allRecs = [...essentialRecs, ...optionalRecs];
    const estimatedTotal = allRecs.reduce((s,{product}) => s + product.price, 0);
    const budgetSuggestions = budget
      ? allRecs.filter(({product}) => product.price <= budget*0.3).slice(0,3).map(({product}) => ({ name:product.name, price:product.price, reason:'Under 30% of your total budget' }))
      : [];
    fullAnalysis.budgetSuggestions = budgetSuggestions;

    // Save to MongoDB
    const sid = sessionId || uuidv4();
    await RecommendationSession.findOneAndUpdate(
      { sessionId: sid },
      {
        sessionId: sid,
        user: req.user?._id || null,
        room: { ...room, type:roomType, windows, doors },
        lifestyle, budget, style, members,
        furnitureInput: furniture,
        analysis: fullAnalysis,
        recommendedProducts: allRecs.map(({product, score, reason, priority}) => ({ product:product._id, score, reason, priority })),
        estimatedTotal
      },
      { upsert:true, new:true }
    );

    res.json({ success:true, sessionId:sid, analysis:fullAnalysis, essential:essentialRecs.slice(0,6), optional:optionalRecs.slice(0,4), estimatedTotal, roomSummary:{ roomType, lifestyle, style, members, budget, roomL, roomW, roomH } });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success:false, message:error.message });
  }
});

// ── POST /api/recommendations — simple wizard mode ──
router.post('/', async (req, res) => {
  try {
    const { roomType='living', roomSize='medium', style='modern', budget='mid', members=2, existing=[] } = req.body;
    const budgetMap = { economy:{min:0,max:20000}, mid:{min:10000,max:50000}, premium:{min:30000,max:150000}, luxury:{min:80000,max:9999999} };
    const sizeMap = { small:120, medium:250, large:400, xlarge:600 };
    const budgetRange = budgetMap[budget] || budgetMap.mid;
    const roomArea = sizeMap[roomSize] || 250;
    const allProducts = await Product.find({ isActive:true, stock:{$gt:0} });
    const rules = ROOM_RULES[roomType] || ROOM_RULES.living;
    const scored = allProducts.map(p => {
      let s = 0;
      if (rules.essential.includes(p.category)) s += 40;
      else if (rules.optional.includes(p.category)) s += 20;
      else if (rules.avoid.includes(p.category)) return { product:p, score:-1 };
      if (p.price >= budgetRange.min && p.price <= budgetRange.max) s += 30;
      if (p.averageRating >= 4.5) s += 15; else if (p.averageRating >= 4) s += 10;
      if (p.stock > 0) s += 5; if (p.featured) s += 5;
      return { product:p, score:s };
    }).filter(({score}) => score > 0).sort((a,b) => b.score - a.score);

    const essentialRecs=[], optionalRecs=[];
    const seenCats = new Set(existing||[]);
    for (const {product, score} of scored) {
      if (rules.essential.includes(product.category) && !seenCats.has(product.category) && essentialRecs.length < 6) {
        essentialRecs.push({ product, score, reason:getReason(product.category, roomType, style) });
        seenCats.add(product.category);
      }
    }
    for (const {product, score} of scored) {
      if (rules.optional.includes(product.category) && !seenCats.has(product.category) && optionalRecs.length < 4) {
        optionalRecs.push({ product, score, reason:getReason(product.category, roomType, style) });
        seenCats.add(product.category);
      }
    }

    const totalCost = [...essentialRecs,...optionalRecs.slice(0,2)].reduce((s,{product}) => s+product.price, 0);
    const styleHints = { modern:['clean lines','minimal','engineered wood','metal accents'], traditional:['carved wood','teak','sheesham','ornate details'], industrial:['metal frame','reclaimed wood','pipe accents'], scandinavian:['light wood','minimal','functional'], contemporary:['mixed materials','bold shapes','upholstered'] };
    const spaceAdvice = [];
    if (roomArea < 150) spaceAdvice.push('Use multifunctional furniture — storage beds & foldable tables save space.','Wall-mounted shelves keep floor clear.','Light colors make small rooms feel larger.');
    else if (roomArea < 300) spaceAdvice.push('Balance open and closed storage.','L-shaped sofa works well in medium rooms.');
    else spaceAdvice.push('Large rooms benefit from defined zones using rugs.','Consider statement furniture as focal points.');
    if (members >= 4) spaceAdvice.push(`For a family of ${members}, prioritize durability and ample storage.`);

    res.json({ success:true, roomSummary:{ roomType, roomSize, style, budget, members }, essential:essentialRecs.slice(0,6), optional:optionalRecs.slice(0,4), spaceAdvice, styleHints:styleHints[style]||styleHints.modern, estimatedTotal:totalCost });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
});

// GET /api/recommendations/session/:id
router.get('/session/:id', async (req, res) => {
  try {
    const session = await RecommendationSession.findOne({ sessionId:req.params.id }).populate('recommendedProducts.product','name price category images dimensions averageRating stock');
    if (!session) return res.status(404).json({ success:false, message:'Session not found' });
    res.json({ success:true, session });
  } catch (error) { res.status(500).json({ success:false, message:error.message }); }
});

module.exports = router;
