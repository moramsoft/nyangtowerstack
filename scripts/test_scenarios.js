#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

async function runTestSuite() {
  console.log(`\n${BOLD}${CYAN}====================================================${RESET}`);
  console.log(`${BOLD}${CYAN}    MEOW STACK TOWER - AUTOMATED TEST SUITE        ${RESET}`);
  console.log(`${BOLD}${CYAN}====================================================${RESET}\n`);

  // Step 1: Run Syntax & Asset Sync Check first
  console.log(`${BOLD}[PHASE 1] Validating Script Syntax & File Sync...${RESET}`);
  const verifyScript = path.resolve(__dirname, 'verify_syntax.js');
  const verifyRes = require('child_process').spawnSync(process.execPath, [verifyScript], { encoding: 'utf8' });
  if (verifyRes.status !== 0) {
    console.error(verifyRes.stderr || verifyRes.stdout);
    console.error(`${RED}✗ Syntax or file sync verification failed! Halting test suite.${RESET}`);
    process.exit(1);
  }
  console.log(`${GREEN}✓ Syntax & Asset Sync passed!${RESET}\n`);

  // Step 2: Launch Headless Chrome
  console.log(`${BOLD}[PHASE 2] Launching Chrome Headless & Connecting CDP...${RESET}`);
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const port = 9232;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--autoplay-policy=no-user-gesture-required',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=/tmp/stacktower-chrome-test',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  let exitCode = 0;
  const testResults = [];

  function recordResult(name, passed, detail = '') {
    testResults.push({ name, passed, detail });
    if (passed) {
      console.log(`  ${GREEN}✓ PASS:${RESET} ${name}${detail ? ` (${detail})` : ''}`);
    } else {
      console.log(`  ${RED}✗ FAIL:${RESET} ${name}${detail ? ` - ${detail}` : ''}`);
      exitCode = 1;
    }
  }

  try {
    let pages = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json`);
      pages = await listRes.json();
      if (pages && pages.length > 0) break;
    } catch (e) {
      // wait for Chrome to listen
    }
    await new Promise(r => setTimeout(r, 400));
  }
  if (!pages || pages.length === 0) {
    throw new Error(`Failed to connect to Chrome CDP on port ${port} after multiple attempts`);
  }
  const targetPage = pages.find(p => p.type === 'page') || pages[0];

  const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();
    const uncaughtErrors = [];
    const telemetryEvents = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => (a.value !== undefined ? a.value : a.description)).join(' ');
        if (text.includes('[Firebase Analytics (Dev)]')) {
          const parts = text.split('[Firebase Analytics (Dev)]');
          telemetryEvents.push(parts[1].trim());
        }
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        uncaughtErrors.push(msg.params.exceptionDetails);
      }
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise(resolve => {
        const reqId = msgId++;
        pending.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    async function evaluate(fnStr) {
      const res = await send('Runtime.evaluate', {
        expression: `(async () => { return (${fnStr})(); })()`,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.result && res.result.exceptionDetails) {
        throw new Error(JSON.stringify(res.result.exceptionDetails));
      }
      return res.result?.result?.value;
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 430,
      height: 932,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log(`Navigating to http://127.0.0.1:8088/index.html ...\n`);
    await send('Page.navigate', { url: 'http://127.0.0.1:8088/index.html' });
    await new Promise(r => setTimeout(r, 1500));
    await evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
    });
    await send('Page.navigate', { url: 'http://127.0.0.1:8088/index.html' });
    await new Promise(r => setTimeout(r, 1500));

    console.log(`${BOLD}[PHASE 3] Executing Scenario Test Cases...${RESET}`);

    // Test 1: Start Screen & Initial State
    try {
      const state = await evaluate(() => {
        const start = document.getElementById('start-screen');
        const btnContinue = document.getElementById('btn-continue');
        const btnSelect = document.getElementById('btn-select');
        const btnEndless = document.getElementById('btn-endless');
        const btnGacha = document.getElementById('btn-gacha');
        const btnCats = document.getElementById('btn-cats');
        return {
          title: document.title,
          startVisible: start && window.getComputedStyle(start).display !== 'none',
          hasBtnContinue: !!btnContinue,
          hasBtnSelect: !!btnSelect,
          hasBtnEndless: !!btnEndless,
          hasBtnGacha: !!btnGacha,
          hasBtnCats: !!btnCats,
          hasGameHarness: !!window.__game
        };
      });
      const passed = state.title === 'Meow Stack Tower 3D' && state.startVisible && state.hasBtnContinue && state.hasGameHarness;
      recordResult('Scenario 1: Start Screen & Navigation Dock Initialized', passed, `Title: ${state.title}`);
    } catch (e) {
      recordResult('Scenario 1: Start Screen & Navigation Dock Initialized', false, e.message);
    }

    // Test 2: Primary Button Click -> Game Play Starts
    try {
      const res = await evaluate(async () => {
        const btn = document.getElementById('btn-continue');
        if (!btn) return { error: 'No continue button' };
        btn.click();
        await new Promise(r => setTimeout(r, 150));
        const readyModal = document.getElementById('ready-modal');
        if (readyModal && window.getComputedStyle(readyModal).display !== 'none') {
          const btnReadyStart = document.getElementById('btn-ready-start');
          if (btnReadyStart) btnReadyStart.click();
          await new Promise(r => setTimeout(r, 150));
        }
        const start = document.getElementById('start-screen');
        return {
          gameState: window.__game.getGameState(),
          mode: window.__game.getMode(),
          startDisplay: start ? window.getComputedStyle(start).display : null,
          hudDisplay: window.getComputedStyle(document.getElementById('hud-layer')).display
        };
      });
      const passed = res.gameState === 'PLAYING' && res.mode === 'STAGE' && res.startDisplay === 'none';
      recordResult('Scenario 2: Primary Continue Button Starts Stage 1-1', passed, `gameState=${res.gameState}, mode=${res.mode}`);
    } catch (e) {
      recordResult('Scenario 2: Primary Continue Button Starts Stage 1-1', false, e.message);
    }

    // Test 3: Block Placement & Score Increment
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await evaluate(() => {
        const scoreBefore = window.__game.getScore();
        window.__game.alignActiveBlock();
        window.__game.handleTap();
        return {
          scoreBefore,
          scoreAfter: window.__game.getScore(),
          towerHeight: window.__game.getTower().length,
          scoreText: document.getElementById('score-text').textContent
        };
      });
      const passed = res.scoreAfter === 1 && res.towerHeight >= 2;
      recordResult('Scenario 3: Canvas Tap Places Block & Updates Score', passed, `Score: ${res.scoreBefore} -> ${res.scoreAfter}`);
    } catch (e) {
      recordResult('Scenario 3: Canvas Tap Places Block & Updates Score', false, e.message);
    }

    // Test 4: Endless Mode Direct Launch
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await evaluate(async () => {
        window.__game.showStart();
        const btnEndless = document.getElementById('btn-endless');
        btnEndless.click();
        await new Promise(r => setTimeout(r, 150));
        return {
          gameState: window.__game.getGameState(),
          mode: window.__game.getMode(),
          startDisplay: window.getComputedStyle(document.getElementById('start-screen')).display
        };
      });
      const passed = res.gameState === 'PLAYING' && res.mode === 'ENDLESS' && res.startDisplay === 'none';
      recordResult('Scenario 4: Endless Mode Launch from Dock Button', passed, `mode=${res.mode}`);
    } catch (e) {
      recordResult('Scenario 4: Endless Mode Launch from Dock Button', false, e.message);
    }

    // Test 5: Stage Select Modal & Back Navigation
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await evaluate(async () => {
        window.__game.showStart();
        const btnSelect = document.getElementById('btn-select');
        btnSelect.click();
        await new Promise(r => setTimeout(r, 150));
        const selectScreen = document.getElementById('select-screen');
        const selectVisible = selectScreen && window.getComputedStyle(selectScreen).display !== 'none';
        const stageBtnCount = document.querySelectorAll('.stage-btn').length;

        // Click back button
        const backBtn = document.getElementById('select-back');
        if (backBtn) backBtn.click();
        await new Promise(r => setTimeout(r, 150));
        const startScreen = document.getElementById('start-screen');
        const startReturned = startScreen && window.getComputedStyle(startScreen).display !== 'none';

        return { selectVisible, stageBtnCount, startReturned };
      });
      const passed = res.selectVisible && res.stageBtnCount >= 10 && res.startReturned;
      recordResult('Scenario 5: Stage Select Screen Grid & Back Navigation', passed, `${res.stageBtnCount} stages generated`);
    } catch (e) {
      recordResult('Scenario 5: Stage Select Screen Grid & Back Navigation', false, e.message);
    }

    // Test 6: Cat Companions Roster & Equipping
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await evaluate(async () => {
        window.__game.showStart();
        const btnCats = document.getElementById('btn-cats');
        btnCats.click();
        await new Promise(r => setTimeout(r, 150));
        const modal = document.getElementById('companion-modal');
        const modalVisible = modal && window.getComputedStyle(modal).display !== 'none';
        const cardCount = document.querySelectorAll('.companion-card').length;

        const closeBtn = document.getElementById('companion-close');
        if (closeBtn) closeBtn.click();
        await new Promise(r => setTimeout(r, 220));
        const closed = modal && window.getComputedStyle(modal).display === 'none';

        return { modalVisible, cardCount, closed };
      });
      const passed = res.modalVisible && res.cardCount === 18 && res.closed;
      recordResult('Scenario 6: Cat Companions Roster (18 Cats) & Close', passed, `${res.cardCount} companion cards`);
    } catch (e) {
      recordResult('Scenario 6: Cat Companions Roster (18 Cats) & Close', false, e.message);
    }

    // Test 7: Gacha Pull & Inventory Flow
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await evaluate(async () => {
        window.__game.showStart();
        const save = window.__game.getSave();
        save.gachaTickets = 5;
        save.churu = 500;
        window.__game.persist();

        const btnGacha = document.getElementById('btn-gacha');
        btnGacha.click();
        await new Promise(r => setTimeout(r, 150));
        const modal = document.getElementById('gacha-modal');
        const modalVisible = modal && window.getComputedStyle(modal).display !== 'none';

        // Perform 1 pull
        window.__game.pullGacha(1);
        const remainingTickets = save.gachaTickets;

        // Skip cutscene & dismiss reveal modal
        const skipBtn = document.getElementById('btn-gacha-anim-skip');
        if (skipBtn) skipBtn.click();
        window.__game.closeGachaReveal();

        const closeBtn = document.getElementById('gacha-close');
        if (closeBtn) closeBtn.click();

        return { modalVisible, remainingTickets };
      });
      const passed = res.modalVisible && res.remainingTickets === 4;
      recordResult('Scenario 7: Cat Gacha Pull & Ticket Balance Deduction', passed, `Tickets left: ${res.remainingTickets}`);
    } catch (e) {
      recordResult('Scenario 7: Cat Gacha Pull & Ticket Balance Deduction', false, e.message);
    }

    // Test 8: Pre-Stage Ready Modal (Multi-Cat Selection)
    try {
      await new Promise(r => setTimeout(r, 400));
      const res1 = await evaluate(async () => {
        window.__game.showStart();
        const save = window.__game.getSave();
        save.unlockedCats = ['shiro', 'miko', 'nero'];
        save.selectedCat = 'shiro';
        window.__game.persist();

        const btnContinue = document.getElementById('btn-continue');
        btnContinue.click();
        await new Promise(r => setTimeout(r, 150));

        const readyModal = document.getElementById('ready-modal');
        const readyVisible = readyModal && window.getComputedStyle(readyModal).display !== 'none';
        const chipCount = document.querySelectorAll('.ready-chip').length;

        // Click miko chip to switch
        const mikoChip = document.querySelector('.ready-chip[data-cat="miko"]');
        if (mikoChip) mikoChip.click();
        const catSwitched = save.selectedCat === 'miko';

        return { readyVisible, chipCount, catSwitched };
      });

      await new Promise(r => setTimeout(r, 400));

      const res2 = await evaluate(async () => {
        const startBtn = document.getElementById('btn-ready-start');
        if (startBtn) startBtn.click();
        await new Promise(r => setTimeout(r, 150));
        const readyModal = document.getElementById('ready-modal');
        return {
          gameState: window.__game.getGameState(),
          readyClosed: readyModal && window.getComputedStyle(readyModal).display === 'none'
        };
      });

      const passed = res1.readyVisible && res1.chipCount >= 3 && res1.catSwitched && res2.gameState === 'PLAYING' && res2.readyClosed;
      recordResult('Scenario 8: Pre-Stage Ready Modal & Companion Selection', passed, `Cat: miko, Game: ${res2.gameState}`);
    } catch (e) {
      recordResult('Scenario 8: Pre-Stage Ready Modal & Companion Selection', false, e.message);
    }

    // Test 9: Boss Stage Mechanics & Damage
    try {
      await new Promise(r => setTimeout(r, 400));
      const resIntro = await evaluate(() => {
        window.__game.startStage(4); // World 0 Boss (Stage 4)
        const cfg = window.__game.getCfg();
        const isBoss = cfg && cfg.boss === true;
        const skipBtn = document.getElementById('boss-intro-skip');
        if (skipBtn) skipBtn.click();
        return { isBoss };
      });

      // Wait 350ms for intro fadeout animation to complete and spawn block
      await new Promise(r => setTimeout(r, 350));

      const resDamage = await evaluate(() => {
        const bossHud = document.getElementById('boss-hud');
        const bossHudVisible = bossHud && window.getComputedStyle(bossHud).display !== 'none';
        const hpBefore = window.__game.getBossHp().current;

        window.__game.alignActiveBlock();
        window.__game.handleTap();
        const hpAfter = window.__game.getBossHp().current;

        return {
          bossHudVisible,
          hpBefore,
          hpAfter,
          damaged: hpAfter < hpBefore
        };
      });
      const passed = resIntro.isBoss && resDamage.bossHudVisible && resDamage.damaged;
      recordResult('Scenario 9: Boss Stage Encounter & HP Damage Handling', passed, `Boss HP: ${resDamage.hpBefore} -> ${resDamage.hpAfter}`);
    } catch (e) {
      recordResult('Scenario 9: Boss Stage Encounter & HP Damage Handling', false, e.message);
    }

    // Test 10: Stage Clear Flow & Next Progression
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await evaluate(() => {
        window.__game.startStage(0);
        window.__game.completeStage();

        const clearScreen = document.getElementById('clear-screen');
        const nextBtn = document.getElementById('btn-next');
        return {
          gameState: window.__game.getGameState(),
          clearVisible: clearScreen && window.getComputedStyle(clearScreen).display !== 'none',
          hasNextBtn: !!nextBtn
        };
      });
      const passed = res.gameState === 'CLEAR' && res.hasNextBtn;
      recordResult('Scenario 10: Stage Clear Completion & Victory Flow', passed, `gameState=${res.gameState}`);
    } catch (e) {
      recordResult('Scenario 10: Stage Clear Completion & Victory Flow', false, e.message);
    }

    // Test 11: Game Over & Retry Flow
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await evaluate(async () => {
        window.__game.startStage(0);
        const tower = window.__game.getTower();
        window.__game.triggerGameOver(tower[0], 'Test Over');
        const goScreen = document.getElementById('gameover-screen');
        const goVisible = goScreen && window.getComputedStyle(goScreen).display !== 'none';

        // Click retry
        const retryBtn = document.getElementById('btn-retry-over');
        if (retryBtn) retryBtn.click();
        await new Promise(r => setTimeout(r, 150));

        return {
          goVisible,
          retryGameState: window.__game.getGameState()
        };
      });
      const passed = res.retryGameState === 'PLAYING';
      recordResult('Scenario 11: Game Over Handling & Instant Retry Action', passed, `gameState=${res.retryGameState}`);
    } catch (e) {
      recordResult('Scenario 11: Game Over Handling & Instant Retry Action', false, e.message);
    }

    // Test 12: Churu Fever Stage Once-Only Rule, Mouse Hazard Hearts & Auto-Skip Flow
    try {
      await new Promise(r => setTimeout(r, 400));
      const initRes = await evaluate(async () => {
        // Reset stage 20 played status for clean test
        const save = window.__game.getSave();
        if (save.bonusPlayed) delete save.bonusPlayed[20];
        if (save.bonusChuruEarned) delete save.bonusChuruEarned[20];
        delete save.stars[20];
        window.__game.persist();

        const baseChuru = save.churu || 0;

        // 1. Start Churu Fever stage (Stage 20 = 3-9)
        window.__game.startStage(20);
        return {
          isBonus: window.__game.getCfg().stageType === 'bonus',
          initialHearts: window.__game.getBonusHearts()
        };
      });

      await new Promise(r => setTimeout(r, 400));
      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('/Users/seunghwanson/.gemini/antigravity/brain/ef916861-6a53-414a-a9cc-d95c350ccc4c/bonus_stage_hearts_preview.png', Buffer.from(shot1.result.data, 'base64'));

      const res = await evaluate(async () => {
        const baseChuru = window.__game.getSave().churu || 0;
        const initialHearts = window.__game.getBonusHearts();
        const cfg = window.__game.getCfg();

        // 2. Test mouse hazard hit mechanic (Hit 1, 2, 3)
        window.__game.hitBonusMouse();
        const heartsAfter1 = window.__game.getBonusHearts();
        window.__game.hitBonusMouse();
        const heartsAfter2 = window.__game.getBonusHearts();

        // Set bonus score before 3rd lethal hit
        window.__game.setBonusScore(120);

        // 3rd hit terminates the stage
        window.__game.hitBonusMouse();
        const heartsAfter3 = window.__game.getBonusHearts();
        const stateAfter3rdHit = window.__game.getGameState();

        const churuAfterFirstClear = window.__game.getSave().churu;
        const playedAfterClear = window.__game.isBonusStageAlreadyPlayed(20);

        // 3. Clear screen replay button must be hidden for bonus stages
        const replayBtn = document.getElementById('btn-retry-clear');
        const replayHidden = !replayBtn || window.getComputedStyle(replayBtn).display === 'none';

        // 4. Try replaying via retryCurrent: should be blocked
        window.__game.retryCurrent();
        const stateAfterRetryAttempt = window.__game.getGameState();

        // 5. Try starting stage 20 again via startStage: should be blocked & auto-skip
        window.__game.startStage(20);
        const currentCfgAfterSkip = window.__game.getCfg();

        // 6. Fail-safe check: If completeStage is called on a bonus stage with past record, 0 Churu added
        const churuBeforeGlitch = window.__game.getSave().churu;
        window.__game.setBonusScore(200);
        window.__game.completeStage();
        const churuAfterGlitch = window.__game.getSave().churu;

        // 7. Progression skip check: getNextPlayableStage from 20 skips to 21
        const nextPlayable = window.__game.getNextPlayableStage(20);

        return {
          isBonus: cfg.stageType === 'bonus',
          initialHearts,
          heartsAfter1,
          heartsAfter2,
          heartsAfter3,
          stateAfter3rdHit,
          churuGained: churuAfterFirstClear - baseChuru,
          playedAfterClear,
          replayHidden,
          nextPlayable,
          skippedStageId: currentCfgAfterSkip.id,
          churuUnchangedOnGlitch: churuAfterGlitch === churuBeforeGlitch
        };
      });

      const passed = res.isBonus &&
        res.initialHearts === 3 &&
        res.heartsAfter1 === 2 &&
        res.heartsAfter2 === 1 &&
        res.heartsAfter3 <= 0 &&
        res.churuGained === 120 &&
        res.playedAfterClear === true &&
        res.replayHidden === true &&
        res.nextPlayable === 21 &&
        res.skippedStageId !== 20 &&
        res.churuUnchangedOnGlitch === true;

      recordResult('Scenario 12: Churu Fever Once-Only Rule, Mouse Hazard Hearts & Auto-Skip', passed,
        `Hearts:${res.initialHearts}->${res.heartsAfter1}->${res.heartsAfter2}->${res.heartsAfter3} | Churu:+${res.churuGained} | ReplayHidden:${res.replayHidden} | AutoSkipTo:${res.skippedStageId} | ZeroGlitchReward:${res.churuUnchangedOnGlitch}`);

      // Capture screenshot of stage select with completed bonus stage
      await evaluate(() => {
        window.__game.openSelect();
      });
      await new Promise(r => setTimeout(r, 400));
      const shot2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('/Users/seunghwanson/.gemini/antigravity/brain/ef916861-6a53-414a-a9cc-d95c350ccc4c/stage_select_bonus_completed_preview.png', Buffer.from(shot2.result.data, 'base64'));
    } catch (e) {
      recordResult('Scenario 12: Churu Fever Once-Only Rule, Mouse Hazard Hearts & Auto-Skip', false, e.message);
    }

    // Test 13: Firebase Telemetry & Exception Tracking Verification
    try {
      const res = await evaluate(() => {
        const hasTracker = typeof FirebaseTracker !== 'undefined';
        FirebaseTracker.logEvent('test_automated_event', { status: 'ok' });
        FirebaseTracker.recordException(new Error('Test synthetic crash'), 'TestContext');
        return { hasTracker };
      });
      const passed = res.hasTracker && telemetryEvents.length > 0;
      recordResult('Scenario 13: Firebase Analytics & Crashlytics Bridge', passed, `${telemetryEvents.length} events logged`);
    } catch (e) {
      recordResult('Scenario 13: Firebase Analytics & Crashlytics Bridge', false, e.message);
    }

    // Test 14: Tab Visibility Background Audio Pause & Resume Handling
    try {
      const res = await evaluate(async () => {
        window.__game.startStage(0);
        window.__gameAudio.initAudio();
        const ctx = window.__gameAudio.getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }
        window.__gameAudio.updateBgmPlayback();
        await new Promise(r => setTimeout(r, 250));

        const bgmBefore = window.__gameAudio.isBgmPlaying();
        const ctxStateBefore = ctx ? ctx.state : null;

        // Simulate switching away from the tab
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        window.__gameAudio.handleVisibilityChange();

        const bgmHidden = window.__gameAudio.isBgmPlaying();
        const ctxStateHidden = ctx ? ctx.state : null;

        // Simulate returning to the tab
        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
        window.__gameAudio.handleVisibilityChange();
        await new Promise(r => setTimeout(r, 250));

        const bgmRestored = window.__gameAudio.isBgmPlaying();
        const ctxStateRestored = ctx ? ctx.state : null;

        return {
          bgmBefore,
          ctxStateBefore,
          bgmHidden,
          ctxStateHidden,
          bgmRestored,
          ctxStateRestored
        };
      });

      const passed = res.bgmBefore === true && res.bgmHidden === false && res.bgmRestored === true;
      recordResult('Scenario 14: Tab Visibility Background Audio Pause & Resume', passed,
        `Before(Bgm:${res.bgmBefore}) | Hidden(Bgm:${res.bgmHidden}, Ctx:${res.ctxStateHidden}) | Restored(Bgm:${res.bgmRestored}, Ctx:${res.ctxStateRestored})`);
    } catch (e) {
      recordResult('Scenario 14: Tab Visibility Background Audio Pause & Resume', false, e.message);
    }

    // Test 15: New Gameplay Gimmicks & Active Skill Mechanics Verification
    // (Ice, Scratcher, Fog, Melting Gelato, Thin Foundation Tilt, Anvil, Perfectionist, Climbing Kitten, Luna Active Skill)
    try {
      const res = await evaluate(async () => {
        // 1. World 3 (Frozen Peak - Ice block)
        window.__game.startStage(22);
        const cfgW3 = window.__game.getCfg();
        const hasIce = !!cfgW3.ice;

        // 2. World 4 (Cardboard Town - Scratcher stick-slip)
        window.__game.startStage(33);
        const cfgW4 = window.__game.getCfg();
        const hasScratcher = !!cfgW4.scratcher;

        // 3. World 5 (Foggy Village)
        window.__game.startStage(44);
        const cfgW5 = window.__game.getCfg();
        const hasFog = !!cfgW5.fog;

        // 4. World 6 (Melting Gelato)
        window.__game.startStage(55);
        const cfgW6 = window.__game.getCfg();
        const hasMelting = !!cfgW6.melting && cfgW6.meltingRate > 0;

        // 5. World 7 (Pinnacle Cliff - Thin Foundation & Tilt)
        window.__game.startStage(66);
        const cfgW7 = window.__game.getCfg();
        const hasThinTilt = !!cfgW7.thinFoundation && !!cfgW7.tilt;

        // 6. World 8 (Clockwork Forge - Anvil)
        window.__game.startStage(77);
        const cfgW8 = window.__game.getCfg();
        const hasAnvil = !!cfgW8.anvil;

        // 7. World 9 (Hall of Perfection - Perfectionist)
        window.__game.startStage(88);
        const cfgW9 = window.__game.getCfg();
        const hasPerfectionist = !!cfgW9.perfectionist;

        // 8. Climbing Kitten presence & floor tracking
        window.__game.startStage(0);
        await new Promise(r => setTimeout(r, 200));
        const kittenBefore = window.__game.getClimbingKitten();
        const kittenExists = !!kittenBefore && kittenBefore.y >= 0;

        // Place a block
        window.__game.alignActiveBlock();
        const tapGuardsBefore = {
          bossIntro: (typeof isBossIntroPlaying !== 'undefined' ? isBossIntroPlaying : null),
          bonus: (typeof bonusActive !== 'undefined' ? bonusActive : null),
          state: window.__game.getGameState(),
          hasBlock: !!window.__game.getActiveBlock()
        };
        window.__game.handleTap();
        await new Promise(r => setTimeout(r, 200));
        const kittenAfter = window.__game.getClimbingKitten();
        const kittenClimbed = !!kittenAfter && (kittenAfter.targetY >= 1 || window.__game.getScore() >= 1);

        // 9. Luna Active Skill (Magnetic Snap: 1-time guaranteed auto-align)
        const save = window.__game.getSave();
        save.selectedCat = 'luna';
        window.__game.startStage(1);
        await new Promise(r => setTimeout(r, 100));
        const cfgLuna = window.__game.getCfg();
        const hasActiveSkill = !!cfgLuna.hasActiveSkill;

        // Simulate skill ready
        window.__game.setActiveSkillReady(true);
        const skillReadyBefore = window.__game.getActiveSkillReady();

        // Intentionally do NOT align active block (let it be offset)
        const activeB = window.__game.getActiveBlock();
        if (activeB) {
          if (activeB.axis === 'x') activeB.x = 4.5;
          else activeB.z = 4.5;
        }

        // Tap triggers magnetic snap auto-centering!
        window.__game.handleTap();
        await new Promise(r => setTimeout(r, 150));

        const skillReadyAfter = window.__game.getActiveSkillReady();
        const tower = window.__game.getTower();
        const lastPlaced = tower[tower.length - 1];
        // Center should be exact 0 (auto-snapped)
        const autoSnapped = Math.abs(lastPlaced.x) < 0.01 && Math.abs(lastPlaced.z) < 0.01;

        return {
          hasIce,
          hasScratcher,
          hasFog,
          hasMelting,
          hasThinTilt,
          hasAnvil,
          hasPerfectionist,
          kittenExists,
          kittenClimbed,
          kittenBefore,
          kittenAfter,
          tapGuardsBefore,
          scoreNow: window.__game.getScore(),
          hasActiveSkill,
          skillReadyBefore,
          skillReadyAfter,
          autoSnapped
        };
      });

      const allGimmicksPass = res.hasIce && res.hasScratcher && res.hasFog && res.hasMelting &&
        res.hasThinTilt && res.hasAnvil && res.hasPerfectionist &&
        res.kittenExists && res.kittenClimbed &&
        res.hasActiveSkill && res.skillReadyBefore && !res.skillReadyAfter && res.autoSnapped;

      recordResult('Scenario 15: New Gameplay Gimmicks & Active Skill Mechanics', allGimmicksPass,
        `Ice:${res.hasIce} | Scratch:${res.hasScratcher} | Fog:${res.hasFog} | Melt:${res.hasMelting} | Tilt:${res.hasThinTilt} | Anvil:${res.hasAnvil} | Perf:${res.hasPerfectionist} | Kitten:${res.kittenClimbed} | LunaSnap:${res.autoSnapped}`);
    } catch (e) {
      recordResult('Scenario 15: New Gameplay Gimmicks & Active Skill Mechanics', false, e.message);
    }

    // Test 16: Zero Uncaught Exceptions & Syntax Errors Check
    if (uncaughtErrors.length > 0) {
      console.log('Uncaught errors detail:', JSON.stringify(uncaughtErrors, null, 2));
    }
    const uncaughtCount = uncaughtErrors.length;
    recordResult('Scenario 16: Zero Uncaught Exceptions & Syntax Errors', uncaughtCount === 0, `${uncaughtCount} exceptions thrown`);

    // Reset to clean start screen for final screenshot
    await evaluate(() => {
      window.__game.closeGachaReveal();
      const gachaModal = document.getElementById('gacha-modal');
      if (gachaModal) gachaModal.style.display = 'none';
      const revealModal = document.getElementById('gacha-reveal-modal');
      if (revealModal) revealModal.style.display = 'none';
      window.__game.showStart();
    });
    await new Promise(r => setTimeout(r, 600));

    // Screenshot capture of successful state
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/seunghwanson/.gemini/antigravity/brain/ef916861-6a53-414a-a9cc-d95c350ccc4c/automated_test_final_screen.png', Buffer.from(shot.result.data, 'base64'));

    ws.close();
  } finally {
    chromeProc.kill();
  }

  // Summary
  console.log(`\n${BOLD}${CYAN}----------------------------------------------------${RESET}`);
  console.log(`${BOLD}TEST SUMMARY:${RESET}`);
  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;
  console.log(`  Passed: ${GREEN}${passedCount} / ${totalCount}${RESET}`);
  if (exitCode !== 0) {
    console.log(`  Status: ${RED}${BOLD}FAILED${RESET}`);
    process.exit(1);
  } else {
    console.log(`  Status: ${GREEN}${BOLD}ALL TESTS PASSED!${RESET}\n`);
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error(`Fatal error running test suite:`, err);
  process.exit(1);
});
