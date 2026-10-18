// Stack Tower - 3D Isometric Canvas Engine & Particles

  // --- 3D ISOMETRIC ENGINE (TRUE 3D PROJECTION & ROTATION) ---
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;
  let viewW = window.innerWidth;
  let viewH = window.innerHeight;

  // Isometric projection angles & scale
  const cos30 = Math.cos(Math.PI / 6); // ~0.866025
  const sin30 = Math.sin(Math.PI / 6); // 0.5
  let baseTileS = 18;
  let currentZoom = 1.0;
  let targetZoom = 1.0;
  const BLOCK_HEIGHT_PX = 20;

  // Screen shake
  let screenShakeTime = 0;
  let screenShakeMag = 0;

  function triggerShake(magnitude = 3, duration = 0.15) {
    if (save && save.settings && save.settings.screenShake === false) return;
    screenShakeMag = magnitude;
    screenShakeTime = duration;
  }

  function handleResize() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    dpr = window.devicePixelRatio || 1;

    if (bgCanvas && bgCtx) {
      bgCanvas.width = Math.round(viewW * dpr);
      bgCanvas.height = Math.round(viewH * dpr);
      bgCtx.resetTransform?.();
      bgCtx.scale(dpr, dpr);
    }

    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    // Responsive scale: dynamically scales on tablets/iPads while maintaining optimal phone baseline
    const referenceDimension = Math.min(viewW, viewH * 0.58);
    baseTileS = Math.max(18, Math.min(referenceDimension / 18, 36));
  }
  window.addEventListener('resize', handleResize);
  handleResize();

  function project3D(px, py, pz, camY, zoom = currentZoom) {
    let rx = px;
    let ry = py;
    let rz = pz;
    if (typeof towerTiltX !== 'undefined' && (towerTiltX !== 0 || towerTiltZ !== 0)) {
      rx += towerTiltX * (py * 0.22);
      rz += towerTiltZ * (py * 0.22);
    }
    const cx = viewW / 2;
    // On wider/tablet screens (e.g. iPad 4:3 or 3:2), place anchor nicely balanced in lower third
    const isTablet = viewW >= 600;
    const cyAnchor = isTablet ? 0.68 : 0.65;
    const cy = viewH * cyAnchor + camY * zoom;
    const effTileS = baseTileS * zoom;
    const effH = (baseTileS * 1.05) * zoom;
    return {
      x: cx + (rx - rz) * cos30 * effTileS,
      y: cy + (rx + rz) * sin30 * effTileS - ry * effH
    };
  }

  // Draw cute embossed Cat Paw Print on top face
  function drawCatPaw(cx, cy, scale = 1, alpha = 0.35, targetCtx = ctx) {
    targetCtx.save();
    targetCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    // Center pad
    targetCtx.beginPath();
    targetCtx.ellipse(cx, cy + 2 * scale, 5.2 * scale, 3.8 * scale, 0, 0, Math.PI * 2);
    targetCtx.fill();
    // 4 cute toe beans
    const toes = [
      { dx: -4.5 * scale, dy: -3.0 * scale, r: 1.8 * scale },
      { dx: -1.6 * scale, dy: -5.0 * scale, r: 2.1 * scale },
      { dx: 1.6 * scale, dy: -5.0 * scale, r: 2.1 * scale },
      { dx: 4.5 * scale, dy: -3.0 * scale, r: 1.8 * scale }
    ];
    for (let t of toes) {
      targetCtx.beginPath();
      targetCtx.arc(cx + t.dx, cy + t.dy, t.r, 0, Math.PI * 2);
      targetCtx.fill();
    }
    targetCtx.restore();
  }

  // Draw authentic 3D Isometric Tower Block
  function drawIsometricBlock(x, z, y, w, d, color, camY, isBaseFoundation = false, opts = {}) {
    const halfW = w / 2;
    const halfD = d / 2;
    const hPx = (isBaseFoundation ? 300 : BLOCK_HEIGHT_PX) * currentZoom;

    // 4 top corner vertices
    const topBack = project3D(x - halfW, y, z - halfD, camY);
    const topLeft = project3D(x - halfW, y, z + halfD, camY);
    const topFront = project3D(x + halfW, y, z + halfD, camY);
    const topRight = project3D(x + halfW, y, z - halfD, camY);

    if (topFront.y < -150 || topBack.y > viewH + 250) return;

    const blockType = opts.blockType || (opts.isIce ? 'ice' : (opts.isScratcher ? 'scratcher' : (opts.isMelting ? 'melting' : (opts.isAnvil ? 'anvil' : 'normal'))));

    // Custom Face Colors for special block types
    let colLeft = color.left;
    let colRight = color.right;
    let colTop = color.top;

    if (blockType === 'ice') {
      colLeft = 'hsl(198, 85%, 65%)';
      colRight = 'hsl(198, 80%, 54%)';
      colTop = 'hsl(195, 95%, 82%)';
    } else if (blockType === 'scratcher') {
      colLeft = 'hsl(34, 48%, 52%)';
      colRight = 'hsl(34, 44%, 42%)';
      colTop = 'hsl(36, 56%, 66%)';
    } else if (blockType === 'melting') {
      colLeft = 'hsl(335, 75%, 68%)';
      colRight = 'hsl(335, 70%, 58%)';
      colTop = 'hsl(335, 90%, 82%)';
    } else if (blockType === 'anvil') {
      colLeft = 'hsl(220, 20%, 42%)';
      colRight = 'hsl(220, 20%, 32%)';
      colTop = 'hsl(220, 22%, 58%)';
    }

    // 1. FRONT-LEFT FACE (Facing Z)
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topFront.x, topFront.y);
    ctx.lineTo(topFront.x, topFront.y + hPx);
    ctx.lineTo(topLeft.x, topLeft.y + hPx);
    ctx.closePath();
    ctx.fillStyle = colLeft;
    ctx.fill();

    // 2. FRONT-RIGHT FACE (Facing X)
    ctx.beginPath();
    ctx.moveTo(topFront.x, topFront.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(topRight.x, topRight.y + hPx);
    ctx.lineTo(topFront.x, topFront.y + hPx);
    ctx.closePath();
    ctx.fillStyle = colRight;
    ctx.fill();

    // 3. TOP DIAMOND FACE
    ctx.beginPath();
    ctx.moveTo(topBack.x, topBack.y);
    ctx.lineTo(topLeft.x, topLeft.y);
    ctx.lineTo(topFront.x, topFront.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.closePath();
    ctx.fillStyle = colTop;
    ctx.fill();

    // Gimmick-specific surface textures
    if (blockType === 'ice') {
      // Ice frost sheen & bevel glint
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Frost star glint
      const centerPt = project3D(x, y, z, camY);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(centerPt.x - 4, centerPt.y - 2, 2.5 * currentZoom, 0, Math.PI * 2);
      ctx.fill();
    } else if (blockType === 'scratcher') {
      // Corrugated cardboard scratch grooves
      ctx.save();
      ctx.strokeStyle = 'rgba(110, 60, 20, 0.35)';
      ctx.lineWidth = 1.2 * currentZoom;
      for (let s = -0.3; s <= 0.3; s += 0.2) {
        const pA = project3D(x - halfW * 0.75, y, z + halfD * s, camY);
        const pB = project3D(x + halfW * 0.75, y, z + halfD * s, camY);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (blockType === 'melting') {
      // Melting drips from front faces
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      const dripCount = 3;
      const dripLen = 7 * currentZoom;
      ctx.fillStyle = colTop;
      for (let di = 0; di < dripCount; di++) {
        const frac = 0.25 + di * 0.25;
        const dripX = topLeft.x + (topFront.x - topLeft.x) * frac;
        const dripY = topLeft.y + (topFront.y - topLeft.y) * frac + hPx;
        ctx.beginPath();
        ctx.arc(dripX, dripY + dripLen, 2.2 * currentZoom, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (blockType === 'anvil') {
      // Iron bevel & rivet bolts at 4 corners
      ctx.strokeStyle = 'rgba(220, 230, 255, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      const corners = [topBack, topLeft, topFront, topRight];
      ctx.fillStyle = '#cfd8dc';
      for (let c of corners) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.8 * currentZoom, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Subtle top bevel highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Stamped Cat Paw Print on Top Face Center
    if (!isBaseFoundation && w >= 1.8 && d >= 1.8) {
      const centerPt = project3D(x, y, z, camY);
      const pawScale = Math.min(w, d) / 7.5 * 1.1 * currentZoom;
      drawCatPaw(centerPt.x, centerPt.y, pawScale, blockType === 'ice' ? 0.55 : 0.42);
    }
  }

  // --- 3D MATRIX ROTATION FOR FALLING SLICES (PHYSICS ENGINE) ---
  // 3D Box vertices around center: [-w/2..w/2], [0..1], [-d/2..d/2]
  function get3DRotationMatrix(rx, ry, rz) {
    const cx = Math.cos(rx), sx = Math.sin(rx);
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cz = Math.cos(rz), sz = Math.sin(rz);
    return [
      cy * cz, -cy * sz, sy,
      sx * sy * cz + cx * sz, -sx * sy * sz + cx * cz, -sx * cy,
      -cx * sy * cz + sx * sz, cx * sy * sz + sx * cz, cx * cy
    ];
  }

  function rotateVec(M, v) {
    return {
      x: M[0] * v.x + M[1] * v.y + M[2] * v.z,
      y: M[3] * v.x + M[4] * v.y + M[5] * v.z,
      z: M[6] * v.x + M[7] * v.y + M[8] * v.z
    };
  }

  // True 3D Faceted Rendering with Directional Lighting & Back-Face Culling
  function draw3DFallingSlice(slice, camY) {
    const hw = slice.w / 2;
    const hd = slice.d / 2;
    const hh = 1.0; // 1 unit high

    // 8 local vertices centered at (0, 0.5, 0)
    const localVerts = [
      { x: -hw, y: -0.5, z: -hd }, // 0
      { x:  hw, y: -0.5, z: -hd }, // 1
      { x:  hw, y: -0.5, z:  hd }, // 2
      { x: -hw, y: -0.5, z:  hd }, // 3
      { x: -hw, y:  0.5, z: -hd }, // 4
      { x:  hw, y:  0.5, z: -hd }, // 5
      { x:  hw, y:  0.5, z:  hd }, // 6
      { x: -hw, y:  0.5, z:  hd }  // 7
    ];

    const M = get3DRotationMatrix(slice.rx, slice.ry, slice.rz);

    // World vertices & 2D Screen Projection
    const screenVerts = [];
    const worldVerts = [];
    for (let lv of localVerts) {
      const rv = rotateVec(M, lv);
      const wx = slice.x + rv.x;
      const wy = slice.y + rv.y + 0.5;
      const wz = slice.z + rv.z;
      worldVerts.push({ x: wx, y: wy, z: wz });
      screenVerts.push(project3D(wx, wy, wz, camY));
    }

    // 6 Quads: [indices], local normal
    const faces = [
      { idx: [7, 6, 5, 4], norm: { x: 0, y: 1, z: 0 } },  // Top
      { idx: [0, 1, 2, 3], norm: { x: 0, y: -1, z: 0 } }, // Bottom
      { idx: [1, 5, 6, 2], norm: { x: 1, y: 0, z: 0 } },  // +X (Right)
      { idx: [3, 2, 6, 7], norm: { x: 0, y: 0, z: 1 } },  // +Z (Front)
      { idx: [0, 4, 7, 3], norm: { x: -1, y: 0, z: 0 } }, // -X (Left)
      { idx: [0, 3, 2, 1], norm: { x: 0, y: 0, z: -1 } }  // -Z (Back)
    ];

    // Camera ray vector in world space: looking from (+1, +1.4, +1) toward (0,0,0)
    const camDir = { x: 0.577, y: 0.75, z: 0.577 };
    // Light direction: warm key light from top-right-front
    const lightDir = { x: 0.35, y: 0.85, z: 0.4 };

    const visibleFaces = [];
    for (let f of faces) {
      const worldNorm = rotateVec(M, f.norm);
      // Back-face cull check
      const dotCam = worldNorm.x * camDir.x + worldNorm.y * camDir.y + worldNorm.z * camDir.z;
      if (dotCam > 0.05) {
        // Compute average screen depth
        let avgDepth = 0;
        for (let id of f.idx) {
          avgDepth += worldVerts[id].x + worldVerts[id].z + worldVerts[id].y * 0.3;
        }
        avgDepth /= 4;

        // Directional lighting
        const dotLight = worldNorm.x * lightDir.x + worldNorm.y * lightDir.y + worldNorm.z * lightDir.z;
        const diffuse = Math.max(0, Math.min(1, dotLight));
        const lightness = Math.round(38 + diffuse * 42); // 38% ~ 80%

        visibleFaces.push({
          idx: f.idx,
          depth: avgDepth,
          color: `hsl(${slice.hue}, 75%, ${lightness}%)`
        });
      }
    }

    // Sort back to front
    visibleFaces.sort((a, b) => a.depth - b.depth);

    // Render visible faces
    for (let f of visibleFaces) {
      ctx.beginPath();
      const p0 = screenVerts[f.idx[0]];
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < f.idx.length; i++) {
        const p = screenVerts[f.idx[i]];
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // --- DYNAMIC COLOR PALETTES & AMBIENT SKY TRANSITION ---
  function getBlockColors(level) {
    const hue = (level * 4.2 + hueBase) % 360;
    return {
      hue: hue,
      top: `hsl(${hue}, 80%, 78%)`,
      left: `hsl(${hue}, 72%, 63%)`,
      right: `hsl(${hue}, 64%, 51%)`,
      particle: `hsl(${hue}, 85%, 75%)`
    };
  }

  const foundationColors = {
    top: '#2b224c',
    left: '#1d1734',
    right: '#141025'
  };

  // --- FLOATING TEXTS (+1, MEOWFECT, STREAKS, SIZE UP) ---
  const floatingTexts = [];

  function spawnFloatingText(x, y, z, text, color = '#ffffff', isBig = false, opts = {}) {
    // Gently dismiss prior floating texts so they don't stack/overlap
    floatingTexts.forEach(ft => {
      ft.life = Math.min(ft.life, 0.18);
    });

    const isStreak = opts.isStreak || false;
    const streakLevel = opts.streakLevel || 1;
    const duration = opts.duration || (isStreak ? 1.6 : (isBig ? 1.4 : 1.25));

    floatingTexts.push({
      x: x,
      y: y + (opts.offsetY !== undefined ? opts.offsetY : 0.85),
      z: z,
      text: text,
      color: color,
      strokeColor: opts.strokeColor || '#120d22',
      glowColor: opts.glowColor || (isStreak ? '#ffd700' : 'rgba(0, 0, 0, 0.85)'),
      isBig: isBig,
      isStreak: isStreak,
      streakLevel: streakLevel,
      life: duration,
      maxLife: duration,
      vy: isStreak ? 1.2 : (isBig ? 1.3 : 1.5)
    });
  }

  function updateFloatingTexts(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      if (dt > 0) {
        ft.y += ft.vy * dt;
        ft.vy = Math.max(0.35, ft.vy * (1 - dt * 1.6));
        ft.life -= dt;
      }
      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
        continue;
      }

      const pt = (ft.z !== undefined)
        ? project3D(ft.x, ft.y, ft.z, cameraY)
        : { x: ft.x, y: ft.y };

      const progress = 1 - (ft.life / ft.maxLife);

      // 1. Elastic Punch Pop Scale
      let scale = 1.0;
      if (progress < 0.12) {
        const t = progress / 0.12;
        scale = 0.55 + (1.28 - 0.55) * Math.sin(t * Math.PI * 0.5);
      } else if (progress < 0.25) {
        const t = (progress - 0.12) / 0.13;
        scale = 1.28 - 0.28 * t;
      } else {
        scale = 1.0 + (progress - 0.25) * 0.05;
      }

      // 2. High Visibility Opacity Curve
      // 100% SOLID and CLEAR for the first 70% of duration!
      const alpha = (progress < 0.70)
        ? 1.0
        : Math.max(0, 1 - (progress - 0.70) / 0.30);

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;

      // Typography
      let fontSize = 22;
      let fontWeight = '900';
      if (ft.isStreak) {
        fontSize = ft.streakLevel >= 5 ? 30 : (ft.streakLevel >= 3 ? 27 : 24);
      } else if (ft.isBig) {
        fontSize = 25;
      }

      ctx.font = `${fontWeight} ${fontSize}px "Fredoka", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Pure Floating Arcade Typography (no black/dark background box)
      ctx.save();
      // Outer shadow / glow
      ctx.shadowColor = ft.isStreak
        ? (ft.streakLevel >= 5 ? 'rgba(255, 64, 129, 0.9)' : (ft.streakLevel >= 3 ? 'rgba(255, 152, 0, 0.9)' : 'rgba(0, 229, 255, 0.9)'))
        : (ft.glowColor || 'rgba(255, 215, 0, 0.85)');
      ctx.shadowBlur = ft.isBig ? 16 : 10;

      // Heavy contrast dark outline so the text pops on any background without needing a box
      ctx.lineWidth = 5.0;
      ctx.strokeStyle = '#0d091a';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(ft.text, 0, 0);

      // Inner text fill
      ctx.fillStyle = ft.color || '#ffffff';
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();

      ctx.restore();
    }
  }

  // --- EXPANSION RIPPLE EFFECT (SIZE UP) ---
  const expandRings = [];
  function spawnExpandRing(x, z, y, w, d) {
    expandRings.push({
      x: x, z: z, y: y,
      w: w, d: d,
      scale: 1.0,
      alpha: 0.85
    });
  }

  function updateExpandRings(dt) {
    for (let i = expandRings.length - 1; i >= 0; i--) {
      const ring = expandRings[i];
      ring.scale += 2.4 * dt;
      ring.alpha -= 1.4 * dt;
      if (ring.alpha <= 0) {
        expandRings.splice(i, 1);
        continue;
      }

      const curW = ring.w * ring.scale;
      const curD = ring.d * ring.scale;
      const hw = curW / 2;
      const hd = curD / 2;

      const p0 = project3D(ring.x - hw, ring.y, ring.z - hd, cameraY);
      const p1 = project3D(ring.x - hw, ring.y, ring.z + hd, cameraY);
      const p2 = project3D(ring.x + hw, ring.y, ring.z + hd, cameraY);
      const p3 = project3D(ring.x + hw, ring.y, ring.z - hd, cameraY);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.strokeStyle = `rgba(255, 230, 120, ${ring.alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- DYNAMIC ATMOSPHERIC SKY SYSTEM STATE ---
  let skyHue = 325;
  let skyProgress = 0;      // 0.0 (ground) to 1.0 (goal / apex)
  let skyFever = 0;         // 0.0 to 1.0 (perfect combo fever)
  let skyCelebration = 0;   // 0.0 to 1.0 (stage clear radiance flare)

  // 55 deterministic celestial stars across the upper sky
  const CELESTIAL_STARS = [];
  for (let i = 0; i < 55; i++) {
    CELESTIAL_STARS.push({
      xRatio: ((i * 37 + 13) % 100) / 100, // evenly distributed pseudo-random
      yRatio: ((i * 53 + 7) % 70) / 100,  // upper 70% of sky
      r: 0.8 + ((i * 17) % 10) / 7.0,     // radius 0.8 ~ 2.2px
      twinkleSpd: 1.2 + ((i * 23) % 10) / 4.0,
      phase: (i * 31) % 6.28,
      isGold: (i % 5 === 0)
    });
  }

  // --- FLOATING CAT PARTICLES (Paws, Fish, Stars) ---
  const floatingItems = [];
  const ITEM_TYPES = ['paw', 'fish', 'star'];

  for (let i = 0; i < 30; i++) {
    floatingItems.push({
      type: ITEM_TYPES[i % ITEM_TYPES.length],
      x: Math.random() * viewW,
      y: Math.random() * viewH,
      size: 7 + Math.random() * 8,
      speedY: 35 + Math.random() * 45,
      speedX: -15 + Math.random() * 30,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.8,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 1 + Math.random() * 1.8,
      opacity: 0.3 + Math.random() * 0.4
    });
  }

  function updateFloatingItems(dt) {
    for (let p of floatingItems) {
      p.y += p.speedY * dt;
      p.swing += p.swingSpeed * dt;
      p.x += (p.speedX + Math.sin(p.swing) * 20) * dt;
      p.rotation += p.rotSpeed * dt;

      if (p.y > viewH + 20) {
        p.y = -20;
        p.x = Math.random() * viewW;
      }
      if (p.x < -20) p.x = viewW + 20;
      if (p.x > viewW + 20) p.x = -20;
    }
  }

  function drawFloatingItems(targetCtx = (bgCtx || ctx)) {
    targetCtx.save();
    for (let p of floatingItems) {
      targetCtx.save();
      targetCtx.translate(p.x, p.y);
      targetCtx.rotate(p.rotation);

      if (p.type === 'paw') {
        drawCatPaw(0, 0, p.size / 9, p.opacity, targetCtx);
      } else if (p.type === 'fish') {
        targetCtx.fillStyle = `rgba(255, 215, 120, ${p.opacity})`;
        targetCtx.beginPath();
        targetCtx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.beginPath();
        targetCtx.moveTo(p.size * 0.7, 0);
        targetCtx.lineTo(p.size * 1.4, -p.size * 0.45);
        targetCtx.lineTo(p.size * 1.4, p.size * 0.45);
        targetCtx.closePath();
        targetCtx.fill();
      } else {
        targetCtx.fillStyle = `rgba(255, 230, 180, ${p.opacity})`;
        targetCtx.beginPath();
        targetCtx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.restore();
    }
    targetCtx.restore();
  }

  // Sparkle burst on perfect & streaks
  const activeParticles = [];
  function spawn3DStarBurst(x, z, y, camY, count = 18, isStreak = false, streakLevel = 1) {
    if (save && save.settings && save.settings.particles === false) return;
    const pt = project3D(x, y, z, camY);
    const streakColors = ['#ffe082', '#ffd700', '#ff80ab', '#00e5ff', '#ff3d00', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = isStreak ? (110 + Math.random() * 240) : (75 + Math.random() * 150);
      const col = isStreak ? streakColors[i % streakColors.length] : ((i % 2 === 0) ? '#ffe082' : '#ff80ab');
      activeParticles.push({
        x: pt.x,
        y: pt.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - (isStreak ? 85 : 60),
        size: (isStreak ? 4.5 : 3.5) + Math.random() * (isStreak ? 5.5 : 3.5),
        isStar: isStreak && (i % 2 === 0),
        life: isStreak ? 1.05 : 0.85,
        maxLife: isStreak ? 1.05 : 0.85,
        color: col
      });
    }
  }

  function updateParticles(dt) {
    for (let i = activeParticles.length - 1; i >= 0; i--) {
      const p = activeParticles[i];
      p.vy += 230 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.life <= 0) {
        activeParticles.splice(i, 1);
        continue;
      }

      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.isStar) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.translate(p.x, p.y);
        const s = p.size * 1.35;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- CLIMBING KITTEN SYSTEM (탑을 오르는 아기 고양이) ---
  function updateClimbingKitten(dt) {
    if (typeof climbingKitten === 'undefined') return;
    if (climbingKitten.isJumping) {
      climbingKitten.jumpProgress += dt * 3.8;
      if (climbingKitten.jumpProgress >= 1.0) {
        climbingKitten.jumpProgress = 1.0;
        climbingKitten.isJumping = false;
        climbingKitten.y = climbingKitten.targetY;
      }
    } else {
      climbingKitten.y = climbingKitten.targetY;
    }
    if (climbingKitten.state === 'wobble') {
      climbingKitten.wobblePhase += dt * 14;
    }
  }

  function drawClimbingKitten(camY) {
    // Disabled per user request: 블럭 가운데 고양이 제거
    return;
    if (cfg && cfg.stageType === 'boss') return; // Excluded in boss battles!
    if (typeof bonusActive !== 'undefined' && bonusActive) return;
    if (!tower || tower.length < 1) return;

    const top = tower[tower.length - 1];
    if (!top) return;

    let kx = climbingKitten.x;
    let kz = climbingKitten.z;
    let ky = climbingKitten.y;

    if (climbingKitten.isJumping) {
      const p = climbingKitten.jumpProgress;
      // Parabolic jump arc
      ky = climbingKitten.y + (climbingKitten.targetY - climbingKitten.y) * p + Math.sin(p * Math.PI) * 0.75;
      kx = climbingKitten.x + (top.x - climbingKitten.x) * p;
      kz = climbingKitten.z + (top.z - climbingKitten.z) * p;
    } else {
      ky = top.y;
      kx = top.x;
      kz = top.z;
    }

    const pt = project3D(kx, ky, kz, camY);
    const kScale = Math.max(0.85, Math.min(1.4, currentZoom * 1.3));

    ctx.save();
    ctx.translate(pt.x, pt.y - 8 * kScale);

    if (climbingKitten.state === 'wobble') {
      ctx.rotate(Math.sin(climbingKitten.wobblePhase) * 0.12);
    }

    // Shadow on top face
    ctx.save();
    ctx.scale(1, 0.45);
    ctx.beginPath();
    ctx.arc(0, 15 * kScale, 9 * kScale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fill();
    ctx.restore();

    // Kitten Body (Soft cream fluffy body)
    const bodyR = 11.5 * kScale;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyR, bodyR * 0.88, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf7';
    ctx.fill();
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Calico orange patch on left head
    ctx.beginPath();
    ctx.arc(-3.2 * kScale, -4.2 * kScale, 4.8 * kScale, 0, Math.PI * 2);
    ctx.fillStyle = '#ff9800';
    ctx.fill();

    // Cute Pointy Ears
    // Left ear
    ctx.beginPath();
    ctx.moveTo(-6 * kScale, -5 * kScale);
    ctx.lineTo(-9.5 * kScale, -13.5 * kScale);
    ctx.lineTo(-2 * kScale, -7 * kScale);
    ctx.closePath();
    ctx.fillStyle = '#ff9800';
    ctx.fill();
    // Left inner ear
    ctx.beginPath();
    ctx.moveTo(-5 * kScale, -6 * kScale);
    ctx.lineTo(-8.5 * kScale, -11.5 * kScale);
    ctx.lineTo(-3 * kScale, -7 * kScale);
    ctx.closePath();
    ctx.fillStyle = '#ff80ab';
    ctx.fill();

    // Right ear
    ctx.beginPath();
    ctx.moveTo(2 * kScale, -7 * kScale);
    ctx.lineTo(9.5 * kScale, -13.5 * kScale);
    ctx.lineTo(6 * kScale, -5 * kScale);
    ctx.closePath();
    ctx.fillStyle = '#fffdf7';
    ctx.fill();
    ctx.strokeStyle = '#f5a623';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Right inner ear
    ctx.beginPath();
    ctx.moveTo(3 * kScale, -7 * kScale);
    ctx.lineTo(8.5 * kScale, -11.5 * kScale);
    ctx.lineTo(5 * kScale, -6 * kScale);
    ctx.closePath();
    ctx.fillStyle = '#ff80ab';
    ctx.fill();

    // Eyes
    if (climbingKitten.state === 'loaf') {
      // Happy purring eyes ^ ^
      ctx.strokeStyle = '#4a2810';
      ctx.lineWidth = 1.6 * kScale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-3.6 * kScale, -0.6 * kScale, 2.3 * kScale, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(3.6 * kScale, -0.6 * kScale, 2.3 * kScale, Math.PI, 0);
      ctx.stroke();
    } else if (climbingKitten.state === 'wobble') {
      // Trembling eyes > <
      ctx.strokeStyle = '#4a2810';
      ctx.lineWidth = 1.4 * kScale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-5 * kScale, -2 * kScale); ctx.lineTo(-2 * kScale, 0);
      ctx.moveTo(-5 * kScale, 0); ctx.lineTo(-2 * kScale, -2 * kScale);
      ctx.moveTo(2 * kScale, -2 * kScale); ctx.lineTo(5 * kScale, 0);
      ctx.moveTo(2 * kScale, 0); ctx.lineTo(5 * kScale, -2 * kScale);
      ctx.stroke();
    } else {
      // Normal sparkling eyes
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.arc(-3.6 * kScale, -0.8 * kScale, 1.8 * kScale, 0, Math.PI * 2);
      ctx.arc(3.6 * kScale, -0.8 * kScale, 1.8 * kScale, 0, Math.PI * 2);
      ctx.fill();
      // Eye glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4.1 * kScale, -1.3 * kScale, 0.75 * kScale, 0, Math.PI * 2);
      ctx.arc(3.1 * kScale, -1.3 * kScale, 0.75 * kScale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nose
    ctx.fillStyle = '#ff80ab';
    ctx.beginPath();
    ctx.arc(0, 1.6 * kScale, 1.1 * kScale, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#bcaaa4';
    ctx.lineWidth = 0.8 * kScale;
    ctx.beginPath();
    ctx.moveTo(-5 * kScale, 1.2 * kScale); ctx.lineTo(-9.5 * kScale, 0.5 * kScale);
    ctx.moveTo(-5 * kScale, 2.5 * kScale); ctx.lineTo(-9.5 * kScale, 3.6 * kScale);
    ctx.moveTo(5 * kScale, 1.2 * kScale); ctx.lineTo(9.5 * kScale, 0.5 * kScale);
    ctx.moveTo(5 * kScale, 2.5 * kScale); ctx.lineTo(9.5 * kScale, 3.6 * kScale);
    ctx.stroke();

    // Swishing Tail
    ctx.beginPath();
    ctx.arc(8.5 * kScale, 3.2 * kScale, 4.8 * kScale, Math.PI * 0.45, Math.PI * 1.8);
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2.5 * kScale;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Reaction Emojis
    if (climbingKitten.state === 'loaf') {
      ctx.font = `${Math.round(12 * kScale)}px sans-serif`;
      ctx.fillText('💖', -4 * kScale, -15 * kScale);
    } else if (climbingKitten.state === 'wobble') {
      ctx.font = `${Math.round(11 * kScale)}px sans-serif`;
      ctx.fillText('💦', 4 * kScale, -15 * kScale);
    }

    ctx.restore();
  }

  // --- FOGGY VILLAGE ROLLING MISTS (안개 낀 마을) ---
  const fogClouds = [];
  for (let i = 0; i < 9; i++) {
    fogClouds.push({
      xRatio: ((i * 13) % 10) / 10,
      yRatio: 0.16 + ((i * 7) % 6) * 0.08,
      radius: 80 + (i % 4) * 25,
      speedX: 9 + (i % 3) * 5,
      phase: (i * 0.7) % 6.28
    });
  }

  function drawFogLayer(time, dt) {
    if (!cfg || !cfg.fog) return;
    const fogClearMult = (cfg.fogClear) ? (1 - cfg.fogClear) : 1.0;
    const oscAlpha = (0.35 + 0.32 * Math.sin(time / 2200)) * fogClearMult;
    if (oscAlpha <= 0.02) return;

    ctx.save();
    for (let cloud of fogClouds) {
      cloud.xRatio += (cloud.speedX * dt) / viewW;
      if (cloud.xRatio > 1.35) cloud.xRatio = -0.35;

      const cx = cloud.xRatio * viewW;
      const cy = cloud.yRatio * viewH + Math.sin(time / 1200 + cloud.phase) * 14;
      const r = cloud.radius * currentZoom;

      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
      grad.addColorStop(0, `rgba(235, 238, 255, ${oscAlpha * 0.85})`);
      grad.addColorStop(0.55, `rgba(220, 226, 250, ${oscAlpha * 0.48})`);
      grad.addColorStop(1, 'rgba(210, 220, 245, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
