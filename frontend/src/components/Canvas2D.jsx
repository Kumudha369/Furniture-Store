import React, { useRef, useEffect, useCallback } from 'react';

const SCALE = 0.55; // pixels per cm

function hasOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.depth &&
    a.y + a.depth > b.y
  );
}

export default function Canvas2D({ room, furniture, setFurniture, selected, setSelected }) {
  const canvasRef  = useRef(null);
  const dragging   = useRef(null);      // id of item being dragged
  const offset     = useRef({ x:0, y:0 });

  // ── Draw everything ──────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = Math.max(100, room.length) * SCALE;
    const H = Math.max(100, room.width)  * SCALE;
    const PAD = 32;

    canvas.width  = W + PAD * 2;
    canvas.height = H + PAD * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(PAD, PAD);

    // ── Grid ────────────────────────────────────────────
    const GRID_CM = 100; // 1 metre grid lines
    ctx.strokeStyle = '#e0d8cc';
    ctx.lineWidth   = 0.5;
    for (let x = 0; x <= W; x += GRID_CM * SCALE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += GRID_CM * SCALE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── Floor ───────────────────────────────────────────
    ctx.fillStyle = '#faf7f3';
    ctx.fillRect(0, 0, W, H);

    // ── Wall border ─────────────────────────────────────
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth   = 3;
    ctx.strokeRect(0, 0, W, H);

    // ── Dimension labels ────────────────────────────────
    ctx.fillStyle    = '#9a8c7d';
    ctx.font         = `12px 'DM Sans', sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${room.length} cm`, W / 2, -6);

    ctx.save();
    ctx.translate(-10, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'top';
    ctx.fillText(`${room.width} cm`, 0, 0);
    ctx.restore();

    // ── Furniture ────────────────────────────────────────
    furniture.forEach(f => {
      const collision = furniture.some(other => other.id !== f.id && hasOverlap(f, other));
      const isSelected = selected === f.id;

      const fx = (f.x || 0) * SCALE;
      const fy = (f.y || 0) * SCALE;
      const fw = Math.max(4, (f.width || 80) * SCALE);
      const fd = Math.max(4, (f.depth || 60) * SCALE);

      ctx.save();

      // Drop shadow
      ctx.shadowColor   = 'rgba(90,74,58,0.25)';
      ctx.shadowBlur    = isSelected ? 10 : 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Main fill
      ctx.fillStyle   = collision ? '#e74c3c' : f.color || '#8b6f47';
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(fx, fy, fw, fd, 5) : ctx.rect(fx, fy, fw, fd);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';

      // Border
      ctx.strokeStyle = isSelected ? '#c9a96e' : 'rgba(60,50,40,0.5)';
      ctx.lineWidth   = isSelected ? 2.5 : 1;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(fx, fy, fw, fd, 5) : ctx.rect(fx, fy, fw, fd);
      ctx.stroke();

      // Selection glow
      if (isSelected) {
        ctx.strokeStyle = '#c9a96e';
        ctx.lineWidth   = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(fx - 4, fy - 4, fw + 8, fd + 8, 7) : ctx.rect(fx - 4, fy - 4, fw + 8, fd + 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Emoji icon (centre)
      const iconSize = Math.min(fw, fd) * 0.5;
      ctx.font         = `${Math.max(10, Math.min(28, iconSize))}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = 'transparent';
      ctx.globalAlpha  = 0.9;
      ctx.fillText(f.icon || '🪑', fx + fw / 2, fy + fd / 2 - (fw > 50 ? 6 : 0));

      // Name label (only if wide enough)
      if (fw > 45 && fd > 30) {
        ctx.font         = `bold ${Math.min(11, fw / 8)}px 'DM Sans', sans-serif`;
        ctx.fillStyle    = 'rgba(255,255,255,0.92)';
        ctx.textBaseline = 'bottom';
        ctx.globalAlpha  = 1;
        ctx.fillText(f.name.length > 12 ? f.name.slice(0, 11) + '…' : f.name, fx + fw / 2, fy + fd - 5);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [room, furniture, selected]);

  useEffect(() => { draw(); }, [draw]);

  // ── Hit test: which furniture is at canvas point px,py ──
  const hitTest = useCallback((px, py) => {
    for (let i = furniture.length - 1; i >= 0; i--) {
      const f  = furniture[i];
      const fx = (f.x || 0) * SCALE + 32;
      const fy = (f.y || 0) * SCALE + 32;
      const fw = (f.width || 80) * SCALE;
      const fd = (f.depth || 60) * SCALE;
      if (px >= fx && px <= fx + fw && py >= fy && py <= fy + fd) return f.id;
    }
    return null;
  }, [furniture]);

  const getCanvasXY = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY
    };
  };

  const onPointerDown = (e) => {
    const canvas = canvasRef.current;
    const { x, y } = getCanvasXY(e, canvas);
    const hit = hitTest(x, y);
    if (hit) {
      const f = furniture.find(item => item.id === hit);
      dragging.current = hit;
      offset.current = {
        x: x - ((f.x || 0) * SCALE + 32),
        y: y - ((f.y || 0) * SCALE + 32)
      };
      setSelected(hit);
    } else {
      setSelected(null);
    }
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const canvas = canvasRef.current;
    const { x, y } = getCanvasXY(e, canvas);
    const id = dragging.current;

    setFurniture(prev => prev.map(f => {
      if (f.id !== id) return f;
      const newX = Math.max(0, Math.min(room.length - f.width, (x - offset.current.x - 32) / SCALE));
      const newY = Math.max(0, Math.min(room.width  - f.depth, (y - offset.current.y - 32) / SCALE));
      return { ...f, x: newX, y: newY };
    }));
  };

  const onPointerUp = () => { dragging.current = null; };

  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        overflow: 'auto',
        minHeight: 520,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        style={{
          cursor: dragging.current ? 'grabbing' : 'grab',
          display: 'block',
          maxWidth: '100%',
          touchAction: 'none'
        }}
      />
    </div>
  );
}
