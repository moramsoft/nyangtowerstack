// scripts/capture_gimmick_screens.js
import { spawn } from 'child_process';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9223;
const ARTIFACTS_DIR = '/Users/seunghwanson/.gemini/antigravity/brain/ef916861-6a53-414a-a9cc-d95c350ccc4c';

async function main() {
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json`);
    const pages = await listRes.json();
    const targetPage = pages.find(p => p.type === 'page') || pages[0];

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
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

    await send('Page.navigate', { url: 'http://127.0.0.1:8088/index.html' });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Capture Climbing Kitten gameplay with 3-4 stacked floors
    console.log('Capturing Climbing Kitten gameplay...');
    await evaluate(async () => {
      window.__game.startStage(0); // Stage 1-1
      await new Promise(r => setTimeout(r, 200));
      // Stack 3 blocks cleanly
      for (let i = 0; i < 3; i++) {
        window.__game.alignActiveBlock();
        window.__game.handleTap();
        await new Promise(r => setTimeout(r, 120));
      }
      // Let kitten loaf peacefully on the top block
      const kitten = window.__game.getClimbingKitten();
      if (kitten) {
        kitten.state = 'loaf';
        kitten.isJumping = false;
        kitten.jumpProgress = 1;
      }
    });
    // Wait for text popups to fade so kitten is fully clear
    await new Promise(r => setTimeout(r, 1400));
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${ARTIFACTS_DIR}/climbing_kitten_gameplay.png`, Buffer.from(shot1.result.data, 'base64'));

    // 2. Capture Luna's Active Skill (Burst Fever Ready) in Ice World (W3)
    console.log('Capturing Luna Active Skill in Ice World...');
    await evaluate(async () => {
      const save = window.__game.getSave();
      save.selectedCat = 'luna';
      window.__game.startStage(22); // World 3 Frozen Peak
      await new Promise(r => setTimeout(r, 200));
      for (let i = 0; i < 2; i++) {
        window.__game.alignActiveBlock();
        window.__game.handleTap();
        await new Promise(r => setTimeout(r, 100));
      }
      window.__game.setActiveSkillReady(true);
    });
    await new Promise(r => setTimeout(r, 1200));
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${ARTIFACTS_DIR}/luna_active_skill_ice_world.png`, Buffer.from(shot2.result.data, 'base64'));

    // 3. Capture Thin Foundation & Tilt Balance HUD (W7)
    console.log('Capturing Tilt Balance Stage...');
    await evaluate(async () => {
      window.__game.startStage(66); // World 7 Pinnacle Cliff
      await new Promise(r => setTimeout(r, 150));
      for (let i = 0; i < 2; i++) {
        window.__game.alignActiveBlock();
        window.__game.handleTap();
        await new Promise(r => setTimeout(r, 80));
      }
      // Induce slight tilt for HUD visibility
      window.__game.setTowerTilt(0.08, 0.05);
    });
    await new Promise(r => setTimeout(r, 300));
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${ARTIFACTS_DIR}/tilt_balance_stage_preview.png`, Buffer.from(shot3.result.data, 'base64'));

    console.log('All gimmick screens successfully captured!');
    ws.close();
  } finally {
    chromeProc.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
