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
  var BLOCK_HEIGHT_PX = 20;

  // Screen shake
  let screenShakeTime = 0;
  let screenShakeMag = 0;

  function triggerShake(magnitude = 3, duration = 0.15) {
    if (save && save.settings && save.settings.screenShake === false) return;
    screenShakeMag = magnitude;
    screenShakeTime = duration;
  }

  function handleResize() {
    viewW = window.innerWidth || document.documentElement.clientWidth || 375;
    viewH = window.innerHeight || document.documentElement.clientHeight || 667;
    dpr = window.devicePixelRatio || 1;

    if (bgCanvas && bgCtx) {
      bgCanvas.width = Math.round(viewW * dpr);
      bgCanvas.height = Math.round(viewH * dpr);
      bgCanvas.style.width = viewW + 'px';
      bgCanvas.style.height = viewH + 'px';
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (canvas && ctx) {
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      canvas.style.width = viewW + 'px';
      canvas.style.height = viewH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Responsive scale: dynamically scales on tablets/iPads while maintaining optimal phone baseline
    const referenceDimension = Math.min(viewW, viewH * 0.58);
    baseTileS = Math.max(18, Math.min(referenceDimension / 18, 36));
    BLOCK_HEIGHT_PX = baseTileS * 1.05;
    window.BLOCK_HEIGHT_PX = BLOCK_HEIGHT_PX;
  }
  window.handleResize = handleResize;
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => setTimeout(handleResize, 150));
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
    const effH = BLOCK_HEIGHT_PX * zoom;
    return {
      x: cx + (rx - rz) * cos30 * effTileS,
      y: cy + (rx + rz) * sin30 * effTileS - ry * effH
    };
  }

  // Draw cute embossed Cat Paw Print on top face
  function drawCatPaw(cx, cy, scale = 1, alpha = 0.35, targetCtx = ctx, fillStyleOverride = null) {
    targetCtx.save();
    targetCtx.fillStyle = fillStyleOverride || `rgba(255, 255, 255, ${alpha})`;
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

  // --- PROCEDURAL 5-FLAVOR GELATO & WAFFLE CONE SYSTEM (녹아내리는 젤라또 & 바삭 와플 콘) ---
  const GELATO_FLAVORS = [
    {
      name: 'strawberry',
      colLeft: 'hsl(340, 78%, 68%)',
      colRight: 'hsl(340, 72%, 58%)',
      colTop: 'hsl(340, 88%, 84%)',
      glazeLeft: '#ffffff',
      glazeRight: '#fff0f5',
      topping: 'rainbow'
    },
    {
      name: 'mint_choco',
      colLeft: 'hsl(162, 75%, 65%)',
      colRight: 'hsl(162, 70%, 52%)',
      colTop: 'hsl(162, 85%, 82%)',
      glazeLeft: '#3e2723',
      glazeRight: '#2b1a17',
      topping: 'chocochip'
    },
    {
      name: 'vanilla_custard',
      colLeft: 'hsl(44, 88%, 74%)',
      colRight: 'hsl(44, 80%, 62%)',
      colTop: 'hsl(46, 95%, 88%)',
      glazeLeft: '#ff9800',
      glazeRight: '#e65100',
      topping: 'caramel'
    },
    {
      name: 'blueberry_taro',
      colLeft: 'hsl(278, 70%, 68%)',
      colRight: 'hsl(278, 65%, 56%)',
      colTop: 'hsl(278, 80%, 86%)',
      glazeLeft: '#ffffff',
      glazeRight: '#ede7f6',
      topping: 'berrypearls'
    },
    {
      name: 'choco_fudge',
      colLeft: 'hsl(26, 68%, 42%)',
      colRight: 'hsl(26, 65%, 32%)',
      colTop: 'hsl(26, 75%, 58%)',
      glazeLeft: '#fff9c4',
      glazeRight: '#fff176',
      topping: 'cocoanibs'
    }
  ];

  const ICE_CREAM_SPRINKLES = [
    { u: -0.28, v: -0.22, color: '#ff4081', rot: 0.38 },  // Strawberry pink
    { u:  0.22, v: -0.26, color: '#00e5ff', rot: -0.45 }, // Mint cyan
    { u: -0.18, v:  0.24, color: '#ffd600', rot: 0.72 },  // Lemon
    { u:  0.26, v:  0.18, color: '#00e676', rot: -0.32 }, // Mint chip
    { u:  0.02, v: -0.28, color: '#ff9100', rot: 0.22 },  // Orange sugar
    { u: -0.28, v:  0.06, color: '#e040fb', rot: -0.65 }, // Sweet taro
    { u:  0.28, v: -0.04, color: '#ffffff', rot: 0.52 },  // Sugar pearl
    { u:  0.04, v:  0.28, color: '#ff4081', rot: -0.42 }, // Berry red
    { u: -0.10, v: -0.08, color: '#ffd600', rot: 0.58 },  // Lemon crumb
    { u:  0.14, v:  0.08, color: '#00e5ff', rot: -0.55 }  // Blue candy
  ];

  // Draw crispy baked Waffle Cone wall pattern (for rock-solid non-melting blocks)
  function drawWaffleConeWall(pTopLeft, pTopRight, hPx, isRightWall) {
    ctx.save();

    // 1. Crosshatch baked waffle wafer grid lines
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pTopLeft.x, pTopLeft.y);
    ctx.lineTo(pTopRight.x, pTopRight.y);
    ctx.lineTo(pTopRight.x, pTopRight.y + hPx);
    ctx.lineTo(pTopLeft.x, pTopLeft.y + hPx);
    ctx.closePath();
    ctx.clip();

    const dx = pTopRight.x - pTopLeft.x;
    const dy = pTopRight.y - pTopLeft.y;
    const steps = 6;

    // Diagonal lines in / direction
    for (let i = -steps; i <= steps * 2; i++) {
      const t = i / steps;
      const startX = pTopLeft.x + dx * t;
      const startY = pTopLeft.y + dy * t;
      const endX = startX + (isRightWall ? -34 : 34) * currentZoom;
      const endY = startY + hPx;

      ctx.strokeStyle = 'rgba(92, 42, 10, 0.28)';
      ctx.lineWidth = 1.4 * currentZoom;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 230, 180, 0.22)';
      ctx.lineWidth = 0.8 * currentZoom;
      ctx.beginPath();
      ctx.moveTo(startX + 1, startY);
      ctx.lineTo(endX + 1, endY);
      ctx.stroke();
    }

    // Diagonal lines in \ direction
    for (let i = -steps; i <= steps * 2; i++) {
      const t = i / steps;
      const startX = pTopLeft.x + dx * t;
      const startY = pTopLeft.y + dy * t;
      const endX = startX + (isRightWall ? 34 : -34) * currentZoom;
      const endY = startY + hPx;

      ctx.strokeStyle = 'rgba(92, 42, 10, 0.28)';
      ctx.lineWidth = 1.4 * currentZoom;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 230, 180, 0.22)';
      ctx.lineWidth = 0.8 * currentZoom;
      ctx.beginPath();
      ctx.moveTo(startX + 1, startY);
      ctx.lineTo(endX + 1, endY);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Firm chocolate ganache dipping rim across the upper 22% of the wall (zero melting)
    const rimH = Math.min(hPx * 0.25, 12 * currentZoom);
    ctx.beginPath();
    ctx.moveTo(pTopLeft.x, pTopLeft.y);
    ctx.lineTo(pTopRight.x, pTopRight.y);

    const scallopCount = 5;
    for (let i = scallopCount - 1; i >= 0; i--) {
      const tEnd = (i + 1) / scallopCount;
      const tStart = i / scallopCount;
      const tMid = (tStart + tEnd) / 2;
      const p0 = { x: pTopLeft.x + dx * tStart, y: pTopLeft.y + dy * tStart };
      const pM = { x: pTopLeft.x + dx * tMid, y: pTopLeft.y + dy * tMid };
      ctx.quadraticCurveTo(pM.x, pM.y + rimH, p0.x, p0.y + rimH * 0.35);
    }
    ctx.closePath();
    ctx.fillStyle = isRightWall ? '#2c1409' : '#3e2012';
    ctx.fill();

    // Delicate chocolate gloss reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.0 * currentZoom;
    ctx.beginPath();
    ctx.moveTo(pTopLeft.x, pTopLeft.y + 1);
    ctx.lineTo(pTopRight.x, pTopRight.y + 1);
    ctx.stroke();

    ctx.restore();
  }

  // Draw procedural melting cream drips (3~5 variable drips with pseudo-random seed per y)
  function drawIceCreamWallDrips(pTopLeft, pTopRight, hPx, isRightWall, opts, yLevel, flavor) {
    const yVal = (typeof yLevel === 'number') ? yLevel : 0;
    // Deterministic pseudo-random seed per block height and wall side
    const seed = Math.abs(Math.sin(yVal * 12.9898 + (isRightWall ? 78.233 : 37.719))) * 43758.5453;
    const dripCount = 3 + (Math.floor(seed) % 3); // 3, 4, or 5 drips

    const depths = [];
    for (let i = 0; i < dripCount; i++) {
      const pseudo = Math.abs(Math.sin(seed + i * 9.17)) * 1000;
      const dRatio = 0.30 + ((pseudo % 100) / 100) * 0.52; // 0.30 to 0.82
      depths.push(dRatio);
    }

    const maxTimer = (opts && opts.maxMeltTimer) ? opts.maxMeltTimer : 2.8;
    const timerProgress = (opts && typeof opts.meltTimer === 'number' && opts.meltTimer > 0)
      ? Math.max(0, Math.min(1.0, 1.0 - (opts.meltTimer / maxTimer)))
      : 0.25;

    ctx.save();

    // 1. Viscous melting whipped cream / icing glaze flowing from top edge
    ctx.beginPath();
    ctx.moveTo(pTopLeft.x, pTopLeft.y);
    ctx.lineTo(pTopRight.x, pTopRight.y);

    // Trace wavy scallop drips from right to left across the wall
    for (let i = dripCount - 1; i >= 0; i--) {
      const tStart = i / dripCount;
      const tEnd = (i + 1) / dripCount;
      const tMid = (tStart + tEnd) / 2;

      const p1 = {
        x: pTopLeft.x + (pTopRight.x - pTopLeft.x) * tEnd,
        y: pTopLeft.y + (pTopRight.y - pTopLeft.y) * tEnd
      };
      const p0 = {
        x: pTopLeft.x + (pTopRight.x - pTopLeft.x) * tStart,
        y: pTopLeft.y + (pTopRight.y - pTopLeft.y) * tStart
      };
      const pM = {
        x: pTopLeft.x + (pTopRight.x - pTopLeft.x) * tMid,
        y: pTopLeft.y + (pTopRight.y - pTopLeft.y) * tMid
      };

      const dripLen = Math.min(hPx * 0.95, hPx * (depths[i] + timerProgress * 0.25));
      const bulbY = pM.y + dripLen;
      const bulbR = (3.2 + (i % 2) * 1.6) * currentZoom;

      // Smooth bezier curves down to the bulbous drip
      ctx.quadraticCurveTo(p1.x, p1.y + dripLen * 0.38, pM.x + bulbR * 0.85, bulbY - bulbR * 0.4);
      ctx.arc(pM.x, bulbY, bulbR, 0, Math.PI, false);
      ctx.quadraticCurveTo(p0.x, p0.y + dripLen * 0.38, p0.x, p0.y);
    }

    ctx.closePath();

    // Cream Glaze Fill from flavor
    const glazeCol = flavor ? (isRightWall ? flavor.glazeRight : flavor.glazeLeft) : (isRightWall ? '#fff8e8' : '#ffffff');
    ctx.fillStyle = glazeCol;
    ctx.fill();

    // 2. Melting Droplets detached below deep drips
    for (let i = 0; i < dripCount; i++) {
      if (depths[i] >= 0.65 || timerProgress > 0.35) {
        const tMid = (i + 0.5) / dripCount;
        const pM = {
          x: pTopLeft.x + (pTopRight.x - pTopLeft.x) * tMid,
          y: pTopLeft.y + (pTopRight.y - pTopLeft.y) * tMid
        };
        const dripLen = Math.min(hPx * 0.95, hPx * (depths[i] + timerProgress * 0.25));
        const dropY = pM.y + dripLen + (6.0 + timerProgress * 4.5) * currentZoom;
        const dropR = (1.9 + timerProgress * 0.8) * currentZoom;

        ctx.fillStyle = glazeCol;
        ctx.beginPath();
        ctx.arc(pM.x, dropY, dropR, 0, Math.PI * 2);
        ctx.fill();

        // Droplet specular shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(pM.x - dropR * 0.3, dropY - dropR * 0.3, dropR * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Glossy Specular Highlights along the drip crests
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.2 * currentZoom;
    ctx.lineCap = 'round';
    for (let i = 0; i < dripCount; i++) {
      const tMid = (i + 0.5) / dripCount;
      const pM = {
        x: pTopLeft.x + (pTopRight.x - pTopLeft.x) * tMid,
        y: pTopLeft.y + (pTopRight.y - pTopLeft.y) * tMid
      };
      const dripLen = Math.min(hPx * 0.95, hPx * (depths[i] + timerProgress * 0.25));
      const bulbY = pM.y + dripLen;
      const bulbR = (3.2 + (i % 2) * 1.6) * currentZoom;

      ctx.beginPath();
      ctx.arc(pM.x, bulbY, bulbR * 0.65, Math.PI * 0.85, Math.PI * 1.45);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw custom flavor toppings on top diamond face
  function drawIceCreamTopTopping(x, y, z, w, d, camY, toppingType) {
    if (w < 1.8 || d < 1.8) return;
    ctx.save();
    const type = toppingType || 'rainbow';

    if (type === 'chocochip') {
      // Dark chocolate morsels with glossy highlights
      const chips = [
        { u: -0.25, v: -0.22, r: 2.2 },
        { u:  0.22, v: -0.20, r: 2.6 },
        { u: -0.16, v:  0.22, r: 2.4 },
        { u:  0.24, v:  0.18, r: 2.0 },
        { u:  0.02, v: -0.26, r: 2.5 },
        { u: -0.26, v:  0.06, r: 2.1 },
        { u:  0.26, v: -0.04, r: 2.3 },
        { u:  0.05, v:  0.26, r: 2.7 },
        { u: -0.08, v: -0.06, r: 2.2 },
        { u:  0.12, v:  0.08, r: 2.4 }
      ];
      for (let ch of chips) {
        if (Math.abs(ch.u) * w > (w * 0.42) || Math.abs(ch.v) * d > (d * 0.42)) continue;
        const pt = project3D(x + ch.u * w, y, z + ch.v * d, camY);
        const rad = ch.r * currentZoom;
        ctx.fillStyle = '#2a160c';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(pt.x - rad * 0.35, pt.y - rad * 0.35, rad * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'caramel') {
      // Golden caramel glaze drops & sugar pearls
      const pearls = [
        { u: -0.22, v: -0.20, color: '#ffb300', r: 2.5 },
        { u:  0.24, v: -0.24, color: '#fff9c4', r: 2.0 },
        { u: -0.18, v:  0.20, color: '#ff9800', r: 2.8 },
        { u:  0.22, v:  0.22, color: '#ffe082', r: 2.2 },
        { u:  0.00, v: -0.24, color: '#ffb300', r: 2.4 },
        { u: -0.24, v:  0.04, color: '#fff9c4', r: 2.1 },
        { u:  0.25, v: -0.02, color: '#ff9800', r: 2.6 },
        { u:  0.04, v:  0.24, color: '#ffe082', r: 2.3 },
        { u: -0.10, v: -0.05, color: '#ffb300', r: 2.2 },
        { u:  0.14, v:  0.06, color: '#ffffff', r: 1.8 }
      ];
      for (let p of pearls) {
        if (Math.abs(p.u) * w > (w * 0.42) || Math.abs(p.v) * d > (d * 0.42)) continue;
        const pt = project3D(x + p.u * w, y, z + p.v * d, camY);
        const rad = p.r * currentZoom;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(pt.x - rad * 0.3, pt.y - rad * 0.3, rad * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'berrypearls') {
      // Sweet blueberry & taro candy pearls
      const berries = [
        { u: -0.24, v: -0.22, color: '#4a148c', r: 2.6 },
        { u:  0.22, v: -0.24, color: '#7b1fa2', r: 2.3 },
        { u: -0.16, v:  0.22, color: '#ab47bc', r: 2.5 },
        { u:  0.25, v:  0.18, color: '#4a148c', r: 2.2 },
        { u:  0.02, v: -0.25, color: '#e1bee7', r: 1.9 },
        { u: -0.26, v:  0.05, color: '#7b1fa2', r: 2.4 },
        { u:  0.24, v: -0.04, color: '#ab47bc', r: 2.3 },
        { u:  0.05, v:  0.25, color: '#4a148c', r: 2.7 },
        { u: -0.09, v: -0.07, color: '#e1bee7', r: 2.0 },
        { u:  0.13, v:  0.07, color: '#7b1fa2', r: 2.4 }
      ];
      for (let b of berries) {
        if (Math.abs(b.u) * w > (w * 0.42) || Math.abs(b.v) * d > (d * 0.42)) continue;
        const pt = project3D(x + b.u * w, y, z + b.v * d, camY);
        const rad = b.r * currentZoom;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(pt.x - rad * 0.35, pt.y - rad * 0.35, rad * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'cocoanibs') {
      // Crunchy dark cocoa nibs and golden sugar crumbs
      const nibs = [
        { u: -0.24, v: -0.20, color: '#3e2723', rot: 0.4 },
        { u:  0.22, v: -0.24, color: '#ffd54f', rot: -0.3 },
        { u: -0.18, v:  0.22, color: '#4e342e', rot: 0.6 },
        { u:  0.25, v:  0.20, color: '#d7ccc8', rot: -0.5 },
        { u:  0.00, v: -0.26, color: '#3e2723', rot: 0.2 },
        { u: -0.26, v:  0.04, color: '#ffd54f', rot: -0.7 },
        { u:  0.24, v: -0.04, color: '#4e342e', rot: 0.5 },
        { u:  0.04, v:  0.25, color: '#d7ccc8', rot: -0.4 },
        { u: -0.08, v: -0.06, color: '#3e2723', rot: 0.8 },
        { u:  0.14, v:  0.06, color: '#ffd54f', rot: -0.2 }
      ];
      for (let nb of nibs) {
        if (Math.abs(nb.u) * w > (w * 0.42) || Math.abs(nb.v) * d > (d * 0.42)) continue;
        const pt = project3D(x + nb.u * w, y, z + nb.v * d, camY);
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(nb.rot);
        ctx.fillStyle = nb.color;
        const nw = 3.8 * currentZoom;
        const nh = 2.4 * currentZoom;
        ctx.fillRect(-nw / 2, -nh / 2, nw, nh);
        ctx.restore();
      }
    } else {
      // Rainbow sprinkles
      for (let sp of ICE_CREAM_SPRINKLES) {
        if (Math.abs(sp.u) * w > (w * 0.42) || Math.abs(sp.v) * d > (d * 0.42)) continue;
        const spPt = project3D(x + sp.u * w, y, z + sp.v * d, camY);
        ctx.save();
        ctx.translate(spPt.x, spPt.y);
        ctx.rotate(sp.rot);
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        const sw = 4.8 * currentZoom;
        const sh = 2.2 * currentZoom;
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(-sw / 2, -sh / 2, sw, sh, 1.1 * currentZoom);
        } else {
          ctx.rect(-sw / 2, -sh / 2, sw, sh);
        }
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(-sw / 2 + 0.6, -sh / 2 + 0.3, sw * 0.35, sh * 0.35);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // Draw authentic 3D Isometric Tower Block
  function drawIsometricBlock(x, z, y, w, d, color, camY, isBaseFoundation = false, opts = {}) {
    const blockType = opts.blockType || (opts.isIce ? 'ice' : (opts.isScratcher ? 'scratcher' : (opts.isMelting ? 'melting' : (opts.isAnvil ? 'anvil' : 'normal'))));
    const isStageMelting = !!(cfg && cfg.melting);
    const isMeltingBlock = (blockType === 'melting');
    const isWaffleConeBlock = (isStageMelting && !isMeltingBlock && !isBaseFoundation);
    const isGelatoBlock = (isMeltingBlock && !isBaseFoundation);

    // Continuous dynamic melting deformation for melting gelato blocks on the tower
    let renderY = y;
    let renderW = w;
    let renderD = d;
    let shiverX = 0;

    if (isGelatoBlock && opts.meltTimer && opts.meltTimer > 0) {
      const maxTimer = opts.maxMeltTimer || 2.8;
      const meltRatio = Math.max(0, Math.min(1.0, 1.0 - (opts.meltTimer / maxTimer)));

      // 1. Vertical sinking: Top surface visibly deflates and sinks downward
      renderY = y - (meltRatio * 0.38);

      // 2. Lateral spreading: Melted ice cream puddles slightly outward
      renderW = w * (1.0 + meltRatio * 0.08);
      renderD = d * (1.0 + meltRatio * 0.08);

      // 3. Urgent liquid shiver during the final 0.9s before melting completely
      if (opts.meltTimer < 0.9) {
        shiverX = Math.sin(performance.now() * 0.035) * ((0.9 - opts.meltTimer) / 0.9) * 2.2 * currentZoom;
      }
    }

    const halfW = renderW / 2;
    const halfD = renderD / 2;
    const hPx = (isBaseFoundation ? 300 : BLOCK_HEIGHT_PX) * currentZoom;

    // 4 top corner vertices
    const topBack = project3D(x - halfW, renderY, z - halfD, camY);
    const topLeft = project3D(x - halfW, renderY, z + halfD, camY);
    const topFront = project3D(x + halfW, renderY, z + halfD, camY);
    const topRight = project3D(x + halfW, renderY, z - halfD, camY);

    if (shiverX !== 0) {
      topBack.x += shiverX;
      topLeft.x += shiverX;
      topFront.x += shiverX;
      topRight.x += shiverX;
    }

    if (topFront.y < -150 || topBack.y > viewH + 250) return;

    // Custom Face Colors for special block types
    let colLeft = color.left;
    let colRight = color.right;
    let colTop = color.top;

    let currentGelatoFlavor = null;

    if (blockType === 'ice') {
      colLeft = 'hsl(198, 85%, 65%)';
      colRight = 'hsl(198, 80%, 54%)';
      colTop = 'hsl(195, 95%, 82%)';
    } else if (blockType === 'scratcher') {
      colLeft = 'hsl(34, 48%, 52%)';
      colRight = 'hsl(34, 44%, 42%)';
      colTop = 'hsl(36, 56%, 66%)';
    } else if (isWaffleConeBlock) {
      // Golden baked crispy waffle cone (firm, rock-solid, zero melting)
      colLeft = 'hsl(32, 68%, 56%)';
      colRight = 'hsl(30, 64%, 46%)';
      colTop = 'hsl(36, 82%, 72%)';
    } else if (isGelatoBlock) {
      // 5-flavor procedural gelato scoop
      const fIdx = Math.abs(Math.floor(y)) % GELATO_FLAVORS.length;
      currentGelatoFlavor = GELATO_FLAVORS[fIdx];
      colLeft = currentGelatoFlavor.colLeft;
      colRight = currentGelatoFlavor.colRight;
      colTop = currentGelatoFlavor.colTop;
    } else if (blockType === 'anvil') {
      colLeft = 'hsl(220, 20%, 42%)';
      colRight = 'hsl(220, 20%, 32%)';
      colTop = 'hsl(220, 22%, 58%)';
    } else if (isBaseFoundation && isStageMelting) {
      // Giant dessert waffle tray foundation
      colLeft = '#7a421b';
      colRight = '#5b2f11';
      colTop = '#b97a45';
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
    } else if (isWaffleConeBlock) {
      // 1. Crosshatch baked wafer lines & chocolate ganache rim on walls
      drawWaffleConeWall(topLeft, topFront, hPx, false);
      drawWaffleConeWall(topFront, topRight, hPx, true);

      // 2. Subtle top diamond wafer grid
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(topBack.x, topBack.y);
      ctx.lineTo(topLeft.x, topLeft.y);
      ctx.lineTo(topFront.x, topFront.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = 'rgba(110, 52, 12, 0.16)';
      ctx.lineWidth = 1.0 * currentZoom;
      for (let s = -0.38; s <= 0.38; s += 0.15) {
        const pA = project3D(x - halfW * 0.85, renderY, z + halfD * s * 2, camY);
        const pB = project3D(x + halfW * 0.85, renderY, z + halfD * s * 2, camY);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Crisp wafer bevel highlight
      ctx.strokeStyle = 'rgba(255, 235, 180, 0.85)';
      ctx.lineWidth = 1.3 * currentZoom;
      ctx.stroke();
    } else if (isGelatoBlock) {
      // 1. Procedural melting gelato glaze dripping down both front walls
      drawIceCreamWallDrips(topLeft, topFront, hPx, false, opts, y, currentGelatoFlavor);
      drawIceCreamWallDrips(topFront, topRight, hPx, true, opts, y, currentGelatoFlavor);

      // 2. Custom flavor toppings (sprinkles, chocochips, caramel, berry pearls, cocoa nibs)
      drawIceCreamTopTopping(x, renderY, z, renderW, renderD, camY, currentGelatoFlavor.topping);

      // 3. Delicate top frosty cream bevel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.lineWidth = 1.2 * currentZoom;
      ctx.stroke();
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
      const centerPt = project3D(x, renderY, z, camY);
      if (shiverX !== 0) centerPt.x += shiverX;
      const pawScale = Math.min(renderW, renderD) / 7.5 * 1.1 * currentZoom;
      if (isWaffleConeBlock) {
        // Cocoa powder cat paw stamp on waffle cone
        drawCatPaw(centerPt.x, centerPt.y, pawScale, 0.55, ctx, 'rgba(85, 38, 12, 0.48)');
      } else if (isGelatoBlock) {
        // Soft creamy marshmallow imprint
        drawCatPaw(centerPt.x, centerPt.y, pawScale, 0.62);
      } else {
        drawCatPaw(centerPt.x, centerPt.y, pawScale, blockType === 'ice' ? 0.55 : 0.42);
      }
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

  // --- FOGGY VILLAGE DYNAMIC ROLLING VOLUMETRIC MISTS & SCREEN OBSTRUCTION (안개 낀 마을) ---

  // Helper to draw an organic, elliptical, non-circular billowing cloud puff
  function drawBillowPuff(targetCtx, cx, cy, rx, ry, rot, alpha, colCenter = '245, 248, 255', colEdge = '218, 226, 252') {
    if (alpha <= 0.01 || rx <= 2 || ry <= 2) return;
    targetCtx.save();
    targetCtx.translate(cx, cy);
    if (rot !== 0) targetCtx.rotate(rot);

    // Elliptical gradient scaling
    const grad = targetCtx.createRadialGradient(0, 0, rx * 0.15, 0, 0, rx);
    grad.addColorStop(0.0, `rgba(${colCenter}, ${Math.min(1.0, alpha * 0.98)})`);
    grad.addColorStop(0.38, `rgba(${colCenter}, ${Math.min(1.0, alpha * 0.90)})`);
    grad.addColorStop(0.72, `rgba(${colEdge}, ${alpha * 0.52})`);
    grad.addColorStop(1.0, `rgba(${colEdge}, 0)`);

    targetCtx.fillStyle = grad;
    targetCtx.beginPath();
    targetCtx.scale(1.0, ry / rx);
    targetCtx.arc(0, 0, rx, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();
  }

  // Pre-configured multi-lobed organic cloud bank structure
  // Wide horizontal coverage to engulf both the top block AND the swinging block approach!
  const FOG_BANK_LOBES = [
    // 1. Core Heavy Cloud Mass (covers tower top with massive density)
    { dx: -70, dy: -15, rx: 260, ry: 135, rot: -0.08, phase: 0.0,  alphaMult: 1.00 },
    { dx:  65, dy:  12, rx: 280, ry: 145, rot:  0.07, phase: 1.4,  alphaMult: 1.00 },
    { dx:   0, dy: -38, rx: 240, ry: 125, rot: -0.05, phase: 2.7,  alphaMult: 0.98 },
    { dx: -15, dy:  32, rx: 270, ry: 140, rot:  0.06, phase: 4.1,  alphaMult: 0.98 },

    // 2. Lateral Wing Lobes (covers incoming and outgoing swinging block lanes)
    { dx: -240, dy: -12, rx: 240, ry: 120, rot: -0.12, phase: 0.8, alphaMult: 0.92 },
    { dx:  240, dy:   8, rx: 250, ry: 125, rot:  0.10, phase: 3.2, alphaMult: 0.92 },
    { dx: -400, dy: -28, rx: 220, ry: 105, rot: -0.06, phase: 5.0, alphaMult: 0.86 },
    { dx:  400, dy:  22, rx: 230, ry: 110, rot:  0.08, phase: 2.1, alphaMult: 0.86 },

    // 3. High/Low Strata Billows (adds height variation and turbulent cloud ceiling)
    { dx: -120, dy: -80, rx: 220, ry: 100, rot:  0.05, phase: 3.7, alphaMult: 0.88 },
    { dx:  130, dy: -75, rx: 230, ry: 105, rot: -0.08, phase: 1.9, alphaMult: 0.88 },
    { dx:  -40, dy:  75, rx: 250, ry: 115, rot: -0.04, phase: 4.5, alphaMult: 0.90 }
  ];

  // Drifting horizontal mist ribbons
  const FOG_MIST_RIBBONS = [
    { yOffset: -55, speed: 28,  rx: 480, ry: 65, phase: 0.5 },
    { yOffset:  15, speed: -22, rx: 540, ry: 75, phase: 2.3 },
    { yOffset:  70, speed: 35,  rx: 460, ry: 58, phase: 4.1 }
  ];

  function drawFogLayer(time, dt) {
    if (!cfg || !cfg.fog) return;

    const fogClearMult = (cfg.fogClear) ? (1 - cfg.fogClear) : 1.0;
    const tSec = time / 1000;

    // --- 1. LEVEL & STAGE SCALING FACTOR (0.0: early stages, 1.0: high difficulty) ---
    const stageIdx = (typeof cfg.idx === 'number') ? cfg.idx : Math.min(9, Math.floor(score / 5));
    const stageCount = (typeof cfg.count === 'number' && cfg.count > 1) ? cfg.count : 10;
    const worldIdx = (typeof cfg.world === 'number') ? cfg.world : 5;

    // Stage progress within current world (0.0 at stage 1 -> 1.0 at final/boss stage)
    const stageProg = Math.max(0, Math.min(1.0, stageIdx / Math.max(1, stageCount - 1)));
    // Bonus scaling for deeper worlds (World 5 Foggy Village -> World 11 -> World 17 -> World 22)
    const worldBonus = Math.min(0.25, Math.max(0, (worldIdx - 5) * 0.03));
    const levelFactor = Math.min(1.0, stageProg * 0.85 + worldBonus);

    // --- 2. DYNAMIC ROLLING CYCLE: DENSE SOUP VS BRIEF CLEAR GLIMPSE WINDOW ---
    const cyclePeriod = 7.5; // seconds per rolling wave
    const cycleT = (tSec % cyclePeriod) / cyclePeriod; // 0.0 to 1.0

    // Dense duty cycle: early stages are dense ~46% of time (~3.5s), high stages ~78% of time (~5.8s!)
    const denseRatio = 0.46 + levelFactor * 0.32;
    const fadeLen = 0.10; // ~0.75s smooth transition between dense and clear

    let densityK = 0.0;
    if (cycleT < denseRatio - fadeLen) {
      // Sustained thick dense fog phase
      densityK = 1.0;
    } else if (cycleT < denseRatio) {
      // Smooth fade-out to clearer window
      const p = (cycleT - (denseRatio - fadeLen)) / fadeLen;
      densityK = 0.5 + 0.5 * Math.cos(p * Math.PI);
    } else if (cycleT < 1.0 - fadeLen) {
      // Clearer observation window
      densityK = 0.0;
    } else {
      // Smooth fade-in back to dense fog
      const p = (cycleT - (1.0 - fadeLen)) / fadeLen;
      densityK = 0.5 - 0.5 * Math.cos(p * Math.PI);
    }

    // Min & Max opacity scaling with level
    // In low levels: min ~0.18, max ~0.94
    // In high levels: min ~0.36, max ~0.99 (truly thick white soup that completely hides the tower!)
    const minAlpha = 0.18 + levelFactor * 0.18;
    const maxAlpha = 0.94 + levelFactor * 0.05;

    // Atmospheric micro-pulsing
    const organicBreath = 0.03 * Math.sin(tSec * 2.1) + 0.02 * Math.cos(tSec * 1.3);
    const targetAlpha = Math.min(1.0, minAlpha + (maxAlpha - minAlpha) * densityK + organicBreath);
    const focalAlpha = Math.max(0.05, Math.min(1.0, targetAlpha * fogClearMult));

    ctx.save();

    // --- 3. ANCHOR POINT: LANDING ZONE AT TOWER TOP ---
    const topBlock = (tower && tower.length > 0) ? tower[tower.length - 1] : { x: 0, y: 0, z: 0, w: 7.5, d: 7.5 };
    const landingY = topBlock.y + 0.5;
    const focalPt = project3D(topBlock.x, landingY, topBlock.z, cameraY);

    // --- 4. DYNAMIC NON-FIXED WANDERING DRIFT ACROSS THE SCREEN ---
    // The fog bank continuously shifts and rolls over the area, never stationary!
    const zoomScale = currentZoom;
    const windDriftX = Math.sin(tSec * 0.32) * 170 * zoomScale + Math.cos(tSec * 0.68) * 85 * zoomScale;
    const windDriftY = Math.sin(tSec * 0.48) * 32 * zoomScale - 10 * zoomScale;
    const bankCenterX = focalPt.x + windDriftX;
    const bankCenterY = focalPt.y + windDriftY;

    // --- 5. MOCHA LANTERN SCOUT SYNERGY (Warm golden glow cutting a clearing through the mist) ---
    if (cfg.fogClear && cfg.fogClear > 0) {
      const lanternR = 145 * zoomScale;
      const lGrad = ctx.createRadialGradient(focalPt.x, focalPt.y, 8, focalPt.x, focalPt.y, lanternR);
      lGrad.addColorStop(0.0, 'rgba(255, 238, 160, 0.60)');
      lGrad.addColorStop(0.35, 'rgba(255, 215, 120, 0.32)');
      lGrad.addColorStop(1.0, 'rgba(255, 190, 80, 0)');
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.arc(focalPt.x, focalPt.y, lanternR, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 6. LAYER A: DRIFTING HORIZONTAL STRATUS MIST RIBBONS ---
    for (let rib of FOG_MIST_RIBBONS) {
      const ribX = ((tSec * rib.speed * zoomScale + rib.phase * 200) % (viewW + 800)) - 400;
      const ribY = bankCenterY + rib.yOffset * zoomScale + Math.sin(tSec * 1.2 + rib.phase) * 18 * zoomScale;
      drawBillowPuff(ctx, ribX, ribY, rib.rx * zoomScale, rib.ry * zoomScale, 0, focalAlpha * 0.65, '240, 244, 255', '212, 222, 248');
    }

    // --- 7. LAYER B: MAIN ROLLING HEAVY FOG BANK (Massive coverage & opacity) ---
    for (let lobe of FOG_BANK_LOBES) {
      const breathScale = 1.0 + 0.08 * Math.sin(tSec * 2.2 + lobe.phase);
      const lobeX = bankCenterX + (lobe.dx * zoomScale) + Math.sin(tSec * 0.8 + lobe.phase) * 18 * zoomScale;
      const lobeY = bankCenterY + (lobe.dy * zoomScale) + Math.cos(tSec * 0.9 + lobe.phase) * 12 * zoomScale;
      const lobeRx = lobe.rx * zoomScale * breathScale;
      const lobeRy = lobe.ry * zoomScale * breathScale;
      const lobeRot = lobe.rot + 0.03 * Math.sin(tSec * 0.5 + lobe.phase);
      const lobeAlpha = focalAlpha * lobe.alphaMult;

      drawBillowPuff(ctx, lobeX, lobeY, lobeRx, lobeRy, lobeRot, lobeAlpha, '246, 248, 255', '216, 225, 250');
    }

    // --- 8. LAYER C: TURBULENT FOREGROUND VAPOR TENDRILS (Organic frayed edges) ---
    const tendrilCount = 5;
    for (let ti = 0; ti < tendrilCount; ti++) {
      const tPhase = ti * 1.35;
      const tAngle = tSec * (0.45 + (ti % 3) * 0.15) + tPhase;
      const tDist = (180 + (ti * 45)) * zoomScale;
      const tx = bankCenterX + Math.cos(tAngle) * tDist;
      const ty = bankCenterY + Math.sin(tAngle) * tDist * 0.55;
      const trx = (110 + (ti % 3) * 35) * zoomScale * (0.9 + 0.15 * Math.sin(tSec * 2.8 + tPhase));
      const try_ = (55 + (ti % 2) * 20) * zoomScale;
      drawBillowPuff(ctx, tx, ty, trx, try_, tAngle * 0.2, focalAlpha * 0.72, '248, 250, 255', '220, 228, 252');
    }

    ctx.restore();
  }
