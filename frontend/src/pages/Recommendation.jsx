import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Home, Ruler, Users, Palette, ArrowRight, ShoppingCart,
  CheckCircle, AlertTriangle, XCircle, RotateCcw, Download,
  Lightbulb, Star, TrendingUp, Wind, Eye, Brain
} from 'lucide-react';
import axios from 'axios';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import './Recommendation.css';

// Real Jothi Furniture images from IndiaMART shop
const SHOP_IMAGES = {
  sofa: [
    'https://5.imimg.com/data5/SELLER/Default/2022/12/IH/ZT/TB/167409459/wooden-sofa-set-500x500.jpg',
    'https://5.imimg.com/data5/SELLER/Default/2022/12/QW/JA/ZK/167409459/teak-sofa-set-500x500.jpg',
  ],
  bed: [
    'https://5.imimg.com/data5/SELLER/Default/2022/12/PU/NM/BI/167409459/wooden-bed-500x500.jpg',
  ],
  dining: [
    'https://5.imimg.com/data5/SELLER/Default/2022/12/AH/OF/ZQ/167409459/dining-table-set-500x500.jpg',
  ],
  wardrobe: [
    'https://5.imimg.com/data5/SELLER/Default/2022/12/DL/JA/QB/167409459/wooden-wardrobe-500x500.jpg',
  ],
  default: 'https://5.imimg.com/data5/SELLER/Default/2022/12/167409459/jothi-furniture-logo.jpg'
};

// Fallback placeholder emoji per category
const CAT_EMOJI = { Sofa:'🛋️', Bed:'🛏️', Dining:'🍽️', Chair:'🪑', Wardrobe:'🚪', Desk:'💻', Table:'☕', Shelf:'📚', Cabinet:'📺', Industrial:'🔩', Outdoor:'🌿', Other:'🪑' };

// Room image backgrounds by type
const ROOM_BG = {
  living:'linear-gradient(135deg,#d4c5b0,#c5b5a0)',
  bedroom:'linear-gradient(135deg,#d0c8b8,#b8b0a0)',
  dining:'linear-gradient(135deg,#cec0a8,#b8aa90)',
  study:'linear-gradient(135deg,#c8c0b0,#b0a898)',
  office:'linear-gradient(135deg,#c0b8a8,#a8a090)',
  kids:'linear-gradient(135deg,#d8d0b8,#c0b8a0)'
};

const ROOM_TYPES = [
  { value:'living', label:'Living Room', icon:'🛋️', desc:'Sofa, coffee table, TV unit' },
  { value:'bedroom', label:'Bedroom', icon:'🛏️', desc:'Bed, wardrobe, study desk' },
  { value:'dining', label:'Dining Room', icon:'🍽️', desc:'Dining table & chairs' },
  { value:'study', label:'Study / Library', icon:'📚', desc:'Desk, chair, bookshelves' },
  { value:'office', label:'Home Office', icon:'💼', desc:'Work desk, ergonomics, storage' },
  { value:'kids', label:"Kids' Room", icon:'🎨', desc:'Safe, fun, functional pieces' },
];

const LIFESTYLES = [
  { value:'Minimalist', icon:'◽', desc:'Clean, less is more' },
  { value:'WorkFromHome', icon:'💻', desc:'Productive & ergonomic' },
  { value:'Family', icon:'👨‍👩‍👧‍👦', desc:'Durable & spacious' },
  { value:'Luxury', icon:'✨', desc:'Premium & aesthetic' },
];

const PREBUILT_FURNITURE = [
  { name:'Sofa Set', category:'Sofa', length:220, width:85, height:95 },
  { name:'King Bed', category:'Bed', length:220, width:200, height:120 },
  { name:'Dining Table (6 seat)', category:'Dining', length:180, width:90, height:76 },
  { name:'Wardrobe (4 door)', category:'Wardrobe', length:240, width:60, height:210 },
  { name:'Study Desk', category:'Desk', length:120, width:60, height:75 },
  { name:'Office Chair', category:'Chair', length:70, width:70, height:125 },
  { name:'Coffee Table', category:'Table', length:110, width:65, height:45 },
  { name:'TV Cabinet', category:'Cabinet', length:180, width:45, height:55 },
  { name:'Bookshelf', category:'Shelf', length:90, width:35, height:180 },
];

