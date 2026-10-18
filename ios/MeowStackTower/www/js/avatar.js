// Stack Tower - Cat Avatar & Boss Dynamic SVG Renderers

  // -------------------------------------------------------------
  // ADORABLE FULL-BODY CAT AVATAR RENDERER
  // -------------------------------------------------------------
  function getCatAvatarHtml(id, size = 64, opts = {}) {
    const cat = CAT_COMPANIONS.find(c => c.id === id) || CAT_COMPANIONS[0];
    const imgSrc = cat.image || 'assets/chara_smile.png';
    const filter = cat.filterStyle || 'none';
    const s = size || 64;
    const isMascot = opts.isMascot || false;

    if (isMascot) {
      return `<img id="mascot-img" class="mascot-chara-img" src="${imgSrc}" style="height:100%;width:auto;object-fit:contain;filter:${filter};" alt="${getCompanionField(cat, 'name')}">`;
    }

    return `<div class="cat-fullbody-avatar" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;">
      <img class="cat-avatar-img" src="${imgSrc}" style="width:100%;height:100%;object-fit:contain;filter:${filter};" alt="${getCompanionField(cat, 'name')}">
    </div>`;
  }

  function getCatAvatarSvg(id, size = 64, opts = {}) {
    return getCatAvatarHtml(id, size, opts);
  }

  function buildStageConfig(i) {
    const info = getStageWorldInfo(i);
    const w = info.world;
    const idx = info.idx;
    const count = info.count;
    const def = WORLD_DEFS[w];
    const boss = (idx === count - 1);
    // Spread Bonus stages across the world to maintain engagement and avoid clustering with Boss stages:
    // - 5-stage worlds (W1): Stage 3 (idx 2) is Bonus, Stage 5 (idx 4) is Boss
    // - 7-stage worlds (W2): Stage 4 (idx 3) is Bonus, Stage 7 (idx 6) is Boss
    // - 10-stage worlds (W3+): Midpoint stage 5 (idx 4) or stage 6 (idx 5) is Bonus, Stage 10 (idx 9) is Boss
    const bonusIdx = (count <= 5) ? 2 : (count <= 7 ? 3 : (w % 2 === 0 ? 4 : 5));
    const bonus = (idx === bonusIdx);
    const m = (boss ? 1.2 : 0.5 + 0.5 * (idx / Math.max(1, count - 1))) * 0.75;
    const mods = Object.assign({}, def.mods);

    // Determine Stage Archetype (4-beat rhythm + Bonus + Boss)
    let stageType = 'standard';
    if (boss) {
      stageType = 'boss';
    } else if (bonus) {
      stageType = 'bonus';
    } else if (idx % 4 === 1) {
      stageType = 'speed';
    } else if (idx % 4 === 2) {
      stageType = 'precision';
    } else if (idx % 4 === 3) {
      stageType = 'hazard';
    } else {
      stageType = 'standard';
    }

    let target = 12 + Math.floor(w * 1.5) + Math.floor(idx * 0.4);
    let timeLimit = 0;
    let streakTarget = 0;
    let bossInfo = null;

    if (stageType === 'boss') {
      target = 16 + Math.floor(w * 1.5);
      bossInfo = WORLD_BOSS_NAMES[w] || WORLD_BOSS_NAMES[0];
    } else if (stageType === 'bonus') {
      target = 100; // Goal score for 2 stars in minigame
      timeLimit = 15; // 15 seconds
    } else if (stageType === 'speed') {
      target = 10 + Math.floor(w * 1.2) + Math.floor(idx * 0.3);
      timeLimit = 18 + Math.floor(target * 1.15); // e.g. 29s
    } else if (stageType === 'precision') {
      target = 10 + Math.floor(w * 1.0) + Math.floor(idx * 0.3);
      streakTarget = Math.min(5, 2 + Math.floor(w * 0.25) + (idx >= 6 ? 1 : 0)); // 2 ~ 4 streak
    } else if (stageType === 'hazard') {
      target = 12 + Math.floor(w * 1.2) + Math.floor(idx * 0.35);
      // Activate explicit hazards even in early worlds
      if (w === 0) {
        if (idx === 3) mods.sway = 18;
      } else {
        mods.sway = (mods.sway || 12) * 1.3;
        mods.wobble = (mods.wobble || 0.2) * 1.25;
      }
    }

    // Descriptions & Objectives for Stage Banner
    let typeDesc = '';
    if (stageType === 'boss') {
      typeDesc = `👑 BOSS: ${bossInfo.name} [HP ${target}]\nMeowfect hits deal 2× Critical Damage!`;
    } else if (stageType === 'bonus') {
      typeDesc = `✨ CHURU FEVER: Catch tasty treats raining down!\nScore 100+ points to collect plenty of Churu coins!`;
    } else if (stageType === 'speed') {
      typeDesc = `⏱️ SPEED RUSH: Reach floor ${target} in ${timeLimit}s!\nMeowfect placements grant +2s bonus time!`;
    } else if (stageType === 'precision') {
      typeDesc = `🎯 PRECISION: Reach floor ${target} & ${streakTarget} Streak!\nCarefully align every block!`;
    } else if (stageType === 'hazard') {
      typeDesc = `🌪️ HAZARD: Overcome environmental trials!\n${worldHint(mods)}`;
    } else {
      typeDesc = `🧱 STANDARD: Build your tower calmly and reach floor ${target}!`;
    }

    let baseStartSize = Math.max(5.4, (7.5 - w * 0.08 - (boss ? 0.3 : 0)) * (stageType === 'speed' ? 1.08 : 1.0));
    if (mods.thinFoundation) {
      baseStartSize *= 0.72; // Thin foundation
    }

    let speedMult = (stageType === 'speed' ? 1.12 : 1.0);
    if (mods.speedBoost) speedMult *= mods.speedBoost;
    else if (mods.melting) speedMult *= 1.65; // Fast flying blocks for melting stages

    const meltingRate = mods.melting ? Math.min(0.9, 0.25 + (idx / Math.max(1, count - 1)) * 0.65) : 0;

    return {
      id: i,
      world: w,
      idx: idx,
      count: count,
      stageType: stageType,
      boss: boss,
      bonus: bonus,
      bossInfo: bossInfo,
      label: `${w + 1}-${idx + 1}`,
      worldName: def.name,
      emoji: def.emoji,
      hueBase: def.hue,
      desc: typeDesc,
      target: target,
      timeLimit: timeLimit,
      streakTarget: streakTarget,
      speed0: (5.8 + w * 0.08 + idx * 0.05) * speedMult,
      accel: 0.010 + w * 0.0003,
      maxSpeed: (8.5 + w * 0.06 + (boss ? 0.4 : 0)) * speedMult,
      tol: Math.max(0.20, (0.34 - w * 0.006) * (stageType === 'precision' ? 0.88 : 1.0)),
      startSize: baseStartSize,
      expandAt: w < 8 ? 2 : (w < 18 ? 3 : 4),
      expandAmt: 0.6,
      wobble: (mods.wobble || 0) * m,
      sway: (mods.sway || 0) * m,
      blink: (mods.blink || 0) * m,
      reverse: (mods.reverse || 0) * m,
      shrink: (mods.shrink || 0) * m,
      // New Gimmick Flags
      ice: !!mods.ice,
      scratcher: !!mods.scratcher,
      fog: !!mods.fog,
      melting: !!mods.melting,
      meltingRate: meltingRate,
      thinFoundation: !!mods.thinFoundation,
      tilt: !!(mods.tilt || mods.thinFoundation),
      anvil: !!mods.anvil,
      perfectionist: !!mods.perfectionist,
      shrinkRush: !!mods.shrinkRush
    };
  }

  // Cat cheer assist
  const MAX_ASSIST = 8;
  function applyAssist(c, level) {
    const a = Math.max(0, Math.min(MAX_ASSIST, level));
    if (a === 0) return c;
    c.assist = a;
    c.tol *= 1 + 0.12 * a;
    c.speed0 *= 1 - 0.035 * a;
    c.maxSpeed *= 1 - 0.035 * a;
    c.expandAmt *= 1 + 0.08 * a;
    c.wobble *= 1 - 0.06 * a;
    c.reverse *= 1 - 0.06 * a;
    c.sway *= 1 - 0.06 * a;
    c.shrink *= 1 - 0.06 * a;
    return c;
  }

  function applyCompanionPerks(c) {
    const comp = getSelectedCat();
    if (!comp) return c;

    // Role-based baseline perks
    if (comp.roleWorld === 1 && c.stageType === 'speed') {
      c.timeLimit += 3;
    }
    if (comp.roleWorld === 2) {
      c.tol *= 1.10;
    }
    if (comp.roleWorld === 3) {
      c.sway *= 0.75;
      c.wobble *= 0.75;
    }
    if (comp.roleWorld === 4) {
      c.expandAt = 2; // Rapid expansion: expands at 2 combos instead of 3~4!
      c.expandAmt = 0.8; // Generous expansion width (+33% boost)
    }

    // Specific Companion Counter-Perks & Active Skill
    if (comp.id === 'vanilla') {
      c.meltTimerBonus = 3.0; // Ice cream melts +3s slower
    }
    if (comp.id === 'mocha') {
      c.fogClear = 0.60; // Clears 60% of village fog
      if (c.stageType === 'speed') c.timeLimit += 3;
    }
    if (comp.id === 'cheddar') {
      c.iceDampen = 0.50; // Dampens ice slip & sway by 50%
      c.sway *= 0.75;
    }
    if (comp.id === 'simba') {
      c.cardboardDampen = 0.50; // Smooths cardboard stick-slip friction by 50%
      c.wobble *= 0.75;
    }
    if (comp.id === 'toram') {
      c.tiltDampen = 0.60; // Dampens tower tilt skew by 60%
    }
    if (comp.id === 'luna') {
      c.hasActiveSkill = true; // Magnetic snap active skill
      c.expandAt = 2;
      c.expandAmt = 0.8;
    }
    return c;
  }
  // @@CAMPAIGN_END


