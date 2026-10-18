// Stack Tower - UI Controllers, Modals & Gacha Engine

  const mascotImgEl = document.getElementById('mascot-img');
  const speechBubbleEl = document.getElementById('speech-bubble');
  const scoreTextEl = document.getElementById('score-text');
  const comboTagEl = document.getElementById('combo-tag');
  const startScreenEl = document.getElementById('start-screen');
  const gameoverScreenEl = document.getElementById('gameover-screen');
  const startBestScoreEl = document.getElementById('start-best-score');
  const gameoverScoreEl = document.getElementById('gameover-score');
  const gameoverBestEl = document.getElementById('gameover-best');
  const newBestPillEl = document.getElementById('new-best-pill');
  const soundBtnEl = document.getElementById('sound-btn');
  const flashOverlayEl = document.getElementById('flash-overlay');

  let mascotTimer = null;
  function setMascot(emotion, speechText, durationMs = 0) {
    const cat = (typeof getSelectedCat === 'function') ? getSelectedCat() : null;
    const mascotWrapper = document.getElementById('mascot-wrapper');
    let mascotImg = document.getElementById('mascot-img');
    if (!mascotImg && mascotWrapper) {
      mascotWrapper.innerHTML = '<img id="mascot-img" src="assets/chara_smile.png" alt="Cat Mascot">';
      mascotImg = document.getElementById('mascot-img');
    }
    if (mascotImg) {
      const filter = (cat && cat.filterStyle) ? cat.filterStyle : 'none';
      mascotImg.style.filter = filter;
      if (cat && cat.image && cat.id !== 'shiro' && cat.id !== 'mochi' && cat.id !== 'vanilla') {
        if (emotion === 'sad') {
          mascotImg.src = ASSET_PATHS.sad;
        } else if (emotion === 'celebrate') {
          mascotImg.src = ASSET_PATHS.celebrate;
        } else {
          mascotImg.src = cat.image;
        }
      } else {
        if (ASSET_PATHS[emotion]) {
          mascotImg.src = ASSET_PATHS[emotion];
        } else {
          mascotImg.src = (cat && cat.image) ? cat.image : ASSET_PATHS.smile;
        }
      }
    }
    if (speechText && speechBubbleEl) {
      speechBubbleEl.textContent = speechText;
      speechBubbleEl.style.opacity = '1';
    }
    const bounceTarget = mascotWrapper || mascotImg;
    if (bounceTarget) {
      bounceTarget.classList.remove('mascot-bounce');
      void bounceTarget.offsetWidth;
      bounceTarget.classList.add('mascot-bounce');
    }

    if (mascotTimer) clearTimeout(mascotTimer);
    if (durationMs > 0) {
      mascotTimer = setTimeout(() => {
        if (gameState === 'PLAYING') {
          setMascot('excited', 'Stay focused, meow...! 🐾');
        }
      }, durationMs);
    }
  }

  const CAT_PRAISES = [
    'Pawsome rhythm, hooman! 🐾',
    'Loafing up happily~ 🍞',
    'Purr-fect balance! ✨',
    'Time for a fish treat! 🐟'
  ];


  // --- UI ELEMENTS FOR CAMPAIGN ---
  const $ = (id) => document.getElementById(id);
  const stageInfoEl = $('stage-info');
  const stageLabelEl = $('stage-label');
  const stageProgressEl = $('stage-progress');
        const goalFillEl = $('goal-fill');
  const bannerEl = $('stage-banner');
  const bannerTitleEl = $('banner-title');
  const bannerDescEl = $('banner-desc');
  const toastEl = $('toast');
  const clearScreenEl = $('clear-screen');
  const selectScreenEl = $('select-screen');
  const selectListEl = $('select-list');
  const selectStarsEl = $('select-stars');
  const startProgressEl = $('start-progress');
  const continueBtnEl = $('btn-continue');
  const gameoverTitleEl = $('gameover-title');
  const gameoverStageEl = $('gameover-stage');
  const bestRowEl = $('best-row');
  const companionModalEl = $('companion-modal');
  const unlockModalEl = $('unlock-modal');
  const readyModalEl = $('ready-modal');
  let gachaOpenedFromReady = false;


  const BOSS_SMUG_QUOTES = {
    en: [
      '😼 Hahaha! That block got sliced off, meow!',
      '😹 What a crooked messy tower, meow~',
      '😼 Hmph, is that the best you can do, meow?',
      '😹 All Churu belongs to me, meow!',
      '😼 Whoops! Did your paw slip, meow?'
    ],
    ko: [
      '😼 냐하하! 블록이 잘려나갔다냥!',
      '😹 삐뚤빼뚤 엉망진창 탑이다냥~',
      '😼 훗, 고작 그 정도 실력이냥?',
      '😹 츄르는 내 차지다냥!',
      '😼 흠칫! 손이 미끄러졌냥?'
    ]
  };

  const BOSS_HURT_QUOTES = {
    en: [
      '🙀 Ouch! A critical hit, meow!!',
      '💥 Meowch! Right in the center, meow!!',
      '😿 S-Seeing stars... feeling dizzy, meow...',
      '🙀 A scratch on my precious fur, meow...!!',
      '⚡ That stings! Stop hitting Meowfects, meow!'
    ],
    ko: [
      '🙀 으악! 크리티컬이라니!!',
      '💥 냐아아악! 정통으로 맞았다냥!!',
      '😿 벼... 별빛이 보인다냥... 어질어질...',
      '🙀 내 소중한 털뭉치에 흠집이...!!',
      '⚡ 앗 따가워! 퍼펙트 치지 마라냥!'
    ]
  };

  function getRandomBossSmugQuote() {
    const arr = BOSS_SMUG_QUOTES[getLang()] || BOSS_SMUG_QUOTES.en;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomBossHurtQuote() {
    const arr = BOSS_HURT_QUOTES[getLang()] || BOSS_HURT_QUOTES.en;
    return arr[Math.floor(Math.random() * arr.length)];
  }


  function renderBossCharacter(bossInfo) {
    const actor = $('boss-actor');
    if (!actor || !bossInfo) return;
    actor.innerHTML = getBossSvgModular(bossInfo.type || 'chonk', bossInfo.palette || {});
    actor.title = `${bossInfo.name} (${bossInfo.title})`;
  }

  function setBossState(emotion, text = '', durationMs = 0) {
    if (mode !== 'STAGE' || !cfg || cfg.stageType !== 'boss') return;
    const container = $('boss-container');
    const actor = $('boss-actor');
    const speech = $('boss-speech');
    if (!container || !actor) return;

    container.style.display = 'block';
    currentBossState = emotion;

    if (bossEmotionTimer) {
      clearTimeout(bossEmotionTimer);
      bossEmotionTimer = null;
    }

    // Hide all facial expression layers
    ['face-idle', 'face-smug', 'face-hurt', 'face-frenzy', 'face-defeat', 'face-victory'].forEach(id => {
      const el = $(id);
      if (el) el.style.display = 'none';
    });

    // Show target face
    const targetFace = $(`face-${emotion}`) || $('face-idle');
    if (targetFace) targetFace.style.display = 'inline';

    // Toggle frenzy flame aura
    const aura = $('boss-frenzy-aura');
    if (aura) {
      const showAura = (emotion === 'frenzy' || (bossFrenzy && emotion !== 'defeat'));
      aura.setAttribute('opacity', showAura ? '1' : '0');
    }

    // Crown sparks
    const crownSparks = document.querySelector('.crown-sparks');
    if (crownSparks) {
      crownSparks.setAttribute('opacity', emotion === 'victory' ? '1' : '0');
    }

    // Update CSS class on actor & container z-index
    actor.className = `boss-actor boss-state-${emotion}`;
    container.classList.toggle('boss-ontop', emotion === 'victory');

    // Auto-resolve speech text from boss definition if omitted
    let speechText = text;
    if (!speechText && cfg && cfg.bossInfo) {
      if (emotion === 'smug') speechText = getBossQuote(cfg.bossInfo, 'smugQuote') || getRandomBossSmugQuote();
      else if (emotion === 'hurt') speechText = getBossQuote(cfg.bossInfo, 'hurtQuote') || getRandomBossHurtQuote();
      else if (emotion === 'frenzy') speechText = getBossQuote(cfg.bossInfo, 'frenzyQuote') || (getLang() === 'ko' ? '😾 분노의 진심 모드다냥! 🔥' : '😾 Furious Serious Mode, meow! 🔥');
      else if (emotion === 'defeat') speechText = getBossQuote(cfg.bossInfo, 'defeatQuote') || (getLang() === 'ko' ? '😾 냐아아앙~~ 항복이다냥! 🏳️' : '😾 Meowch~~ I surrender, meow! 🏳️');
      else if (emotion === 'victory') speechText = getBossQuote(cfg.bossInfo, 'victoryQuote') || (getLang() === 'ko' ? '😹 음하하! 내 승리다냥! 👑' : '😹 Mwahaha! My victory, meow! 👑');
    }

    // Speech bubble
    if (speech) {
      if (speechText) {
        speech.textContent = speechText;
        speech.style.opacity = '1';
        speech.style.transform = 'translateX(-50%) translateY(0) scale(1)';
      } else if (durationMs === 0) {
        speech.style.opacity = '0';
        speech.style.transform = 'translateX(-50%) translateY(-6px) scale(0.95)';
      }
    }

    // Audio cues
    if (emotion === 'hurt') playBossHurtSound();
    else if (emotion === 'smug') playBossSmugSound();
    else if (emotion === 'frenzy') playBossFrenzySound();
    else if (emotion === 'defeat') playBossDefeatSound();
    else if (emotion === 'victory') playBossVictorySound();

    // Duration auto-revert
    if (durationMs > 0 && emotion !== 'defeat' && emotion !== 'victory') {
      bossEmotionTimer = setTimeout(() => {
        const defaultState = bossFrenzy ? 'frenzy' : 'idle';
        setBossState(defaultState);
        if (speech) {
          speech.style.opacity = '0';
          speech.style.transform = 'translateX(-50%) translateY(-6px) scale(0.95)';
        }
      }, durationMs);
    }
  }

  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  function showBanner(title, desc) {
    bannerTitleEl.textContent = title;
    bannerDescEl.textContent = desc;
    bannerEl.classList.remove('show');
    void bannerEl.offsetWidth;
    bannerEl.classList.add('show');
  }

  function updateHud() {
    if (mode === 'STAGE') {
      stageInfoEl.style.display = 'flex';
      const badgeEl = $('stage-badge');
      if (badgeEl) {
        const typeInfo = STAGE_TYPES[cfg.stageType] || STAGE_TYPES.standard;
        const typeName = (getLang() === 'ko') ? typeInfo.ko : typeInfo.name;
        badgeEl.textContent = `${typeInfo.emoji} ${typeName.toUpperCase()}`;
        badgeEl.className = 'stage-badge ' + (typeInfo.badgeCls || '');
      }
      stageLabelEl.textContent = `${cfg.emoji} ${cfg.label}`;
      stageProgressEl.textContent = `${score} / ${cfg.target}`;
      goalFillEl.style.width = Math.min(100, (score / cfg.target) * 100) + '%';

      // Archetype Sub-HUDs
      const bossHud = $('boss-hud');
      const timerHud = $('timer-hud');
      const precHud = $('precision-hud');

      if (cfg.stageType === 'boss') {
        bossHud.style.display = 'flex';
        $('boss-name').textContent = `${cfg.bossInfo.emoji} ${cfg.bossInfo.name}`;
        $('boss-hp-val').textContent = `HP ${bossCurrentHp}/${bossMaxHp}`;
        $('boss-fill').style.width = Math.max(0, (bossCurrentHp / bossMaxHp) * 100) + '%';
      } else {
        bossHud.style.display = 'none';
      }

      if (cfg.stageType === 'speed') {
        timerHud.style.display = 'flex';
        $('timer-val').textContent = `${Math.max(0, timeRemaining).toFixed(1)}s`;
        $('timer-fill').style.width = Math.min(100, Math.max(0, (timeRemaining / cfg.timeLimit) * 100)) + '%';
        if (timeRemaining <= 5.0) timerHud.classList.add('timer-warning');
        else timerHud.classList.remove('timer-warning');
      } else {
        timerHud.style.display = 'none';
      }

      if (cfg.stageType === 'precision') {
        precHud.style.display = 'block';
        precHud.textContent = `🎯 STREAK: ${perfectCombo} / ${cfg.streakTarget} ${perfectCombo >= cfg.streakTarget ? '⭐ PASS!' : ''}`;
      } else {
        precHud.style.display = 'none';
      }

      const bonusHud = $('bonus-hud');
      if (cfg.stageType === 'bonus') {
        if (bonusHud) bonusHud.style.display = 'flex';
        if ($('bonus-timer-val')) $('bonus-timer-val').textContent = `⏱️ ${Math.max(0, bonusTimer).toFixed(1)}s`;
        if ($('bonus-churu-val')) $('bonus-churu-val').innerHTML = `<img src="assets/churu_icon.jpg" class="churu-icon" alt="츄르"> ${bonusChuru}`;
        if ($('bonus-hearts-val')) {
          const h = Math.max(0, Math.min(3, bonusHearts));
          $('bonus-hearts-val').textContent = '❤️'.repeat(h) + '🖤'.repeat(3 - h);
        }
        if ($('bonus-fill')) $('bonus-fill').style.width = Math.min(100, (bonusScore / cfg.target) * 100) + '%';
        const feverBadge = $('bonus-fever-badge');
        if (feverBadge) feverBadge.style.display = bonusFeverTimer > 0 ? 'inline-block' : 'none';
      } else {
        if (bonusHud) bonusHud.style.display = 'none';
      }

      // Active Skill HUD (Luna: Magnetic Snap)
      const skillHud = $('skill-hud');
      if (skillHud) {
        if (typeof activeSkillReady !== 'undefined' && activeSkillReady) {
          skillHud.style.display = 'flex';
          const sb = $('skill-badge');
          if (sb) sb.textContent = (getLang() === 'ko' ? '🧲 자석 솜방망이 준비완료!' : '🧲 Magnetic Paw Ready!');
        } else {
          skillHud.style.display = 'none';
        }
      }

      // Tilt Balance HUD
      const tiltHud = $('tilt-hud');
      if (tiltHud) {
        if (cfg && cfg.tilt) {
          tiltHud.style.display = 'flex';
          const curTiltX = (typeof towerTiltX !== 'undefined') ? towerTiltX : 0;
          const curTiltZ = (typeof towerTiltZ !== 'undefined') ? towerTiltZ : 0;
          const maxTilt = Math.max(Math.abs(curTiltX), Math.abs(curTiltZ));
          let statusText = (getLang() === 'ko' ? '⚖️ 밸런스: 안전' : '⚖️ Balance: Safe');
          if (maxTilt > 0.16) {
            statusText = (getLang() === 'ko' ? '⚖️ 밸런스: 위험! ⚠️' : '⚖️ Balance: DANGER! ⚠️');
          } else if (maxTilt > 0.08) {
            statusText = (getLang() === 'ko' ? '⚖️ 밸런스: 주의' : '⚖️ Balance: Caution');
          }
          const tb = $('tilt-badge');
          if (tb) tb.textContent = statusText;
        } else {
          tiltHud.style.display = 'none';
        }
      }
    } else {
      stageInfoEl.style.display = 'none';
    }
  }

  // --- GAME MODAL ANIMATION & TACTILE ENGINE ---
  function openModalAnim(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('modal-closing');
    modalEl.style.display = 'flex';
    modalEl.classList.add('modal-active');
    playUiOpen();
    triggerHaptic(15);
  }

  function closeModalAnim(modalEl, onClosed, immediate = false) {
    if (!modalEl) return;
    if (immediate || window.getComputedStyle(modalEl).display === 'none') {
      modalEl.style.display = 'none';
      modalEl.classList.remove('modal-active', 'modal-closing');
      if (typeof onClosed === 'function') onClosed();
      return;
    }
    modalEl.classList.add('modal-closing');
    playUiClose();
    triggerHaptic(10);
    setTimeout(() => {
      modalEl.style.display = 'none';
      modalEl.classList.remove('modal-active', 'modal-closing');
      if (typeof onClosed === 'function') onClosed();
    }, 160);
  }

  function hideOverlays() {
    startScreenEl.style.display = 'none';
    gameoverScreenEl.style.display = 'none';
    gameoverScreenEl.classList.remove('modal-active', 'modal-closing');
    clearScreenEl.style.display = 'none';
    clearScreenEl.classList.remove('modal-active', 'modal-closing');
    selectScreenEl.style.display = 'none';
    if (companionModalEl) {
      companionModalEl.style.display = 'none';
      companionModalEl.classList.remove('modal-active', 'modal-closing');
    }
    if (unlockModalEl) {
      unlockModalEl.style.display = 'none';
      unlockModalEl.classList.remove('modal-active', 'modal-closing');
    }
    if (readyModalEl) {
      readyModalEl.style.display = 'none';
      readyModalEl.classList.remove('modal-active', 'modal-closing');
    }
    const gm = $('gacha-modal');
    if (gm) {
      gm.style.display = 'none';
      gm.classList.remove('modal-active', 'modal-closing');
    }
    const gr = $('gacha-reveal-modal');
    if (gr) {
      gr.style.display = 'none';
      gr.classList.remove('modal-active', 'modal-closing');
    }
    const sm = $('settings-modal');
    if (sm) {
      sm.style.display = 'none';
      sm.classList.remove('modal-active', 'modal-closing');
    }
  }

  // --- COMPANION MODAL SYSTEM ---
  function renderCompanionModal() {
    const listEl = $('companion-list');
    if (!listEl) return;
    if ($('comp-ticket-count')) $('comp-ticket-count').textContent = save.gachaTickets || 0;
    if ($('comp-churu-count')) $('comp-churu-count').textContent = save.churu || 0;
    let html = '';
    const currentCatId = save.selectedCat || 'shiro';
    const unlockedList = save.unlockedCats || ['shiro'];

    CAT_COMPANIONS.forEach((cat) => {
      const isUnlocked = unlockedList.includes(cat.id);
      const isEquipped = currentCatId === cat.id;

      let actionHtml = '';
      if (isEquipped) {
        actionHtml = `<span class="cat-status-badge badge-equipped">✓ ${t('companionEquipped')}</span>`;
      } else if (isUnlocked) {
        actionHtml = `<button class="cat-equip-btn btn-active" data-cat="${cat.id}">${t('btnEquip')}</button>`;
      } else {
        actionHtml = `<span class="cat-status-badge badge-locked">🔒 ${t('companionLockedBadge')}</span>`;
      }

      let lockNoteHtml = '';
      if (!isUnlocked) {
        lockNoteHtml = `<div class="cat-card-lock-note">🔒 ${t('companionLocked')}</div>`;
      }

      html += `
        <div class="companion-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : 'can-equip'}" data-cat="${cat.id}">
          <div class="cat-card-top">
            <div class="cat-avatar-wrap">
              <img class="cat-avatar-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter: ${cat.filterStyle || 'none'};" alt="${getCompanionField(cat, 'name')}">
            </div>
            <div class="cat-identity-col">
              <div class="cat-card-name">${getCompanionField(cat, 'name')}</div>
              <div class="cat-card-title">${getCompanionField(cat, 'title')}</div>
            </div>
            <div class="cat-action-wrap">
              ${actionHtml}
            </div>
          </div>
          <div class="cat-card-body">
            <div class="cat-card-perk">⚡ ${getCompanionField(cat, 'perk')}</div>
            <div class="cat-card-desc">"${getCompanionField(cat, 'quote')}"</div>
            ${lockNoteHtml}
          </div>
        </div>
      `;
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll('.companion-card.can-equip').forEach(card => {
      card.addEventListener('click', (e) => {
        const catId = card.getAttribute('data-cat');
        if (!catId) return;
        save.selectedCat = catId;
        persist();
        applyCompanionVisual();
        renderCompanionModal();
        const cat = getSelectedCat();
        playCatPurr(1.5, 0.9);
        showToast(t('catEquippedToast', { name: getCompanionField(cat, 'name') }));
        setMascot('happy', getCompanionField(cat, 'quote'), 1500);
        FirebaseTracker.setCustomKey('selected_cat', catId);
        FirebaseTracker.logEvent('companion_equipped', {
          cat_id: catId,
          cat_name: getCompanionField(cat, 'name') || catId
        });
      });
    });
  }

  function showCompanionModal() {
    if ($('companion-title')) $('companion-title').textContent = t('companionsTitle');
    if ($('companion-subtitle')) $('companion-subtitle').textContent = t('companionsSubtitle');
    renderCompanionModal();
    openModalAnim(companionModalEl);
  }

  function hideCompanionModal() {
    closeModalAnim(companionModalEl);
  }

  let pendingUnlockedCat = null;
  function showUnlockModal(cat) {
    pendingUnlockedCat = cat;
    $('unlock-cat-name').textContent = getCompanionField(cat, 'name');
    $('unlock-cat-title').textContent = getCompanionField(cat, 'title');
    $('unlock-cat-perk').textContent = `⚡ ${getCompanionField(cat, 'perk')}`;
    $('unlock-cat-quote').textContent = `"${getCompanionField(cat, 'quote')}"`;
    const avatarWrap = $('unlock-cat-avatar');
    if (avatarWrap) {
      avatarWrap.innerHTML = `<img class="unlock-cat-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter:${cat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(cat, 'name')}">`;
    }
    openModalAnim(unlockModalEl);
    playSizeExpandChime();
    playStageClearCat(3);
  }

  // --- EXPEDITION PREP & COMPANION PICKER (출격 준비) ---
  let pendingStageId = 0;

  function getRecommendedCatId(stageCfg) {
    if (!stageCfg) return 'shiro';
    let targetRole = 0;
    if (stageCfg.stageType === 'speed') targetRole = 1;
    else if (stageCfg.stageType === 'precision') targetRole = 2;
    else if (stageCfg.stageType === 'hazard') targetRole = 3;
    else if (stageCfg.stageType === 'boss') targetRole = 5;
    else targetRole = 4;

    const unlocked = save.unlockedCats || ['shiro'];
    const unlockedMatch = CAT_COMPANIONS.find(c => c.roleWorld === targetRole && unlocked.includes(c.id));
    if (unlockedMatch) return unlockedMatch.id;
    const anyMatch = CAT_COMPANIONS.find(c => c.roleWorld === targetRole);
    return anyMatch ? anyMatch.id : 'shiro';
  }

  function updateReadyModal() {
    const c = buildStageConfig(pendingStageId);
    const typeInfo = STAGE_TYPES[c.stageType] || STAGE_TYPES.standard;
    const typeName = (getLang() === 'ko') ? typeInfo.ko : typeInfo.name;
    const curCat = getSelectedCat();
    const unlockedList = save.unlockedCats || ['shiro'];
    const recCatId = getRecommendedCatId(c);

    if (c.stageType === 'boss') {
      $('ready-stage-badge').textContent = `${typeInfo.emoji} ${typeName.toUpperCase()} ${c.label} · ${c.bossInfo.name}`;
    } else {
      $('ready-stage-badge').textContent = `${typeInfo.emoji} ${typeName.toUpperCase()} ${c.label}`;
    }
    $('ready-stage-badge').className = 'stage-badge ' + (typeInfo.badgeCls || '');
    $('ready-stage-title').textContent = `${c.emoji} World ${c.world + 1} · ${c.worldName}`;

    let targetTxt = t('targetLabel', { target: c.target });
    if (c.stageType === 'boss') {
      targetTxt = t('targetBoss', { boss: c.bossInfo.name, target: c.target });
    } else if (c.stageType === 'bonus') {
      targetTxt = t('targetBonus');
    } else if (c.stageType === 'speed') {
      targetTxt = t('targetSpeed', { time: c.timeLimit, target: c.target });
    } else if (c.stageType === 'precision') {
      targetTxt = t('targetPrecision', { target: c.target, streak: c.streakTarget });
    }
    $('ready-stage-target').textContent = targetTxt;

    let tipTxt = t('tipDefault');
    if (c.stageType === 'bonus') {
      tipTxt = t('tipBonus');
    } else if (c.stageType === 'speed') {
      tipTxt = t('tipSpeed');
    } else if (c.stageType === 'precision') {
      tipTxt = t('tipPrecision');
    } else if (c.stageType === 'hazard') {
      tipTxt = t('tipHazard');
    } else if (c.stageType === 'boss') {
      tipTxt = t('tipBoss', { boss: c.bossInfo.name, title: getBossField(c.bossInfo, 'title') });
    }
    $('ready-stage-tip').textContent = tipTxt;

    // Selected Cat Card preview
    $('ready-cat-name').textContent = getCompanionField(curCat, 'name');
    $('ready-cat-title').textContent = getCompanionField(curCat, 'title');
    $('ready-cat-perk').textContent = `⚡ ${getCompanionField(curCat, 'perk')}`;
    $('ready-cat-quote').textContent = `"${getCompanionField(curCat, 'quote')}"`;
    const readyAvatarWrap = $('ready-cat-avatar-wrap');
    if (readyAvatarWrap) {
      readyAvatarWrap.innerHTML = `<img class="ready-cat-img" src="${curCat.image || 'assets/chara_smile.png'}" style="filter:${curCat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(curCat, 'name')}">`;
    }

    // Chips row for quick switching
    const chipsEl = $('ready-companion-chips');
    let chipsHtml = '';
    const recLabel = (getLang() === 'ko') ? '⭐추천' : '⭐REC';
    const gachaWord = (getLang() === 'ko') ? '가챠' : 'Gacha';
    CAT_COMPANIONS.forEach(cat => {
      const isUnlocked = unlockedList.includes(cat.id);
      const isSelected = curCat.id === cat.id;
      const isRec = cat.id === recCatId;
      const cls = ['ready-chip'];
      if (isSelected) cls.push('active');
      if (!isUnlocked) cls.push('locked');

      const rarityStars = '★'.repeat(cat.rarity || 1);

      chipsHtml += `
        <div class="${cls.join(' ')}" data-cat="${cat.id}">
          <div class="ready-chip-avatar">
            <img class="ready-chip-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter:${cat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(cat, 'name')}">
          </div>
          <span class="ready-chip-name">${getCompanionField(cat, 'name').split(' ')[0]} ${isUnlocked ? '' : '🔒'}</span>
          ${isUnlocked && isRec ? `<span class="ready-chip-rec">${recLabel}</span>` : ''}
          ${!isUnlocked ? `<span class="ready-chip-lock-tag">${rarityStars} ${gachaWord}</span>` : ''}
        </div>
      `;
    });
    chipsEl.innerHTML = chipsHtml;

    chipsEl.querySelectorAll('.ready-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = chip.dataset.cat;
        const targetCat = CAT_COMPANIONS.find(c => c.id === cid);
        if (!unlockedList.includes(cid)) {
          const catName = targetCat ? getCompanionField(targetCat, 'name') : '';
          showToast(t('catLockedToast', { cat: catName }));
          playThud();
          return;
        }
        save.selectedCat = cid;
        persist();
        applyCompanionVisual();
        updateReadyModal();
        playMarimbaNote(587.33, true);
        FirebaseTracker.setCustomKey('selected_cat', cid);
        FirebaseTracker.logEvent('companion_equipped', {
          cat_id: cid,
          cat_name: targetCat ? (getCompanionField(targetCat, 'name') || cid) : cid
        });
      });
    });
  }

  function openReadyModal(stageId) {
    if (isBonusStageAlreadyPlayed(stageId)) {
      showToast((getLang() === 'ko')
        ? '보너스 스테이지는 1회만 도전할 수 있습니다냥! 🔒'
        : 'Bonus stage can only be played once, meow! 🔒');
      return;
    }
    pendingStageId = stageId;
    updateReadyModal();
    hideOverlays();
    openModalAnim(readyModalEl);
  }

  function closeReadyModal() {
    closeModalAnim(readyModalEl, () => {
      if (gameState === 'SELECT') openSelect();
      else showStart();
    });
  }

  function refreshStartScreen() {
    if (startBestScoreEl) startBestScoreEl.textContent = bestScore;
    const next = nextStageIndex();
    const allDone = clearedCount() >= TOTAL_STAGES;
    const c = buildStageConfig(next);
    const isKo = getLang() === 'ko';

    const playText = allDone
      ? (isKo ? '모든 스테이지 클리어! 다시하기' : 'All Cleared! Replay')
      : (clearedCount() === 0
          ? (isKo ? `모험 시작 · ${c.label}` : `Start Adventure · ${c.label}`)
          : (isKo ? `이어서 모험 · ${c.label}` : `Continue · ${c.label}`));

    if ($('btn-play-text')) {
      $('btn-play-text').textContent = playText;
    } else if (continueBtnEl) {
      continueBtnEl.textContent = `▶ ${playText}`;
    }

    if (startProgressEl) {
      startProgressEl.textContent = isKo
        ? `⭐ ${totalStars()} / ${TOTAL_STAGES * 3}  ·  클리어 ${clearedCount()} / ${TOTAL_STAGES}`
        : `⭐ ${totalStars()} / ${TOTAL_STAGES * 3}  ·  Cleared ${clearedCount()} / ${TOTAL_STAGES}`;
    }
    applyCompanionVisual();
  }

  function showStart() {
    const bc = $('boss-container'); if (bc) bc.style.display = 'none';
    const bs = $('boss-speech'); if (bs) bs.style.opacity = '0';
    resetScene();
    gameState = 'START';
    hideOverlays();
    refreshStartScreen();
    startScreenEl.classList.remove('screen-entering');
    void startScreenEl.offsetWidth;
    startScreenEl.classList.add('screen-entering');
    startScreenEl.style.display = 'flex';
    const companion = getSelectedCat();
    setMascot('smile', companion.quote || 'Hooman! Stack me a tower, meow! 🐾');
  }

  function openSelect() {
    const bc = $('boss-container'); if (bc) bc.style.display = 'none';
    const bs = $('boss-speech'); if (bs) bs.style.opacity = '0';
    resetScene();
    gameState = 'SELECT';
    hideOverlays();
    renderSelect();
    selectScreenEl.classList.remove('screen-entering');
    void selectScreenEl.offsetWidth;
    selectScreenEl.classList.add('screen-entering');
    selectScreenEl.style.display = 'flex';
    const cur = selectListEl.querySelector('.stage-btn.current');
    if (cur) cur.scrollIntoView({ block: 'center' });
    setMascot('smile', 'Which cat tower shall we build, meow? 🐾');
  }

  function renderSelect() {
    const next = nextStageIndex();
    selectStarsEl.textContent = `⭐ ${totalStars()}`;
    let html = '';
    for (let w = 0; w < WORLD_DEFS.length; w++) {
      const def = WORLD_DEFS[w];
      const first = WORLD_STAGE_OFFSETS[w];
      const count = WORLD_STAGE_COUNTS[w];
      const gate = gateFor(first);
      const worldOpen = isUnlocked(first);
      let wStars = 0;
      for (let k = 0; k < count; k++) wStars += starsOf(first + k);
      let status = `★ ${wStars}/${count * 3}`;
      if (!worldOpen && starsOf(first - 1) > 0 && totalStars() < gate) {
        status = (getLang() === 'ko')
          ? `🔒 ⭐ ${gate}개 필요 (현재 ${totalStars()}개)`
          : `🔒 ${gate} Stars Needed (Have ${totalStars()})`;
      } else if (!worldOpen) {
        status = '🔒';
      }
      html += `<section class="world${worldOpen ? '' : ' world-locked'}">` +
        `<div class="world-head"><div class="world-title">${def.emoji} World ${w + 1} · ${def.name}</div>` +
        `<div class="world-status">${status}</div></div>` +
        `<div class="world-desc">${worldHint(def.mods)}</div><div class="stage-grid">`;
      for (let k = 0; k < count; k++) {
        const id = first + k;
        const s = starsOf(id);
        const open = isUnlocked(id);
        const stageCfg = buildStageConfig(id);
        const typeInfo = STAGE_TYPES[stageCfg.stageType] || STAGE_TYPES.standard;
        const isBonusPlayed = isBonusStageAlreadyPlayed(id);
        const cls = ['stage-btn'];
        if (!open) cls.push('locked');
        if (s > 0) cls.push('cleared');
        if (stageCfg.boss) cls.push('boss');
        if (stageCfg.stageType === 'bonus') {
          cls.push('bonus');
          if (isBonusPlayed) cls.push('bonus-completed');
        }
        if (id === next && open && !isBonusPlayed) cls.push('current');
        const stars = isBonusPlayed
          ? (s > 0 ? '★'.repeat(s) + '☆'.repeat(3 - s) : 'CLEAR')
          : (s > 0 ? '★'.repeat(s) + '☆'.repeat(3 - s) : (open ? '☆☆☆' : '🔒'));
        const numLabel = `${w + 1}-${k + 1}`;
        html += `<button class="${cls.join(' ')}" data-id="${id}" data-ui>` +
          `<span class="sb-num">${numLabel}</span>` +
          `<span class="sb-type">${typeInfo.emoji}</span>` +
          `<span class="sb-stars">${stars}</span></button>`;
      }
      html += '</div></section>';
    }
    selectListEl.innerHTML = html;
  }

  selectListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.stage-btn');
    if (!btn) return;
    initAudio();
    const id = parseInt(btn.dataset.id, 10);
    if (isBonusStageAlreadyPlayed(id)) {
      showToast((getLang() === 'ko')
        ? '보너스 스테이지는 1회만 도전할 수 있습니다냥! 🔒'
        : 'Bonus stage can only be played once, meow! 🔒');
      return;
    }
    if (!isUnlocked(id)) {
      const gate = gateFor(id);
      if (starsOf(id - 1) > 0 && totalStars() < gate) {
        showToast((getLang() === 'ko')
          ? `⭐ 별이 ${gate - totalStars()}개 더 필요하다냥! 이전 스테이지에서 3성을 모아보자냥!`
          : `⭐ Need ${gate - totalStars()} more stars! Replay earlier stages for 3 stars!`);
      } else {
        showToast((getLang() === 'ko') ? '이전 스테이지를 먼저 클리어하라냥! 🔒' : 'Clear the previous stage first 🔒');
      }
      return;
    }
    btn.classList.add('btn-pressing');
    setTimeout(() => {
      btn.classList.remove('btn-pressing');
      openReadyModal(id);
    }, 85);
  });

  const TRANSITION_DELAY_MS = 85;

  function bindBtn(id, fn, delayMs = TRANSITION_DELAY_MS) {
    const el = $(id);
    if (!el) return;
    let lastTrigger = 0;
    const trigger = (e) => {
      if (e.type === 'pointerdown') {
        try { e.preventDefault(); } catch (err) {}
      }
      e.stopPropagation();
      const now = Date.now();
      if (now - lastTrigger < 250) return;
      lastTrigger = now;
      initAudio();

      if (delayMs > 0) {
        el.classList.add('btn-pressing');
        setTimeout(() => {
          el.classList.remove('btn-pressing');
          fn();
        }, delayMs);
      } else {
        fn();
      }
    };
    el.addEventListener('pointerdown', trigger);
    el.addEventListener('click', trigger);
  }
  bindBtn('btn-continue', () => {
    const next = nextStageIndex();
    if (clearedCount() >= TOTAL_STAGES) { openSelect(); return; }
    if (!isUnlocked(next)) { openSelect(); showToast(`⭐ Need ${gateFor(next)} stars! Collect more stars from earlier worlds!`); return; }
    if (save.unlockedCats && save.unlockedCats.length > 1) {
      openReadyModal(next);
    } else {
      startStage(next);
    }
  });
  bindBtn('btn-select', openSelect);
  bindBtn('btn-endless', () => startEndless());
  bindBtn('btn-cats', showCompanionModal);
  bindBtn('btn-select-cats', showCompanionModal);
  bindBtn('companion-close', hideCompanionModal, 0);
  bindBtn('select-back', showStart);
  bindBtn('btn-ready-start', () => {
    if (readyModalEl) readyModalEl.style.display = 'none';
    if (isBonusStageAlreadyPlayed(pendingStageId)) {
      showToast((getLang() === 'ko')
        ? '보너스 스테이지는 1회만 도전할 수 있습니다냥! 🔒'
        : 'Bonus stage can only be played once, meow! 🔒');
      openSelect();
      return;
    }
    startStage(pendingStageId);
  });
  bindBtn('btn-ready-gacha-shortcut', () => {
    if (readyModalEl) readyModalEl.style.display = 'none';
    gachaOpenedFromReady = true;
    openGachaModal();
  });
  bindBtn('ready-close', closeReadyModal, 0);
  if (readyModalEl) {
    readyModalEl.addEventListener('click', (e) => {
      if (e.target === readyModalEl) closeReadyModal();
    });
  }
  bindBtn('start-settings-btn', openSettingsModal);
  bindBtn('in-game-settings-btn', openSettingsModal);
  bindBtn('select-settings-btn', openSettingsModal);
  bindBtn('lang-btn', toggleLanguage, 0);
  bindBtn('start-lang-btn', toggleLanguage, 0);
  bindBtn('menu-btn', () => { if (gameState === 'PLAYING' || gameState === 'GAMEOVER' || gameState === 'CLEAR') goMenu(); });
  bindBtn('btn-menu-over', () => goMenu());
  bindBtn('btn-menu-clear', () => goMenu());
  bindBtn('btn-retry-clear', () => retryCurrent());
  bindBtn('btn-retry-over', () => retryCurrent());
  bindBtn('btn-next', () => {
    let next = cfg.id + 1;
    while (next < TOTAL_STAGES && isBonusStageAlreadyPlayed(next)) {
      next++;
    }
    if (next < TOTAL_STAGES && isUnlocked(next)) {
      if (save.unlockedCats && save.unlockedCats.length > 1) {
        openReadyModal(next);
      } else {
        startStage(next);
      }
    } else {
      openSelect();
    }
  });
  bindBtn('btn-equip-unlocked', () => {
    if (pendingUnlockedCat) {
      save.selectedCat = pendingUnlockedCat.id;
      persist();
      applyCompanionVisual();
      showToast(t('catEquippedToast', { name: getCompanionField(pendingUnlockedCat, 'name') }));
    }
    hideOverlays();
    if (mode === 'STAGE') openSelect();
    else showStart();
  });
  bindBtn('btn-close-unlock', () => {
    hideOverlays();
    if (mode === 'STAGE') openSelect();
    else showStart();
  });

  if (companionModalEl) {
    companionModalEl.addEventListener('click', (e) => {
      if (e.target === companionModalEl) hideCompanionModal();
    });
  }
  if (unlockModalEl) {
    unlockModalEl.addEventListener('click', (e) => {
      if (e.target === unlockModalEl) {
        hideOverlays();
        if (mode === 'STAGE') openSelect();
        else showStart();
      }
    });
  }

  const bossActorEl = $('boss-actor');
  if (bossActorEl) {
    bossActorEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      initAudio();
      const pokeLine = (cfg && cfg.bossInfo && getBossQuote(cfg.bossInfo, 'frenzyQuote'))
        || t('pokeLineFallback');
      setBossState('frenzy', pokeLine, 1400);
      playBossHurtSound();
    });
  }

  const GACHA_WEIGHTS = {
    1: 25, // Classic/Starter (Role 0)
    2: 15, // Rare (Role 1~3)
    3: 10, // Mystic (Role 4)
    4: 6   // Legendary (Role 5)
  };

  function openGachaModal() {
    initAudio();
    const modal = $('gacha-modal');
    if (!modal) return;
    if ($('gacha-ticket-count')) $('gacha-ticket-count').textContent = save.gachaTickets || 0;
    if ($('gacha-churu-count')) $('gacha-churu-count').textContent = save.churu || 0;
    openModalAnim(modal);
  }

  function closeGachaModal() {
    const modal = $('gacha-modal');
    const roster = $('gacha-roster-view');
    if (roster) roster.style.display = 'none';
    closeModalAnim(modal, () => {
      if (gachaOpenedFromReady) {
        gachaOpenedFromReady = false;
        openReadyModal(pendingStageId);
        return;
      }
      if (companionModalEl && companionModalEl.style.display === 'flex') {
        renderCompanionModal();
      }
    });
  }

  function drawCatFromGacha() {
    let totalW = 0;
    CAT_COMPANIONS.forEach(c => {
      totalW += GACHA_WEIGHTS[c.rarity] || 15;
    });
    let r = Math.random() * totalW;
    let chosen = CAT_COMPANIONS[0];
    for (let c of CAT_COMPANIONS) {
      const w = GACHA_WEIGHTS[c.rarity] || 15;
      if (r < w) {
        chosen = c;
        break;
      }
      r -= w;
    }

    const unlocked = save.unlockedCats || ['shiro'];
    const isDuplicate = unlocked.includes(chosen.id);

    if (!isDuplicate) {
      save.unlockedCats.push(chosen.id);
    } else {
      save.churu = (save.churu || 0) + 25; // Duplicate refund
      FirebaseTracker.logEvent('churu_earned', {
        source: 'gacha_duplicate',
        amount: 25,
        total_churu: save.churu,
        cat_id: chosen.id
      });
    }
    return { cat: chosen, isDuplicate: isDuplicate };
  }

  let gachaAnimTimeout1 = null;
  let gachaAnimTimeout2 = null;
  let gachaAnimTimeout3 = null;

  function startGachaCutscene(count, results, onComplete) {
    const overlay = $('gacha-anim-overlay');
    const machine = $('gacha-anim-machine');
    const machineCard = $('gacha-machine-card') || machine;
    const crank = $('gacha-anim-crank');
    const statusEl = $('gacha-anim-status');
    const capWrap = $('gacha-anim-capsule-wrap');
    const cap = $('gacha-big-capsule');
    const burstArt = $('gacha-burst-art');
    const prompt = $('gacha-anim-tap-prompt');
    const burst = $('gacha-anim-burst');
    const skipBtn = $('btn-gacha-anim-skip');

    if (!overlay || !machine || !capWrap || !cap) {
      onComplete();
      return;
    }

    if (gachaAnimTimeout1) clearTimeout(gachaAnimTimeout1);
    if (gachaAnimTimeout2) clearTimeout(gachaAnimTimeout2);
    if (gachaAnimTimeout3) clearTimeout(gachaAnimTimeout3);

    const maxRarity = Math.max(...results.map(r => r.cat.rarity));

    overlay.style.display = 'flex';
    machine.style.display = 'flex';
    machine.style.opacity = '1';
    machine.style.transform = 'scale(1)';
    machineCard.classList.remove('anim-shake');
    if (crank) {
      crank.style.transition = 'none';
      crank.style.transform = 'rotate(0deg)';
    }
    if (statusEl) {
      statusEl.textContent = (getLang() === 'ko') ? '🐾 냥이 레버를 힘차게 돌리는 중! 🐾' : '🐾 CRANKING THE MAGICAL MACHINE! 🐾';
    }
    capWrap.style.display = 'none';
    if (burstArt) burstArt.style.display = 'none';
    burst.style.display = 'none';
    cap.className = `gacha-big-capsule rarity-${maxRarity}`;

    if (prompt) {
      prompt.style.display = 'block';
      prompt.textContent = (getLang() === 'ko') ? '✨ 캡슐을 터치하여 개봉! ✨' : '✨ TAP TO OPEN CAPSULE! ✨';
    }

    let finished = false;
    function finishCutscene() {
      if (finished) return;
      finished = true;
      if (gachaAnimTimeout1) clearTimeout(gachaAnimTimeout1);
      if (gachaAnimTimeout2) clearTimeout(gachaAnimTimeout2);
      if (gachaAnimTimeout3) clearTimeout(gachaAnimTimeout3);
      overlay.style.display = 'none';
      onComplete();
    }

    if (skipBtn) {
      skipBtn.onclick = (e) => {
        e.stopPropagation();
        finishCutscene();
      };
    }

    // 1. Crank turn & machine wobble
    playGachaCrankSound();
    setTimeout(() => {
      if (crank) {
        crank.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
        crank.style.transform = 'rotate(720deg)';
      }
      machineCard.classList.add('anim-shake');
    }, 30);

    // 2. Drop Capsule
    gachaAnimTimeout1 = setTimeout(() => {
      machine.style.opacity = '0';
      machine.style.transform = 'scale(0.85)';
      setTimeout(() => {
        machine.style.display = 'none';
        capWrap.style.display = 'flex';
        cap.classList.add('capsule-drop-in');
        playThud(0.8);
      }, 150);

      let opened = false;
      function triggerCrack() {
        if (opened || finished) return;
        opened = true;
        if (gachaAnimTimeout3) clearTimeout(gachaAnimTimeout3);

        if (prompt) prompt.style.display = 'none';
        cap.classList.add('cracking');
        if (burstArt) burstArt.style.display = 'block';
        playGachaCrackSound(maxRarity);
        if (burst) burst.style.display = 'flex';

        gachaAnimTimeout2 = setTimeout(() => {
          finishCutscene();
        }, 600);
      }

      capWrap.onclick = (e) => {
        e.stopPropagation();
        triggerCrack();
      };

      gachaAnimTimeout3 = setTimeout(() => {
        triggerCrack();
      }, 1400);

    }, 700);
  }

  function pullGacha(count) {
    initAudio();
    save.gachaTickets = save.gachaTickets || 0;
    save.churu = save.churu || 0;

    if (count === 1) {
      if (save.gachaTickets >= 1) {
        save.gachaTickets -= 1;
      } else if (save.churu >= 50) {
        save.churu -= 50;
      } else {
        showToast(t('gachaNotEnough'));
        return;
      }
    } else if (count === 10) {
      if (save.gachaTickets >= 10) {
        save.gachaTickets -= 10;
      } else if (save.churu >= 450) {
        save.churu -= 450;
      } else {
        showToast(t('gachaNotEnough'));
        return;
      }
    } else {
      return;
    }

    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(drawCatFromGacha());
    }
    persist();

    FirebaseTracker.log(`Gacha pull count: ${count}`);
    FirebaseTracker.logEvent('gacha_pull', {
      pull_count: count,
      currency_used: (save.gachaTickets > 0 || count === 1 ? 'ticket_or_churu' : 'churu'),
      remaining_tickets: save.gachaTickets,
      remaining_churu: save.churu,
      result_cats: results.map(r => r.id).join(',')
    });

    if ($('gacha-ticket-count')) $('gacha-ticket-count').textContent = save.gachaTickets;
    if ($('gacha-churu-count')) $('gacha-churu-count').textContent = save.churu;
    if ($('comp-ticket-count')) $('comp-ticket-count').textContent = save.gachaTickets;
    if ($('comp-churu-count')) $('comp-churu-count').textContent = save.churu;

    startGachaCutscene(count, results, () => {
      showGachaReveal(results);
    });
  }

  function showGachaReveal(results) {
    const modal = $('gacha-reveal-modal');
    const container = $('gacha-reveal-cards');
    if (!modal || !container) return;

    container.classList.toggle('grid-10', results.length > 1);
    let html = '';
    results.forEach((res, idx) => {
      const cat = res.cat;
      const isNew = !res.isDuplicate;
      const starsStr = '★'.repeat(cat.rarity);
      const badgeClass = isNew ? 'gacha-res-new' : 'gacha-res-dup';
      const badgeText = isNew ? t('gachaNewCat') : t('gachaDuplicate');
      const rarityCls = cat.rarity === 4 ? 'is-legendary' : (cat.rarity === 3 ? 'is-mystic' : '');

      html += `
        <div class="gacha-reveal-card ${isNew ? 'is-new' : 'is-dup'} ${rarityCls}" style="animation-delay: ${idx * 0.08}s;">
          <div class="gacha-card-badge ${badgeClass}">${badgeText}</div>
          <div class="gacha-card-avatar-wrap">
            <img class="gacha-card-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter:${cat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(cat, 'name')}">
          </div>
          <div class="gacha-card-name">${getCompanionField(cat, 'name')}</div>
          <div class="gacha-card-rarity">${starsStr}</div>
          <div class="gacha-card-title">${getCompanionField(cat, 'title')}</div>
          <div class="gacha-card-perk">⚡ ${getCompanionField(cat, 'perk')}</div>
        </div>
      `;
    });

    container.innerHTML = html;
    openModalAnim(modal);
  }

  function closeGachaReveal() {
    const modal = $('gacha-reveal-modal');
    closeModalAnim(modal, () => {
      if (companionModalEl && companionModalEl.style.display === 'flex') {
        renderCompanionModal();
      }
    });
  }

  function toggleGachaRoster() {
    const roster = $('gacha-roster-view');
    if (!roster) return;
    if (roster.style.display === 'block') {
      roster.style.display = 'none';
      return;
    }

    const unlocked = save.unlockedCats || ['shiro'];
    let html = `
      <div class="gacha-rates-banner">
        <div style="font-weight: 800; margin-bottom: 4px;">🎯 Gacha Rates / 등장 확률:</div>
        <div>👑 4★ Legendary (W5): 7%  ·  🌙 3★ Mystic (W4): 12%</div>
        <div>⭐ 2★ Rare (W1~3): 52%  ·  🐾 1★ Classic (Base): 29%</div>
        <div style="margin-top: 4px; font-size: 11px; opacity: 0.85;">※ Duplicate pulls refund +25 <img src="assets/churu_icon.jpg" class="churu-icon" alt="츄르"> Churu Coins!</div>
      </div>
      <div class="gacha-roster-grid">
    `;

    CAT_COMPANIONS.forEach(cat => {
      const isUn = unlocked.includes(cat.id);
      const stars = '★'.repeat(cat.rarity);
      html += `
        <div class="gacha-roster-item ${isUn ? 'unlocked' : 'locked'}">
          <div class="gacha-roster-avatar">
            <img class="gacha-roster-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter:${cat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(cat, 'name')}">
          </div>
          <div class="gacha-roster-info">
            <div class="gacha-roster-name-row">
              <span class="gacha-roster-name">${getCompanionField(cat, 'name')}</span>
              <span class="gacha-roster-stars">${stars}</span>
              <span class="gacha-roster-status">${isUn ? '✓' : '🔒'}</span>
            </div>
            <div class="gacha-roster-perk">${getCompanionField(cat, 'perk')}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    roster.innerHTML = html;
    roster.style.display = 'block';
  }

  // Gacha button event bindings
  bindBtn('btn-gacha', openGachaModal, TRANSITION_DELAY_MS);
  bindBtn('btn-select-gacha', openGachaModal, TRANSITION_DELAY_MS);
  bindBtn('btn-comp-to-gacha', () => {
    hideCompanionModal();
    openGachaModal();
  }, TRANSITION_DELAY_MS);
  bindBtn('gacha-close', closeGachaModal, 0);

  const btnGacha1 = $('btn-gacha-1');
  if (btnGacha1) btnGacha1.addEventListener('click', () => pullGacha(1));

  const btnGacha10 = $('btn-gacha-10');
  if (btnGacha10) btnGacha10.addEventListener('click', () => pullGacha(10));

  const btnToggleRoster = $('btn-toggle-roster');
  if (btnToggleRoster) btnToggleRoster.addEventListener('click', toggleGachaRoster);

  const btnGachaRevealOk = $('btn-gacha-reveal-ok');
  if (btnGachaRevealOk) btnGachaRevealOk.addEventListener('click', closeGachaReveal);

  const gachaModalEl = $('gacha-modal');
  if (gachaModalEl) {
    gachaModalEl.addEventListener('click', (e) => {
      if (e.target === gachaModalEl) closeGachaModal();
    });
  }

  const gachaRevealModalEl = $('gacha-reveal-modal');
  if (gachaRevealModalEl) {
    gachaRevealModalEl.addEventListener('click', (e) => {
      if (e.target === gachaRevealModalEl) closeGachaReveal();
    });
  }


  // -------------------------------------------------------------
  // GAME SETTINGS SYSTEM
  // -------------------------------------------------------------
  const settingsModalEl = $('settings-modal');

  let settingsOpenedAt = 0;
  function openSettingsModal() {
    initAudio();
    renderSettingsModal();
    settingsOpenedAt = Date.now();
    openModalAnim(settingsModalEl);
  }

  function closeSettingsModal() {
    closeModalAnim(settingsModalEl);
  }

  function renderSettingsModal() {
    if (!save.settings) {
      save.settings = { bgm: true, sfx: true, haptics: true, screenShake: true, particles: true };
    }

    // Language Buttons
    const lang = getLang();
    const btnKo = $('btn-set-lang-ko');
    const btnEn = $('btn-set-lang-en');
    if (btnKo) btnKo.className = 'settings-lang-btn' + (lang === 'ko' ? ' active' : '');
    if (btnEn) btnEn.className = 'settings-lang-btn' + (lang === 'en' ? ' active' : '');

    // Toggles
    function syncToggle(id, val) {
      const btn = $(id);
      if (!btn) return;
      btn.textContent = val ? 'ON' : 'OFF';
      if (val) btn.classList.add('active');
      else btn.classList.remove('active');
    }

    syncToggle('toggle-bgm', save.settings.bgm !== false);
    syncToggle('toggle-sfx', save.settings.sfx !== false);
    syncToggle('toggle-haptics', save.settings.haptics !== false);
    syncToggle('toggle-shake', save.settings.screenShake !== false);
    syncToggle('toggle-particles', save.settings.particles !== false);

    // Stats
    if ($('setting-stat-stars')) $('setting-stat-stars').textContent = t('settingStatStars', { stars: totalStars() });
    if ($('setting-stat-cleared')) $('setting-stat-cleared').textContent = t('settingStatCleared', { cleared: clearedCount() });

    // Text Translations
    if ($('settings-title')) $('settings-title').textContent = t('settingsTitle');
    if ($('setting-lbl-lang')) $('setting-lbl-lang').textContent = t('settingLang');
    if ($('setting-lbl-audio')) $('setting-lbl-audio').textContent = t('settingAudio');
    if ($('setting-lbl-bgm')) $('setting-lbl-bgm').textContent = t('settingBgm');
    if ($('setting-desc-bgm')) $('setting-desc-bgm').textContent = t('settingBgmDesc');
    if ($('setting-lbl-sfx')) $('setting-lbl-sfx').textContent = t('settingSfx');
    if ($('setting-desc-sfx')) $('setting-desc-sfx').textContent = t('settingSfxDesc');
    if ($('setting-lbl-feel')) $('setting-lbl-feel').textContent = t('settingFeel');
    if ($('setting-lbl-haptics')) $('setting-lbl-haptics').textContent = t('settingHaptics');
    if ($('setting-desc-haptics')) $('setting-desc-haptics').textContent = t('settingHapticsDesc');
    if ($('setting-lbl-shake')) $('setting-lbl-shake').textContent = t('settingShake');
    if ($('setting-desc-shake')) $('setting-desc-shake').textContent = t('settingShakeDesc');
    if ($('setting-lbl-particles')) $('setting-lbl-particles').textContent = t('settingParticles');
    if ($('setting-desc-particles')) $('setting-desc-particles').textContent = t('settingParticlesDesc');
    if ($('setting-lbl-data')) $('setting-lbl-data').textContent = t('settingData');
    if ($('btn-reset-data')) $('btn-reset-data').textContent = t('settingResetBtn');
    if ($('setting-version-tag')) $('setting-version-tag').textContent = t('settingVersion');
  }

  // Settings Interactions
  bindBtn('btn-set-lang-ko', () => {
    if (save.lang !== 'ko') {
      save.lang = 'ko';
      persist();
      applyLanguage();
      renderSettingsModal();
      playMarimbaNote(587.33, true);
      FirebaseTracker.logEvent('settings_changed', { setting_name: 'language', new_value: 'ko' });
    }
  }, 0);

  bindBtn('btn-set-lang-en', () => {
    if (save.lang !== 'en') {
      save.lang = 'en';
      persist();
      applyLanguage();
      renderSettingsModal();
      playMarimbaNote(587.33, true);
      FirebaseTracker.logEvent('settings_changed', { setting_name: 'language', new_value: 'en' });
    }
  }, 0);

  bindBtn('toggle-bgm', () => {
    save.settings.bgm = !(save.settings.bgm !== false);
    persist();
    updateBgmPlayback();
    renderSettingsModal();
    playMarimbaNote(659.25, true);
    FirebaseTracker.logEvent('settings_changed', { setting_name: 'bgm', new_value: save.settings.bgm });
  }, 0);

  bindBtn('toggle-sfx', () => {
    save.settings.sfx = !(save.settings.sfx !== false);
    persist();
    renderSettingsModal();
    if (save.settings.sfx) playMarimbaNote(659.25, true);
    FirebaseTracker.logEvent('settings_changed', { setting_name: 'sfx', new_value: save.settings.sfx });
  }, 0);

  bindBtn('toggle-haptics', () => {
    save.settings.haptics = !(save.settings.haptics !== false);
    persist();
    if (save.settings.haptics) triggerHaptic(35);
    renderSettingsModal();
    playMarimbaNote(523.25, true);
    FirebaseTracker.logEvent('settings_changed', { setting_name: 'haptics', new_value: save.settings.haptics });
  }, 0);

  bindBtn('toggle-shake', () => {
    save.settings.screenShake = !(save.settings.screenShake !== false);
    persist();
    if (save.settings.screenShake) triggerShake(4, 0.2);
    renderSettingsModal();
    playMarimbaNote(523.25, true);
    FirebaseTracker.logEvent('settings_changed', { setting_name: 'screenShake', new_value: save.settings.screenShake });
  }, 0);

  bindBtn('toggle-particles', () => {
    save.settings.particles = !(save.settings.particles !== false);
    persist();
    renderSettingsModal();
    playMarimbaNote(523.25, true);
    FirebaseTracker.logEvent('settings_changed', { setting_name: 'particles', new_value: save.settings.particles });
  }, 0);

  bindBtn('btn-reset-data', () => {
    if (window.confirm(t('settingResetConfirm'))) {
      const prevStarsCount = Object.keys(save.stars || {}).length;
      const prevChuru = save.churu || 0;
      FirebaseTracker.logEvent('user_data_reset', {
        previous_stars_count: prevStarsCount,
        previous_churu: prevChuru
      });
      localStorage.removeItem(SAVE_KEY);
      save = loadSave();
      persist();
      showToast(t('settingResetSuccess'));
      closeSettingsModal();
      applyLanguage();
      renderSelect();
      showStart();
    }
  }, 0);

  bindBtn('settings-close', closeSettingsModal, 0);

  let backdropPointerDownOnSelf = false;
  if (settingsModalEl) {
    settingsModalEl.addEventListener('pointerdown', (e) => {
      backdropPointerDownOnSelf = (e.target === settingsModalEl);
    });
    settingsModalEl.addEventListener('click', (e) => {
      if (backdropPointerDownOnSelf && e.target === settingsModalEl && (Date.now() - settingsOpenedAt > 200)) {
        closeSettingsModal();
      }
      backdropPointerDownOnSelf = false;
    });
  }


  // CINEMATIC BOSS INTRO & JUICY CLEAR STARS ENGINE
  // -------------------------------------------------------------
  let isBossIntroPlaying = false;
  let bossIntroTimers = [];

  function clearBossIntroTimers() {
    bossIntroTimers.forEach(t => clearTimeout(t));
    bossIntroTimers = [];
  }

  function playBossIntro(stageCfg, onFinish) {
    isBossIntroPlaying = true;
    clearBossIntroTimers();

    const overlay = $('boss-intro-overlay');
    const warningEl = $('boss-intro-warning');
    const cardEl = $('boss-intro-card');
    const avatarEl = $('boss-intro-avatar');
    const titleEl = $('boss-intro-title');
    const nameEl = $('boss-intro-name');
    const hpFill = $('boss-intro-hp-fill');
    const hpNum = $('boss-intro-hp-num');
    const quoteBox = $('boss-intro-quote-box');
    const quoteEl = $('boss-intro-quote');
    const fightEl = $('boss-intro-fight');
    const skipBtn = $('boss-intro-skip');

    if (!overlay) {
      isBossIntroPlaying = false;
      onFinish();
      return;
    }

    // Set localized texts
    if (warningEl) warningEl.textContent = t('bossIntroWarning');
    if (fightEl) fightEl.textContent = t('bossIntroFight');
    if (skipBtn) skipBtn.textContent = t('bossIntroSkip');

    const bInfo = stageCfg.bossInfo || WORLD_BOSS_NAMES[0];
    if (avatarEl) avatarEl.textContent = bInfo.emoji || '😾';
    if (titleEl) titleEl.textContent = getBossField(bInfo, 'title');
    if (nameEl) nameEl.textContent = bInfo.name;
    if (hpNum) hpNum.textContent = `${stageCfg.target} / ${stageCfg.target}`;
    if (quoteEl) quoteEl.textContent = `"${getBossField(bInfo, 'quote')}"`;

    // Reset elements
    overlay.style.display = 'flex';
    overlay.style.transition = '';
    overlay.style.opacity = '1';
    if (cardEl) cardEl.classList.remove('slam');
    if (hpFill) hpFill.style.width = '0%';
    if (quoteBox) quoteBox.classList.remove('show');
    if (fightEl) fightEl.classList.remove('show');

    // Audio: Warning tone
    playMarimbaNote(220, false);
    triggerShake(5, 0.35);

    const endIntro = () => {
      if (!isBossIntroPlaying) return;
      clearBossIntroTimers();
      overlay.style.transition = 'opacity 0.22s ease-out';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.transition = '';
        isBossIntroPlaying = false;
        onFinish();
      }, 240);
    };

    if (skipBtn) {
      skipBtn.onclick = (e) => {
        e.stopPropagation();
        endIntro();
      };
    }

    // Phase 1 (0.5s): Boss zoom & quote appear
    bossIntroTimers.push(setTimeout(() => {
      if (quoteBox) quoteBox.classList.add('show');
      setBossState('frenzy', `${bInfo.name}: "${getBossField(bInfo, 'quote')}"`, 1800);
      playMarimbaNote(330, false);
      triggerShake(6, 0.25);
    }, 500));

    // Phase 2 (1.1s): Card slam & HP fill
    bossIntroTimers.push(setTimeout(() => {
      if (cardEl) cardEl.classList.add('slam');
      if (hpFill) hpFill.style.width = '100%';
      playLifeSaveChime();
      triggerShake(8, 0.3);
    }, 1100));

    // Phase 3 (1.6s): FIGHT shout!
    bossIntroTimers.push(setTimeout(() => {
      if (fightEl) fightEl.classList.add('show');
      playMarimbaNote(587.33, true);
      triggerShake(4, 0.2);
    }, 1600));

    // Phase 4 (2.1s): Fadeout and start game
    bossIntroTimers.push(setTimeout(() => {
      endIntro();
    }, 2100));
  }

  function spawnStarElementSparks(starEl) {
    if (!starEl) return;
    const rect = starEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ['#ffd54f', '#ffca28', '#fff9c4', '#ffffff', '#ff9800'];

    for (let i = 0; i < 9; i++) {
      const spark = document.createElement('div');
      spark.className = 'dom-star-spark';
      const angle = (Math.PI * 2 * i) / 9 + (Math.random() - 0.5) * 0.4;
      const dist = 22 + Math.random() * 24;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const size = 5 + Math.random() * 4;

      spark.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${colors[i % colors.length]};
        box-shadow: 0 0 8px ${colors[i % colors.length]};
        pointer-events: none;
        z-index: 1000;
        transform: translate(-50%, -50%) scale(1);
        transition: transform 0.45s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.45s ease-out;
      `;
      document.body.appendChild(spark);

      requestAnimationFrame(() => {
        spark.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
        spark.style.opacity = '0';
      });

      setTimeout(() => {
        if (spark.parentNode) spark.parentNode.removeChild(spark);
      }, 480);
    }
  }

  function animateClearStars(stars) {
    const cstars = [$('cstar-1'), $('cstar-2'), $('cstar-3')];
    cstars.forEach(el => {
      if (el) el.classList.remove('filled');
    });
    const purrfectEl = $('clear-purrfect-banner');
    if (purrfectEl) purrfectEl.style.display = 'none';

    const starFreqs = [523.25, 659.25, 783.99]; // C5, E5, G5

    for (let s = 1; s <= 3; s++) {
      const starEl = cstars[s - 1];
      if (s <= stars) {
        setTimeout(() => {
          if (gameState !== 'CLEAR') return;
          if (starEl) {
            starEl.classList.add('filled');
            spawnStarElementSparks(starEl);
          }
          playMarimbaNote(starFreqs[s - 1] || 523.25, true);
          triggerHaptic(25);
        }, (s - 1) * 320 + 200);
      }
    }

    if (stars === 3) {
      setTimeout(() => {
        if (gameState !== 'CLEAR') return;
        if (purrfectEl) {
          purrfectEl.textContent = t('purrfect');
          purrfectEl.style.display = 'block';
        }
        playSizeExpandChime();
        const top = tower[tower.length - 1];
        if (top) spawn3DStarBurst(top.x, top.z, top.y, cameraY, 28);
        triggerHaptic([30, 40, 50]);
      }, 3 * 320 + 350);
    }
  }