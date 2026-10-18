// Stack Tower - Churu Fever Catcher Minigame Engine

  // CHURU FEVER CATCHER MINIGAME ENGINE
  // -------------------------------------------------------------
  let bonusActive = false;
  let bonusTimer = 15.0;
  let bonusHearts = 3;
  let bonusScore = 0;
  let bonusChuru = 0;
  let bonusStreak = 0;
  let bonusFeverTimer = 0;
  let bonusSpawnCooldown = 0.25;
  let bonusItems = [];
  let bonusParticles = [];
  let bonusStageHadPastRecord = false;
  let bonusBasket = {
    x: 0,
    targetX: 0,
    w: 100,
    h: 42,
    y: 0
  };

  const churuTreatImg = new Image();
  churuTreatImg.src = 'assets/churu_icon.jpg';

  const BONUS_ITEM_TYPES = [
    { type: 'churu', emoji: '🥢', points: 10, weight: 40, size: 28 },
    { type: 'can', emoji: '🥫', points: 15, weight: 22, size: 28 },
    { type: 'star', emoji: '⭐', points: 20, weight: 14, size: 26 },
    { type: 'heart', emoji: '💖', points: 25, weight: 10, size: 28 },
    { type: 'gold', emoji: '✨', points: 30, weight: 6, size: 30 },
    { type: 'mouse', emoji: '🐭', points: 0, weight: 16, size: 30, isObstacle: true }
  ];

  function initBonusGame() {
    bonusActive = true;
    bonusTimer = 15.0;
    bonusHearts = 3;
    bonusScore = 0;
    bonusChuru = 0;
    bonusStreak = 0;
    bonusFeverTimer = 0;
    bonusSpawnCooldown = 0.25;
    bonusItems = [];
    bonusParticles = [];

    // Mark as played now that bonus stage initializes
    save.bonusPlayed = save.bonusPlayed || {};
    save.bonusPlayed[cfg.id] = true;
    persist();

    bonusBasket.w = Math.max(90, Math.min(130, viewW * 0.26));
    bonusBasket.x = viewW / 2;
    bonusBasket.targetX = viewW / 2;
    bonusBasket.y = viewH - 165;

    spawnBonusItem();
    spawnBonusItem();
    if (bonusItems[0]) bonusItems[0].y = 80;
    if (bonusItems[1]) bonusItems[1].y = 170;

    score = 0;
    gameState = 'PLAYING';
    hideOverlays();
    updateHud();

    const bannerBadge = $('banner-badge');
    const typeInfo = STAGE_TYPES.bonus;
    const typeName = (getLang() === 'ko') ? typeInfo.ko : typeInfo.name;
    if (bannerBadge) {
      bannerBadge.textContent = `${typeInfo.emoji} ${typeName.toUpperCase()}`;
      bannerBadge.className = 'stage-badge ' + (typeInfo.badgeCls || 'type-bonus');
    }

    const comp = getSelectedCat();
    setMascot('excited', (getLang() === 'ko')
      ? '떨어지는 츄르를 담고 쥐(🐭)는 피하자냥! (하트 3개) ✨'
      : 'Catch Churu and dodge mice (🐭), meow! (3 Hearts) ✨', 3500);
  }

  function spawnBonusItem() {
    let totalW = 0;
    BONUS_ITEM_TYPES.forEach(i => totalW += i.weight);
    let r = Math.random() * totalW;
    let chosen = BONUS_ITEM_TYPES[0];
    for (let it of BONUS_ITEM_TYPES) {
      if (r < it.weight) {
        chosen = it;
        break;
      }
      r -= it.weight;
    }

    const margin = 35;
    const x = margin + Math.random() * (viewW - margin * 2);
    const vy = (bonusFeverTimer > 0) ? (220 + Math.random() * 120) : (160 + Math.random() * 90);
    const vx = (Math.random() - 0.5) * 40;
    const wobblePhase = Math.random() * Math.PI * 2;

    bonusItems.push({
      x: x,
      y: -30,
      vx: vx,
      vy: vy,
      emoji: chosen.emoji,
      points: chosen.points,
      size: chosen.size,
      type: chosen.type,
      phase: wobblePhase,
      rot: (Math.random() - 0.5) * 0.4
    });
  }

  function updateBonusGame(dt, curTime) {
    const timeVal = (typeof curTime === 'number') ? curTime : performance.now();
    bonusTimer -= dt;
    if (bonusTimer < 0) bonusTimer = 0;

    if (bonusFeverTimer > 0) {
      bonusFeverTimer -= dt;
      if (bonusFeverTimer < 0) bonusFeverTimer = 0;
    }

    bonusBasket.x += (bonusBasket.targetX - bonusBasket.x) * Math.min(1.0, dt * 18);
    const halfW = bonusBasket.w / 2;
    if (bonusBasket.x < halfW) bonusBasket.x = halfW;
    if (bonusBasket.x > viewW - halfW) bonusBasket.x = viewW - halfW;
    bonusBasket.y = viewH - 165;

    bonusSpawnCooldown -= dt;
    const interval = (bonusFeverTimer > 0) ? 0.18 : 0.38;
    if (bonusSpawnCooldown <= 0) {
      bonusSpawnCooldown = interval;
      spawnBonusItem();
    }

    for (let i = bonusItems.length - 1; i >= 0; i--) {
      const item = bonusItems[i];
      item.y += item.vy * dt;
      item.x += (item.vx + Math.sin(timeVal / 200 + item.phase) * 20) * dt;

      const basketTop = bonusBasket.y - bonusBasket.h / 2;
      const basketBot = bonusBasket.y + bonusBasket.h / 2;
      const basketLeft = bonusBasket.x - bonusBasket.w / 2 - 8;
      const basketRight = bonusBasket.x + bonusBasket.w / 2 + 8;

      if (item.y >= basketTop && item.y <= basketBot + 15 && item.x >= basketLeft && item.x <= basketRight) {
        if (item.type === 'mouse') {
          bonusStreak = 0;
          bonusHearts--;
          triggerShake(5.5, 0.3);
          triggerHaptic([60, 40, 80]);
          FirebaseTracker.logEvent('bonus_hazard_hit', {
            stage_id: (typeof cfg !== 'undefined' && cfg) ? cfg.id : 0,
            hearts_remaining: bonusHearts,
            bonus_score: bonusScore
          });

          floatingTexts.push({
            text: '🐭 -1 ❤️',
            color: '#ff5252',
            size: 24,
            x: item.x,
            y: basketTop - 12,
            vy: -65,
            alpha: 1.0,
            time: 0
          });

          for (let p = 0; p < 8; p++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 60 + Math.random() * 80;
            bonusParticles.push({
              x: item.x,
              y: basketTop,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 30,
              color: '#ff5252',
              life: 0.45,
              maxLife: 0.45,
              size: 4 + Math.random() * 3
            });
          }

          bonusItems.splice(i, 1);
          updateHud();

          if (bonusHearts <= 0) {
            bonusActive = false;
            playCatSad();
            setMascot('sad', (getLang() === 'ko')
              ? '으앙! 쥐한테 세 번이나 부딪혀서 끝났다냥... 😿🐭'
              : 'Meow! Hit by mice 3 times... 😿🐭', 3500);
            setTimeout(() => {
              completeStage();
            }, 400);
            return;
          } else {
            playMarimbaNote(196, false);
            setMascot('scared', (getLang() === 'ko')
              ? `앗! 쥐 조심해라냥! (남은 하트 ${bonusHearts}개) 🙀`
              : `Watch out for mice! (${bonusHearts} hearts left) 🙀`, 1500);
          }
          continue;
        }

        bonusStreak++;
        if (bonusStreak >= 3 && bonusFeverTimer <= 0) {
          bonusFeverTimer = 4.0;
          playSizeExpandChime();
          showToast((getLang() === 'ko') ? '🔥 츄르 피버 모드 발동! 2배 보너스!' : '🔥 CHURU FEVER ACTIVATED! 2× BONUS!');
        }

        const multi = (bonusFeverTimer > 0) ? 2 : 1;
        const pts = item.points * multi;
        bonusScore += pts;
        bonusChuru = bonusScore;
        score = bonusScore;

        playMarimbaNote(SCALE_FREQS[Math.min(15, 6 + (bonusStreak % 8) * 2)], true);

        floatingTexts.push({
          text: `+${pts} ${item.emoji}`,
          color: (multi > 1) ? '#ffeb3b' : '#00e676',
          size: (multi > 1) ? 24 : 18,
          x: item.x,
          y: basketTop - 12,
          vy: -65,
          alpha: 1.0,
          time: 0
        });

        for (let p = 0; p < 6; p++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 60 + Math.random() * 80;
          bonusParticles.push({
            x: item.x,
            y: basketTop,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - 30,
            color: (multi > 1) ? '#ffeb3b' : '#80d8ff',
            life: 0.45,
            maxLife: 0.45,
            size: 3 + Math.random() * 3
          });
        }

        bonusItems.splice(i, 1);
        continue;
      }

      if (item.y > viewH + 40) {
        if (item.type !== 'mouse') {
          bonusStreak = 0;
        }
        bonusItems.splice(i, 1);
      }
    }

    for (let p = bonusParticles.length - 1; p >= 0; p--) {
      const pt = bonusParticles[p];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.life <= 0) {
        bonusParticles.splice(p, 1);
      }
    }

    updateHud();

    if (bonusTimer <= 0) {
      bonusActive = false;
      playCatSad();
      setMascot('sad', (getLang() === 'ko')
        ? '시간이 다 됐다냥! 아쉽다냥~ 😿'
        : 'Time is up, meow! 😿', 2500);
      completeStage();
    }
  }

  function drawBonusGame(c, curTime) {
    c.save();
    bonusItems.forEach(it => {
      c.save();
      c.translate(it.x, it.y);
      c.rotate(it.rot);
      if (it.type === 'mouse') {
        c.shadowColor = '#ff1744';
        c.shadowBlur = 12;
      } else if (bonusFeverTimer > 0) {
        c.shadowColor = '#ffd700';
        c.shadowBlur = 14;
      } else {
        c.shadowColor = 'rgba(0,0,0,0.3)';
        c.shadowBlur = 6;
      }

      if ((it.type === 'churu' || it.type === 'gold') && churuTreatImg.complete && churuTreatImg.naturalWidth > 0) {
        const sz = it.size * 1.35;
        c.save();
        c.beginPath();
        c.arc(0, 0, sz / 2, 0, Math.PI * 2);
        c.clip();
        c.drawImage(churuTreatImg, -sz / 2, -sz / 2, sz, sz);
        c.restore();

        if (it.type === 'gold') {
          c.strokeStyle = '#ffd700';
          c.lineWidth = 2.5;
          c.beginPath();
          c.arc(0, 0, sz / 2, 0, Math.PI * 2);
          c.stroke();
          c.font = '12px -apple-system, sans-serif';
          c.fillText('✨', sz * 0.35, -sz * 0.35);
        }
      } else {
        c.font = `${it.size}px -apple-system, sans-serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(it.emoji, 0, 0);
      }
      c.restore();
    });
    c.restore();

    const bx = bonusBasket.x;
    const by = bonusBasket.y;
    const bw = bonusBasket.w;
    const bh = bonusBasket.h;

    c.save();
    if (bonusFeverTimer > 0) {
      c.shadowColor = '#ffeb3b';
      c.shadowBlur = 22;
    } else {
      c.shadowColor = 'rgba(0,0,0,0.35)';
      c.shadowBlur = 10;
    }

    const basketGrad = c.createLinearGradient(bx, by - bh / 2, bx, by + bh / 2);
    if (bonusFeverTimer > 0) {
      basketGrad.addColorStop(0, '#ffe082');
      basketGrad.addColorStop(1, '#ff6f00');
    } else {
      basketGrad.addColorStop(0, '#d7ccc8');
      basketGrad.addColorStop(1, '#6d4c41');
    }

    c.fillStyle = basketGrad;
    c.lineWidth = 2.5;
    c.strokeStyle = (bonusFeverTimer > 0) ? '#ffeb3b' : '#4e342e';

    const rx = bx - bw / 2, ry = by - bh / 2, rw = bw, rh = bh, rad = 14;
    c.beginPath();
    c.moveTo(rx + rad, ry);
    c.lineTo(rx + rw - rad, ry);
    c.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
    c.lineTo(rx + rw, ry + rh - rad);
    c.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
    c.lineTo(rx + rad, ry + rh);
    c.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
    c.lineTo(rx, ry + rad);
    c.quadraticCurveTo(rx, ry, rx + rad, ry);
    c.closePath();
    c.fill();
    c.stroke();

    // Basket Cat Ears 🐱
    c.fillStyle = (bonusFeverTimer > 0) ? '#ffa000' : '#8d6e63';
    c.beginPath();
    c.moveTo(bx - bw * 0.42, by - bh / 2);
    c.lineTo(bx - bw * 0.32, by - bh / 2 - 14);
    c.lineTo(bx - bw * 0.22, by - bh / 2);
    c.closePath();
    c.fill();
    c.stroke();

    c.beginPath();
    c.moveTo(bx + bw * 0.22, by - bh / 2);
    c.lineTo(bx + bw * 0.32, by - bh / 2 - 14);
    c.lineTo(bx + bw * 0.42, by - bh / 2);
    c.closePath();
    c.fill();
    c.stroke();

    c.fillStyle = '#fff9c4';
    c.font = '16px -apple-system, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('🐾', bx, by + 1);

    c.restore();

    c.save();
    bonusParticles.forEach(pt => {
      c.fillStyle = pt.color;
      c.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      c.beginPath();
      c.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      c.fill();
    });
    c.restore();

    updateFloatingTexts(0);
  }

  window.addEventListener('pointermove', (e) => {
    if (bonusActive && gameState === 'PLAYING') {
      bonusBasket.targetX = e.clientX;
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!bonusActive || gameState !== 'PLAYING') return;
    const step = 45;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      bonusBasket.targetX = Math.max(bonusBasket.w / 2, bonusBasket.targetX - step);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      bonusBasket.targetX = Math.min(viewW - bonusBasket.w / 2, bonusBasket.targetX + step);
    }
  });
