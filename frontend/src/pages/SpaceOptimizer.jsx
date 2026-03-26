import React, { useState, useCallback } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import Canvas2D from '../components/Canvas2D';
import Canvas3D from '../components/Canvas3D';

const PRESETS = [
  { id:'sofa',    name:'Sofa',         icon:'🛋️', width:220, depth:85,  height:90,  color:'#8b6f47', category:'Sofa'    },
  { id:'bed',     name:'Bed (King)',   icon:'🛏️', width:200, depth:220, height:120, color:'#a0856e', category:'Bed'     },
  { id:'dining',  name:'Dining Table', icon:'🍽️', width:180, depth:90,  height:76,  color:'#6b5240', category:'Dining'  },
  { id:'wardrobe',name:'Wardrobe',     icon:'🚪', width:240, depth:60,  height:210, color:'#7a6555', category:'Wardrobe'},
  { id:'desk',    name:'Study Desk',   icon:'💻', width:120, depth:60,  height:75,  color:'#9e8070', category:'Desk'    },
  { id:'chair',   name:'Chair',        icon:'🪑', width:65,  depth:65,  height:90,  color:'#c9a96e', category:'Chair'   },
  { id:'coffee',  name:'Coffee Table', icon:'☕', width:110, depth:65,  height:45,  color:'#b8956a', category:'Table'   },
  { id:'tv',      name:'TV Unit',      icon:'📺', width:180, depth:45,  height:55,  color:'#7d6b5e', category:'Cabinet' },
  { id:'shelf',   name:'Bookshelf',    icon:'📚', width:90,  depth:35,  height:180, color:'#a08060', category:'Shelf'   },
];

