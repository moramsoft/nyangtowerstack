// Stack Tower - Core Game Loop, Block Slicing & Test Harness

  function resetScene() {
    bonusActive = false;
    tower = [];
    fallingPieces = [];
    activeBlock = null;
    floatingTexts.length = 0;
    expandRings.length = 0;
    activeParticles.length = 0;
    cameraTargetY = 0;
    cameraY = 0;
    currentZoom = 1.0;
    targetZoom = 1.0;
    INITIAL_SIZE = 7.5;
    hueBase = 325;
    cfg = ENDLESS_CFG;
    mode = 'ENDLESS';
    comboTagEl.classList.remove('show', 'combo-fire', 'combo-ultra', 'combo-pop');
    scoreTextEl.textContent = '0';
    if (typeof isBossIntroPlaying !== 'undefined') isBossIntroPlaying = false;
    lastTapTime = 0;
    const bioReset = $('boss-intro-overlay');
    if (bioReset) bioReset.style.display = 'none';
    bossBlocksPlaced = 0;
    towerTiltX = 0;
    towerTiltZ = 0;
    towerTiltTargetX = 0;
    towerTiltTargetZ = 0;
    meltingBlocks = [];
    isPointerHolding = false;
    activeSkillReady = false;
    activeSkillTimer = 14.0;
    activeSkillNoticeShown = false;
    if (typeof climbingKitten !== 'undefined') {
      climbingKitten.x = 0; climbingKitten.z = 0; climbingKitten.y = 0; climbingKitten.targetY = 0;
      climbingKitten.isJumping = false; climbingKitten.jumpProgress = 0; climbingKitten.state = 'idle';
    }
    updateHud();
  }

  function startStage(id) {
    if (typeof setBgmTrack === 'function') setBgmTrack('gameplay');
    mode = 'STAGE';
    const rawCfg = buildStageConfig(id);
    if (rawCfg.stageType === 'bonus' && isBonusStageAlreadyPlayed(id)) {
      showToast((getLang() === 'ko')
        ? '보너스 스테이지는 1회만 도전할 수 있습니다냥! 🔒'
        : 'Bonus stage can only be played once, meow! 🔒');
      const nextPlayable = getNextPlayableStage(id);
      if (nextPlayable < TOTAL_STAGES && isUnlocked(nextPlayable)) {
        startStage(nextPlayable);
      } else {
        openSelect();
      }
      return;
    }

    if (rawCfg.stageType === 'bonus') {
      bonusStageHadPastRecord = isBonusStageAlreadyPlayed(id);
    }

    cfg = applyAssist(rawCfg, save.fails[id] || 0);
    FirebaseTracker.setCustomKey('current_stage', String(id));
    FirebaseTracker.setCustomKey('game_mode', 'STAGE');
    FirebaseTracker.log(`Starting stage ${id} (${cfg.label})`);
    FirebaseTracker.logEvent('stage_start', {
      stage_id: id,
      stage_label: cfg.label,
      world_name: cfg.worldName,
      stage_type: cfg.stageType || 'normal',
      companion: save.selectedCat || 'shiro',
      target_score: cfg.target
    });
    initGame();
  }
  function startEndless() {
    if (typeof setBgmTrack === 'function') setBgmTrack('gameplay');
    mode = 'ENDLESS';
    cfg = ENDLESS_CFG;
    FirebaseTracker.setCustomKey('game_mode', 'ENDLESS');
    FirebaseTracker.log('Starting endless mode');
    FirebaseTracker.logEvent('endless_start', {
      companion: save.selectedCat || 'shiro',
      best_score: bestScore
    });
    initGame();
  }
  function retryCurrent() {
    if (mode === 'STAGE') {
      if (cfg && cfg.stageType === 'bonus') {
        showToast((getLang() === 'ko')
          ? '보너스 스테이지는 1회만 도전할 수 있습니다냥! 🔒'
          : 'Bonus stage can only be played once, meow! 🔒');
        openSelect();
        return;
      }
      startStage(cfg.id);
    } else {
      startEndless();
    }
  }
  function goMenu() {
    if (mode === 'STAGE') openSelect();
    else showStart();
  }

  function initGame() {
    initAudio();
    updateBgmPlayback();
    fallingPieces = [];
    floatingTexts.length = 0;
    expandRings.length = 0;
    activeParticles.length = 0;
    activeBlock = null;
    towerTiltX = 0;
    towerTiltZ = 0;
    towerTiltTargetX = 0;
    towerTiltTargetZ = 0;
    meltingBlocks = [];
    isPointerHolding = false;
    holdStartTime = 0;
    perfectionistStreak = 0;
    activeSkillReady = false;
    activeSkillTimer = 14.0;
    activeSkillNoticeShown = false;

    if (typeof climbingKitten !== 'undefined') {
      climbingKitten.x = 0; climbingKitten.z = 0; climbingKitten.y = 0; climbingKitten.targetY = 0;
      climbingKitten.isJumping = false; climbingKitten.jumpProgress = 0; climbingKitten.state = 'idle';
    }

    applyCompanionVisual();

    if (mode === 'STAGE') {
      cfg = applyCompanionPerks(cfg);
      if (cfg.stageType === 'bonus') {
        initBonusGame();
        return;
      }
      timeRemaining = cfg.timeLimit || 0;
      bossMaxHp = cfg.boss ? cfg.target : 0;
      bossCurrentHp = bossMaxHp;
      bossFrenzy = false;
      bossBlocksPlaced = 0;
      precisionStreakAchieved = false;
      lastTickSecond = -1;

      if (cfg.thinFoundation) {
        showToast((getLang() === 'ko')
          ? '⚠️ 얇은 받침대! 균형을 잡아주세요냥! ⚖️'
          : '⚠️ Thin foundation! Keep tower balance! ⚖️');
      }
    }

    INITIAL_SIZE = cfg.startSize;
    PERFECT_TOLERANCE = cfg.tol;
    hueBase = cfg.hueBase;
    skyHue = cfg.hueBase;
    skyProgress = 0;
    skyFever = 0;
    skyCelebration = 0;
    perfectTotal = 0;

    // Base foundation block (level 0)
    tower = [{
      x: 0,
      z: 0,
      y: 0,
      w: INITIAL_SIZE,
      d: INITIAL_SIZE,
      color: getBlockColors(0)
    }];

    score = 0;
    perfectCombo = 0;
    musicalStep = -1;
    scoreTextEl.textContent = '0';
    comboTagEl.classList.remove('show', 'combo-fire', 'combo-ultra', 'combo-pop');

    cameraTargetY = 0;
    cameraY = 0;
    currentZoom = 1.0;
    targetZoom = 1.0;

    gameState = 'PLAYING';
    if (typeof setBgmTrack === 'function') setBgmTrack('gameplay');
    hideOverlays();
    updateHud();

    if (mode === 'STAGE') {
      const bannerBadge = $('banner-badge');
      const typeInfo = STAGE_TYPES[cfg.stageType] || STAGE_TYPES.standard;
      const typeName = (getLang() === 'ko') ? typeInfo.ko : typeInfo.name;
      if (bannerBadge) {
        bannerBadge.textContent = `${typeInfo.emoji} ${typeName.toUpperCase()}`;
        bannerBadge.className = 'stage-badge ' + (typeInfo.badgeCls || '');
      }
      if (cfg.stageType === 'boss') {
        renderBossCharacter(cfg.bossInfo);
        const bc = $('boss-container');
        if (bc) bc.style.display = 'block';
        bossFrenzy = false;
        const hud = $('hud-layer');
        if (hud) hud.style.opacity = '0';
        playBossIntro(cfg, () => {
          if (hud) hud.style.opacity = '1';
          setBossState('idle', `${cfg.bossInfo.name}: "${getBossQuote(cfg.bossInfo, 'quote')}"`, 2600);
          setMascot('excited', t('bossCheerMascot', { boss: cfg.bossInfo.name }));
          if (gameState === 'PLAYING') spawnNextBlock();
        });
      } else {
        if (typeof isBossIntroPlaying !== 'undefined') isBossIntroPlaying = false;
        const bio = $('boss-intro-overlay');
        if (bio) bio.style.display = 'none';
        const bc = $('boss-container');
        if (bc) bc.style.display = 'none';
        const bs = $('boss-speech');
        if (bs) bs.style.opacity = '0';
        if (cfg.stageType === 'speed') {
          setMascot('excited', t('timeAttackMascot'));
        } else if (cfg.stageType === 'precision') {
          setMascot('excited', t('precisionMascot'));
        } else if (cfg.stageType === 'hazard') {
          setMascot('excited', t('hazardMascot'));
        } else {
          setMascot('excited', getCompanionField(getSelectedCat(), 'quote'));
        }
        spawnNextBlock();
      }
    } else {
      setMascot('excited', t('endlessMascot'));
      spawnNextBlock();
    }
  }

  function spawnNextBlock() {
    const top = tower[tower.length - 1];
    const level = tower.length;
    const color = getBlockColors(level);

    // Alternating axes: odd = X, even = Z
    const axis = (level % 2 === 1) ? 'x' : 'z';
    const speed = Math.min(cfg.speed0 * (1 + level * cfg.accel), cfg.maxSpeed);
    const direction = (level % 4 === 1 || level % 4 === 2) ? 1 : -1;

    const startDist = 10.5;
    const posX = (axis === 'x') ? -startDist * direction : top.x;
    const posZ = (axis === 'z') ? -startDist * direction : top.z;

    let blockType = 'normal';
    if (cfg.ice) {
      blockType = 'ice';
    } else if (cfg.scratcher) {
      blockType = 'scratcher';
    } else if (cfg.melting && Math.random() < (cfg.meltingRate || 0.45)) {
      blockType = 'melting';
    } else if (cfg.anvil) {
      blockType = 'anvil';
    }

    activeBlock = {
      x: posX,
      z: posZ,
      y: top.y + 1,
      w: top.w,
      d: top.d,
      axis: axis,
      color: color,
      speed: speed,
      direction: direction,
      bound: 10.5,
      age: 0,
      phase: Math.random() * Math.PI * 2,
      blockType: blockType,
      meltTimer: (blockType === 'melting') ? (5.0 + (cfg.meltTimerBonus || 0)) : 0
    };
  }

  function handleTap() {
    if (isBossIntroPlaying) return;
    if (bonusActive) return;
    initAudio();
    const now = performance.now();

    if (gameState === 'GAMEOVER') {
      if (now - gameOverTime >= 700) retryCurrent();
      return;
    }

    if (gameState === 'PLAYING') {
      if (now - lastTapTime < 100) return;
      lastTapTime = now;

      if (!activeBlock) return;
      sliceActiveBlock();
    }
  }

  function finishPlacement(block) {
    cameraTargetY = block.y * BLOCK_HEIGHT_PX;
    if (mode === 'STAGE') {
      if (cfg.stageType === 'boss' && bossCurrentHp <= 0) {
        completeStage();
        return;
      }
      if (score >= cfg.target) {
        completeStage();
        return;
      }
    }
    updateHud();
    spawnNextBlock();
  }

  function spawnMissedPiece(missedBlock) {
    fallingPieces.push({
      x: missedBlock.x,
      z: missedBlock.z,
      y: missedBlock.y,
      w: missedBlock.w,
      d: missedBlock.d,
      hue: missedBlock.color.hue,
      color: missedBlock.color,
      vx: (missedBlock.axis === 'x') ? missedBlock.direction * 3 : 0,
      vy: 0,
      vz: (missedBlock.axis === 'z') ? missedBlock.direction * 3 : 0,
      rx: 0, ry: 0, rz: 0,
      vrx: (missedBlock.axis === 'z') ? -3.5 * missedBlock.direction : 0,
      vry: (Math.random() - 0.5) * 2,
      vrz: (missedBlock.axis === 'x') ? 3.5 * missedBlock.direction : 0
    });
  }

  function sliceActiveBlock() {
    const block = activeBlock;
    activeBlock = null;

    const top = tower[tower.length - 1];
    const axis = block.axis;
    const targetPos = (axis === 'x') ? top.x : top.z;

    // Active skill (Luna's Magnetic Snap)
    let isAutoSnap = false;
    if (typeof activeSkillReady !== 'undefined' && activeSkillReady) {
      activeSkillReady = false;
      activeSkillTimer = 16.0;
      isAutoSnap = true;
      if (axis === 'x') block.x = targetPos;
      else block.z = targetPos;
      spawn3DStarBurst(block.x, block.z, block.y, cameraY, 32, true, 3);
      spawnFloatingText(block.x, block.y + 1.2, block.z, (getLang() === 'ko' ? '🧲 자석 솜방망이 100%!' : '🧲 MAGNETIC SNAP! 100%'), '#00e5ff', true);
      playMarimbaNote(880, true);
      FirebaseTracker.logEvent('active_skill_used', {
        cat_id: save.selectedCat || 'luna',
        skill_name: 'magnetic_snap',
        stage_id: (typeof cfg !== 'undefined' && cfg) ? cfg.id : 0,
        game_mode: mode,
        score: score
      });
    }

    const currentPos = (axis === 'x') ? block.x : block.z;
    const diff = currentPos - targetPos;
    const sizeOnAxis = (axis === 'x') ? block.w : block.d;

    // Check PERFECT
    if (isAutoSnap || Math.abs(diff) <= PERFECT_TOLERANCE) {
      if (axis === 'x') block.x = targetPos;
      else block.z = targetPos;

      perfectCombo++;
      perfectTotal++;
      score++;
      musicalStep = (musicalStep + 1) % SCALE_FREQS.length;

      scoreTextEl.textContent = score;
      scoreTextEl.classList.remove('score-pop');
      void scoreTextEl.offsetWidth;
      scoreTextEl.classList.add('score-pop');

      // Impactful Streak Tier Handling
      let streakShake = 2.5;
      let particleCount = 20;
      let isStreakCombo = perfectCombo >= 2;

      if (perfectCombo === 1) {
        comboTagEl.classList.remove('combo-pop', 'show', 'combo-fire', 'combo-ultra');
        spawnFloatingText(block.x, block.y, block.z, `MEOWFECT! +1`, '#ffe082', true, { isStreak: false });
        spawnExpandRing(block.x, block.z, block.y, block.w * 1.06, block.d * 1.06);
      } else {
        comboTagEl.classList.remove('combo-pop');
        void comboTagEl.offsetWidth;
        comboTagEl.classList.add('combo-pop', 'show');

        if (perfectCombo === 2) {
          comboTagEl.textContent = `⚡ 2 STREAK!`;
          comboTagEl.classList.remove('combo-fire', 'combo-ultra');
          spawnFloatingText(block.x, block.y, block.z, `⚡ STREAK ×2! ⚡`, '#ffd700', true, { isStreak: true, streakLevel: 2 });
          spawnExpandRing(block.x, block.z, block.y, block.w * 1.15, block.d * 1.15);
          streakShake = 3.6;
          particleCount = 30;
        } else if (perfectCombo === 3) {
          comboTagEl.textContent = `🔥 3 SUPER STREAK!`;
          comboTagEl.classList.add('combo-fire');
          comboTagEl.classList.remove('combo-ultra');
          spawnFloatingText(block.x, block.y, block.z, `🔥 STREAK ×3! 🔥`, '#ffab00', true, { isStreak: true, streakLevel: 3 });
          spawnExpandRing(block.x, block.z, block.y, block.w * 1.25, block.d * 1.25);
          setTimeout(() => spawnExpandRing(block.x, block.z, block.y, block.w * 1.1, block.d * 1.1), 75);
          streakShake = 4.8;
          particleCount = 42;
        } else if (perfectCombo === 4) {
          comboTagEl.textContent = `🌟 4 MEGA STREAK!`;
          comboTagEl.classList.add('combo-fire');
          comboTagEl.classList.remove('combo-ultra');
          spawnFloatingText(block.x, block.y, block.z, `🌟 STREAK ×4! 🌟`, '#ffd700', true, { isStreak: true, streakLevel: 4 });
          spawnExpandRing(block.x, block.z, block.y, block.w * 1.32, block.d * 1.32);
          setTimeout(() => spawnExpandRing(block.x, block.z, block.y, block.w * 1.15, block.d * 1.15), 65);
          streakShake = 5.8;
          particleCount = 52;
        } else {
          comboTagEl.textContent = `👑 ${perfectCombo} ULTRA STREAK!`;
          comboTagEl.classList.remove('combo-fire');
          comboTagEl.classList.add('combo-ultra');
          spawnFloatingText(block.x, block.y, block.z, `👑 STREAK ×${perfectCombo}! 👑`, '#ff4081', true, { isStreak: true, streakLevel: perfectCombo });
          spawnExpandRing(block.x, block.z, block.y, block.w * 1.42, block.d * 1.42);
          setTimeout(() => spawnExpandRing(block.x, block.z, block.y, block.w * 1.22, block.d * 1.22), 60);
          setTimeout(() => spawnExpandRing(block.x, block.z, block.y, block.w * 1.08, block.d * 1.08), 120);
          streakShake = 7.0;
          particleCount = 64;
        }
      }

      flashOverlayEl.style.opacity = isStreakCombo ? '0.65' : '0.50';
      setTimeout(() => flashOverlayEl.style.opacity = '0', isStreakCombo ? 110 : 80);
      triggerShake(streakShake, isStreakCombo ? 0.12 : 0.08);

      spawn3DStarBurst(block.x, block.z, block.y, cameraY, particleCount, isStreakCombo, perfectCombo);
      playMarimbaNote(SCALE_FREQS[musicalStep], true);

      // Archetype handling for PERFECT placement
      if (mode === 'STAGE') {
        if (cfg.stageType === 'boss') {
          bossBlocksPlaced++;
          const dmg = getSelectedCat().roleWorld === 5 ? 3 : 2;
          bossCurrentHp = Math.max(0, bossCurrentHp - dmg);
          const bh = $('boss-hud');
          if (bh) { bh.classList.remove('boss-hit-anim'); void bh.offsetWidth; bh.classList.add('boss-hit-anim'); }
          spawnFloatingText(block.x, block.y + 1.2, block.z, `CRITICAL! -${dmg} HP 💥`, '#ffd700', true);
          if (bossCurrentHp <= 0) {
            const defQ = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'defeatQuote')) || (getLang() === 'ko' ? '😾 냐아아앙~~ 항복이다냥! 🏳️💦' : '😾 Meowch~~ I surrender, meow! 🏳️💦');
            setBossState('defeat', defQ);
            tower.push({ x: block.x, z: block.z, y: block.y, w: block.w, d: block.d, color: block.color, blockType: block.blockType, meltTimer: block.meltTimer });
            finishPlacement(block);
            return;
          } else if (bossCurrentHp <= bossMaxHp * 0.5 && !bossFrenzy) {
            bossFrenzy = true;
            triggerShake(3.5, 0.2);
            const freQ = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'frenzyQuote')) || (getLang() === 'ko' ? '😾 감히 내 털을 뽑다니... 진심 모드다냥! 🔥' : '😾 Furious Serious Mode, meow! 🔥');
            setBossState('frenzy', freQ, 2500);
            setMascot('excited', t('bossEnragedMascot', { boss: cfg.bossInfo.name }), 1200);
            FirebaseTracker.logEvent('boss_frenzy_entered', {
              stage_id: cfg.id,
              boss_name: (cfg.bossInfo && cfg.bossInfo.name) || 'Boss',
              remaining_hp: bossCurrentHp,
              max_hp: bossMaxHp
            });
          } else {
            const q = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'hurtQuote')) || getRandomBossHurtQuote();
            setBossState('hurt', q, 1300);
          }
        } else if (cfg.stageType === 'speed') {
          timeRemaining = Math.min(cfg.timeLimit + 6, timeRemaining + 2.0);
          spawnFloatingText(block.x, block.y + 0.8, block.z, `+2.0s! ⏱️`, '#69f0ae', true);
        } else if (cfg.stageType === 'precision') {
          if (perfectCombo >= cfg.streakTarget && !precisionStreakAchieved) {
            precisionStreakAchieved = true;
            spawnFloatingText(block.x, block.y + 0.8, block.z, `STREAK GOAL! ⭐`, '#ffd700', true);
            setMascot('happy', t('streakGoalMascot'), 1000);
          }
        }
      }

      // Ketchapp Stack Signature Size Expansion (combo threshold depends on stage)
      if (perfectCombo >= cfg.expandAt) {
        if (block.w < INITIAL_SIZE || block.d < INITIAL_SIZE) {
          const expandAmt = cfg.expandAmt;
          block.w = Math.min(block.w + expandAmt, INITIAL_SIZE);
          block.d = Math.min(block.d + expandAmt, INITIAL_SIZE);
          spawnExpandRing(block.x, block.z, block.y, block.w, block.d);
          playSizeExpandChime();
          spawnFloatingText(block.x, block.y + 0.8, block.z, `SIZE UP! ✨`, '#ff80ab', true);
          setMascot('happy', `SIZE UP! 💖 (+${perfectCombo})`, 800);
          FirebaseTracker.logEvent('expand_ring_triggered', {
            streak_count: perfectCombo,
            stage_id: (typeof cfg !== 'undefined' && cfg) ? cfg.id : 0,
            game_mode: mode,
            new_width: Number(block.w.toFixed(2)),
            new_depth: Number(block.d.toFixed(2))
          });
        } else {
          setMascot('happy', `COMBO ×${perfectCombo}! 🔥`, 800);
        }
      } else {
        const msg = perfectCombo >= 2 ? `COMBO ×${perfectCombo}! 🔥` : `NICE! 🐾`;
        setMascot('happy', msg, 700);
      }

      const placedBlock = {
        x: block.x,
        z: block.z,
        y: block.y,
        w: block.w,
        d: block.d,
        color: block.color,
        blockType: block.blockType,
        meltTimer: block.meltTimer
      };
      tower.push(placedBlock);

      if (block.blockType === 'melting') {
        meltingBlocks.push(placedBlock);
      }
      if (cfg && cfg.tilt) {
        towerTiltTargetX *= 0.5;
        towerTiltTargetZ *= 0.5;
      }
      if (typeof climbingKitten !== 'undefined' && cfg.stageType !== 'boss') {
        climbingKitten.isJumping = true;
        climbingKitten.jumpProgress = 0;
        climbingKitten.targetY = block.y;
        climbingKitten.state = 'loaf'; // Loaf on Meowfect
      }

      finishPlacement(block);
      return;
    }

    // Overlap Calculation
    const overlap = sizeOnAxis - Math.abs(diff);

    if (overlap <= 0) {
      triggerGameOver(block);
      return;
    }

    // Perfectionist Challenge: Imperfect placement fails stage!
    if (cfg && cfg.perfectionist) {
      triggerGameOver(block, (getLang() === 'ko' ? '퍼펙트 안착 실패! 🎯' : 'PERFECT MISSED! 🎯'));
      return;
    }

    perfectCombo = 0;
    comboTagEl.classList.remove('show', 'combo-fire', 'combo-ultra', 'combo-pop');
    score++;
    musicalStep = -1;
    scoreTextEl.textContent = score;

    playNormalTap();
    playSliceWhoosh();
    playMarimbaNote(SCALE_FREQS[0], false);
    const praise = CAT_PRAISES[Math.floor(Math.random() * CAT_PRAISES.length)];
    setMascot('clap', praise, 700);

    spawnFloatingText(block.x, block.y, block.z, `+1 🐾`, '#ffffff', false);

    // Archetype handling for NORMAL placement
    if (mode === 'STAGE') {
      if (cfg.stageType === 'boss') {
        bossBlocksPlaced++;
        const dmg = 1;
        bossCurrentHp = Math.max(0, bossCurrentHp - dmg);
        const bh = $('boss-hud');
        if (bh) { bh.classList.remove('boss-hit-anim'); void bh.offsetWidth; bh.classList.add('boss-hit-anim'); }
        spawnFloatingText(block.x, block.y + 0.8, block.z, `-${dmg} HP`, '#ff8a80', false);
        if (bossCurrentHp <= 0) {
          const defQ = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'defeatQuote')) || (getLang() === 'ko' ? '😾 냐아아앙~~ 항복이다냥! 🏳️💦' : '😾 Meowch~~ I surrender, meow! 🏳️💦');
          setBossState('defeat', defQ);
        } else if (bossCurrentHp <= bossMaxHp * 0.5 && !bossFrenzy) {
          bossFrenzy = true;
          triggerShake(3.5, 0.2);
          const freQ = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'frenzyQuote')) || (getLang() === 'ko' ? '😾 감히 내 털을 뽑다니... 진심 모드다냥! 🔥' : '😾 Furious Serious Mode, meow! 🔥');
          setBossState('frenzy', freQ, 2500);
          setMascot('excited', t('bossEnragedMascot', { boss: cfg.bossInfo.name }), 1200);
        } else {
          const q = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'smugQuote')) || getRandomBossSmugQuote();
          setBossState('smug', q, 1400);
        }
      } else if (cfg.stageType === 'speed') {
        timeRemaining = Math.min(cfg.timeLimit + 6, timeRemaining + 0.6);
        spawnFloatingText(block.x, block.y + 0.8, block.z, `+0.6s! ⏱️`, '#b9f6ca', false);
      }
    }

    // Stage "shrink" modifier: imperfect placements lose extra width (never below 0.8 / the real overlap)
    const keptAlong = cfg.shrink > 0
      ? Math.max(Math.min(overlap, 0.8), overlap - cfg.shrink)
      : overlap;
    const newW = (axis === 'x') ? keptAlong : block.w;
    const newD = (axis === 'z') ? keptAlong : block.d;
    const newCenter = targetPos + diff / 2;

    const keptX = (axis === 'x') ? newCenter : block.x;
    const keptZ = (axis === 'z') ? newCenter : block.z;

    const placedNormalBlock = {
      x: keptX,
      z: keptZ,
      y: block.y,
      w: newW,
      d: newD,
      color: block.color,
      blockType: block.blockType,
      meltTimer: block.meltTimer
    };
    tower.push(placedNormalBlock);

    if (block.blockType === 'melting') {
      meltingBlocks.push(placedNormalBlock);
    }
    if (cfg && cfg.tilt) {
      const tiltFactor = (1 - (cfg.tiltDampen || 0));
      if (axis === 'x') towerTiltTargetX += (diff * 0.045) * tiltFactor;
      else towerTiltTargetZ += (diff * 0.045) * tiltFactor;
    }
    if (typeof climbingKitten !== 'undefined' && cfg.stageType !== 'boss') {
      climbingKitten.isJumping = true;
      climbingKitten.jumpProgress = 0;
      climbingKitten.targetY = block.y;
      if (overlap < 2.5) {
        climbingKitten.state = 'wobble';
        climbingKitten.wobblePhase = 0;
      } else {
        climbingKitten.state = 'idle';
      }
    }

    // Sliced overhang piece (3D physics)
    const sliceSize = Math.abs(diff);
    const sliceW = (axis === 'x') ? sliceSize : block.w;
    const sliceD = (axis === 'z') ? sliceSize : block.d;
    const sliceSign = (diff > 0) ? 1 : -1;
    const sliceCenter = (axis === 'x')
      ? keptX + (overlap / 2 + sliceSize / 2) * sliceSign
      : keptZ + (overlap / 2 + sliceSize / 2) * sliceSign;

    const sliceX = (axis === 'x') ? sliceCenter : keptX;
    const sliceZ = (axis === 'z') ? sliceCenter : keptZ;

    // Torque & angular velocity about the cut edge
    const angVel = (sliceSign > 0) ? 4.2 : -4.2;
    fallingPieces.push({
      x: sliceX,
      z: sliceZ,
      y: block.y,
      w: sliceW,
      d: sliceD,
      hue: block.color.hue,
      color: block.color,
      vx: (axis === 'x') ? sliceSign * 1.8 : 0,
      vy: 0,
      vz: (axis === 'z') ? sliceSign * 1.8 : 0,
      rx: 0,
      ry: 0,
      rz: 0,
      vrx: (axis === 'z') ? -angVel : 0,
      vry: (Math.random() - 0.5) * 1.5,
      vrz: (axis === 'x') ? angVel : 0
    });

    if (mode === 'STAGE' && cfg.stageType === 'boss' && bossCurrentHp <= 0) {
      finishPlacement(block);
      return;
    }

    finishPlacement(block);
  }

  function panOutCamera() {
    targetZoom = Math.max(0.48, 1.0 - (tower.length * 0.012));
    cameraTargetY = (tower.length * 0.52) * BLOCK_HEIGHT_PX;
  }

  function completeStage() {
    gameState = 'CLEAR';
    skyCelebration = 1.0;
    updateHud();
    let stars;
    if (cfg.stageType === 'bonus') {
      stars = bonusScore >= 150 ? 3 : (bonusScore >= 60 ? 2 : 1);
    } else if (cfg.stageType === 'boss') {
      // Boss battle star rating: Speed / Efficiency bonus!
      // Quick, high-combo victory with critical Meowfect hits earns higher stars.
      const blocksUsed = Math.max(1, bossBlocksPlaced);
      const minPossibleBlocks = Math.ceil(cfg.target / 2); // all critical hits
      const ratio = minPossibleBlocks / blocksUsed;
      if (ratio >= 0.70 || blocksUsed <= minPossibleBlocks + 3) {
        stars = 3; // Rapid boss knockout with mostly Meowfect critical hits
      } else if (ratio >= 0.45 || blocksUsed <= minPossibleBlocks + 8) {
        stars = 2; // Decent speed boss knockout
      } else {
        stars = 1; // Defeated boss with slow/normal chip damage
      }
    } else {
      const ratio = perfectTotal / cfg.target;
      stars = ratio >= 0.4 ? 3 : (ratio >= 0.2 ? 2 : 1);
    }
    const prev = starsOf(cfg.id);
    const improved = stars > prev;
    if (improved) {
      save.stars[cfg.id] = stars;
    }
    delete save.fails[cfg.id];
    persist();

    FirebaseTracker.log(`Stage clear: ${cfg.id} (${cfg.label}) with ${stars} stars`);
    FirebaseTracker.logEvent('stage_clear', {
      stage_id: cfg.id,
      stage_label: cfg.label,
      world_name: cfg.worldName,
      stage_type: cfg.stageType || 'normal',
      stars_earned: stars,
      perfect_ratio: Number((perfectTotal / (cfg.target || 1)).toFixed(2)),
      companion: save.selectedCat || 'shiro',
      bonus_score: cfg.stageType === 'bonus' ? bonusScore : 0
    });

    panOutCamera();
    playSizeExpandChime();
    playStageClearCat(stars);
    const top = tower[tower.length - 1];
    if (top) {
      for (let k = 0; k < 5; k++) {
        setTimeout(() => {
          if (gameState === 'CLEAR') {
            spawn3DStarBurst(top.x, top.z, top.y, cameraY, 22);
            playMarimbaNote(SCALE_FREQS[Math.min(15, 6 + k * 2)], true);
          }
        }, k * 180);
      }
    }
    setMascot('celebrate', stars === 3 ? t('purrfectCatTower') : t('stageClearMascot'), 3000);
    if (cfg.stageType === 'boss') {
      const defQ = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'defeatQuote')) || (getLang() === 'ko' ? '😾 냐아아앙~~ 항복이다냥! 🏳️💦' : '😾 Meowch~~ I surrender, meow! 🏳️💦');
      setBossState('defeat', defQ);
    }

    // Boss Defeat Reward: Gacha Ticket!
    if (cfg.boss) {
      save.gachaTickets = (save.gachaTickets || 0) + 1;
      persist();
      FirebaseTracker.logEvent('ticket_earned', {
        source: 'boss_defeat',
        amount: 1,
        total_tickets: save.gachaTickets,
        stage_id: cfg.id
      });
      showToast(getLang() === 'ko' ? '👑 보스 격파 보상! 🎟️ 냥이 가챠 티켓 1장 획득!' : '👑 Boss Defeated! +1 🎟️ Gacha Ticket!');
    }

    // Bonus Stage Reward: Churu Coins + 3-star ticket!
    if (cfg.stageType === 'bonus') {
      if (bonusStageHadPastRecord) {
        // Fail-safe guard: If this bonus stage was already played in the past, NO additional rewards are added!
        showToast(getLang() === 'ko' ? '이미 완료된 보너스 스테이지로 추가 보상이 지급되지 않습니다냥! 🔒' : 'Bonus stage already completed. No additional rewards given! 🔒');
      } else {
        save.bonusChuruEarned = save.bonusChuruEarned || {};
        save.churu = (save.churu || 0) + bonusScore;
        save.bonusChuruEarned[cfg.id] = bonusScore;
        updateChuruDisplays();
        FirebaseTracker.logEvent('churu_earned', {
          source: 'bonus_stage',
          amount: bonusScore,
          total_churu: save.churu,
          stage_id: cfg.id
        });
        if (stars === 3) {
          if (prev < 3) {
            save.gachaTickets = (save.gachaTickets || 0) + 1;
            FirebaseTracker.logEvent('ticket_earned', {
              source: 'three_star_clear',
              amount: 1,
              total_tickets: save.gachaTickets,
              stage_id: cfg.id
            });
            showToast(getLang() === 'ko' ? `🎉 3성 달성! 🎟️ 가챠 티켓 1장 & +${bonusScore} 츄르 획득!` : `🎉 3-Star Purr-fect! +1 🎟️ Ticket & +${bonusScore} Churu!`);
          } else {
            showToast(getLang() === 'ko' ? `🎉 3성 달성! +${bonusScore} 츄르 획득!` : `🎉 3-Star Purr-fect! +${bonusScore} Churu!`);
          }
        } else {
          showToast(getLang() === 'ko' ? `+${bonusScore} 츄르 코인 획득!` : `+${bonusScore} Churu coins earned!`);
        }
        save.bonusPlayed = save.bonusPlayed || {};
        save.bonusPlayed[cfg.id] = true;
        persist();
      }
    }

    const isLast = cfg.id >= TOTAL_STAGES - 1;
    let next = cfg.id + 1;
    while (next < TOTAL_STAGES && isBonusStageAlreadyPlayed(next)) {
      next++;
    }
    const isKo = getLang() === 'ko';
    $('clear-title').textContent = isLast
      ? (isKo ? '올 클리어!' : 'ALL CLEAR!')
      : (cfg.boss
          ? (isKo ? '보스 격파!' : 'BOSS CLEAR!')
          : (cfg.stageType === 'bonus'
              ? (isKo ? '피버 클리어!' : 'FEVER CLEAR!')
              : (isKo ? '스테이지 클리어!' : 'STAGE CLEAR!')));
    $('clear-stage').textContent = `${cfg.label} · ${cfg.worldName}`;

    if (cfg.stageType === 'bonus') {
      if (bonusStageHadPastRecord) {
        $('clear-stats').innerHTML = `<div class="clear-stat-pill">${isKo ? '🔒 이미 완료된 보너스' : '🔒 Already Completed'}</div>`;
      } else {
        $('clear-stats').innerHTML = `
          <div class="reward-chips-row">
            <div class="reward-chip-card churu-card">
              <img src="assets/reward_churu.png" class="reward-chip-img" alt="Churu">
              <div class="reward-chip-text">
                <span class="reward-chip-val">+${bonusScore}</span>
                <span class="reward-chip-lbl">${isKo ? '츄르' : 'Churu'}</span>
              </div>
            </div>
            ${(stars === 3 && prev < 3) ? `
            <div class="reward-chip-card ticket-card">
              <img src="assets/reward_ticket.png" class="reward-chip-img" alt="Ticket">
              <div class="reward-chip-text">
                <span class="reward-chip-val">+1</span>
                <span class="reward-chip-lbl">${isKo ? '가챠 티켓' : 'Ticket'}</span>
              </div>
            </div>` : ''}
          </div>
        `;
      }
    } else if (cfg.stageType === 'boss') {
      const blocksUsed = Math.max(1, bossBlocksPlaced);
      $('clear-stats').innerHTML = `
        <div class="clear-paw-card boss-paw-card clear-stat-pill">
          <div class="clear-paw-icon-badge boss-icon">
            👑
          </div>
          <div class="clear-paw-data">
            <span class="clear-paw-title">${isKo ? '보스 격파 달성' : 'BOSS KNOCKOUT'}</span>
            <div class="clear-paw-score-row">
              <span class="clear-paw-num">${blocksUsed}</span>
              <span class="clear-paw-target" style="font-size:16px; margin-left:2px;">${isKo ? '블록만으로 성공!' : 'Blocks Used!'}</span>
              ${improved && prev > 0 ? `<span class="clear-paw-new-pill">★ NEW</span>` : ''}
            </div>
          </div>
        </div>
      `;
    } else {
      $('clear-stats').innerHTML = `
        <div class="clear-paw-card clear-stat-pill">
          <div class="clear-paw-icon-badge">
            <img src="assets/badge_paw_glow.png" class="clear-paw-badge-img" alt="Meowfect">
          </div>
          <div class="clear-paw-data">
            <span class="clear-paw-title">${isKo ? '묘펙트 달성' : 'MEOWFECT'}</span>
            <div class="clear-paw-score-row">
              <span class="clear-paw-num">${perfectTotal}</span>
              <span class="clear-paw-sep">/</span>
              <span class="clear-paw-target">${cfg.target}</span>
              ${improved && prev > 0 ? `<span class="clear-paw-new-pill">★ NEW</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    let note = '';
    const nextBtn = $('btn-next');
    const replayBtn = $('btn-retry-clear');
    const menuBtn = $('btn-menu-clear');
    if (nextBtn) nextBtn.setAttribute('aria-label', isKo ? '다음 ▶' : 'Next ▶');
    if (replayBtn) {
      replayBtn.style.display = (cfg.stageType === 'bonus') ? 'none' : 'inline-flex';
      replayBtn.setAttribute('aria-label', isKo ? '다시하기' : 'Replay');
    }
    if (menuBtn) menuBtn.setAttribute('aria-label', isKo ? '스테이지' : 'Stages');

    if (next >= TOTAL_STAGES) {
      note = t('clearAllNote');
      nextBtn.style.display = 'none';
    } else if (!isUnlocked(next)) {
      note = t('needStarsNote', { gate: gateFor(next), cur: totalStars() });
      nextBtn.style.display = 'none';
    } else {
      const nextInfo = getStageWorldInfo(next);
      if (nextInfo.idx === 0) note = t('newWorldUnlocked', { name: WORLD_DEFS[nextInfo.world].name });
      nextBtn.style.display = 'inline-flex';
    }
    $('clear-note').textContent = note;

    setTimeout(() => {
      if (gameState === 'CLEAR') {
        openModalAnim(clearScreenEl);
        animateClearStars(stars);
      }
    }, 1100);
  }

  function triggerGameOver(missedBlock, reason = null) {
    gameState = 'GAMEOVER';
    gameOverTime = performance.now();
    playGameOverChord();
    triggerShake(4.5, 0.25);
    updateHud();

    // Entire missed block plunges down
    if (missedBlock) spawnMissedPiece(missedBlock);

    // Ketchapp Stack Cinematic Pan-Out View
    panOutCamera();

    let isNewBest = false;
    if (mode === 'ENDLESS') {
      isNewBest = score > bestScore;
      if (isNewBest) {
        bestScore = score;
        localStorage.setItem('stackTowerBest', bestScore);
        setMascot('celebrate', (getLang() === 'ko') ? '대박!! 새로운 최고 기록이다냥!! 👑🐟' : 'WOAH!! New high score, meow!! 👑🐟', 2500);
      } else {
        setMascot('sad', (getLang() === 'ko') ? '으앙! 타워가 와르르 무너졌다냥... 😿' : 'Oh no! The tower tumbled down... 😿');
      }
      gameoverTitleEl.textContent = t('gameOver');
      gameoverStageEl.textContent = '';
      bestRowEl.style.display = 'block';
      FirebaseTracker.log(`Endless game over at score ${score}`);
      FirebaseTracker.logEvent('endless_gameover', {
        score: score,
        best_score: bestScore,
        is_new_best: isNewBest,
        companion: save.selectedCat || 'shiro'
      });
    } else {
      save.fails[cfg.id] = (save.fails[cfg.id] || 0) + 1;
      persist();
      FirebaseTracker.log(`Stage failed: ${cfg.id} (${cfg.label}) score ${score}/${cfg.target}`);
      FirebaseTracker.logEvent('stage_failed', {
        stage_id: cfg.id,
        stage_label: cfg.label,
        world_name: cfg.worldName,
        stage_type: cfg.stageType || 'normal',
        reached_score: score,
        target_score: cfg.target,
        fail_count: save.fails[cfg.id] || 1,
        companion: save.selectedCat || 'shiro',
        reason: reason || 'miss'
      });
      if (cfg.stageType === 'boss') {
        setMascot('sad', (getLang() === 'ko') ? '보스가 너무 강력했다냥... 다음엔 꼭 이기자! 😿' : 'The boss was too powerful, meow... Let\'s win next time! 😿');
        gameoverTitleEl.textContent = (getLang() === 'ko') ? '보스전 패배' : 'BOSS DEFEAT';
        gameoverStageEl.textContent = t('defeatedBy', { boss: cfg.bossInfo.name });
        const vicQ = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'victoryQuote')) || (getLang() === 'ko' ? '😹 음하하하! 역시 이 몸의 캣타워가 최고다냥! 👑🐟' : '😹 Mwahaha! My cat tower is the greatest, meow! 👑🐟');
        setBossState('victory', vicQ);
      } else if (reason) {
        setMascot('sad', (getLang() === 'ko') ? '시간이 다 됐다냥... 다음엔 더 서둘러보자! ⏱️😿' : 'Time ran out, meow... Let\'s move faster next time! ⏱️😿');
        gameoverTitleEl.textContent = reason;
        gameoverStageEl.textContent = `${cfg.emoji} STAGE ${cfg.label} · ${t('targetLabel', { target: cfg.target })}`;
      } else {
        setMascot('sad', (getLang() === 'ko') ? `앞으로 ${cfg.target - score}층 남았는데... 😿 다시 도전하자!` : `Just ${cfg.target - score} more floors to go... 😿 Try again!`);
        gameoverTitleEl.textContent = t('stageFailed', { n: score, target: cfg.target });
        gameoverStageEl.textContent = `${cfg.emoji} STAGE ${cfg.label} · ${t('targetLabel', { target: cfg.target })}`;
      }
      bestRowEl.style.display = 'none';
    }

    gameoverScoreEl.textContent = score;
    gameoverBestEl.textContent = bestScore;
    newBestPillEl.style.display = isNewBest ? 'inline-block' : 'none';

    setTimeout(() => {
      if (gameState === 'GAMEOVER') openModalAnim(gameoverScreenEl);
    }, 750);
  }

  // Global Touch Particle Ripple & Tactile Sound for UI
  function spawnUiTapEffect(x, y) {
    try {
      if (!x && !y) return;
      const ripple = document.createElement('div');
      ripple.className = 'ui-tap-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 360);
    } catch (e) {}
  }

  window.addEventListener('pointerdown', (e) => {
    try {
      const target = e.target;
      if (!target || !target.closest) return;
      const interactive = target.closest('button, .menu-btn, .dock-btn, .stage-btn, .companion-card, .ready-chip, .small-btn, .settings-lang-btn, .settings-reset-btn, .close-icon-btn, [data-ui]');
      if (interactive) {
        spawnUiTapEffect(e.clientX, e.clientY);
        playUiTap(1.0 + (Math.random() * 0.16 - 0.08));
        triggerHaptic(8);
      }
    } catch (err) {}
  }, { capture: true, passive: true });

  window.addEventListener('pointerdown', (e) => {
    if (e.target.closest && e.target.closest('[data-ui]')) return;
    e.preventDefault();
    if (gameState === 'PLAYING' && activeBlock && activeBlock.blockType === 'anvil') {
      isPointerHolding = true;
      holdStartTime = performance.now();
      return;
    }
    handleTap();
  }, { passive: false });

  window.addEventListener('pointerup', (e) => {
    if (isPointerHolding) {
      isPointerHolding = false;
      handleTap();
    }
  });

  // --- ANIMATION LOOP (Delta-time) ---
  let lastTime = performance.now();

  function animate(time) {
    requestAnimationFrame(animate);

    let dt = (time - lastTime) / 1000;
    lastTime = time;
    if (dt > 0.1) dt = 0.1;
    if (dt <= 0) return;

    // -------------------------------------------------------------
    // Rule 0: Speed Rush Countdown Timer
    // -------------------------------------------------------------
    if (gameState === 'PLAYING' && mode === 'STAGE' && cfg.stageType === 'speed') {
      timeRemaining -= dt;
      const curSec = Math.ceil(timeRemaining);
      if (timeRemaining <= 5.0 && curSec !== lastTickSecond && timeRemaining > 0) {
        lastTickSecond = curSec;
        playMarimbaNote(523.25, false);
      }
      if (timeRemaining <= 0) {
        timeRemaining = 0;
        updateHud();
        triggerGameOver(activeBlock || tower[tower.length - 1], 'TIME OVER! ⏰');
        return;
      }
      updateHud();
    }

    // Melting blocks timer countdown & sink
    if (typeof meltingBlocks !== 'undefined' && meltingBlocks.length > 0) {
      for (let mIdx = meltingBlocks.length - 1; mIdx >= 0; mIdx--) {
        const mb = meltingBlocks[mIdx];
        mb.meltTimer -= dt;
        if (mb.meltTimer <= 0) {
          meltingBlocks.splice(mIdx, 1);
          const tIdx = tower.indexOf(mb);
          if (tIdx > 0) {
            spawn3DStarBurst(mb.x, mb.z, mb.y, cameraY, 16);
            spawnFloatingText(mb.x, mb.y, mb.z, (getLang() === 'ko' ? '녹아내림! 🍦💦' : 'MELTED! 🍦💦'), '#ff80ab', false);
            tower.splice(tIdx, 1);
            for (let up = tIdx; up < tower.length; up++) {
              tower[up].y -= 1;
            }
            if (activeBlock) activeBlock.y -= 1;
            if (typeof climbingKitten !== 'undefined') climbingKitten.targetY = Math.max(0, climbingKitten.targetY - 1);
            triggerShake(2.5, 0.1);
          }
        }
      }
    }

    // Tilt Balance check
    if (cfg && cfg.tilt) {
      towerTiltX += (towerTiltTargetX - towerTiltX) * Math.min(1, dt * 3.5);
      towerTiltZ += (towerTiltTargetZ - towerTiltZ) * Math.min(1, dt * 3.5);
      if (Math.abs(towerTiltX) > 0.24 || Math.abs(towerTiltZ) > 0.24) {
        triggerGameOver(activeBlock || tower[tower.length - 1], (getLang() === 'ko' ? '타워 균형 붕괴! ⚖️' : 'TOWER TILT COLLAPSE! ⚖️'));
        return;
      }
    }

    // Active skill cooldown update (Luna: Magnetic Snap)
    if (cfg && cfg.hasActiveSkill && !activeSkillReady) {
      activeSkillTimer -= dt;
      if (activeSkillTimer <= 0) {
        activeSkillReady = true;
        setMascot('excited', (getLang() === 'ko' ? '자석 솜방망이 준비 완료다냥! 🧲' : 'Magnetic paw ready, meow! 🧲'), 2500);
        playMarimbaNote(880, true);
        updateHud();
      }
    }

    // -------------------------------------------------------------
    // DYNAMIC ATMOSPHERIC SKY SYSTEM (Rules tied to Game Play)
    // -------------------------------------------------------------
    // Rule 1: Altitude Progress towards Goal (or 24-floor Endless cycle)
    const targetGoal = (mode === 'STAGE' && cfg && cfg.target) ? cfg.target : 30;
    let targetProg = 0;
    if (mode === 'STAGE') {
      targetProg = Math.min(1.0, tower.length / Math.max(1, targetGoal));
    } else {
      // Endless Mode: climbs through 24-floor atmospheric cycles
      targetProg = (tower.length % 24) / 24;
    }

    // Rule 3: Player Mastery & Perfect Combo Fever
    const targetFever = Math.min(1.0, perfectCombo / 5.5);
    const targetCeleb = (gameState === 'CLEAR') ? 1.0 : 0.0;

    // Smooth Exponential Lerp (silky frame-by-frame blending)
    skyProgress += (targetProg - skyProgress) * Math.min(1, dt * 2.6);
    skyFever += (targetFever - skyFever) * Math.min(1, dt * 3.6);
    skyCelebration += (targetCeleb - skyCelebration) * Math.min(1, dt * 1.8);

    // Rule 2: World Theme Affinity + Chromatic Altitude Drift
    const baseH = (typeof hueBase !== 'undefined') ? hueBase : 325;
    const altitudeHueShift = skyProgress * 62;
    const targetH = (baseH + altitudeHueShift) % 360;

    let dH = targetH - skyHue;
    if (dH > 180) dH -= 360;
    if (dH < -180) dH += 360;
    skyHue = (skyHue + dH * Math.min(1, dt * 2.4) + 360) % 360;

    const satTop = 32 + skyProgress * 22 + skyFever * 15 + skyCelebration * 20;
    const lightTop = 13 + skyProgress * 9 + skyFever * 6 + skyCelebration * 14;

    const satBot = 42 + skyProgress * 18 + skyFever * 12 + skyCelebration * 15;
    const lightBot = 8 + skyProgress * 5 + skyCelebration * 8;

    const currentTopHue = skyHue;
    const currentBotHue = (skyHue + 38 + skyProgress * 14) % 360;

    const bgTop = `hsl(${currentTopHue.toFixed(1)}, ${satTop.toFixed(1)}%, ${lightTop.toFixed(1)}%)`;
    const bgBot = `hsl(${currentBotHue.toFixed(1)}, ${satBot.toFixed(1)}%, ${lightBot.toFixed(1)}%)`;

    // Dynamic resize check if window or DPR changes (e.g. tablet orientation, split-screen)
    if (typeof handleResize === 'function' && (window.innerWidth !== viewW || window.innerHeight !== viewH)) {
      handleResize();
    }

    const skyCtx = bgCtx || ctx;

    // Ensure 100% deterministic high-DPI transform every single frame across WebKit / Safari
    if (bgCanvas && bgCtx) {
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Primary Atmosphere Radial Gradient
    const bgGrad = skyCtx.createRadialGradient(
      viewW * 0.5, viewH * 0.32, 15,
      viewW * 0.5, viewH * 0.55, Math.max(viewW, viewH)
    );
    bgGrad.addColorStop(0, bgTop);
    bgGrad.addColorStop(1, bgBot);
    skyCtx.fillStyle = bgGrad;
    skyCtx.fillRect(0, 0, viewW, viewH);

    // 2. High-Altitude Aurora Bloom & Combo Radiance Glow
    const auroraIntensity = Math.min(1.0, (skyProgress * 0.35 + skyFever * 0.45 + skyCelebration * 0.75));
    if (auroraIntensity > 0.04) {
      const auroraHue = (skyHue + 55 + Math.sin(time / 2000) * 15) % 360;
      const auroraGrad = skyCtx.createRadialGradient(
        viewW * 0.5, viewH * (0.28 - skyProgress * 0.08), 20,
        viewW * 0.5, viewH * 0.36, viewW * 0.88
      );
      auroraGrad.addColorStop(0, `hsla(${auroraHue}, 92%, 72%, ${auroraIntensity * 0.28})`);
      auroraGrad.addColorStop(0.45, `hsla(${(auroraHue + 25) % 360}, 85%, 62%, ${auroraIntensity * 0.12})`);
      auroraGrad.addColorStop(1, `hsla(${skyHue}, 80%, 45%, 0)`);
      skyCtx.fillStyle = auroraGrad;
      skyCtx.fillRect(0, 0, viewW, viewH);
    }

    // 3. Celestial Crescent Moon & Moon Halo (Revealed as tower ascends)
    if (skyProgress > 0.18) {
      const moonAlpha = Math.min(0.85, (skyProgress - 0.18) * 1.3 + skyCelebration * 0.2);
      const moonX = viewW * 0.82;
      const moonY = viewH * 0.16;
      const moonR = 18;

      skyCtx.save();
      // Moon Soft Aura
      const moonHalo = skyCtx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 3.2);
      moonHalo.addColorStop(0, `rgba(255, 248, 220, ${moonAlpha * 0.32})`);
      moonHalo.addColorStop(0.5, `rgba(255, 220, 180, ${moonAlpha * 0.12})`);
      moonHalo.addColorStop(1, 'rgba(255, 220, 180, 0)');
      skyCtx.fillStyle = moonHalo;
      skyCtx.beginPath();
      skyCtx.arc(moonX, moonY, moonR * 3.2, 0, Math.PI * 2);
      skyCtx.fill();

      // Delicate Golden Crescent Moon (Dual-arc path, no destructive compositing)
      skyCtx.fillStyle = `rgba(255, 245, 210, ${moonAlpha * 0.92})`;
      skyCtx.beginPath();
      skyCtx.arc(moonX, moonY, moonR, -Math.PI * 0.42, Math.PI * 0.42, false);
      skyCtx.arc(moonX + moonR * 0.42, moonY, moonR * 0.82, Math.PI * 0.42, -Math.PI * 0.42, true);
      skyCtx.closePath();
      skyCtx.fill();
      skyCtx.restore();
    }

    // 4. Celestial Twinkling Stars (Altitude-dependent brilliance)
    const starGlobalAlpha = Math.min(1.0, Math.max(0.12, skyProgress * 0.92 + 0.12 + skyFever * 0.2));
    skyCtx.save();
    for (let s of CELESTIAL_STARS) {
      const twinkle = 0.55 + 0.45 * Math.sin(time / 1000 * s.twinkleSpd + s.phase);
      const starAlpha = starGlobalAlpha * twinkle;
      if (starAlpha <= 0.05) continue;

      const sx = s.xRatio * viewW;
      const sy = s.yRatio * viewH;
      skyCtx.fillStyle = s.isGold ? `rgba(255, 225, 140, ${starAlpha})` : `rgba(255, 255, 255, ${starAlpha * 0.85})`;
      skyCtx.beginPath();
      skyCtx.arc(sx, sy, s.r * (0.8 + 0.3 * twinkle), 0, Math.PI * 2);
      skyCtx.fill();
    }
    skyCtx.restore();

    // Background floating cat items
    updateFloatingItems(dt);
    drawFloatingItems(skyCtx);

    // Clear entire game canvas buffer for transparent background behind 3D tower
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (gameState === 'PLAYING' && mode === 'STAGE' && cfg.stageType === 'bonus') {
      updateBonusGame(dt, time);
      drawBonusGame(ctx, time);
      return;
    }

    // Screen shake
    ctx.save();
    swayAmp += ((gameState === 'PLAYING' ? cfg.sway : 0) - swayAmp) * 0.08;
    if (swayAmp > 0.05) ctx.translate(Math.sin(time / 1000 * 1.3) * swayAmp, 0);
    if (screenShakeTime > 0) {
      screenShakeTime -= dt;
      const sx = (Math.random() - 0.5) * screenShakeMag * 2;
      const sy = (Math.random() - 0.5) * screenShakeMag * 2;
      ctx.translate(sx, sy);
    }

    // Smooth camera follow lerp & zoom lerp
    cameraY += (cameraTargetY - cameraY) * 0.085;
    currentZoom += (targetZoom - currentZoom) * 0.06;

    // Base foundation pillar
    drawIsometricBlock(0, 0, -1, INITIAL_SIZE, INITIAL_SIZE, foundationColors, cameraY, true);

    // Stacked tower blocks
    for (let b of tower) {
      drawIsometricBlock(b.x, b.z, b.y, b.w, b.d, b.color, cameraY, false, b);
    }

    // Climbing Kitten update
    if (typeof updateClimbingKitten === 'function') updateClimbingKitten(dt);

    // Goal marker (stage mode)
    if (mode === 'STAGE' && gameState === 'PLAYING') {
      const gs = Math.max(INITIAL_SIZE, 4) / 2;
      const g0 = project3D(-gs, cfg.target, -gs, cameraY);
      const g1 = project3D(-gs, cfg.target, gs, cameraY);
      const g2 = project3D(gs, cfg.target, gs, cameraY);
      const g3 = project3D(gs, cfg.target, -gs, cameraY);
      if (g2.y > -60 && g0.y < viewH + 60) {
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 + 0.3 * Math.sin(time / 250)})`;
        ctx.beginPath();
        ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y); ctx.lineTo(g2.x, g2.y); ctx.lineTo(g3.x, g3.y);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '900 14px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd54f';
        ctx.fillText('🏁 GOAL', (g0.x + g2.x) / 2, g0.y - 10);
        ctx.restore();
      }
    }

    // Expansion ripples
    updateExpandRings(dt);

    // Active swinging block
    if (activeBlock) {
      const b = activeBlock;
      b.age += dt;
      if (cfg.reverse > 0 && Math.random() < cfg.reverse * dt) b.direction *= -1;
      let spd = b.speed * (1 + cfg.wobble * Math.sin(b.age * 3.1 + b.phase));

      // 1. Ice Block: Slip acceleration & perpendicular sway
      if (b.blockType === 'ice') {
        let iceSpdMult = 1.35;
        if (cfg.iceDampen) iceSpdMult = 1.0 + (iceSpdMult - 1.0) * (1 - cfg.iceDampen);
        spd *= iceSpdMult;

        const top = tower[tower.length - 1];
        if (top) {
          const iceSwayDampen = cfg.iceDampen ? 0.5 : 1.0;
          const iceJitter = Math.sin(b.age * 9.5) * 0.12 * iceSwayDampen;
          if (b.axis === 'x') b.z = top.z + iceJitter;
          else b.x = top.x + iceJitter;
        }
      }

      // 2. Cardboard Scratcher: Stick-slip friction
      if (b.blockType === 'scratcher') {
        const cycle = (b.age % 0.38);
        let slipMult = (cycle < 0.26) ? 0.32 : 2.25;
        if (cfg.cardboardDampen) {
          slipMult = 1.0 + (slipMult - 1.0) * (1 - cfg.cardboardDampen);
        }
        spd *= slipMult;
      }

      // 3. Shrink Rush: Block gradually shrinks as it swings
      if (cfg.shrinkRush) {
        const top = tower[tower.length - 1];
        if (top) {
          const shrinkFactor = Math.max(0.45, 1.0 - b.age * 0.045);
          b.w = Math.max(1.8, top.w * shrinkFactor);
          b.d = Math.max(1.8, top.d * shrinkFactor);
        }
      }

      if (b.axis === 'x') {
        b.x += spd * b.direction * dt;
        if (b.x > b.bound) { b.x = b.bound; b.direction = -1; }
        else if (b.x < -b.bound) { b.x = -b.bound; b.direction = 1; }
      } else {
        b.z += spd * b.direction * dt;
        if (b.z > b.bound) { b.z = b.bound; b.direction = -1; }
        else if (b.z < -b.bound) { b.z = -b.bound; b.direction = 1; }
      }
      if (cfg.blink > 0) {
        const k = Math.min(1, cfg.blink);
        ctx.globalAlpha = 1 - k * 0.85 * (0.5 + 0.5 * Math.sin(b.age * 4.2));
      }
      drawIsometricBlock(b.x, b.z, b.y, b.w, b.d, b.color, cameraY, false, b);
      ctx.globalAlpha = 1;
    }

    // Falling 3D Slices with True 3D Physics
    for (let i = fallingPieces.length - 1; i >= 0; i--) {
      const piece = fallingPieces[i];
      piece.vy -= 34 * dt; // gravity
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.z += piece.vz * dt;

      piece.rx += piece.vrx * dt;
      piece.ry += piece.vry * dt;
      piece.rz += piece.vrz * dt;

      draw3DFallingSlice(piece, cameraY);

      if (piece.y < -25) {
        fallingPieces.splice(i, 1);
      }
    }

    // Climbing Kitten (disabled per user request)
    // if (typeof drawClimbingKitten === 'function') drawClimbingKitten(cameraY);

    // 3D sparkles
    updateParticles(dt);

    // Floating popup score texts
    updateFloatingTexts(dt);

    // Rolling fog layer
    if (typeof drawFogLayer === 'function') drawFogLayer(time, dt);

    ctx.restore(); // restore screen shake
  }

  // Startup & URL Parameter Test Support
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  if (langParam === 'ko' || langParam === 'en') {
    save.lang = langParam;
    persist();
    applyLanguage();
  }
  const actionParam = params.get('action');
  const stageParam = params.get('stage') ? parseInt(params.get('stage'), 10) : 0;
  const catParam = params.get('cat');
  if (catParam) {
    save.selectedCat = catParam;
    if (!save.unlockedCats) save.unlockedCats = ['shiro'];
    if (!save.unlockedCats.includes(catParam)) save.unlockedCats.push(catParam);
    applyCompanionVisual();
  }
  if (actionParam === 'select') {
    openSelect();
  } else if (actionParam === 'companions') {
    const unlockAll = params.get('all') === '1';
    if (unlockAll) {
      save.unlockedCats = CAT_COMPANIONS.map(c => c.id);
    }
    showStart();
    showCompanionModal();
  } else if (actionParam === 'gacha') {
    showStart();
    openGachaModal();
  } else if (actionParam === 'roster') {
    showStart();
    openGachaModal();
    toggleGachaRoster();
  } else if (actionParam === 'pull1') {
    showStart();
    openGachaModal();
    pullGacha(1);
  } else if (actionParam === 'pull10') {
    save.gachaTickets = 10;
    showStart();
    openGachaModal();
    pullGacha(10);
  } else if (actionParam === 'bonus') {
    startStage(stageParam !== null && !isNaN(stageParam) && stageParam > 0 ? stageParam : 20);
  } else if (actionParam === 'unlock') {
    showStart();
    showUnlockModal(CAT_COMPANIONS[1]); // Miko
  } else if (actionParam === 'settings') {
    showStart();
    openSettingsModal();
  } else if (actionParam === 'select_settings') {
    openSelect();
    openSettingsModal();
  } else if (actionParam === 'ready') {
    const unlockAll = params.get('all') === '1';
    if (unlockAll) {
      save.unlockedCats = ['shiro', 'miko', 'nero', 'simba', 'luna', 'meowperor'];
    }
    openReadyModal(stageParam || 15);
    if (params.get('click_locked') === '1') {
      setTimeout(() => {
        const lockedChip = document.querySelector('.ready-chip.locked');
        if (lockedChip) lockedChip.click();
      }, 400);
    }
  } else if (actionParam === 'miss') {
    startStage(stageParam || 0);
    setTimeout(() => {
      if (activeBlock) {
        tower.push({ x: 0, z: 0, y: 1, w: 2.2, d: 2.2, color: getBlockColors(1) });
        activeBlock.x = 9.5;
        sliceActiveBlock();
      }
    }, 350);
  } else if (actionParam === 'boss') {
    const targetStage = (stageParam !== null && !isNaN(stageParam)) ? stageParam : 15;
    startStage(targetStage);
    const bState = params.get('boss_state') || 'idle';
    const bQuote = params.get('quote') || '';
    setTimeout(() => {
      setBossState(bState, bQuote || undefined);
    }, 80);
  } else if (actionParam === 'play') {
    startStage(stageParam);
    const autoTaps = parseInt(params.get('autotap') || '0', 10);
    if (autoTaps > 0) {
      let tCount = 0;
      const tapInt = setInterval(() => {
        if (tCount >= autoTaps || gameState !== 'PLAYING') {
          clearInterval(tapInt);
          return;
        }
        if (activeBlock) {
          const top = tower[tower.length - 1];
          if (activeBlock.axis === 'x') activeBlock.x = top.x;
          else activeBlock.z = top.z;
        }
        handleTap();
        tCount++;
      }, 500);
    }
  } else if (actionParam === 'clear') {
    startStage(stageParam);
    perfectTotal = cfg.target;
    score = cfg.target;
    bonusScore = 180;
    completeStage();
  } else if (actionParam === 'gameover') {
    startStage(stageParam);
    score = Math.floor(cfg.target / 2);
    triggerGameOver({ x: 5, z: 5, y: score, w: 4, d: 4, axis: 'x', direction: 1, color: getBlockColors(score) });
  } else {
    showStart();
  }
  applyLanguage();
  const clickParam = params.get('click');
  if (clickParam) {
    setTimeout(() => {
      const el = $(clickParam);
      if (el) el.click();
    }, 150);
  }
  requestAnimationFrame(animate);

  // Track app open and user profile state
  FirebaseTracker.setCustomKey('selected_cat', save.selectedCat || 'shiro');
  FirebaseTracker.setCustomKey('lang', save.lang || 'ko');
  FirebaseTracker.logEvent('app_open', {
    lang: save.lang || 'ko',
    total_stars: totalStars(),
    unlocked_cats_count: (save.unlockedCats || []).length,
    selected_cat: save.selectedCat || 'shiro',
    best_score: bestScore,
    churu: save.churu || 0,
    gacha_tickets: save.gachaTickets || 0
  });

  window.__gameAudio = {
    playMarimbaNote,
    playStageClearCat,
    playGameOverChord,
    playCatSad,
    playNormalTap,
    SCALE_FREQS,
    initAudio: (typeof initAudio === 'function' ? initAudio : () => {}),
    updateBgmPlayback: (typeof updateBgmPlayback === 'function' ? updateBgmPlayback : () => {}),
    getMusicalStep: () => musicalStep,
    getAudioContext: () => (typeof audioCtx !== 'undefined' ? audioCtx : null),
    isBgmPlaying: () => (typeof bgmTimer !== 'undefined' ? !!bgmTimer : false),
    handleVisibilityChange: (typeof handleVisibilityChange === 'function' ? handleVisibilityChange : null),
    setBgmTrack: (typeof setBgmTrack === 'function' ? setBgmTrack : () => {}),
    getBgmTrack: (typeof getBgmTrack === 'function' ? getBgmTrack : () => 'menu')
  };

  // Test harness bridge for automated E2E testing
  window.__game = {
    getGameState: () => gameState,
    getMode: () => mode,
    getScore: () => score,
    getCfg: () => cfg,
    getTower: () => tower,
    getSave: () => save,
    startStage,
    startEndless,
    showStart,
    openSelect,
    completeStage,
    triggerGameOver,
    handleTap,
    pullGacha,
    getSelectedCat,
    persist,
    getBossHp: () => ({ current: bossCurrentHp, max: bossMaxHp }),
    closeGachaReveal,
    retryCurrent,
    setBonusScore: (s) => { bonusScore = s; bonusChuru = s; score = s; },
    getBonusScore: () => bonusScore,
    getBonusHearts: () => bonusHearts,
    isBonusStageAlreadyPlayed,
    getNextPlayableStage,
    hitBonusMouse: () => {
      bonusStreak = 0;
      bonusHearts--;
      FirebaseTracker.logEvent('bonus_hazard_hit', {
        stage_id: (typeof cfg !== 'undefined' && cfg) ? cfg.id : 0,
        hearts_remaining: bonusHearts,
        bonus_score: bonusScore
      });
      if (bonusHearts <= 0) {
        bonusActive = false;
        playCatSad();
        completeStage();
      }
    },
    alignActiveBlock: () => {
      if (activeBlock) {
        const top = tower[tower.length - 1];
        if (activeBlock.axis === 'x') activeBlock.x = top.x;
        else activeBlock.z = top.z;
      }
    },
    getActiveBlock: () => activeBlock,
    getActiveSkillReady: () => activeSkillReady,
    setActiveSkillReady: (v) => { activeSkillReady = v; updateHud(); },
    getClimbingKitten: () => (typeof climbingKitten !== 'undefined' ? climbingKitten : null),
    getMeltingBlocks: () => meltingBlocks,
    getTowerTilt: () => ({ x: towerTiltX, z: towerTiltZ }),
    setTowerTiltTarget: (x, z) => { towerTiltTargetX = x; towerTiltTargetZ = z; },
    openSettingsModal: () => { if (typeof openSettingsModal === 'function') openSettingsModal(); },
    closeSettingsModal: () => { if (typeof closeSettingsModal === 'function') closeSettingsModal(); },
    applyLanguage: () => { if (typeof applyLanguage === 'function') applyLanguage(); },
    buildStageConfig: (s) => (typeof buildStageConfig === 'function' ? buildStageConfig(s) : null)
  };