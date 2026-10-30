// Stack Tower - Procedural Marimba & Synthesizer Audio Engine

  // --- PROCEDURAL MARIMBA + SYNTH AUDIO ENGINE ---
  let audioCtx = null;
  let isMuted = localStorage.getItem('stackTowerMuted') === 'true';

  function isSfxEnabled() {
    return !isMuted && (!save || !save.settings || save.settings.sfx !== false);
  }
  function isBgmEnabled() {
    return !isMuted && (!save || !save.settings || save.settings.bgm !== false);
  }

  function updateSoundBtn() {
    const soundBtnEl = document.getElementById('sound-btn');
    if (soundBtnEl) soundBtnEl.textContent = isMuted ? '🔇' : '🔊';
  }
  updateSoundBtn();

  const _soundBtn = document.getElementById('sound-btn');
  if (_soundBtn) {
    _soundBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isMuted = !isMuted;
      localStorage.setItem('stackTowerMuted', isMuted);
      updateSoundBtn();
      initAudio();
      updateBgmPlayback();
    });
  }

  function triggerHaptic(pattern = 25, type = 'light') {
    if (!save || !save.settings || save.settings.haptics === false) return;

    const duration = Array.isArray(pattern) ? (pattern[0] || 25) : (typeof pattern === 'number' ? pattern : 25);

    // 1. Android Native Bridge via window.FirebaseBridge
    if (typeof window !== 'undefined' && window.FirebaseBridge && typeof window.FirebaseBridge.vibrate === 'function') {
      try {
        window.FirebaseBridge.vibrate(duration, type);
        return;
      } catch (e) { /* ignore */ }
    }

    // 2. iOS Native Bridge via window.webkit.messageHandlers.FirebaseBridge
    if (typeof window !== 'undefined' && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.FirebaseBridge) {
      try {
        window.webkit.messageHandlers.FirebaseBridge.postMessage({
          action: 'vibrate',
          duration: duration,
          type: type
        });
        return;
      } catch (e) { /* ignore */ }
    }

    // 3. Fallback to standard Web Vibration API
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
    }
  }

  // --- PROCEDURAL DUAL BGM ENGINE (Gameplay vs. Stage Select / Menu) ---
  let bgmTimer = null;
  let bgmStep = 0;
  let currentBgmTrack = 'menu'; // 'gameplay' | 'menu'

  // Track A: In-Game Climbing Rhythm (Energetic, rhythmic, crisp wooden marimba)
  const GAMEPLAY_BGM_CHORDS = [
    [261.63, 392.00, 493.88, 587.33], // C4, G4, B4, D5 (C maj9)
    [220.00, 329.63, 392.00, 523.25], // A3, E4, G4, C5 (A min7)
    [174.61, 261.63, 329.63, 440.00], // F3, C4, E4, A4 (F maj7)
    [196.00, 293.66, 392.00, 523.25]  // G3, D4, G4, C5 (G sus4)
  ];
  const GAMEPLAY_STEP_INTERVAL = 440;
  const GAMEPLAY_ARP_PATTERN = [0, 2, 1, 3];

  // Track B: Outside Stage Select & World Map (Dreamy, cozy, sparkling music box waltz)
  const MENU_BGM_CHORDS = [
    [349.23, 440.00, 523.25, 659.25], // F4, A4, C5, E5 (F maj9)
    [293.66, 392.00, 493.88, 587.33], // D4, G4, B4, D5 (G6 / D)
    [329.63, 392.00, 493.88, 659.25], // E4, G4, B4, E5 (E min7)
    [220.00, 329.63, 523.25, 587.33]  // A3, E4, C5, D5 (A min9)
  ];
  const MENU_STEP_INTERVAL = 580;
  const MENU_ARP_PATTERN = [0, 1, 3, 2];

  function playGameplayBgmNote(freq, time, dur = 0.44, isRoot = false) {
    if (!audioCtx) return;
    try {
      // 1. Primary Marimba Note (warm triangle tone)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1150, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(time);
      osc.stop(time + dur);

      // 2. Wooden Bar Overtone Resonance (authentic marimba clink)
      const oscHarm = audioCtx.createOscillator();
      const gainHarm = audioCtx.createGain();
      oscHarm.type = 'sine';
      oscHarm.frequency.setValueAtTime(freq * 2.76, time);
      gainHarm.gain.setValueAtTime(0.0001, time);
      gainHarm.gain.linearRampToValueAtTime(0.045, time + 0.02);
      gainHarm.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

      oscHarm.connect(gainHarm);
      gainHarm.connect(audioCtx.destination);
      oscHarm.start(time);
      oscHarm.stop(time + 0.17);

      // 3. Gentle Root Bass Pad on Chord Downbeat
      if (isRoot) {
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(freq * 0.5, time);
        bassGain.gain.setValueAtTime(0.0001, time);
        bassGain.gain.linearRampToValueAtTime(0.09, time + 0.08);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

        bassOsc.connect(bassGain);
        bassGain.connect(audioCtx.destination);
        bassOsc.start(time);
        bassOsc.stop(time + 1.25);
      }
    } catch (e) { /* ignore */ }
  }

  function playMenuBgmNote(freq, time, dur = 0.58, isRoot = false) {
    if (!audioCtx) return;
    try {
      // 1. Soft Music Box & Kalimba (crystalline sine tone with warm bell resonance)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1900, time);
      filter.Q.setValueAtTime(1.2, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(time);
      osc.stop(time + dur);

      // 2. Sparkling High Bell Chime partial (celeste octave overtone)
      const oscBell = audioCtx.createOscillator();
      const gainBell = audioCtx.createGain();
      oscBell.type = 'sine';
      oscBell.frequency.setValueAtTime(freq * 2.0, time);
      gainBell.gain.setValueAtTime(0.0001, time);
      gainBell.gain.linearRampToValueAtTime(0.032, time + 0.025);
      gainBell.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);

      oscBell.connect(gainBell);
      gainBell.connect(audioCtx.destination);
      oscBell.start(time);
      oscBell.stop(time + 0.30);

      // 3. Dreamy warm low harp bass note on the downbeat
      if (isRoot) {
        const harpOsc = audioCtx.createOscillator();
        const harpGain = audioCtx.createGain();
        harpOsc.type = 'triangle';
        harpOsc.frequency.setValueAtTime(freq * 0.5, time);
        harpGain.gain.setValueAtTime(0.0001, time);
        harpGain.gain.linearRampToValueAtTime(0.075, time + 0.09);
        harpGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);

        harpOsc.connect(harpGain);
        harpGain.connect(audioCtx.destination);
        harpOsc.start(time);
        harpOsc.stop(time + 1.45);
      }
    } catch (e) { /* ignore */ }
  }

  function setBgmTrack(track) {
    if (track !== 'gameplay' && track !== 'menu') track = 'menu';
    currentBgmTrack = track;
    bgmStep = 0;
    if (bgmTimer) {
      stopBgm();
      startBgm(track);
    }
  }

  function getBgmTrack() {
    return currentBgmTrack;
  }

  function startBgm(overrideTrack) {
    if (bgmTimer) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    if (!isBgmEnabled() || !audioCtx) return;

    if (overrideTrack) {
      currentBgmTrack = overrideTrack;
      bgmStep = 0;
    } else if (typeof gameState !== 'undefined') {
      const target = (gameState === 'PLAYING') ? 'gameplay' : 'menu';
      if (currentBgmTrack !== target) {
        currentBgmTrack = target;
        bgmStep = 0;
      }
    }

    const isMenu = (currentBgmTrack === 'menu');
    const chords = isMenu ? MENU_BGM_CHORDS : GAMEPLAY_BGM_CHORDS;
    const interval = isMenu ? MENU_STEP_INTERVAL : GAMEPLAY_STEP_INTERVAL;
    const arpPattern = isMenu ? MENU_ARP_PATTERN : GAMEPLAY_ARP_PATTERN;

    function scheduleBgmPattern() {
      if (typeof document !== 'undefined' && document.hidden) {
        stopBgm();
        return;
      }
      if (!isBgmEnabled() || !audioCtx) {
        stopBgm();
        return;
      }

      if (typeof gameState !== 'undefined') {
        const expected = (gameState === 'PLAYING') ? 'gameplay' : 'menu';
        if (currentBgmTrack !== expected) {
          setBgmTrack(expected);
          return;
        }
      }

      const now = audioCtx.currentTime;
      const chordIdx = Math.floor(bgmStep / 4) % chords.length;
      const stepInChord = bgmStep % 4;
      const noteIdx = arpPattern[stepInChord];
      const chord = chords[chordIdx];
      const freq = chord[noteIdx];

      if (isMenu) {
        playMenuBgmNote(freq, now + 0.04, 0.58, stepInChord === 0);
      } else {
        playGameplayBgmNote(freq, now + 0.04, 0.44, stepInChord === 0);
      }
      bgmStep = (bgmStep + 1) % 16;
    }

    scheduleBgmPattern();
    bgmTimer = setInterval(scheduleBgmPattern, interval);
  }

  function stopBgm() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  function updateBgmPlayback() {
    if (isBgmEnabled() && !(typeof document !== 'undefined' && document.hidden)) {
      if (audioCtx) {
        if (audioCtx.state === 'running') {
          startBgm();
        } else if (audioCtx.state === 'suspended') {
          try {
            audioCtx.resume().then(() => {
              if (isBgmEnabled() && !(typeof document !== 'undefined' && document.hidden)) {
                startBgm();
              }
            }).catch(() => {});
          } catch (e) {}
        }
      }
    } else {
      stopBgm();
    }
  }

  // --- TAB VISIBILITY & BACKGROUND AUDIO LIFECYCLE (Page Visibility API) ---
  let wasAudioSuspendedByVisibility = false;

  function handleVisibilityChange() {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      // User switched tabs or minimized browser -> Stop BGM & suspend AudioContext
      stopBgm();
      if (audioCtx && audioCtx.state === 'running') {
        wasAudioSuspendedByVisibility = true;
        try {
          audioCtx.suspend();
        } catch (e) { /* ignore */ }
      }
    } else {
      // User returned to game tab -> Resume AudioContext & BGM
      if (audioCtx && (audioCtx.state === 'suspended' || wasAudioSuspendedByVisibility)) {
        wasAudioSuspendedByVisibility = false;
        try {
          audioCtx.resume().then(() => {
            updateBgmPlayback();
          }).catch(() => {
            updateBgmPlayback();
          });
        } catch (e) {
          updateBgmPlayback();
        }
      } else {
        updateBgmPlayback();
      }
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => {
      stopBgm();
      if (audioCtx && audioCtx.state === 'running') {
        try { audioCtx.suspend(); } catch (e) {}
      }
    });
    window.addEventListener('pageshow', () => {
      if (audioCtx && audioCtx.state === 'suspended') {
        try { audioCtx.resume().then(updateBgmPlayback).catch(() => {}); } catch (e) {}
      } else {
        updateBgmPlayback();
      }
    });

    // Ensure first user interaction resumes AudioContext and starts ambient BGM
    ['pointerdown', 'touchstart', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, () => {
        initAudio();
      }, { capture: true, passive: true });
    });
  }

  const mascotAreaEl = document.getElementById('mascot-area');
  if (mascotAreaEl) {
    mascotAreaEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      initAudio();
      playCatPurr(2.2, 0.9);
      setMascot('happy', 'Purrr... I love you hooman! 💖🐾', 1200);
    });
  }

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx) {
      preloadRealCatAudio();
      if (audioCtx.state === 'suspended') {
        try {
          audioCtx.resume().then(() => {
            updateBgmPlayback();
          }).catch(() => {});
        } catch (e) {}
      } else {
        updateBgmPlayback();
      }
    }
  }

  // 16-note Major Pentatonic Scale (C4 to C7)
  const SCALE_FREQS = [
    261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
    523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
    1046.50, 1174.66, 1318.51, 1567.98, 1760.00, // C6, D6, E6, G6, A6
    2093.00 // C7
  ];

  // Play authentic resonant marimba note with wooden overtone
  function playMarimbaNote(freq, isPerfect = false) {
    if (!isSfxEnabled() || !audioCtx) return;
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, now); // Wooden bar resonance

    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 5.4, now); // Crisp initial tap click

    const dur = isPerfect ? 0.38 : 0.22;
    // Rich, crystal-clear marimba tone for stack ascending melody
    const vol = isPerfect ? 0.38 : 0.22;

    gain1.gain.setValueAtTime(vol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + dur);

    gain2.gain.setValueAtTime(vol * 0.45, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.6);

    gain3.gain.setValueAtTime(vol * 0.25, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc1.connect(gain1); gain1.connect(audioCtx.destination);
    osc2.connect(gain2); gain2.connect(audioCtx.destination);
    osc3.connect(gain3); gain3.connect(audioCtx.destination);

    osc1.start(now); osc2.start(now); osc3.start(now);
    osc1.stop(now + dur); osc2.stop(now + dur); osc3.stop(now + 0.05);
  }

  // Normal landing tap (low woodblock thud)
  function playNormalTap() {
    if (!isSfxEnabled() || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Soft dull thud sound for UI bumps and capsule drops
  function playThud(vol = 0.5) {
    if (!isSfxEnabled() || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain.gain.setValueAtTime(vol * 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Slice drop whoosh sound
  function playSliceWhoosh() {
    if (!isSfxEnabled() || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Juicy tactile UI tap sound
  function playUiTap(pitch = 1.0) {
    if (!isSfxEnabled() || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(780 * pitch, now + 0.045);
      osc.frequency.exponentialRampToValueAtTime(260 * pitch, now + 0.09);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.095);
    } catch (e) {}
  }

  // Ascending two-tone joyful chime for opening modals & menus
  function playUiOpen() {
    if (!isSfxEnabled() || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880.0, now + 0.05); // A5
      gain2.gain.setValueAtTime(0.16, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.18);
    } catch (e) {}
  }

  // Descending soft whoosh for closing modals & menus
  function playUiClose() {
    if (!isSfxEnabled() || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.11);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.115);
    } catch (e) {}
  }

  // Combo size expand magical arpeggio
  function playSizeExpandChime() {
    if (!isSfxEnabled() || !audioCtx) return;
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
      setTimeout(() => playMarimbaNote(freq, true), idx * 60);
    });
  }

  // Guardian Cat Life Save Rescue Chime (Heavenly harp arpeggio + cheerful kitten meow)
  function playLifeSaveChime() {
    if (!isSfxEnabled()) return;
    playRealCatSound('tier2', 0.95, 1.15);
    if (audioCtx) {
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.07);
        g.gain.setValueAtTime(0.24, now + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.45);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.48);
      });
    }
  }

  // ============================================================
  // AUTHENTIC ACOUSTIC FELINE SOUND ENGINE (Real Cat Recordings)
  // High-fidelity, adorable real cat vocals & purring (골골송)
  // ============================================================

  const catAudioBuffers = {};
  let audioDecodingStarted = false;

  function base64ToArrayBuffer(dataUri) {
    const base64 = dataUri.indexOf(',') >= 0 ? dataUri.split(',')[1] : dataUri;
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function decodeAudioDataSafe(ctx, arrayBuffer) {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const onOk = (b) => { if (!resolved) { resolved = true; resolve(b); } };
      const onErr = (e) => { if (!resolved) { resolved = true; reject(e); } };
      try {
        const copy = arrayBuffer.slice(0);
        const res = ctx.decodeAudioData(copy, onOk, onErr);
        if (res && typeof res.then === 'function') {
          res.then(onOk).catch(onErr);
        }
      } catch (err) {
        onErr(err);
      }
    });
  }

  async function preloadRealCatAudio() {
    if (!audioCtx || audioDecodingStarted || !window.CAT_AUDIO_DATA) return;
    audioDecodingStarted = true;
    for (const [key, dataUri] of Object.entries(window.CAT_AUDIO_DATA)) {
      try {
        const raw = base64ToArrayBuffer(dataUri);
        const decoded = await decodeAudioDataSafe(audioCtx, raw);
        catAudioBuffers[key] = decoded;
      } catch (e) {
        console.warn('[RealCatAudio] Decode fallback for', key, e);
      }
    }
  }

  // Universal Real Cat Sound Player (Web Audio buffer + zero-delay HTML5 fallback)
  function playRealCatSound(key, volume = 0.85, pitchRate = 1.0) {
    if (!isSfxEnabled()) return;
    initAudio();

    // 1. Preferred: Web Audio Buffer (Zero-latency, polyphonic overlapping)
    if (audioCtx && catAudioBuffers[key]) {
      try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const source = audioCtx.createBufferSource();
        source.buffer = catAudioBuffers[key];
        if (pitchRate && pitchRate !== 1.0) {
          source.playbackRate.value = pitchRate;
        }
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        source.connect(gain);
        gain.connect(audioCtx.destination);
        source.start(0);
        return;
      } catch (err) {
        console.warn('[RealCatAudio] Buffer play failed:', err);
      }
    }

    // 2. Immediate HTML5 Audio fallback
    if (window.CAT_AUDIO_DATA && window.CAT_AUDIO_DATA[key]) {
      try {
        const sound = new Audio(window.CAT_AUDIO_DATA[key]);
        sound.volume = Math.min(1.0, Math.max(0.0, volume));
        if (pitchRate && pitchRate !== 1.0) {
          sound.playbackRate = Math.min(2.0, Math.max(0.5, pitchRate));
        }
        sound.play().catch(() => {});
      } catch (e) {}
    }
  }

  // Real Cat Meow with 4 Distinct Streak Tiers (Used for special companion interactions)
  function playCatMeow(streak = 1) {
    if (!isSfxEnabled()) return;
    let key = 'tier1';
    let pitch = 1.0;

    if (streak <= 1) {
      key = 'tier1';
      pitch = 1.0;
    } else if (streak <= 3) {
      key = 'tier2';
      pitch = 1.0 + (streak - 2) * 0.035;
    } else if (streak <= 6) {
      key = 'tier3';
      pitch = 1.0 + (streak - 4) * 0.03;
    } else {
      key = 'tier4';
      pitch = 1.0 + Math.min(0.18, (streak - 7) * 0.02);
    }

    playRealCatSound(key, 0.95, pitch);
  }

  // Real Cat Purring (골골송: Authentic domestic cat purring rumble)
  function playCatPurr(duration = 2.8, volume = 0.85) {
    if (!isSfxEnabled()) return;
    playRealCatSound('purr', volume, 1.0);
  }

  // Stage Clear Celebratory Cat Sound (Triumphant victory meow + Heartwarming purr 골골송)
  function playStageClearCat(stars = 3) {
    if (!isSfxEnabled()) return;
    // 1. Immediate rich celebration meow + soothing purring
    playRealCatSound('stage_clear', 1.0, 1.0);

    // 2. Bonus sweet kitten chirp & purr for high-star clear!
    if (stars >= 3) {
      setTimeout(() => {
        playRealCatSound('tier3', 0.95, 1.08);
      }, 1600);
      setTimeout(() => {
        playRealCatSound('purr', 0.85, 1.0);
      }, 2400);
    } else {
      setTimeout(() => {
        playRealCatSound('tier2', 0.85, 1.02);
      }, 1600);
    }
  }

  // Real Sad Kitten Whimper / Crying (for misses or stage failure)
  function playCatSad() {
    if (!isSfxEnabled()) return;
    playRealCatSound('sad', 1.0, 0.95);
  }

  // Stage Failure / Game Over Sound (Sorrowful descending minor chord + Sad kitten whimper)
  function playGameOverChord() {
    if (!isSfxEnabled()) return;
    if (audioCtx) {
      const now = audioCtx.currentTime;
      // Sorrowful descending minor chord (Eb4 -> D4 -> C4 -> Ab3)
      [311.13, 293.66, 261.63, 207.65].forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.22, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.42);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    }
    // Distinct, sad kitten whimper "미야아앙... 😿" right after the collapse
    setTimeout(() => playCatSad(), 160);
  }

  // --- BOSS CAT SOUND FX ---
  function playBossHurtSound() {
    if (!isSfxEnabled()) return;
    playRealCatSound('sad', 1.0, 0.82);
    if (audioCtx) {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);
      g.gain.setValueAtTime(0.28, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    }
  }

  function playBossSmugSound() {
    if (!isSfxEnabled()) return;
    playRealCatSound('purr', 0.9, 1.35);
    if (audioCtx) {
      const now = audioCtx.currentTime;
      [330, 440, 330, 440].forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        g.gain.setValueAtTime(0.12, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.07);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.08);
      });
    }
  }

  function playBossFrenzySound() {
    if (!isSfxEnabled()) return;
    playRealCatSound('tier4', 1.0, 0.65);
    if (audioCtx) {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(190, now + 0.35);
      osc.frequency.linearRampToValueAtTime(80, now + 0.75);
      g.gain.setValueAtTime(0.24, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  }

  function playBossDefeatSound() {
    if (!isSfxEnabled()) return;
    playRealCatSound('sad', 1.0, 0.7);
    if (audioCtx) {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 1.2);
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    }
  }

  function playBossVictorySound() {
    if (!isSfxEnabled()) return;
    playRealCatSound('stage_clear', 1.0, 0.8);
  }


  function playGachaCrankSound() {
    initAudio();
    playMarimbaNote(349.23, true); // F4
    setTimeout(() => playMarimbaNote(440.00, true), 120); // A4
    setTimeout(() => playMarimbaNote(523.25, true), 240); // C5
  }

  function playGachaCrackSound(rarity) {
    initAudio();
    playMarimbaNote(523.25);
    setTimeout(() => playMarimbaNote(659.25), 80);
    setTimeout(() => playMarimbaNote(783.99), 160);
    setTimeout(() => playMarimbaNote(1046.50), 240);
    if (rarity >= 4) {
      setTimeout(() => {
        playStageClearCat(3);
        playSizeExpandChime();
      }, 280);
    } else if (rarity >= 3) {
      setTimeout(() => playSizeExpandChime(), 260);
    }
  }

  function playWorldFanfare() {
    initAudio();
    if (!audioCtx || !save.settings.sound) return;
    try {
      const now = audioCtx.currentTime;
      const notes = [
        { f: 523.25, t: 0.00, d: 0.35, v: 0.28 }, // C5
        { f: 659.25, t: 0.12, d: 0.35, v: 0.30 }, // E5
        { f: 783.99, t: 0.24, d: 0.40, v: 0.32 }, // G5
        { f: 1046.50, t: 0.38, d: 0.85, v: 0.38 }, // C6
        { f: 1318.51, t: 0.48, d: 1.10, v: 0.34 }  // E6
      ];
      notes.forEach(({ f, t, d, v }) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(0, now + t);
        gain.gain.linearRampToValueAtTime(v, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
      setTimeout(() => {
        if (typeof playRealCatSound === 'function') playRealCatSound('happy', 0.65, 1.1);
      }, 350);
    } catch (e) {}
  }