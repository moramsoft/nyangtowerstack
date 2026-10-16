#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function checkHtmlAndScripts(htmlPath) {
  console.log(`Checking syntax for: ${htmlPath}`);
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`File not found: ${htmlPath}`);
  }
  const baseDir = path.dirname(htmlPath);
  const html = fs.readFileSync(htmlPath, 'utf8');

  // 1. Check external script references
  const srcRegex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let srcMatch;
  let externalCount = 0;

  while ((srcMatch = srcRegex.exec(html)) !== null) {
    const src = srcMatch[1];
    // Ignore external http/https scripts if any
    if (src.startsWith('http://') || src.startsWith('https://')) continue;

    const scriptPath = path.resolve(baseDir, src);
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Referenced script not found: ${scriptPath} (from ${htmlPath})`);
    }

    const scriptCode = fs.readFileSync(scriptPath, 'utf8');
    try {
      new vm.Script(scriptCode, {
        filename: path.basename(scriptPath),
        displayErrors: true
      });
      externalCount++;
      console.log(`  ✓ Script [src="${src}"] (${scriptCode.length} chars) compiled successfully.`);
    } catch (err) {
      console.error(`  ✗ Syntax Error in [${src}]:`, err.message);
      if (err.stack) {
        console.error(err.stack.split('\n').slice(0, 5).join('\n'));
      }
      throw err;
    }
  }

  // 2. Check inline script blocks if any
  const inlineRegex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let inlineMatch;
  let inlineCount = 0;

  while ((inlineMatch = inlineRegex.exec(html)) !== null) {
    const inlineCode = inlineMatch[1];
    if (!inlineCode.trim()) continue;

    inlineCount++;
    try {
      new vm.Script(inlineCode, {
        filename: `${path.basename(htmlPath)} (inline #${inlineCount})`,
        displayErrors: true
      });
      console.log(`  ✓ Inline Script #${inlineCount} (${inlineCode.length} chars) compiled successfully.`);
    } catch (err) {
      console.error(`  ✗ Syntax Error in inline script #${inlineCount}:`, err.message);
      if (err.stack) {
        console.error(err.stack.split('\n').slice(0, 5).join('\n'));
      }
      throw err;
    }
  }

  console.log(`  Summary: ${externalCount} external scripts, ${inlineCount} inline scripts validated.`);
  return true;
}

function verifySync() {
  const gameDir = path.resolve(__dirname, '../game');
  const androidDir = path.resolve(__dirname, '../android/app/src/main/assets/www');

  const gameHtml = path.join(gameDir, 'index.html');
  const androidHtml = path.join(androidDir, 'index.html');

  checkHtmlAndScripts(gameHtml);
  checkHtmlAndScripts(androidHtml);

  function compareRecursive(relPath) {
    const p1 = path.join(gameDir, relPath);
    const p2 = path.join(androidDir, relPath);

    if (!fs.existsSync(p2)) {
      throw new Error(`File missing in android assets: ${relPath}`);
    }

    const stat1 = fs.statSync(p1);
    const stat2 = fs.statSync(p2);

    if (stat1.isDirectory()) {
      const items = fs.readdirSync(p1);
      for (const item of items) {
        compareRecursive(path.join(relPath, item));
      }
    } else {
      const buf1 = fs.readFileSync(p1);
      const buf2 = fs.readFileSync(p2);
      if (!buf1.equals(buf2)) {
        throw new Error(`File content mismatch between game/ and android assets for: ${relPath}`);
      }
    }
  }

  // Compare index.html, manifest.json, css/, js/, assets/
  compareRecursive('index.html');
  compareRecursive('manifest.json');
  compareRecursive('css');
  compareRecursive('js');
  compareRecursive('assets');

  console.log('  ✓ game/ and android assets www/ are 100% byte-for-byte synchronized.');
}

try {
  verifySync();
  console.log('\n[PASS] All JavaScript syntax and asset sync checks passed!\n');
} catch (e) {
  console.error('\n[FAIL] Syntax / sync verification failed:', e.message);
  process.exit(1);
}
