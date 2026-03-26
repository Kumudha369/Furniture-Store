import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const S = 0.01; // 1 cm = 0.01 Three.js units (100cm = 1 unit = 1 metre)

export default function Canvas3D({ room, furniture }) {
  const mountRef    = useRef(null);
  const sceneRef    = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef   = useRef(null);
  const frameRef    = useRef(null);
  const dragging    = useRef(false);
  const lastMouse   = useRef({ x: 0, y: 0 });
  const sph         = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.5, radius: 8 });

  // ── Update camera position from spherical coords ──────────
  const updateCamera = useCallback(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    const { theta, phi, radius } = sph.current;
    const cx = (room.length || 500) * S / 2;
    const cz = (room.width  || 400) * S / 2;
    cam.position.set(
      cx + radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      cz + radius * Math.sin(phi) * Math.sin(theta)
    );
    cam.lookAt(cx, 0, cz);
  }, [room]);

  // ── Build / rebuild scene objects ─────────────────────────
  const buildScene = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove previous dynamic objects
    const toRemove = [];
    scene.traverse(obj => { if (obj.userData.dynamic) toRemove.push(obj); });
    toRemove.forEach(obj => {
      if (obj.parent) obj.parent.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });

    const rL = (room.length || 500) * S;
    const rW = (room.width  || 400) * S;
    const rH = (room.height || 280) * S;

    const tag = (obj) => { obj.userData.dynamic = true; return obj; };

    // ── Floor ─────────────────────────────────────────────
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(rL, rW),
      new THREE.MeshLambertMaterial({ color: 0xd4c5b0 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(rL / 2, 0, rW / 2);
    floorMesh.receiveShadow = true;
    scene.add(tag(floorMesh));

    // ── Floor grid ────────────────────────────────────────
    const gridSize = Math.max(rL, rW);
    const gridHelper = new THREE.GridHelper(gridSize, 10, 0xb8a898, 0xc8b8a8);
    gridHelper.position.set(rL / 2, 0.002, rW / 2);
    scene.add(tag(gridHelper));

    // ── Walls (back + left only so you can see inside) ────
    const wallMat = new THREE.MeshLambertMaterial({
      color: 0xede0d0,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide
    });

    // Back wall (z = 0)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(rL, rH), wallMat.clone());
    backWall.position.set(rL / 2, rH / 2, 0);
    scene.add(tag(backWall));

    // Left wall (x = 0)
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(rW, rH), wallMat.clone());
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(0, rH / 2, rW / 2);
    scene.add(tag(leftWall));

    // ── Room outline box ──────────────────────────────────
    const roomBox = new THREE.Mesh(
      new THREE.BoxGeometry(rL, rH, rW),
      new THREE.MeshLambertMaterial({ color: 0xe8d8c0, transparent: true, opacity: 0.08, side: THREE.BackSide })
    );
    roomBox.position.set(rL / 2, rH / 2, rW / 2);
    scene.add(tag(roomBox));

    const edgeLines = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(rL, rH, rW)),
      new THREE.LineBasicMaterial({ color: 0x8b6f47, linewidth: 1 })
    );
    edgeLines.position.set(rL / 2, rH / 2, rW / 2);
    scene.add(tag(edgeLines));

    // ── Furniture ─────────────────────────────────────────
    furniture.forEach(f => {
      const fw = Math.max(0.01, (f.width  || 100) * S);
      const fd = Math.max(0.01, (f.depth  || 80)  * S);
      const fh = Math.max(0.01, (f.height || 80)  * S);
      const fx = (f.x || 0) * S + fw / 2;
      const fz = (f.y || 0) * S + fd / 2;

      // Parse color safely
      let colorHex = 0x8b6f47;
      try {
        const raw = (f.color || '#8b6f47').replace('#', '');
        colorHex = parseInt(raw, 16);
        if (isNaN(colorHex)) colorHex = 0x8b6f47;
      } catch { /* use default */ }

      // Main box
      const boxGeo  = new THREE.BoxGeometry(fw, fh, fd);
      const boxMat  = new THREE.MeshLambertMaterial({ color: colorHex });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.position.set(fx, fh / 2, fz);
      boxMesh.castShadow    = true;
      boxMesh.receiveShadow = true;

      // Outline edges
      const edgeMesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(boxGeo),
        new THREE.LineBasicMaterial({ color: 0x3d3028 })
      );
      boxMesh.add(edgeMesh);

      // Top face slightly lighter to show depth
      const topGeo = new THREE.PlaneGeometry(fw * 0.85, fd * 0.85);
      const topMat = new THREE.MeshLambertMaterial({ color: colorHex + 0x151515, transparent: true, opacity: 0.5 });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.rotation.x = -Math.PI / 2;
      topMesh.position.set(0, fh / 2 + 0.001, 0);
      boxMesh.add(topMesh);

      tag(boxMesh);
      scene.add(boxMesh);
    });

    updateCamera();
  }, [room, furniture, updateCamera]);

  // ── Initial setup (runs once) ──────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f1ed);
    scene.fog = new THREE.Fog(0xf5f1ed, 15, 40);
    sceneRef.current = scene;

    // Camera
    const w = mount.clientWidth  || 800;
    const h = mount.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.05, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.8);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffae0, 1.4);
    sun.position.set(6, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.width  = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far  = 50;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xd4c8b0, 0.5);
    fill.position.set(-4, 5, -4);
    scene.add(fill);

    const hemi = new THREE.HemisphereLight(0xfff5e0, 0xd4c5b0, 0.4);
    scene.add(hemi);

    // Build and start render loop
    buildScene();

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    frameRef.current = animId;

    // ── Mouse / touch controls ──
    const onMouseDown = (e) => {
      dragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onMouseUp = () => {
      dragging.current = false;
      renderer.domElement.style.cursor = 'grab';
    };
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const dx = (e.clientX - lastMouse.current.x) * 0.008;
      const dy = (e.clientY - lastMouse.current.y) * 0.008;
      sph.current.theta -= dx;
      sph.current.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, sph.current.phi + dy));
      updateCamera();
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e) => {
      e.preventDefault();
      sph.current.radius = Math.max(2, Math.min(25, sph.current.radius + e.deltaY * 0.008));
      updateCamera();
    };

    // Touch controls (mobile)
    let lastTouch = null;
    const onTouchStart = (e) => { if (e.touches.length === 1) lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTouchMove  = (e) => {
      if (e.touches.length !== 1 || !lastTouch) return;
      const dx = (e.touches[0].clientX - lastTouch.x) * 0.008;
      const dy = (e.touches[0].clientY - lastTouch.y) * 0.008;
      sph.current.theta -= dx;
      sph.current.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, sph.current.phi + dy));
      updateCamera();
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const el = renderer.domElement;
    el.style.cursor = 'grab';
    el.addEventListener('mousedown',  onMouseDown);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: true });
    el.addEventListener('wheel',      onWheel, { passive: false });
    window.addEventListener('mouseup',   onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!mount || !renderer) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      renderer.setSize(nw, nh);
      if (cameraRef.current) {
        cameraRef.current.aspect = nw / nh;
        cameraRef.current.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      el.removeEventListener('mousedown',  onMouseDown);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('wheel',      onWheel);
      window.removeEventListener('mouseup',   onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      if (mount.contains(el)) mount.removeChild(el);
      renderer.dispose();
      sceneRef.current    = null;
      rendererRef.current = null;
      cameraRef.current   = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Rebuild when room or furniture changes ─────────────
  useEffect(() => {
    if (sceneRef.current) buildScene();
  }, [room, furniture, buildScene]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '520px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1.5px solid var(--border)',
        background: '#f5f1ed',
        position: 'relative'
      }}
    />
  );
}