function getBossSvgModular(type, p) {
const fur1 = p.fur1 || '#ffa726';
const fur2 = p.fur2 || '#fb8c00';
const fur3 = p.fur3 || '#f57c00';
const belly1 = p.belly1 || '#fffde7';
const belly2 = p.belly2 || '#fff9c4';

let customDefs = '';
let throneSvg = '';
let tailSvg = '';
let bodyOutfitSvg = '';
let headExtrasSvg = '';
let hatSvg = '';
let facesSvg = '';

// 1. CHONK
if (type === 'chonk') {
customDefs = `
  <linearGradient id="bCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffe082"/><stop offset="100%" stop-color="#ffb300"/></linearGradient>
  <linearGradient id="bCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f3e5f5"/><stop offset="100%" stop-color="#ce93d8"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <ellipse cx="80" cy="140" rx="56" ry="15" fill="url(#bCloudGrad)" filter="url(#bossShadow)"/>
    <ellipse cx="44" cy="136" rx="22" ry="12" fill="#ede7f6"/><ellipse cx="116" cy="136" rx="22" ry="12" fill="#ede7f6"/>
    <ellipse cx="80" cy="135" rx="36" ry="12" fill="#fff" opacity="0.9"/>
    <text x="36" y="142" font-size="10" fill="#ffd54f">★</text><text x="114" y="142" font-size="10" fill="#ffd54f">★</text>
  </g>
  <g id="boss-cape">
    <path d="M 40 78 C 22 95, 18 128, 32 135 C 44 126, 42 105, 48 88 Z" fill="#c62828" stroke="#8e0000" stroke-width="1.5"/>
    <path d="M 120 78 C 138 95, 142 128, 128 135 C 116 126, 118 105, 112 88 Z" fill="#c62828" stroke="#8e0000" stroke-width="1.5"/>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 112, 158 92, 150 74 C 144 62, 134 68, 138 80 C 142 90, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#e65100" stroke-width="1.5"/>
  <path d="M 144 76 Q 148 80 146 84" stroke="#bf360c" stroke-width="3" stroke-linecap="round"/>`;
bodyOutfitSvg = `
  <ellipse cx="80" cy="106" rx="34" ry="28" fill="url(#bossBellyGrad)"/>
  <g transform="translate(71, 74) scale(0.9)">
    <path d="M 2 8 C 6 4, 14 4, 18 8 C 14 12, 6 12, 2 8 Z M 18 8 L 22 4 L 22 12 Z" fill="#ffd700" stroke="#ff8f00" stroke-width="1.2"/>
    <circle cx="6" cy="7.5" r="1" fill="#3e2723"/>
  </g>`;
headExtrasSvg = `
  <path d="M 72 32 L 80 44 L 88 32 M 76 28 L 80 36 L 84 28" fill="none" stroke="#d84315" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="56" cy="68" rx="6" ry="3.5" fill="#ff8a80" opacity="0.6"/><ellipse cx="104" cy="68" rx="6" ry="3.5" fill="#ff8a80" opacity="0.6"/>`;
hatSvg = `<g id="boss-crown">
  <path d="M 64 26 L 68 10 L 75 20 L 80 6 L 85 20 L 92 10 L 96 26 Z" fill="url(#bCrownGrad)" stroke="#ff8f00" stroke-width="1.8"/>
  <circle cx="80" cy="16" r="3.2" fill="#e53935"/><circle cx="70" cy="18" r="2" fill="#00e676"/><circle cx="90" cy="18" r="2" fill="#00e676"/>
</g>`;
facesSvg = `
  <g id="face-idle">
    <ellipse cx="64" cy="54" rx="6.5" ry="7.5" fill="#ffb300" stroke="#e65100" stroke-width="1"/><ellipse cx="64" cy="54" rx="2.5" ry="6.5" fill="#212121"/><circle cx="62" cy="51" r="2" fill="#fff"/>
    <ellipse cx="96" cy="54" rx="6.5" ry="7.5" fill="#ffb300" stroke="#e65100" stroke-width="1"/><ellipse cx="96" cy="54" rx="2.5" ry="6.5" fill="#212121"/><circle cx="94" cy="51" r="2" fill="#fff"/>
    <path d="M 73 70 Q 77 75 80 71 Q 83 75 87 70" fill="none" stroke="#3e2723" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 58 56 Q 64 47 70 56 M 90 56 Q 96 47 102 56" fill="none" stroke="#3e2723" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M 103 56 C 107 56 109 59 107 63 C 105 66 102 63 103 56 Z" fill="#00e5ff"/>
    <path d="M 71 70 Q 80 85 89 70 Z" fill="#c2185b" stroke="#3e2723" stroke-width="2"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <path d="M 57 50 L 67 55 L 57 60 M 103 50 L 93 55 L 103 60" fill="none" stroke="#b71c1c" stroke-width="3.8" stroke-linecap="round"/>
    <ellipse cx="80" cy="74" rx="8" ry="10" fill="#b71c1c"/><text x="70" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="64" cy="54" rx="7" ry="7" fill="#d50000"/><ellipse cx="64" cy="54" rx="2" ry="7" fill="#ffeb3b"/>
    <ellipse cx="96" cy="54" rx="7" ry="7" fill="#d50000"/><ellipse cx="96" cy="54" rx="2" ry="7" fill="#ffeb3b"/>
    <path d="M 71 70 Q 80 66 89 70" fill="none" stroke="#3e2723" stroke-width="2.5"/><text x="32" y="22" font-size="12">♨️</text>
  </g>
  <g id="face-defeat" style="display:none;">
    <path d="M 64 54 m -6,0 a 6,6 0 1,0 12,0 a 4,4 0 1,0 -8,0 a 2,2 0 1,0 4,0 M 96 54 m -6,0 a 6,6 0 1,0 12,0 a 4,4 0 1,0 -8,0 a 2,2 0 1,0 4,0" fill="none" stroke="#212121" stroke-width="2"/>
    <path d="M 61 60 L 61 88 M 99 60 L 99 88" stroke="#00b0ff" stroke-width="3" stroke-linecap="round"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
    <text x="74" y="10" font-size="15" class="dizzy-star">💫</text>
  </g>
  <g id="face-victory" style="display:none;">
    <text x="56" y="58" font-size="16" fill="#ffd700">★</text><text x="88" y="58" font-size="16" fill="#ffd700">★</text>
    <path d="M 70 69 Q 80 86 90 69 Z" fill="#d81b60" stroke="#3e2723" stroke-width="2"/>
    <g transform="translate(108, 68) scale(1.1)"><text x="0" y="0" font-size="22">🐟</text><text x="14" y="-8" font-size="14">✨</text></g>
  </g>`;
}

// 2. BULLY
else if (type === 'bully') {
customDefs = `
  <linearGradient id="bSkateGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ab47bc"/><stop offset="50%" stop-color="#26a69a"/><stop offset="100%" stop-color="#00e676"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <path d="M 22 136 Q 30 144 80 144 Q 130 144 138 136 L 142 140 Q 130 152 80 152 Q 30 152 18 140 Z" fill="url(#bSkateGrad)" stroke="#00e676" stroke-width="1.5" filter="url(#bossShadow)"/>
    <circle cx="42" cy="151" r="5" fill="#ff9100" stroke="#37474f" stroke-width="1.5"/><circle cx="118" cy="151" r="5" fill="#ff9100" stroke="#37474f" stroke-width="1.5"/>
    <path d="M 12 153 L 32 153 M 128 153 L 148 153" stroke="#ffd700" stroke-width="2" stroke-linecap="round"/>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 112, 158 92, 150 74 C 144 62, 134 68, 138 80 C 142 90, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#4e342e" stroke-width="1.8"/>`;
bodyOutfitSvg = `
  <ellipse cx="80" cy="106" rx="32" ry="26" fill="url(#bossBellyGrad)"/>
  <path d="M 44 82 Q 80 94 116 82" stroke="#212121" stroke-width="7" fill="none" stroke-linecap="round"/>
  <polygon points="52,80 48,72 56,74" fill="#e0e0e0"/><polygon points="66,85 64,77 72,79" fill="#e0e0e0"/><polygon points="80,87 80,78 86,81" fill="#fff"/><polygon points="94,85 96,77 88,79" fill="#e0e0e0"/><polygon points="108,80 112,72 104,74" fill="#e0e0e0"/>`;
headExtrasSvg = `
  <polygon points="118,46 114,30 110,34 112,16 94,38" fill="${fur2}" stroke="#4e342e" stroke-width="2"/>
  <g transform="translate(42, 60)">
    <rect x="-2" y="5" width="16" height="5" rx="1.5" fill="#ffe0b2" stroke="#bcaaa4" stroke-width="1" transform="rotate(45 6 7.5)"/>
    <rect x="-2" y="5" width="16" height="5" rx="1.5" fill="#ffe0b2" stroke="#bcaaa4" stroke-width="1" transform="rotate(-45 6 7.5)"/>
  </g>`;
facesSvg = `
  <g id="face-idle">
    <polygon points="56,50 68,54 60,58" fill="#212121"/><polygon points="104,50 92,54 100,58" fill="#212121"/>
    <path d="M 54 46 L 70 51 M 106 46 L 90 51" stroke="#d84315" stroke-width="3" stroke-linecap="round"/>
    <line x1="74" y1="72" x2="54" y2="78" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="58" y1="74" x2="56" y2="80" stroke="#fff" stroke-width="1.5"/>
    <path d="M 74 72 Q 80 75 86 71" fill="none" stroke="#212121" stroke-width="2.5"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 56 54 L 68 50 M 92 50 L 104 54" stroke="#212121" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M 71 70 Q 82 66 90 74 Z" fill="#b71c1c" stroke="#212121" stroke-width="2"/><polygon points="76,69 78,74 80,69" fill="#ffd700"/>
    <line x1="72" y1="70" x2="50" y2="62" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <ellipse cx="62" cy="53" rx="7" ry="9" fill="#fff" stroke="#b71c1c" stroke-width="2"/><ellipse cx="98" cy="53" rx="7" ry="9" fill="#fff" stroke="#b71c1c" stroke-width="2"/>
    <ellipse cx="80" cy="74" rx="8" ry="9" fill="#b71c1c"/><text x="68" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="63" cy="53" rx="7" ry="7" fill="#d50000"/><ellipse cx="97" cy="53" rx="7" ry="7" fill="#d50000"/>
    <path d="M 72 70 Q 80 66 88 70" fill="none" stroke="#212121" stroke-width="2.5"/><polygon points="74,70 76,78 78,70" fill="#fff"/><polygon points="82,70 84,78 86,70" fill="#fff"/>
    <text x="73" y="34" font-size="14">💢</text>
  </g>
  <g id="face-defeat" style="display:none;">
    <circle cx="63" cy="54" r="8" fill="#7e57c2" opacity="0.4"/>
    <path d="M 60 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0 a 1.5,1.5 0 1,0 3,0 M 97 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0 a 1.5,1.5 0 1,0 3,0" fill="none" stroke="#212121" stroke-width="2"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
    <text x="74" y="10" font-size="15" class="dizzy-star">💫</text>
  </g>
  <g id="face-victory" style="display:none;">
    <path d="M 56 52 Q 63 45 70 52 M 90 52 Q 97 45 104 52" fill="none" stroke="#212121" stroke-width="3"/>
    <path d="M 70 68 Q 80 84 90 68 Z" fill="#c2185b" stroke="#212121" stroke-width="2"/><polygon points="76,68 79,74 82,68" fill="#ffd700"/>
    <text x="108" y="70" font-size="18">✌️</text><text x="32" y="70" font-size="16">✨</text>
  </g>`;
}

// 3. HOBO
else if (type === 'hobo') {
customDefs = `
  <linearGradient id="bBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#d7ccc8"/><stop offset="100%" stop-color="#8d6e63"/></linearGradient>
  <linearGradient id="bTapeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ffe082"/><stop offset="100%" stop-color="#ffd54f"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <rect x="22" y="125" width="116" height="28" rx="4" fill="url(#bBoxGrad)" stroke="#5d4037" stroke-width="2" filter="url(#bossShadow)"/>
    <rect x="70" y="125" width="20" height="28" fill="url(#bTapeGrad)" opacity="0.85"/>
    <text x="30" y="143" font-size="8" fill="#d32f2f" font-weight="900">FRAGILE</text><text x="96" y="143" font-size="8" fill="#1565c0" font-weight="900">PARCEL 📦</text>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 114, 156 94, 148 76 C 142 66, 134 70, 138 82 C 140 92, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#455a64" stroke-width="1.8"/>`;
bodyOutfitSvg = `
  <rect x="46" y="90" width="68" height="26" rx="3" fill="url(#bBoxGrad)" stroke="#6d4c41" stroke-width="1.5"/>
  <rect x="68" y="95" width="14" height="12" fill="#80cbc4" stroke="#004d40" stroke-dasharray="2,2"/>
  <circle cx="50" cy="108" r="7" fill="#cfd8dc" stroke="#78909c" stroke-width="1.2"/>`;
headExtrasSvg = `
  <ellipse cx="42" cy="65" rx="7" ry="5" fill="#5d4037" opacity="0.35"/><ellipse cx="118" cy="65" rx="7" ry="5" fill="#5d4037" opacity="0.35"/>`;
hatSvg = `<g transform="translate(62, 10) rotate(-8 18 10)">
  <rect x="0" y="4" width="36" height="18" rx="3" fill="#cfd8dc" stroke="#607d8b" stroke-width="1.5"/>
  <ellipse cx="18" cy="4" rx="18" ry="4" fill="#eceff1"/>
  <path d="M 10 8 Q 16 14 24 8" stroke="#78909c" stroke-width="2" fill="none"/>
  <circle cx="28" cy="2" r="3" fill="none" stroke="#90a4ae" stroke-width="1.5"/>
</g>`;
facesSvg = `
  <g id="face-idle">
    <ellipse cx="64" cy="54" rx="7" ry="8" fill="#263238"/><circle cx="62" cy="51" r="3" fill="#fff"/><circle cx="66" cy="56" r="1.5" fill="#fff"/>
    <ellipse cx="96" cy="54" rx="7" ry="8" fill="#263238"/><circle cx="94" cy="51" r="3" fill="#fff"/><circle cx="98" cy="56" r="1.5" fill="#fff"/>
    <path d="M 73 72 Q 77 76 80 72 Q 83 76 87 72" fill="none" stroke="#37474f" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 58 54 Q 64 48 70 54 M 90 54 Q 96 48 102 54" stroke="#263238" stroke-width="3" stroke-linecap="round"/>
    <path d="M 72 70 Q 80 82 88 70 Z" fill="#b0bec5" stroke="#37474f" stroke-width="2"/><ellipse cx="80" cy="76" rx="4" ry="3" fill="#ff4081"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <ellipse cx="64" cy="54" rx="6" ry="8" fill="#fff" stroke="#d32f2f" stroke-width="2"/><ellipse cx="96" cy="54" rx="6" ry="8" fill="#fff" stroke="#d32f2f" stroke-width="2"/>
    <path d="M 58 58 Q 50 68 54 78 M 102 58 Q 110 68 106 78" stroke="#00b0ff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="80" cy="74" rx="8" ry="9" fill="#d32f2f"/>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="64" cy="54" rx="7" ry="7" fill="#d50000"/><ellipse cx="96" cy="54" rx="7" ry="7" fill="#d50000"/>
    <path d="M 72 71 Q 80 66 88 71" fill="none" stroke="#212121" stroke-width="2.5"/><text x="68" y="24" font-size="14">⚡</text>
  </g>
  <g id="face-defeat" style="display:none;">
    <path d="M 60 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0 M 97 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0" fill="none" stroke="#212121" stroke-width="2"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
    <text x="74" y="10" font-size="15" class="dizzy-star">💫</text>
  </g>
  <g id="face-victory" style="display:none;">
    <text x="56" y="56" font-size="16" fill="#ffd700">★</text><text x="88" y="56" font-size="16" fill="#ffd700">★</text>
    <path d="M 70 68 Q 80 84 90 68 Z" fill="#d81b60" stroke="#212121" stroke-width="2"/>
    <g transform="translate(104, 60)">
      <rect x="0" y="0" width="24" height="14" rx="3" fill="#ffd700" stroke="#ff8f00" stroke-width="1.5"/>
      <text x="2" y="10" font-size="8" fill="#3e2723" font-weight="900">TUNA</text><text x="14" y="-4" font-size="12">✨</text>
    </g>
  </g>`;
}

// 4. YAKUZA
else if (type === 'yakuza') {
customDefs = `
  <linearGradient id="bSofaGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#b71c1c"/><stop offset="100%" stop-color="#311b92"/></linearGradient>
  <linearGradient id="bChainGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ffe082"/><stop offset="100%" stop-color="#ff8f00"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <rect x="22" y="130" width="116" height="24" rx="10" fill="url(#bSofaGrad)" stroke="#ff1744" stroke-width="1.2" filter="url(#bossShadow)"/>
    <circle cx="44" cy="142" r="2.5" fill="#ffd700"/><circle cx="68" cy="142" r="2.5" fill="#ffd700"/><circle cx="92" cy="142" r="2.5" fill="#ffd700"/><circle cx="116" cy="142" r="2.5" fill="#ffd700"/>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 112, 158 92, 150 74 C 144 62, 134 68, 138 80 C 142 90, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#111" stroke-width="1.8"/>`;
bodyOutfitSvg = `
  <path d="M 44 86 C 44 116, 54 130, 80 130 C 106 130, 116 116, 116 86 Z" fill="#151515" stroke="#333" stroke-width="1.5"/>
  <polygon points="68,82 80,100 92,82" fill="#fff"/>
  <polygon points="77,88 83,88 82,112 80,116 78,112" fill="#d50000"/>
  <path d="M 56 82 Q 80 94 104 82" fill="none" stroke="url(#bChainGrad)" stroke-width="3" stroke-linecap="round"/>`;
headExtrasSvg = `
  <line x1="64" y1="36" x2="64" y2="70" stroke="#ff5252" stroke-width="2.5" stroke-linecap="round"/>`;
facesSvg = `
  <g id="face-idle">
    <path d="M 48 48 L 76 48 L 73 64 L 52 64 Z M 84 48 L 112 48 L 108 64 L 87 64 Z" fill="#111" stroke="#ffd700" stroke-width="1.5"/>
    <line x1="52" y1="52" x2="70" y2="60" stroke="#fff" stroke-width="1" opacity="0.6"/><line x1="88" y1="52" x2="106" y2="60" stroke="#fff" stroke-width="1" opacity="0.6"/>
    <line x1="74" y1="73" x2="86" y2="73" stroke="#e0e0e0" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g id="face-smug" style="display:none;">
    <ellipse cx="64" cy="50" rx="4" ry="5" fill="#ffd700"/><ellipse cx="96" cy="50" rx="4" ry="5" fill="#ffd700"/>
    <path d="M 48 55 L 76 55 L 73 68 L 52 68 Z M 84 55 L 112 55 L 108 68 L 87 68 Z" fill="#111" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M 72 73 Q 82 70 88 75" fill="none" stroke="#fff" stroke-width="2.5"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <path d="M 48 48 L 76 48 L 73 64 L 52 64 Z M 84 48 L 112 48 L 108 64 L 87 64 Z" fill="#111" stroke="#b71c1c" stroke-width="1.5"/>
    <path d="M 54 50 L 64 56 L 58 64" stroke="#fff" stroke-width="1.5" fill="none"/>
    <ellipse cx="80" cy="74" rx="7" ry="9" fill="#d50000"/><text x="68" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="64" cy="54" rx="7" ry="7" fill="#d50000"/><ellipse cx="96" cy="54" rx="7" ry="7" fill="#d50000"/>
    <line x1="64" y1="54" x2="30" y2="50" stroke="#ff1744" stroke-width="3"/><line x1="96" y1="54" x2="130" y2="50" stroke="#ff1744" stroke-width="3"/>
    <path d="M 72 71 Q 80 66 88 71" fill="none" stroke="#fff" stroke-width="2.5"/>
  </g>
  <g id="face-defeat" style="display:none;">
    <path d="M 60 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0 M 97 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0" fill="none" stroke="#fff" stroke-width="2"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
    <text x="74" y="10" font-size="15" class="dizzy-star">💫</text>
  </g>
  <g id="face-victory" style="display:none;">
    <path d="M 48 48 L 76 48 L 73 64 L 52 64 Z M 84 48 L 112 48 L 108 64 L 87 64 Z" fill="#111" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M 72 70 Q 80 84 88 70 Z" fill="#d50000"/>
    <g transform="translate(108, 64)"><rect x="0" y="0" width="18" height="10" rx="2" fill="#00e676"/><text x="3" y="8" font-size="7" fill="#fff" font-weight="900">$$$</text></g>
  </g>`;
}

// 5. HIPHOP
else if (type === 'hiphop') {
customDefs = `
  <linearGradient id="bBoomGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#424242"/><stop offset="100%" stop-color="#121212"/></linearGradient>
  <linearGradient id="bCapGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#00e5ff"/><stop offset="100%" stop-color="#d500f9"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <rect x="20" y="126" width="120" height="28" rx="4" fill="url(#bBoomGrad)" stroke="#757575" stroke-width="1.5" filter="url(#bossShadow)"/>
    <circle cx="40" cy="140" r="9" fill="#1a1a1a" stroke="#00e5ff" stroke-width="2"/><circle cx="120" cy="140" r="9" fill="#1a1a1a" stroke="#d500f9" stroke-width="2"/>
    <rect x="66" y="132" width="28" height="16" rx="2" fill="#333"/>
    <line x1="26" y1="126" x2="14" y2="102" stroke="#e0e0e0" stroke-width="2"/><circle cx="14" cy="102" r="2.5" fill="#ff1744"/>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 112, 158 92, 150 74 C 144 62, 134 68, 138 80 C 142 90, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#4a148c" stroke-width="1.8"/>
  <path d="M 140 78 L 146 84 L 142 90 L 148 94" fill="none" stroke="#ffd700" stroke-width="2"/>`;
bodyOutfitSvg = `
  <ellipse cx="80" cy="106" rx="32" ry="26" fill="url(#bossBellyGrad)"/>
  <path d="M 54 84 Q 80 100 106 84" fill="none" stroke="#ffd700" stroke-width="3" stroke-linecap="round"/>
  <circle cx="80" cy="110" r="10" fill="#ffd700" stroke="#ff8f00" stroke-width="1.5"/>
  <text x="80" y="115" font-size="14" font-weight="900" fill="#212121" text-anchor="middle">$</text>`;
headExtrasSvg = `
  <path d="M 38 60 Q 80 20 122 60" fill="none" stroke="#ff007f" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="36" cy="60" rx="7" ry="12" fill="#00e5ff" stroke="#ff007f" stroke-width="2"/><ellipse cx="124" cy="60" rx="7" ry="12" fill="#00e5ff" stroke="#ff007f" stroke-width="2"/>
  <path d="M 104 62 L 110 68 L 106 72 L 112 76" stroke="#ffd700" stroke-width="2" fill="none"/>`;
hatSvg = `<g id="boss-snapback">
  <path d="M 50 32 C 50 16, 110 16, 110 32 Z" fill="url(#bCapGrad)" stroke="#4a148c" stroke-width="1.5"/>
  <rect x="42" y="30" width="30" height="6" rx="2" fill="#ff007f" transform="rotate(-15 42 30)"/>
  <text x="80" y="27" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">SWAG</text>
</g>`;
facesSvg = `
  <g id="face-idle">
    <path d="M 54 48 L 74 48 L 70 60 L 58 60 Z M 86 48 L 106 48 L 102 60 L 90 60 Z" fill="#212121" stroke="#00e5ff" stroke-width="1.2"/>
    <path d="M 74 72 Q 80 75 86 71" fill="none" stroke="#212121" stroke-width="2.5"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 54 48 L 74 48 L 70 60 L 58 60 Z M 86 48 L 106 48 L 102 60 L 90 60 Z" fill="#212121" stroke="#00e5ff" stroke-width="1.2"/>
    <path d="M 71 70 Q 80 84 89 70 Z" fill="#c2185b" stroke="#212121" stroke-width="1.5"/><polygon points="75,70 77,75 79,70" fill="#ffd700"/>
    <g transform="translate(108, 62)"><rect x="0" y="6" width="6" height="14" rx="2" fill="#757575"/><circle cx="3" cy="4" r="5" fill="#424242"/></g>
  </g>
  <g id="face-hurt" style="display:none;">
    <ellipse cx="64" cy="54" rx="7" ry="9" fill="#fff" stroke="#ff007f" stroke-width="2"/><ellipse cx="96" cy="54" rx="7" ry="9" fill="#fff" stroke="#ff007f" stroke-width="2"/>
    <ellipse cx="80" cy="74" rx="8" ry="9" fill="#ff007f"/><text x="68" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="64" cy="54" rx="7" ry="7" fill="#ff007f"/><ellipse cx="96" cy="54" rx="7" ry="7" fill="#ff007f"/>
    <rect x="25" y="112" width="4" height="12" fill="#00e5ff"/><rect x="31" y="106" width="4" height="18" fill="#ffd700"/><rect x="125" y="106" width="4" height="18" fill="#ffd700"/>
  </g>
  <g id="face-defeat" style="display:none;">
    <path d="M 60 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0 M 97 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0" fill="none" stroke="#212121" stroke-width="2"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
    <text x="74" y="10" font-size="15" class="dizzy-star">💫</text>
  </g>
  <g id="face-victory" style="display:none;">
    <text x="56" y="56" font-size="16" fill="#00e5ff">★</text><text x="88" y="56" font-size="16" fill="#ff007f">★</text>
    <path d="M 70 68 Q 80 84 90 68 Z" fill="#d81b60" stroke="#212121" stroke-width="2"/>
    <text x="110" y="60" font-size="20">🎵</text><text x="30" y="60" font-size="18">🎶</text>
  </g>`;
}

// 6. PIRATE
else if (type === 'pirate') {
customDefs = `<linearGradient id="bBarGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8d6e63"/><stop offset="100%" stop-color="#3e2723"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <rect x="24" y="128" width="112" height="26" rx="8" fill="url(#bBarGrad)" stroke="#271c19" stroke-width="1.8" filter="url(#bossShadow)"/>
    <line x1="24" y1="134" x2="136" y2="134" stroke="#ffd700" stroke-width="2"/><line x1="24" y1="148" x2="136" y2="148" stroke="#ffd700" stroke-width="2"/>
    <text x="74" y="145" font-size="12">⚓</text>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 112, 158 92, 150 74 C 144 62, 134 68, 138 80 C 142 90, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#3e2723" stroke-width="1.8"/>`;
bodyOutfitSvg = `
  <path d="M 44 86 C 44 116, 54 130, 80 130 C 106 130, 116 116, 116 86 Z" fill="#b71c1c" stroke="#5f0909" stroke-width="1.5"/>
  <circle cx="72" cy="96" r="2.5" fill="#ffd700"/><circle cx="72" cy="108" r="2.5" fill="#ffd700"/><circle cx="88" cy="96" r="2.5" fill="#ffd700"/><circle cx="88" cy="108" r="2.5" fill="#ffd700"/>`;
hatSvg = `<g>
  <path d="M 36 34 Q 80 8 124 34 Q 80 24 36 34 Z" fill="#212121" stroke="#ffd700" stroke-width="1.5"/>
  <text x="75" y="25" font-size="9" fill="#fff">☠️</text>
  <line x1="44" y1="48" x2="80" y2="60" stroke="#212121" stroke-width="2"/><ellipse cx="64" cy="54" rx="7" ry="8" fill="#212121"/>
</g>`;
facesSvg = `
  <g id="face-idle">
    <ellipse cx="96" cy="54" rx="6.5" ry="7.5" fill="#ffb300" stroke="#3e2723" stroke-width="1"/><circle cx="96" cy="54" r="3" fill="#212121"/>
    <path d="M 74 72 Q 80 75 86 71" fill="none" stroke="#212121" stroke-width="2.5"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 90 54 Q 96 48 102 54" stroke="#212121" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M 72 70 Q 80 84 88 70 Z" fill="#b71c1c" stroke="#212121" stroke-width="2"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <ellipse cx="96" cy="53" rx="7" ry="9" fill="#fff" stroke="#b71c1c" stroke-width="2"/>
    <ellipse cx="80" cy="74" rx="8" ry="9" fill="#b71c1c"/><text x="68" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="96" cy="54" rx="7" ry="7" fill="#d50000"/><ellipse cx="96" cy="54" rx="2" ry="7" fill="#ffeb3b"/>
    <path d="M 72 71 Q 80 66 88 71" fill="none" stroke="#212121" stroke-width="2.5"/>
  </g>
  <g id="face-defeat" style="display:none;">
    <path d="M 97 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0" fill="none" stroke="#212121" stroke-width="2"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
  </g>
  <g id="face-victory" style="display:none;">
    <text x="88" y="56" font-size="16" fill="#ffd700">★</text>
    <path d="M 70 68 Q 80 84 90 68 Z" fill="#b71c1c" stroke="#212121" stroke-width="2"/><text x="108" y="65" font-size="20">🪙</text>
  </g>`;
}

// 7. WIZARD
else if (type === 'wizard') {
customDefs = `<linearGradient id="bWizGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7c4dff"/><stop offset="100%" stop-color="#00e5ff"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <ellipse cx="80" cy="140" rx="54" ry="14" fill="none" stroke="url(#bWizGrad)" stroke-width="2.5" filter="url(#bossShadow)"/>
    <text x="40" y="143" font-size="10" fill="#00e5ff">✧</text><text x="114" y="143" font-size="10" fill="#00e5ff">✧</text><text x="76" y="144" font-size="10" fill="#ffd700">★</text>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 112, 158 92, 150 74 C 144 62, 134 68, 138 80 C 142 90, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#283593" stroke-width="1.8"/>`;
bodyOutfitSvg = `
  <path d="M 42 86 C 42 116, 52 130, 80 130 C 108 130, 118 116, 118 86 Z" fill="#311b92" stroke="#651fff" stroke-width="1.5"/>
  <circle cx="80" cy="92" r="4" fill="#00e5ff"/>`;
hatSvg = `<g>
  <polygon points="44,32 80,4 116,32" fill="#311b92" stroke="#651fff" stroke-width="1.8"/>
  <ellipse cx="80" cy="32" rx="40" ry="8" fill="#4527a0" stroke="#ffd700" stroke-width="1.5"/><text x="76" y="22" font-size="10" fill="#ffd700">🌙</text>
</g>`;
facesSvg = `
  <g id="face-idle">
    <ellipse cx="64" cy="54" rx="6.5" ry="7.5" fill="#00e5ff"/><circle cx="64" cy="54" r="2.5" fill="#212121"/>
    <ellipse cx="96" cy="54" rx="6.5" ry="7.5" fill="#00e5ff"/><circle cx="96" cy="54" r="2.5" fill="#212121"/>
    <path d="M 73 70 Q 77 74 80 71 Q 83 74 87 70" fill="none" stroke="#212121" stroke-width="2.5"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 58 54 Q 64 47 70 54 M 90 54 Q 96 47 102 54" stroke="#212121" stroke-width="3.5"/><path d="M 72 70 Q 80 82 88 70 Z" fill="#651fff"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <ellipse cx="64" cy="53" rx="7" ry="9" fill="#fff" stroke="#ff1744" stroke-width="2"/><ellipse cx="96" cy="53" rx="7" ry="9" fill="#fff" stroke="#ff1744" stroke-width="2"/>
    <ellipse cx="80" cy="74" rx="8" ry="9" fill="#d50000"/><text x="68" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="64" cy="54" rx="7" ry="7" fill="#d50000"/><ellipse cx="96" cy="54" rx="7" ry="7" fill="#d50000"/><text x="74" y="28" font-size="12">🔮</text>
  </g>
  <g id="face-defeat" style="display:none;">
    <path d="M 60 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0 M 97 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0" fill="none" stroke="#212121" stroke-width="2"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
  </g>
  <g id="face-victory" style="display:none;">
    <text x="56" y="56" font-size="16" fill="#00e5ff">★</text><text x="88" y="56" font-size="16" fill="#00e5ff">★</text>
    <path d="M 70 68 Q 80 84 90 68 Z" fill="#651fff"/><text x="108" y="60" font-size="18">✨</text>
  </g>`;
}

// 8. CYBER
else if (type === 'cyber') {
customDefs = `<linearGradient id="bDiscGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#00e5ff"/><stop offset="100%" stop-color="#1de9b6"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <ellipse cx="80" cy="140" rx="54" ry="12" fill="#212121" stroke="url(#bDiscGrad)" stroke-width="2.5" filter="url(#bossShadow)"/>
    <ellipse cx="80" cy="140" rx="40" ry="8" fill="#00e5ff" opacity="0.3"/>
  </g>`;
tailSvg = `<path d="M 120 108 L 140 108 L 150 90 L 144 76" stroke="#00e5ff" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="144" cy="76" r="3" fill="#ff007f"/>`;
bodyOutfitSvg = `
  <path d="M 50 88 L 110 88 L 102 120 L 58 120 Z" fill="#263238" stroke="#00e5ff" stroke-width="1.5"/>
  <circle cx="80" cy="104" r="8" fill="#00e5ff" stroke="#fff" stroke-width="1.5"/><circle cx="80" cy="104" r="3" fill="#fff"/>`;
hatSvg = `<rect x="46" y="46" width="68" height="15" rx="3" fill="#00e5ff" stroke="#fff" stroke-width="1.5"/>`;
facesSvg = `
  <g id="face-idle">
    <line x1="52" y1="53" x2="72" y2="53" stroke="#fff" stroke-width="3" stroke-linecap="round"/><line x1="88" y1="53" x2="108" y2="53" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <line x1="74" y1="73" x2="86" y2="73" stroke="#00e5ff" stroke-width="2.5"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 52 56 L 68 50 M 92 50 L 108 56" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M 72 72 Q 80 80 88 72" fill="none" stroke="#00e5ff" stroke-width="2.5"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <rect x="46" y="46" width="68" height="15" rx="3" fill="#ff1744"/><text x="54" y="58" font-size="10" fill="#fff" font-weight="900">ERR_404</text><text x="68" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <rect x="46" y="46" width="68" height="15" rx="3" fill="#ff007f"/><line x1="46" y1="53" x2="114" y2="53" stroke="#ffeb3b" stroke-width="3"/><text x="73" y="30" font-size="12">⚡</text>
  </g>
  <g id="face-defeat" style="display:none;">
    <rect x="46" y="46" width="68" height="15" rx="3" fill="#424242"/><text x="56" y="58" font-size="10" fill="#ff1744">OFFLINE</text>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
  </g>
  <g id="face-victory" style="display:none;">
    <text x="52" y="58" font-size="11" fill="#fff" font-weight="900">WIN 100%</text><text x="110" y="65" font-size="18">💾</text>
  </g>`;
}

// 9. LAVA
else if (type === 'lava') {
customDefs = `<linearGradient id="bLavaGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#bf360c"/><stop offset="100%" stop-color="#212121"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <ellipse cx="80" cy="140" rx="54" ry="14" fill="url(#bLavaGrad)" stroke="#ff3d00" stroke-width="1.8" filter="url(#bossShadow)"/>
    <path d="M 40 140 Q 60 144 80 138 Q 100 144 120 139" stroke="#ffeb3b" stroke-width="2" fill="none"/>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 112, 158 92, 150 74 C 144 62, 134 68, 138 80 C 142 90, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#bf360c" stroke-width="1.8"/>
  <circle cx="150" cy="74" r="5" fill="#ffeb3b"/>`;
bodyOutfitSvg = `<path d="M 66 94 L 72 104 L 80 100 L 88 108" stroke="#ff3d00" stroke-width="2" fill="none"/>`;
hatSvg = `<polygon points="42,46 44,12 66,38" fill="#d50000" stroke="#ffeb3b" stroke-width="1.5"/><polygon points="118,46 116,12 94,38" fill="#d50000" stroke="#ffeb3b" stroke-width="1.5"/>`;
facesSvg = `
  <g id="face-idle">
    <ellipse cx="64" cy="54" rx="6.5" ry="7.5" fill="#ffeb3b"/><ellipse cx="64" cy="54" rx="2" ry="6.5" fill="#bf360c"/>
    <ellipse cx="96" cy="54" rx="6.5" ry="7.5" fill="#ffeb3b"/><ellipse cx="96" cy="54" rx="2" ry="6.5" fill="#bf360c"/>
    <path d="M 73 70 Q 77 74 80 71 Q 83 74 87 70" fill="none" stroke="#bf360c" stroke-width="2.5"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 58 54 Q 64 47 70 54 M 90 54 Q 96 47 102 54" stroke="#bf360c" stroke-width="3.5"/><path d="M 72 70 Q 80 82 88 70 Z" fill="#d50000"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <ellipse cx="64" cy="53" rx="7" ry="9" fill="#fff" stroke="#ff1744" stroke-width="2"/><ellipse cx="96" cy="53" rx="7" ry="9" fill="#fff" stroke="#ff1744" stroke-width="2"/>
    <ellipse cx="80" cy="74" rx="8" ry="9" fill="#d50000"/><text x="68" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="64" cy="54" rx="7" ry="7" fill="#ffeb3b"/><ellipse cx="96" cy="54" rx="7" ry="7" fill="#ffeb3b"/><text x="70" y="24" font-size="16">🌋</text>
  </g>
  <g id="face-defeat" style="display:none;">
    <path d="M 60 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0 M 97 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0" fill="none" stroke="#212121" stroke-width="2"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
  </g>
  <g id="face-victory" style="display:none;">
    <text x="56" y="56" font-size="16" fill="#ffeb3b">★</text><text x="88" y="56" font-size="16" fill="#ffeb3b">★</text>
    <path d="M 70 68 Q 80 84 90 68 Z" fill="#d50000"/><text x="108" y="60" font-size="18">🔥</text>
  </g>`;
}

// 10. EMPEROR
else if (type === 'emperor') {
customDefs = `<linearGradient id="bEmpGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff59d"/><stop offset="100%" stop-color="#ff6f00"/></linearGradient>`;
throneSvg = `
  <g id="boss-throne" class="mount-layer">
    <rect x="20" y="130" width="120" height="24" rx="6" fill="url(#bEmpGrad)" stroke="#ff8f00" stroke-width="2" filter="url(#bossShadow)"/>
    <circle cx="40" cy="142" r="3" fill="#d50000"/><circle cx="80" cy="142" r="3" fill="#00e676"/><circle cx="120" cy="142" r="3" fill="#2979ff"/>
  </g>`;
tailSvg = `<path d="M 120 108 C 146 112, 158 92, 150 74 C 144 62, 134 68, 138 80 C 142 90, 134 100, 118 102 Z" fill="url(#bossFurGrad)" stroke="#ff8f00" stroke-width="1.8"/>`;
bodyOutfitSvg = `
  <path d="M 40 84 C 40 116, 50 132, 80 132 C 110 132, 120 116, 120 84 Z" fill="#d50000" stroke="#b71c1c" stroke-width="2"/>
  <path d="M 64 84 L 80 110 L 96 84" fill="none" stroke="#ffd700" stroke-width="3"/>`;
hatSvg = `<g>
  <path d="M 54 28 L 60 8 L 70 18 L 80 4 L 90 18 L 100 8 L 106 28 Z" fill="url(#bEmpGrad)" stroke="#e65100" stroke-width="1.8"/>
  <circle cx="80" cy="14" r="3.5" fill="#d50000"/><circle cx="65" cy="18" r="2.5" fill="#00e676"/><circle cx="95" cy="18" r="2.5" fill="#2979ff"/>
</g>`;
facesSvg = `
  <g id="face-idle">
    <ellipse cx="64" cy="54" rx="6.5" ry="7.5" fill="#ffd700"/><circle cx="64" cy="54" r="2.5" fill="#212121"/>
    <ellipse cx="96" cy="54" rx="6.5" ry="7.5" fill="#ffd700"/><circle cx="96" cy="54" r="2.5" fill="#212121"/>
    <path d="M 73 70 Q 77 74 80 71 Q 83 74 87 70" fill="none" stroke="#ff8f00" stroke-width="2.5"/>
  </g>
  <g id="face-smug" style="display:none;">
    <path d="M 58 54 Q 64 47 70 54 M 90 54 Q 96 47 102 54" stroke="#212121" stroke-width="3.5"/><path d="M 72 70 Q 80 82 88 70 Z" fill="#d50000"/>
  </g>
  <g id="face-hurt" style="display:none;">
    <ellipse cx="64" cy="53" rx="7" ry="9" fill="#fff" stroke="#ff1744" stroke-width="2"/><ellipse cx="96" cy="53" rx="7" ry="9" fill="#fff" stroke="#ff1744" stroke-width="2"/>
    <ellipse cx="80" cy="74" rx="8" ry="9" fill="#d50000"/><text x="68" y="24" font-size="16">💥</text>
  </g>
  <g id="face-frenzy" style="display:none;">
    <ellipse cx="64" cy="54" rx="7" ry="7" fill="#d50000"/><ellipse cx="96" cy="54" rx="7" ry="7" fill="#d50000"/><text x="74" y="28" font-size="12">👑</text>
  </g>
  <g id="face-defeat" style="display:none;">
    <path d="M 60 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0 M 97 54 m -5,0 a 5,5 0 1,0 10,0 a 3,3 0 1,0 -6,0" fill="none" stroke="#212121" stroke-width="2"/>
    <g class="surrender-flag"><line x1="44" y1="108" x2="22" y2="34" stroke="#fff" stroke-width="2.5"/><polygon points="22,34 2,46 22,58" fill="#fff" stroke="#e0e0e0"/><text x="6" y="50" font-size="10">🏳️</text></g>
  </g>
  <g id="face-victory" style="display:none;">
    <text x="56" y="56" font-size="16" fill="#ffd700">★</text><text x="88" y="56" font-size="16" fill="#ffd700">★</text>
    <path d="M 70 68 Q 80 84 90 68 Z" fill="#d50000"/><text x="108" y="60" font-size="18">👑</text>
  </g>`;
}

return `<svg id="boss-svg" viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="bossFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="${fur1}"/>
    <stop offset="60%" stop-color="${fur2}"/>
    <stop offset="100%" stop-color="${fur3}"/>
  </linearGradient>
  <linearGradient id="bossBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="${belly1}"/>
    <stop offset="100%" stop-color="${belly2}"/>
  </linearGradient>
  <radialGradient id="frenzyFlameGrad" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffeb3b" stop-opacity="0.95"/>
    <stop offset="50%" stop-color="#ff5722" stop-opacity="0.8"/>
    <stop offset="100%" stop-color="#d50000" stop-opacity="0"/>
  </radialGradient>
  <filter id="bossShadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/>
  </filter>
  ${customDefs}
</defs>

<!-- Frenzy Aura -->
<g id="boss-frenzy-aura" class="aura-layer" opacity="0">
  <ellipse cx="80" cy="85" rx="66" ry="60" fill="url(#frenzyFlameGrad)"/>
  <path class="flame-sparks" d="M 30 70 Q 25 45 35 30 Q 45 45 42 70 M 120 70 Q 135 45 125 30 Q 115 45 118 70 M 75 30 Q 80 10 85 30" fill="none" stroke="#ffeb3b" stroke-width="3" stroke-linecap="round"/>
</g>

<!-- Mount / Throne -->
${throneSvg}

<!-- Tail -->
<g id="boss-tail" class="tail-layer">
  ${tailSvg}
</g>

<!-- Body & Outfit -->
<g id="boss-body" class="body-layer">
  <ellipse cx="80" cy="98" rx="46" ry="40" fill="url(#bossFurGrad)" stroke="${p.stroke || '#424242'}" stroke-width="2"/>
  ${bodyOutfitSvg}
</g>

<!-- Head & Ears -->
<g id="boss-head" class="head-layer">
  <g class="ears-group">
    <polygon points="42,46 48,16 66,38" fill="${fur2}" stroke="${p.stroke || '#424242'}" stroke-width="2"/>
    <polygon points="46,42 51,24 62,37" fill="#ffab91"/>
    <polygon points="118,46 112,16 94,38" fill="${fur2}" stroke="${p.stroke || '#424242'}" stroke-width="2"/>
    <polygon points="114,42 109,24 98,37" fill="#ffab91"/>
  </g>
  <ellipse cx="80" cy="58" rx="42" ry="33" fill="url(#bossFurGrad)" stroke="${p.stroke || '#424242'}" stroke-width="2"/>
  <ellipse cx="80" cy="68" rx="19" ry="13" fill="url(#bossBellyGrad)"/>
  <polygon points="76,64 84,64 80,68" fill="#ff7043"/>
  <!-- Whiskers -->
  <path d="M 32 64 L 54 66 M 30 70 L 54 70" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 128 64 L 106 66 M 130 70 L 106 70" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
  ${headExtrasSvg}
</g>

<!-- Hat / Headpiece -->
${hatSvg}

<!-- Facial Expressions (6 emotion states) -->
${facesSvg}
</svg>`;
}