export default function SpaceOptimizer() {
  const [room, setRoom] = useState({ length: 500, width: 400, height: 280 });
  const [furniture, setFurniture] = useState([]);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('2d');
  const [saving, setSaving] = useState(false);
  const [layoutName, setLayoutName] = useState('My Room Layout');
  const { isLoggedIn } = useAuthStore();

  const totalArea = room.length * room.width;
  const usedArea = furniture.reduce((s, f) => s + f.width * f.depth, 0);
  const utilPct = Math.min(100, Math.round((usedArea / totalArea) * 100));

  const setRoomField = (key, val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setRoom(prev => ({ ...prev, [key]: num }));
    }
  };

  const addFurniture = (preset) => {
    setFurniture(prev => [
      ...prev,
      { ...preset, id: Date.now().toString(), x: 20, y: 20, rotation: 0 }
    ]);
    toast.success(`${preset.name} added to room!`);
  };

  const removeFurniture = (id) => {
    setFurniture(prev => prev.filter(f => f.id !== id));
    if (selected === id) setSelected(null);
  };

  const rotateFurniture = (id) => {
    setFurniture(prev => prev.map(f => {
      if (f.id !== id) return f;
      const r = (f.rotation + 90) % 360;
      const swap = r === 90 || r === 270;
      return { ...f, rotation: r, width: swap ? f.depth : f.width, depth: swap ? f.width : f.depth };
    }));
  };

  const saveLayout = async () => {
    if (!isLoggedIn()) { toast.error('Please login to save layout'); return; }
    setSaving(true);
    try {
      await axios.post('/api/layouts', {
        name: layoutName, room,
        furniture: furniture.map(f => ({
          name: f.name, category: f.category,
          x: f.x, y: f.y, width: f.width, depth: f.depth,
          height: f.height || 90, rotation: f.rotation, color: f.color
        })),
        spaceUtilization: { totalArea, usedArea, percentage: utilPct }
      });
      toast.success('Layout saved successfully!');
    } catch { toast.error('Failed to save. Please login first.'); }
    finally { setSaving(false); }
  };

  const exportJSON = () => {
    const data = { name: layoutName, room, furniture, spaceUtilization: { totalArea, usedArea, percentage: utilPct } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${layoutName.replace(/\s+/g, '_')}.json`;
    a.click();
    toast.success('Layout exported!');
  };

  const selectedItem = furniture.find(f => f.id === selected);

  const utilColor = utilPct > 80 ? '#e74c3c' : utilPct > 60 ? '#f39c12' : '#27ae60';
  const utilLabel = utilPct > 80 ? 'Too crowded' : utilPct > 60 ? 'Getting full' : utilPct > 30 ? 'Good balance' : 'Under-furnished';

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Space Optimizer</h1>
            <p style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>
              Design your room in 2D &amp; 3D — drag, drop and visualise before you buy
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <input
              value={layoutName}
              onChange={e => setLayoutName(e.target.value)}
              placeholder="Layout name..."
              style={{ padding:'9px 13px', border:'1.5px solid var(--border)', borderRadius:8, fontFamily:'var(--font-body)', fontSize:'0.875rem', outline:'none', width:180 }}
            />
            <button className="btn btn-outline btn-sm" onClick={exportJSON}>Export JSON</button>
            <button className="btn btn-primary btn-sm" onClick={saveLayout} disabled={saving}>
              {saving ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.5rem', alignItems:'start' }}>

          {/* ══ SIDEBAR ══ */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Room Dimensions */}
            <div className="card" style={{ padding:'1.25rem' }}>
              <h4 style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:600, color:'var(--primary)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                📐 Room Dimensions (cm)
              </h4>

              {/* LENGTH */}
              <div style={{ marginBottom:'0.875rem' }}>
                <label style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', fontWeight:500, color:'var(--text-2)', marginBottom:5 }}>
                  <span>Length</span>
                  <span style={{ color:'var(--primary-light)', fontWeight:400 }}>{room.length} cm = {(room.length/100).toFixed(1)} m</span>
                </label>
                <input
                  type="number"
                  value={room.length}
                  min={100} max={2000}
                  onChange={e => setRoomField('length', e.target.value)}
                  style={{ width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontFamily:'var(--font-body)', fontSize:'0.9rem', outline:'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* WIDTH */}
              <div style={{ marginBottom:'0.875rem' }}>
                <label style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', fontWeight:500, color:'var(--text-2)', marginBottom:5 }}>
                  <span>Width</span>
                  <span style={{ color:'var(--primary-light)', fontWeight:400 }}>{room.width} cm = {(room.width/100).toFixed(1)} m</span>
                </label>
                <input
                  type="number"
                  value={room.width}
                  min={100} max={2000}
                  onChange={e => setRoomField('width', e.target.value)}
                  style={{ width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontFamily:'var(--font-body)', fontSize:'0.9rem', outline:'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* HEIGHT */}
              <div>
                <label style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', fontWeight:500, color:'var(--text-2)', marginBottom:5 }}>
                  <span>Height (ceiling)</span>
                  <span style={{ color:'var(--primary-light)', fontWeight:400 }}>{room.height} cm = {(room.height/100).toFixed(1)} m</span>
                </label>
                <input
                  type="number"
                  value={room.height}
                  min={200} max={600}
                  onChange={e => setRoomField('height', e.target.value)}
                  style={{ width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontFamily:'var(--font-body)', fontSize:'0.9rem', outline:'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Room info */}
              <div style={{ marginTop:'0.875rem', padding:'8px 12px', background:'var(--bg-2)', borderRadius:8, fontSize:'0.78rem', color:'var(--text-3)', lineHeight:1.8 }}>
                <div>Floor area: <strong style={{color:'var(--primary)'}}>{(room.length * room.width / 10000).toFixed(1)} m²</strong></div>
                <div>Volume: <strong style={{color:'var(--primary)'}}>{(room.length * room.width * room.height / 1000000).toFixed(1)} m³</strong></div>
              </div>
            </div>

            {/* Add Furniture */}
            <div className="card" style={{ padding:'1.25rem' }}>
              <h4 style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:600, color:'var(--primary)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                🛋️ Add Furniture
              </h4>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addFurniture(p)}
                    style={{
                      display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                      padding:'12px 8px', background:'var(--bg-2)',
                      border:'1.5px solid var(--border-light)', borderRadius:10,
                      cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.2s',
                      textAlign:'center'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary-light)'; e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-light)'; e.currentTarget.style.background='var(--bg-2)'; e.currentTarget.style.transform=''; }}
                  >
                    <span style={{ fontSize:'1.6rem', lineHeight:1 }}>{p.icon}</span>
                    <span style={{ fontSize:'0.73rem', fontWeight:600, color:'var(--text-2)' }}>{p.name}</span>
                    <span style={{ fontSize:'0.63rem', color:'var(--text-3)' }}>{p.width}×{p.depth} cm</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Space Usage */}
            <div className="card" style={{ padding:'1.25rem' }}>
              <h4 style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:600, color:'var(--primary)', marginBottom:'0.875rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                📊 Space Usage
              </h4>
              <div style={{ width:'100%', height:12, background:'var(--bg-3)', borderRadius:6, overflow:'hidden', marginBottom:8 }}>
                <div style={{ height:'100%', width:`${utilPct}%`, background:utilColor, transition:'width 0.5s ease', borderRadius:6 }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontSize:'1.1rem', fontWeight:700, color:utilColor }}>{utilPct}%</span>
                <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{utilLabel}</span>
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:4 }}>
                {(usedArea/10000).toFixed(2)} m² used of {(totalArea/10000).toFixed(2)} m²
              </div>
            </div>

            {/* Selected item controls */}
            {selectedItem && (
              <div className="card" style={{ padding:'1.25rem', borderColor:'var(--accent)', borderWidth:2 }}>
                <h4 style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:600, color:'var(--primary)', marginBottom:'0.875rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                  ✏️ Selected Item
                </h4>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'0.75rem' }}>
                  <span style={{ fontSize:'1.8rem' }}>{selectedItem.icon}</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{selectedItem.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>
                      {selectedItem.width}W × {selectedItem.depth}D cm · {selectedItem.rotation}° rotation
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => rotateFurniture(selectedItem.id)} style={{ flex:1 }}>🔄 Rotate 90°</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeFurniture(selectedItem.id)} style={{ flex:1 }}>🗑️ Remove</button>
                </div>
              </div>
            )}

            {/* Room Items list */}
            {furniture.length > 0 && (
              <div className="card" style={{ padding:'1.25rem' }}>
                <h4 style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:600, color:'var(--primary)', marginBottom:'0.875rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                  🏠 Room Items ({furniture.length})
                </h4>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {furniture.map(f => (
                    <div
                      key={f.id}
                      onClick={() => setSelected(f.id)}
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'8px 12px', borderRadius:8,
                        background: selected === f.id ? 'var(--accent-light)' : 'var(--bg-2)',
                        border: selected === f.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                        cursor:'pointer', fontSize:'0.82rem',
                        color: selected === f.id ? 'var(--primary)' : 'var(--text-2)',
                        transition:'all 0.2s'
                      }}
                    >
                      <span>{f.icon} {f.name}</span>
                      <button
                        onClick={e => { e.stopPropagation(); removeFurniture(f.id); }}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:'1.1rem', lineHeight:1, padding:'0 2px' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══ CANVAS AREA ══ */}
          <div>
            {/* View toggle */}
            <div style={{ display:'flex', gap:4, background:'var(--bg-3)', padding:4, borderRadius:10, width:'fit-content', marginBottom:'1rem' }}>
              <button
                onClick={() => setView('2d')}
                style={{
                  padding:'9px 22px', border:'none', borderRadius:8,
                  fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:500,
                  cursor:'pointer', transition:'all 0.2s',
                  background: view==='2d' ? 'var(--white)' : 'transparent',
                  color: view==='2d' ? 'var(--primary)' : 'var(--text-3)',
                  boxShadow: view==='2d' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                📐 2D Top View
              </button>
              <button
                onClick={() => setView('3d')}
                style={{
                  padding:'9px 22px', border:'none', borderRadius:8,
                  fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:500,
                  cursor:'pointer', transition:'all 0.2s',
                  background: view==='3d' ? 'var(--white)' : 'transparent',
                  color: view==='3d' ? 'var(--primary)' : 'var(--text-3)',
                  boxShadow: view==='3d' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                🎮 3D View
              </button>
            </div>

            {/* Canvas */}
            {view === '2d' ? (
              <Canvas2D
                room={room}
                furniture={furniture}
                setFurniture={setFurniture}
                selected={selected}
                setSelected={setSelected}
              />
            ) : (
              <Canvas3D room={room} furniture={furniture} />
            )}

            {/* Tip bar */}
            <div style={{ marginTop:10, padding:'10px 14px', background:'var(--bg-2)', borderRadius:8, fontSize:'0.78rem', color:'var(--text-3)', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:'1rem' }}>💡</span>
              {view === '2d'
                ? 'Click any furniture to select it. Drag to move. Red items = overlapping — rearrange to fix.'
                : 'Left-click + drag to rotate the 3D view. Scroll wheel to zoom in and out.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
