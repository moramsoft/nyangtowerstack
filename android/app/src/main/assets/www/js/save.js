// Stack Tower - Save Data Persistence & Progress Helpers

  // --- SAVE DATA ---
  const SAVE_KEY = 'stackTowerCampaignV1';
  function loadSave() {
    let urlLang = null;
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      try {
        const p = new URLSearchParams(window.location.search);
        const l = p.get('lang');
        if (l === 'ko' || l === 'en') urlLang = l;
      } catch (e) { /* ignore */ }
    }
    const defaultLang = urlLang || ((typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('ko')) ? 'ko' : 'en');
    const defaultSettings = {
      bgm: true,
      sfx: true,
      haptics: true,
      screenShake: true,
      particles: true
    };
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (s && s.stars) {
        s.fails = s.fails || {};
        s.bonusChuruEarned = s.bonusChuruEarned || {};
        s.bonusPlayed = s.bonusPlayed || {};
        s.unlockedCats = Array.isArray(s.unlockedCats) ? s.unlockedCats : ['shiro'];
        s.selectedCat = s.selectedCat || 'shiro';
        s.lang = s.lang || defaultLang;
        s.gachaTickets = s.gachaTickets !== undefined ? s.gachaTickets : 2;
        s.churu = s.churu !== undefined ? s.churu : 100;
        s.settings = Object.assign({}, defaultSettings, s.settings || {});
        return s;
      }
    } catch (e) { /* ignore corrupt save */ }
    return {
      stars: {},
      fails: {},
      bonusChuruEarned: {},
      bonusPlayed: {},
      unlockedCats: ['shiro'],
      selectedCat: 'shiro',
      lang: defaultLang,
      gachaTickets: 2,
      churu: 100,
      settings: Object.assign({}, defaultSettings)
    };
  }
  let save = loadSave();

  function toggleLanguage() {
    save.lang = (getLang() === 'ko') ? 'en' : 'ko';
    persist();
    applyLanguage();
  }

  function applyLanguage() {
    const lang = getLang();
    const langLabel = (lang === 'ko') ? '🌐 한국어' : '🌐 EN';
    const langBtnEl = $('lang-btn');
    if (langBtnEl) langBtnEl.textContent = langLabel;
    const startLangBtnEl = $('start-lang-btn');
    if (startLangBtnEl) startLangBtnEl.textContent = langLabel;

    // Start screen
    const isKo = lang === 'ko';
    if ($('badge-3d')) $('badge-3d').textContent = t('badge3d');
    if ($('dock-label-select')) $('dock-label-select').textContent = isKo ? '스테이지' : 'Stages';
    if ($('dock-label-endless')) $('dock-label-endless').textContent = isKo ? '무한 모드' : 'Endless';
    if ($('dock-label-gacha')) $('dock-label-gacha').textContent = isKo ? '냥이 가챠' : 'Cat Gacha';
    if ($('dock-label-cats')) $('dock-label-cats').textContent = isKo ? '동료 고양이' : 'Companions';
    if (typeof refreshStartScreen === 'function') {
      refreshStartScreen();
    }

    // Select screen
    if ($('select-title')) $('select-title').textContent = t('selectTitle');
    if ($('select-back')) $('select-back').textContent = '←';
    const gachaShort = lang === 'ko' ? '가챠' : 'Gacha';
    const catsShort = lang === 'ko' ? '동료' : 'Cats';
    if ($('btn-select-gacha')) $('btn-select-gacha').innerHTML = `🎁 <span class="header-btn-label">${gachaShort}</span>`;
    if ($('btn-select-cats')) $('btn-select-cats').innerHTML = `🐱 <span class="header-btn-label">${catsShort}</span>`;
    if ($('legend-climb')) $('legend-climb').textContent = t('legendClimb');
    if ($('legend-speed')) $('legend-speed').textContent = t('legendSpeed');
    if ($('legend-precision')) $('legend-precision').textContent = t('legendPrecision');
    if ($('legend-hazard')) $('legend-hazard').textContent = t('legendHazard');
    if ($('legend-bonus')) $('legend-bonus').innerHTML = t('legendBonus');
    if ($('legend-boss')) $('legend-boss').textContent = t('legendBoss');

    // Game Over screen
    if ($('gameover-title')) $('gameover-title').textContent = t('gameOver');
    if ($('score-label')) $('score-label').textContent = t('scoreLabel');
    if ($('best-label')) $('best-label').textContent = t('bestLabel');
    if ($('restart-text')) $('restart-text').textContent = t('tapRetry');
    if ($('btn-retry-over')) $('btn-retry-over').textContent = t('btnRetry');
    if ($('btn-menu-over')) $('btn-menu-over').textContent = t('btnMenu');

    // Clear screen (jelly buttons preserve img child and update aria-label)
    if ($('btn-next')) $('btn-next').setAttribute('aria-label', t('btnNext'));
    if ($('btn-retry-clear')) $('btn-retry-clear').setAttribute('aria-label', t('btnReplay'));
    if ($('btn-menu-clear')) $('btn-menu-clear').setAttribute('aria-label', t('btnMenuClear'));

    // Companions modal
    if ($('companion-title')) $('companion-title').textContent = t('companionsTitle');
    if ($('companion-subtitle')) $('companion-subtitle').textContent = t('companionsSubtitle');
    if ($('btn-comp-to-gacha')) $('btn-comp-to-gacha').textContent = t('btnCompToGacha');

    // Gacha modal
    if ($('gacha-title')) $('gacha-title').textContent = t('gachaTitle');
    if ($('gacha-subtitle')) $('gacha-subtitle').textContent = t('gachaSubtitle');
    if ($('btn-gacha-1-text')) $('btn-gacha-1-text').textContent = t('gachaPull1');
    if ($('btn-gacha-1-cost')) $('btn-gacha-1-cost').innerHTML = t('gachaPull1Cost');
    if ($('btn-gacha-10-text')) $('btn-gacha-10-text').textContent = t('gachaPull10');
    if ($('btn-gacha-10-cost')) $('btn-gacha-10-cost').innerHTML = t('gachaPull10Cost');
    if ($('btn-toggle-roster')) $('btn-toggle-roster').textContent = t('gachaRatesBtn');

    // Unlock modal
    if ($('unlock-ribbon')) $('unlock-ribbon').textContent = t('unlockRibbon');
    if ($('btn-equip-unlocked')) $('btn-equip-unlocked').textContent = t('btnEquipUnlocked');
    if ($('btn-close-unlock')) $('btn-close-unlock').textContent = t('btnCloseUnlock');

    // Ready modal
    if ($('ready-ribbon')) $('ready-ribbon').textContent = t('prepTitle');
    if ($('btn-ready-start')) $('btn-ready-start').textContent = t('startExpedition');
    if ($('ready-section-label')) $('ready-section-label').textContent = t('chooseCompanion');
    if ($('btn-ready-gacha-shortcut')) $('btn-ready-gacha-shortcut').textContent = t('readyGachaShortcut');
    
    if (gameState === 'SELECT') {
      renderSelect();
    } else if (mode === 'STAGE' && cfg) {
      updateHud();
    }

    if (readyModalEl && readyModalEl.style.display === 'flex') {
      updateReadyModal();
    }
    if (companionModalEl && companionModalEl.style.display === 'flex') {
      renderCompanionModal();
    }
    if (typeof renderSettingsModal === 'function') {
      renderSettingsModal();
    }
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
  }
  function updateChuruDisplays() {
    const cnt = save.churu || 0;
    if ($('comp-churu-count')) $('comp-churu-count').textContent = cnt;
    if ($('gacha-churu-count')) $('gacha-churu-count').textContent = cnt;
  }
  function getSelectedCat() {
    return CAT_COMPANIONS.find(c => c.id === save.selectedCat) || CAT_COMPANIONS[0];
  }
  function applyCompanionVisual(emotion = 'smile') {
    const cat = getSelectedCat();
    const wrap = $('mascot-wrapper');
    let mascotImg = $('mascot-img');
    if (!mascotImg && wrap) {
      wrap.innerHTML = '<img id="mascot-img" src="assets/chara_smile.png" alt="Cat Mascot">';
      mascotImg = $('mascot-img');
    }
    if (mascotImg && cat) {
      mascotImg.style.filter = cat.filterStyle || 'none';
      if (cat && cat.image && cat.id !== 'shiro' && cat.id !== 'mochi' && cat.id !== 'vanilla') {
        if (emotion === 'sad') {
          mascotImg.src = ASSET_PATHS.sad;
        } else if (emotion === 'celebrate') {
          mascotImg.src = ASSET_PATHS.celebrate;
        } else {
          mascotImg.src = cat.image;
        }
      } else {
        if (emotion === 'smile' && cat.image) {
          mascotImg.src = cat.image;
        } else if (ASSET_PATHS[emotion]) {
          mascotImg.src = ASSET_PATHS[emotion];
        } else {
          mascotImg.src = ASSET_PATHS.smile;
        }
      }
    }
  }
  function starsOf(i) { return save.stars[i] || 0; }
  function totalStars() {
    let t = 0;
    for (let i = 0; i < TOTAL_STAGES; i++) t += starsOf(i);
    return t;
  }
  function isBonusStageAlreadyPlayed(id) {
    if (id < 0 || id >= TOTAL_STAGES) return false;
    const stageCfg = buildStageConfig(id);
    if (stageCfg.stageType !== 'bonus') return false;
    if (save.bonusPlayed && save.bonusPlayed[id]) return true;
    if (save.stars && save.stars[id] > 0) return true;
    if (save.bonusChuruEarned && save.bonusChuruEarned[id] !== undefined) return true;
    return false;
  }
  function isStagePassedOrCleared(id) {
    if (id < 0) return true;
    return starsOf(id) > 0 || isBonusStageAlreadyPlayed(id);
  }
  function getNextPlayableStage(fromId) {
    let target = fromId;
    while (target < TOTAL_STAGES && isBonusStageAlreadyPlayed(target)) {
      target++;
    }
    return target;
  }
  function clearedCount() {
    let c = 0;
    for (let i = 0; i < TOTAL_STAGES; i++) {
      if (starsOf(i) > 0 || isBonusStageAlreadyPlayed(i)) c++;
    }
    return c;
  }
  function gateFor(i) {
    const info = getStageWorldInfo(i);
    return (info.idx === 0) ? (WORLD_STAR_GATES[info.world] || 0) : 0;
  }
  function isUnlocked(i) {
    if (starsOf(i) > 0 || isBonusStageAlreadyPlayed(i) || i === 0) return true;
    if (!isStagePassedOrCleared(i - 1)) return false;
    return totalStars() >= gateFor(i);
  }
  function nextStageIndex() {
    for (let i = 0; i < TOTAL_STAGES; i++) {
      if (isBonusStageAlreadyPlayed(i)) continue;
      if (starsOf(i) < 1) return i;
    }
    return TOTAL_STAGES - 1;
  }