function ScoreRing({ score, label, color, size=64 }) {
  const r = (size/2) - 6;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - score/100);
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}/>
        <text x={size/2} y={size/2+5} textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{score}</text>
      </svg>
      <span style={{fontSize:'0.68rem',color:'var(--text-3)',textAlign:'center',maxWidth:70}}>{label}</span>
    </div>
  );
}

export default function Recommendation() {
  const [step, setStep] = useState(1); // 1=room setup, 2=lifestyle, 3=furniture, 4=results
  const [room, setRoom] = useState({ length:400, width:300, height:270 });
  const [roomType, setRoomType] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [budget, setBudget] = useState('');
  const [members, setMembers] = useState(2);
  const [style, setStyle] = useState('modern');
  const [furniture, setFurniture] = useState([]);
  const [windows, setWindows] = useState([]);
  const [doors, setDoors] = useState([{ wall:'bottom', position:50, width:90 }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedItems, setAddedItems] = useState(new Set());
  const [activeTab, setActiveTab] = useState('products');
  const { addItem } = useCartStore();

  const addFurnitureItem = (preset) => {
    setFurniture(prev => [...prev, { ...preset, x:10, y:10, rotation:0, id:Date.now() }]);
    toast.success(`${preset.name} added to room!`);
  };

  const removeFurnitureItem = (id) => setFurniture(prev => prev.filter(f => f.id !== id));

  const updateFurnitureProp = (id, key, val) => {
    setFurniture(prev => prev.map(f => f.id === id ? { ...f, [key]: Number(val)||0 } : f));
  };

  const addWindow = () => setWindows(prev => [...prev, { wall:'top', position:50, width:100 }]);
  const addDoor = () => setDoors(prev => [...prev, { wall:'left', position:50, width:90 }]);

  const canProceed = () => {
    if (step===1) return roomType !== '' && room.length > 100 && room.width > 100;
    if (step===2) return lifestyle !== '';
    if (step===3) return true;
    return false;
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/recommendations/analyze', {
        room, roomType, furniture, lifestyle,
        budget: budget ? Number(budget) : null,
        style, members, windows, doors
      });
      setResults(data);
      setStep(4);
      setActiveTab('scores');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleAddToCart = (product) => {
    addItem(product);
    setAddedItems(prev => new Set([...prev, product._id]));
    toast.success(`${product.name} added to cart!`);
  };

  const exportReport = () => {
    if (!results) return;
    const report = {
      generatedAt: new Date().toISOString(),
      shop: 'Jothi Industrial And Furniture, Ilampillai, Salem',
      gst: '33MUBPS8703H1ZA',
      room: { ...room, type: roomType },
      lifestyle, style, members,
      analysis: results.analysis,
      recommendations: {
        essential: results.essential?.map(r => ({ name:r.product.name, price:r.product.price, reason:r.reason })),
        optional: results.optional?.map(r => ({ name:r.product.name, price:r.product.price, reason:r.reason }))
      },
      estimatedTotal: results.estimatedTotal
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `jothi-room-analysis-${Date.now()}.json`;
    a.click();
    toast.success('Report exported!');
  };

  const a = results?.analysis;

  return (
    <div className="rec-page page-wrapper">
      <div className="container">

        {/* ── HERO ── */}
        <div className="rec-hero">
          <div className="rec-hero-badge"><Sparkles size={14}/> AI Space Optimization Assistant</div>
          <h1>Smart Furniture Advisor</h1>
          <p>Enter your room dimensions and furniture. Our AI will analyze fit, detect overlaps, calculate space utilization, score movement comfort, and recommend the perfect furniture layout — backed by Jothi Furniture's collection.</p>
        </div>

        {/* ── STEPS NAV ── */}
        {step < 4 && (
          <div className="rec-steps-nav">
            {[{n:1,l:'Room Setup'},{n:2,l:'Lifestyle'},{n:3,l:'Furniture'},{n:4,l:'AI Results'}].map(s => (
              <div key={s.n} className={`step-dot ${step===s.n?'active':''} ${step>s.n?'done':''}`}>
                <div className="step-circle">{step>s.n?'✓':s.n}</div>
                <span>{s.l}</span>
              </div>
            ))}
            <div className="steps-line" style={{width:`${((step-1)/3)*100}%`}}/>
          </div>
        )}

        {/* ══════════ STEP 1: ROOM SETUP ══════════ */}
        {step===1 && (
          <div className="rec-step fade-in">
            <div className="step-head"><Home size={20}/><h2>Room Setup</h2></div>
            <p className="step-sub">Choose room type and enter your actual room dimensions in centimeters</p>

            <h3 className="sub-title">Room Type</h3>
            <div className="room-type-grid">
              {ROOM_TYPES.map(rt => (
                <button key={rt.value} className={`room-card ${roomType===rt.value?'active':''}`} onClick={() => setRoomType(rt.value)}>
                  <span className="rt-icon">{rt.icon}</span>
                  <span className="rt-label">{rt.label}</span>
                  <span className="rt-desc">{rt.desc}</span>
                </button>
              ))}
            </div>

            <h3 className="sub-title" style={{marginTop:'2rem'}}><Ruler size={14}/> Room Dimensions (cm)</h3>
            <div className="dims-grid">
              {[['length','Length (cm)','400'],['width','Width (cm)','300'],['height','Height / Ceiling (cm)','270']].map(([k,l,ph]) => (
                <div key={k} className="dim-input-wrap">
                  <label>{l}</label>
                  <input type="number" value={room[k]} placeholder={ph} min={100} max={2000}
                    onChange={e => setRoom(p => ({...p,[k]:Number(e.target.value)||0}))}/>
                  <span className="dim-preview">{room[k]} cm = {(room[k]/100).toFixed(1)} m</span>
                </div>
              ))}
            </div>
            <div className="room-area-info">
              <span>📐 Floor Area: <strong>{(room.length * room.width / 10000).toFixed(1)} m²</strong></span>
              <span>🏠 Volume: <strong>{(room.length * room.width * room.height / 1000000).toFixed(1)} m³</strong></span>
              <span>📏 Diagonal: <strong>{Math.round(Math.sqrt(room.length**2 + room.width**2))} cm</strong></span>
            </div>

            {/* Doors & Windows (optional) */}
            <div className="optionals-row">
              <div className="optional-section">
                <div className="optional-header">
                  <span>🪟 Windows ({windows.length})</span>
                  <button className="btn btn-ghost btn-sm" onClick={addWindow}>+ Add Window</button>
                </div>
                {windows.map((w, i) => (
                  <div key={i} className="optional-item">
                    <select value={w.wall} onChange={e => setWindows(prev => prev.map((x,j) => j===i?{...x,wall:e.target.value}:x))}>
                      <option value="top">Top wall</option><option value="bottom">Bottom wall</option>
                      <option value="left">Left wall</option><option value="right">Right wall</option>
                    </select>
                    <input type="number" value={w.width} placeholder="Width cm" style={{width:90}}
                      onChange={e => setWindows(prev => prev.map((x,j) => j===i?{...x,width:+e.target.value}:x))}/>
                    <button onClick={() => setWindows(prev => prev.filter((_,j) => j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--error)'}}>✕</button>
                  </div>
                ))}
              </div>
              <div className="optional-section">
                <div className="optional-header">
                  <span>🚪 Doors ({doors.length})</span>
                  <button className="btn btn-ghost btn-sm" onClick={addDoor}>+ Add Door</button>
                </div>
                {doors.map((d, i) => (
                  <div key={i} className="optional-item">
                    <select value={d.wall} onChange={e => setDoors(prev => prev.map((x,j) => j===i?{...x,wall:e.target.value}:x))}>
                      <option value="bottom">Bottom wall</option><option value="top">Top wall</option>
                      <option value="left">Left wall</option><option value="right">Right wall</option>
                    </select>
                    <input type="number" value={d.width} placeholder="Width cm" style={{width:90}}
                      onChange={e => setDoors(prev => prev.map((x,j) => j===i?{...x,width:+e.target.value}:x))}/>
                    <button onClick={() => setDoors(prev => prev.filter((_,j) => j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--error)'}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ STEP 2: LIFESTYLE ══════════ */}
        {step===2 && (
          <div className="rec-step fade-in">
            <div className="step-head"><Users size={20}/><h2>Lifestyle & Preferences</h2></div>
            <p className="step-sub">This helps the AI tailor the layout and furniture recommendations to your actual usage</p>

            <h3 className="sub-title">How do you use this room?</h3>
            <div className="lifestyle-grid">
              {LIFESTYLES.map(l => (
                <button key={l.value} className={`lifestyle-card ${lifestyle===l.value?'active':''}`} onClick={() => setLifestyle(l.value)}>
                  <span className="ls-icon">{l.icon}</span>
                  <span className="ls-label">{l.value}</span>
                  <span className="ls-desc">{l.desc}</span>
                </button>
              ))}
            </div>

            <div className="prefs-row">
              <div className="pref-group">
                <label className="sub-title"><Palette size={14}/> Interior Style</label>
                <div className="style-pills">
                  {['modern','traditional','industrial','scandinavian','contemporary'].map(s => (
                    <button key={s} className={`style-pill ${style===s?'active':''}`} onClick={() => setStyle(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="pref-group">
                <label className="sub-title"><Users size={14}/> People in Household</label>
                <div className="members-ctrl">
                  <button onClick={() => setMembers(m => Math.max(1,m-1))}>−</button>
                  <span className="mem-num">{members}</span>
                  <button onClick={() => setMembers(m => Math.min(12,m+1))}>+</button>
                </div>
              </div>
              <div className="pref-group">
                <label className="sub-title">💰 Total Budget (₹) <em style={{fontWeight:300,fontSize:'0.75rem'}}>(optional)</em></label>
                <input type="number" value={budget} placeholder="e.g. 100000"
                  onChange={e => setBudget(e.target.value)}
                  style={{padding:'10px 14px',border:'1.5px solid var(--border)',borderRadius:'8px',fontFamily:'var(--font-body)',fontSize:'0.9rem',outline:'none',width:'100%'}}/>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ STEP 3: FURNITURE ══════════ */}
        {step===3 && (
          <div className="rec-step fade-in">
            <div className="step-head"><Home size={20}/><h2>Add Furniture to Analyse</h2></div>
            <p className="step-sub">Add the furniture you have or plan to buy. The AI will check fit, detect overlaps and suggest optimal placement.</p>

            <div className="furniture-builder">
              {/* Presets */}
              <div className="furniture-presets">
                <h4 className="sub-title">Quick Add</h4>
                <div className="preset-btns">
                  {PREBUILT_FURNITURE.map(p => (
                    <button key={p.name} className="preset-pill" onClick={() => addFurnitureItem(p)}>
                      {CAT_EMOJI[p.category]} {p.name}
                    </button>
                  ))}
                </div>
                <p style={{fontSize:'0.75rem',color:'var(--text-3)',marginTop:'0.5rem'}}>Or add custom furniture below</p>
                <CustomFurnitureForm onAdd={addFurnitureItem}/>
              </div>

              {/* Furniture list */}
              <div className="furniture-list-panel">
                <h4 className="sub-title">Room Furniture ({furniture.length} items)</h4>
                {furniture.length === 0 ? (
                  <div style={{padding:'2rem',textAlign:'center',color:'var(--text-3)',background:'var(--bg-2)',borderRadius:'12px',fontSize:'0.875rem'}}>
                    No furniture added yet.<br/>Add items from Quick Add or create custom pieces above.
                  </div>
                ) : (
                  <div className="furniture-items">
                    {furniture.map(f => (
                      <div key={f.id} className="furniture-item-row">
                        <span className="fi-emoji">{CAT_EMOJI[f.category]||'🪑'}</span>
                        <div className="fi-details">
                          <strong>{f.name}</strong>
                          <div className="fi-dims">
                            <label>L:<input type="number" value={f.length} onChange={e => updateFurnitureProp(f.id,'length',e.target.value)}/></label>
                            <label>W:<input type="number" value={f.width} onChange={e => updateFurnitureProp(f.id,'width',e.target.value)}/></label>
                            <label>X:<input type="number" value={f.x} onChange={e => updateFurnitureProp(f.id,'x',e.target.value)}/></label>
                            <label>Y:<input type="number" value={f.y} onChange={e => updateFurnitureProp(f.id,'y',e.target.value)}/></label>
                          </div>
                        </div>
                        <button className="fi-remove" onClick={() => removeFurnitureItem(f.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Visual mini preview */}
                <div className="mini-room-preview">
                  <RoomMinimap room={room} furniture={furniture} doors={doors} windows={windows}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step Nav ── */}
        {step < 4 && (
          <div className="step-nav-row">
            {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s-1)}>← Back</button>}
            <div style={{flex:1}}/>
            {step < 3 ? (
              <button className="btn btn-primary btn-lg" onClick={() => setStep(s => s+1)} disabled={!canProceed()}>
                Continue <ArrowRight size={18}/>
              </button>
            ) : (
              <button className="btn btn-accent btn-lg" onClick={handleAnalyze} disabled={loading}>
                {loading ? (
                  <><span className="spinner-sm"/> Analysing your space...</>
                ) : (
                  <><Brain size={18}/> Run AI Analysis</>
                )}
              </button>
            )}
          </div>
        )}

        {/* ══════════ STEP 4: RESULTS ══════════ */}
        {step===4 && results && (
          <div className="rec-results fade-in">
            {/* Results header */}
            <div className="results-hero">
              <div>
                <h2>AI Analysis Complete</h2>
                <p style={{color:'var(--text-3)',fontSize:'0.875rem'}}>
                  {ROOM_TYPES.find(r=>r.value===results.roomSummary?.roomType)?.label} · {results.roomSummary?.lifestyle} · {style} style
                </p>
              </div>
              <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                <button className="btn btn-ghost btn-sm" onClick={exportReport}><Download size={15}/> Export</button>
                <button className="btn btn-outline btn-sm" onClick={() => {setStep(1);setResults(null);}}>
                  <RotateCcw size={15}/> Re-analyse
                </button>
              </div>
            </div>

            {/* Score Dashboard */}
            <div className="score-dashboard">
              <div className="score-card overall">
                <div className="overall-ring">
                  <ScoreRing score={a.overallScore} label="Overall Score" color={a.overallScore>=80?'#4a7c59':a.overallScore>=60?'#c9a96e':'#c0392b'} size={90}/>
                </div>
                <div className="overall-label">
                  <h3 style={{fontFamily:'var(--font-body)'}}>
                    {a.overallScore>=80?'Excellent Layout ✨':a.overallScore>=60?'Good — Needs Tweaks ⚡':'Needs Rework 🔧'}
                  </h3>
                  <p style={{fontSize:'0.82rem',color:'var(--text-3)'}}>Based on space, movement, light & aesthetics</p>
                </div>
              </div>
              <div className="sub-scores">
                <ScoreRing score={a.utilizationScore} label="Space Use" color="#8b6f47" size={68}/>
                <ScoreRing score={a.movementComfortScore} label="Movement" color="#4a7c59" size={68}/>
                <ScoreRing score={a.aestheticScore} label="Aesthetics" color="#c9a96e" size={68}/>
                <ScoreRing score={a.naturalLightScore} label="Natural Light" color="#e67e22" size={68}/>
              </div>
            </div>

            {/* Tabs */}
            <div className="results-tabs">
              {[
                {id:'scores',label:'📊 Analysis'},
                {id:'products',label:'🛋️ Recommendations'},
                {id:'layout',label:'💡 Layout Tips'},
                {id:'ai',label:'🤖 AI Reasoning'}
              ].map(t => (
                <button key={t.id} className={`res-tab ${activeTab===t.id?'active':''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
              ))}
            </div>

            {/* ── TAB: ANALYSIS ── */}
            {activeTab==='scores' && (
              <div className="tab-content fade-in">
                {/* Space metrics */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-label">Room Area</div>
                    <div className="metric-value">{(a.roomArea/10000).toFixed(1)} m²</div>
                    <div className="metric-sub">{a.roomArea.toLocaleString()} cm²</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Used Area</div>
                    <div className="metric-value">{a.utilizationPct}%</div>
                    <div className="metric-sub">{(a.usedArea/10000).toFixed(1)} m² occupied</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Free Space</div>
                    <div className="metric-value">{a.freeAreaPct}%</div>
                    <div className="metric-sub">Available for movement</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Furniture Items</div>
                    <div className="metric-value">{furniture.length}</div>
                    <div className="metric-sub">{a.furnitureFit?.filter(f=>f.fits).length} items fit correctly</div>
                  </div>
                </div>

                {/* Utilization bar */}
                <div className="util-section">
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:'0.85rem',fontWeight:600}}>Space Utilization</span>
                    <span style={{fontSize:'0.85rem',color:'var(--text-3)'}}>{a.utilizationPct}% — {a.utilizationPct<30?'Under-furnished':a.utilizationPct<=55?'✓ Optimal':a.utilizationPct<=70?'Dense':'Overcrowded'}</span>
                  </div>
                  <div className="util-bar-wrap">
                    <div className="util-bar-fill" style={{width:`${a.utilizationPct}%`,background:a.utilizationPct>70?'var(--error)':a.utilizationPct>55?'var(--warning)':'var(--success)'}}/>
                    <div className="util-zone" style={{left:'30%',right:'45%',background:'rgba(74,124,89,0.1)',borderLeft:'2px dashed #4a7c59',borderRight:'2px dashed #4a7c59'}}>
                      <span>Optimal zone</span>
                    </div>
                  </div>
                </div>

                {/* Furniture fit results */}
                {a.furnitureFit?.length > 0 && (
                  <div className="fit-results">
                    <h4 className="sub-title">Furniture Fit Check</h4>
                    {a.furnitureFit.map((f,i) => (
                      <div key={i} className={`fit-row ${f.fits?'fit':'nofit'}`}>
                        <span className="fit-icon">{f.fits?<CheckCircle size={16} color="var(--success)"/>:<XCircle size={16} color="var(--error)"/>}</span>
                        <div className="fit-info">
                          <strong>{f.name}</strong>
                          <span>{f.reason}</span>
                          {!f.fits && f.suggestedAlternative && (
                            <span className="fit-alt">💡 {f.suggestedAlternative}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Overlaps */}
                {a.overlaps?.length > 0 && (
                  <div className="issues-box warning">
                    <AlertTriangle size={18}/>
                    <div>
                      <strong>Furniture Overlaps Detected ({a.overlaps.length})</strong>
                      {a.overlaps.map((o,i) => <div key={i} style={{fontSize:'0.82rem',marginTop:4}}>⚠️ {o.item1} overlaps with {o.item2}</div>)}
                    </div>
                  </div>
                )}

                {/* Blockages */}
                {a.blockages?.length > 0 && (
                  <div className="issues-box error">
                    <XCircle size={18}/>
                    <div>
                      <strong>Movement Blockages ({a.blockages.length})</strong>
                      {a.blockages.map((b,i) => <div key={i} style={{fontSize:'0.82rem',marginTop:4}}>🚶 {b.item}: {b.issue}</div>)}
                    </div>
                  </div>
                )}

                {/* Alternative sizes */}
                {a.alternativeFurnitureSizes?.length > 0 && (
                  <div className="alt-sizes">
                    <h4 className="sub-title">Suggested Alternatives for Oversized Items</h4>
                    {a.alternativeFurnitureSizes.map((alt,i) => (
                      <div key={i} className="alt-row">
                        <span className="alt-icon">📦</span>
                        <div><strong>{alt.original}</strong><p>{alt.suggested}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: PRODUCTS ── */}
            {activeTab==='products' && (
              <div className="tab-content fade-in">
                {results.essential?.length > 0 && (
                  <div className="rec-section">
                    <div className="rec-sec-head">
                      <span className="sec-badge essential">Must Have</span>
                      <h3>Essential for Your {ROOM_TYPES.find(r=>r.value===results.roomSummary?.roomType)?.label}</h3>
                      <p>These pieces are fundamental to the room's function</p>
                    </div>
                    <div className="rec-products-grid">
                      {results.essential.map(({product, reason}, i) => (
                        <ProductRecCard key={product._id} product={product} reason={reason}
                          badge="Essential" isTop={i===0}
                          added={addedItems.has(product._id)}
                          onAdd={() => handleAddToCart(product)}/>
                      ))}
                    </div>
                  </div>
                )}
                {results.optional?.length > 0 && (
                  <div className="rec-section">
                    <div className="rec-sec-head">
                      <span className="sec-badge optional">Nice to Have</span>
                      <h3>Complementary Additions</h3>
                      <p>Enhance the aesthetics and functionality of your space</p>
                    </div>
                    <div className="rec-products-grid">
                      {results.optional.map(({product, reason}) => (
                        <ProductRecCard key={product._id} product={product} reason={reason}
                          badge="Recommended"
                          added={addedItems.has(product._id)}
                          onAdd={() => handleAddToCart(product)}/>
                      ))}
                    </div>
                  </div>
                )}
                <div className="est-total-card">
                  <span>Estimated Total for Recommended Furniture</span>
                  <strong className="price" style={{fontSize:'1.4rem'}}>₹{(results.estimatedTotal||0).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            )}

            {/* ── TAB: LAYOUT TIPS ── */}
            {activeTab==='layout' && (
              <div className="tab-content fade-in">
                <div className="theme-rec-card">
                  <div className="theme-badge">
                    <Eye size={16}/> Recommended Theme
                  </div>
                  <h3>{a.themeRecommendation}</h3>
                  <p>{a.themeRecommendation==='Modern'?'Clean lines, neutral palette, engineered wood & metal accents. Minimal clutter.':
                      a.themeRecommendation==='Traditional'?'Ornate teak/sheesham pieces, warm browns, carved details, rich fabrics.':
                      a.themeRecommendation==='Minimal'?'Only essential pieces, maximum open space, monochrome tones.':
                      'Statement pieces, premium materials, layered lighting, art objects.'}</p>
                </div>

                <div className="layout-tips-grid">
                  {a.layoutSuggestions?.map((tip, i) => (
                    <div key={i} className="layout-tip-card">
                      <div className="tip-num">{i+1}</div>
                      <div>
                        <Lightbulb size={14} style={{color:'var(--accent)',marginBottom:4}}/>
                        <p>{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {a.budgetSuggestions?.length > 0 && (
                  <div className="budget-picks">
                    <h4 className="sub-title">💰 Budget-Friendly Picks</h4>
                    {a.budgetSuggestions.map((s,i) => (
                      <div key={i} className="budget-pick-row">
                        <span style={{fontWeight:600}}>{s.name}</span>
                        <span className="price">₹{s.price.toLocaleString('en-IN')}</span>
                        <span style={{fontSize:'0.78rem',color:'var(--text-3)'}}>{s.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: AI REASONING ── */}
            {activeTab==='ai' && (
              <div className="tab-content fade-in">
                <div className="ai-reasoning-card">
                  <div className="ai-header">
                    <Brain size={22}/>
                    <h3>AI Analysis Reasoning</h3>
                  </div>
                  <pre className="ai-text">{a.aiReasoning}</pre>
                </div>
                <div className="improvement-steps">
                  <h4 className="sub-title">Top Improvement Actions</h4>
                  {a.improvementSteps?.map((step, i) => (
                    <div key={i} className="improve-row">
                      <span className="improve-num">{i+1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="results-cta">
              <div>
                <h3>Ready to order your furniture?</h3>
                <p>Visit Jothi Industrial And Furniture showroom at Ilampillai, Salem — GST: 33MUBPS8703H1ZA</p>
              </div>
              <div className="cta-btns">
                <Link to="/cart" className="btn btn-primary btn-lg"><ShoppingCart size={18}/> View Cart</Link>
                <Link to="/products" className="btn btn-outline btn-lg">Browse All Products</Link>
                <Link to="/space-optimizer" className="btn btn-ghost btn-lg">📐 Plan in 3D</Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Custom furniture form ──────────────────────────────
function CustomFurnitureForm({ onAdd }) {
  const [form, setForm] = useState({ name:'', category:'Other', length:100, width:80, height:75, x:10, y:10 });
  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('Enter furniture name'); return; }
    onAdd({ ...form, id: Date.now() });
    setForm({ name:'', category:'Other', length:100, width:80, height:75, x:10, y:10 });
  };
  return (
    <div className="custom-form">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'8px'}}>
        <input placeholder="Furniture name" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} style={{gridColumn:'1/-1'}}/>
        <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
          {['Sofa','Bed','Dining','Chair','Wardrobe','Desk','Table','Shelf','Cabinet','Other'].map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{display:'flex',gap:4}}>
          <input type="number" value={form.length} placeholder="L cm" onChange={e => setForm(p=>({...p,length:+e.target.value}))} style={{width:'50%'}}/>
          <input type="number" value={form.width} placeholder="W cm" onChange={e => setForm(p=>({...p,width:+e.target.value}))} style={{width:'50%'}}/>
        </div>
      </div>
      <button className="btn btn-primary btn-sm btn-block" onClick={handleAdd}>+ Add Custom Furniture</button>
    </div>
  );
}

// ── Room mini preview canvas ───────────────────────────
function RoomMinimap({ room, furniture, doors, windows }) {
  const canvasRef = useRef(null);
  const maxW = 280, maxH = 200;
  const scaleX = maxW / (room.length || 400);
  const scaleY = maxH / (room.width || 300);
  const scale = Math.min(scaleX, scaleY, 0.6);

  const W = (room.length || 400) * scale;
  const H = (room.width || 300) * scale;

  const colors = ['#8b6f47','#a08060','#c9a96e','#6b5240','#9e8070','#b8956a','#7a6555','#7d6b5e'];

  return (
    <div style={{marginTop:'1rem'}}>
      <p style={{fontSize:'0.75rem',color:'var(--text-3)',marginBottom:'6px'}}>Room Preview (top view)</p>
      <div style={{background:'#faf7f3',border:'1.5px solid var(--border)',borderRadius:'8px',padding:'8px',display:'inline-block',position:'relative'}}>
        <svg width={W+16} height={H+16}>
          <rect x={8} y={8} width={W} height={H} fill="#f0ebe2" stroke="#5a4a3a" strokeWidth="2" rx="2"/>
          {(windows||[]).map((w,i) => {
            const wx = w.wall==='top'||w.wall==='bottom' ? 8+(W*0.4) : w.wall==='left'?8:8+W;
            const wy = w.wall==='left'||w.wall==='right' ? 8+(H*0.3) : w.wall==='top'?8:8+H;
            const ww = w.wall==='top'||w.wall==='bottom' ? (w.width||100)*scale : 3;
            const wh = w.wall==='left'||w.wall==='right' ? (w.width||100)*scale : 3;
            return <rect key={i} x={wx} y={wy} width={ww} height={wh} fill="#7ab8e0" rx="1"/>;
          })}
          {(doors||[]).map((d,i) => {
            const dx = d.wall==='bottom'||d.wall==='top' ? 8+(W*0.3) : d.wall==='left'?6:8+W;
            const dy = d.wall==='left'||d.wall==='right' ? 8+(H*0.3) : d.wall==='top'?6:8+H;
            const dw = d.wall==='top'||d.wall==='bottom' ? (d.width||90)*scale : 4;
            const dh = d.wall==='left'||d.wall==='right' ? (d.width||90)*scale : 4;
            return <rect key={i} x={dx} y={dy} width={dw} height={dh} fill="#c9a96e" rx="1"/>;
          })}
          {furniture.map((f,i) => {
            const fx = 8 + (f.x||0)*scale;
            const fy = 8 + (f.y||0)*scale;
            const fw = Math.max(4, (f.length||80)*scale);
            const fh = Math.max(4, (f.width||60)*scale);
            const color = colors[i % colors.length];
            return (
              <g key={f.id||i}>
                <rect x={fx} y={fy} width={fw} height={fh} fill={color} opacity="0.8" rx="2"/>
                {fw > 18 && fh > 12 && <text x={fx+fw/2} y={fy+fh/2+4} textAnchor="middle" fill="white" fontSize={Math.min(9,fw/3)}>{f.name?.slice(0,8)}</text>}
              </g>
            );
          })}
        </svg>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'4px'}}>
          <span style={{fontSize:'0.65rem',color:'var(--text-3)'}}>🟦 Window  🟧 Door  🟫 Furniture</span>
        </div>
      </div>
    </div>
  );
}

// ── Product recommendation card ─────────────────────────
function ProductRecCard({ product, reason, badge, isTop, added, onAdd }) {
  const disc = product.originalPrice ? Math.round(((product.originalPrice-product.price)/product.originalPrice)*100) : 0;
  const bgColors = ['#d4c5b0','#c5b5a0','#e8d5b0','#b5a090','#c9a96e','#ddd0c0'];
  const bg = bgColors[(product.name?.charCodeAt(0)||0) % 6];

  return (
    <div className={`rec-product-card ${added?'added':''}`}>
      <div className="rec-prod-image" style={{background:bg}}>
        <span style={{fontSize:'3rem',opacity:.65}}>{CAT_EMOJI[product.category]||'🪑'}</span>
        <span className={`rec-badge ${badge==='Essential'?'rec-badge-ess':'rec-badge-opt'}`}>{badge}</span>
        {isTop && <span className="rec-top-pick">#1 Pick</span>}
        {disc > 0 && <span className="rec-disc">{disc}% OFF</span>}
      </div>
      <div className="rec-prod-body">
        <span className="rec-category">{product.category}</span>
        <h4 className="rec-prod-name"><Link to={`/products/${product._id}`}>{product.name}</Link></h4>
        {product.averageRating > 0 && (
          <div className="rec-rating"><Star size={12} fill="currentColor"/><span>{product.averageRating}</span><span className="rec-rc">({product.reviewCount})</span></div>
        )}
        {product.dimensions && (
          <div className="rec-dims">📐 {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height} cm</div>
        )}
        <p className="rec-reason">💡 {reason}</p>
        <div className="rec-price-row">
          <div>
            <span className="price" style={{fontSize:'1.05rem'}}>₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && <span className="price-original" style={{marginLeft:6}}>₹{product.originalPrice.toLocaleString('en-IN')}</span>}
          </div>
          <button className={`btn btn-sm ${added?'btn-ghost':'btn-primary'}`} onClick={onAdd} disabled={added}
            style={added?{color:'var(--success)',borderColor:'var(--success)'}:{}}>
            {added ? <><CheckCircle size={13}/> Added</> : <><ShoppingCart size={13}/> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}
