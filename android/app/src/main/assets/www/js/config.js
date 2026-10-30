// Stack Tower - Game Configuration & I18N Data

  const APP_VERSION = 'v1.3.0';

  const ASSET_PATHS = {
    smile: 'assets/chara_smile.png',
    excited: 'assets/chara_excited.png',
    happy: 'assets/chara_happy.png',
    clap: 'assets/chara_clap.png',
    sad: 'assets/chara_sad.png',
    celebrate: 'assets/chara_celebrate.png'
  };

  // --- CAMPAIGN DATA (25 worlds: W1=5, W2=7, W3..25=10 stages each, total 242 stages) ---
  // @@CAMPAIGN_BEGIN
  const WORLD_STAGE_COUNTS = [5, 7, ...Array(23).fill(10)];
  const WORLD_STAGE_OFFSETS = [0];
  for (let w = 0; w < WORLD_STAGE_COUNTS.length; w++) {
    WORLD_STAGE_OFFSETS.push(WORLD_STAGE_OFFSETS[w] + WORLD_STAGE_COUNTS[w]);
  }
  const TOTAL_STAGES = WORLD_STAGE_OFFSETS[WORLD_STAGE_OFFSETS.length - 1]; // 242

  // Star requirements to unlock each world
  const WORLD_STAR_GATES = [0, 8, 20, 36];
  for (let w = 4; w < WORLD_STAGE_COUNTS.length; w++) {
    WORLD_STAR_GATES.push(36 + (w - 3) * 16);
  }

  function getStageWorldInfo(stageId) {
    let w = 0;
    while (w < WORLD_STAGE_COUNTS.length - 1 && stageId >= WORLD_STAGE_OFFSETS[w + 1]) {
      w++;
    }
    const first = WORLD_STAGE_OFFSETS[w];
    const idx = stageId - first;
    const count = WORLD_STAGE_COUNTS[w];
    return { world: w, idx: idx, count: count, first: first };
  }

  const MOD_HINTS = {
    en: {
      wobble: 'Blocks sway in speed',
      sway: 'The tower sways gently',
      blink: 'Blocks flicker in and out',
      reverse: 'Sudden direction shifts',
      shrink: 'Misalignments cut extra width'
    },
    ko: {
      wobble: '블록 속도가 흔들립니다',
      sway: '타워가 좌우로 흔들립니다',
      blink: '블록이 깜빡입니다',
      reverse: '블록 이동 방향이 급변합니다',
      shrink: '오차 발생 시 추가로 깎입니다',
      ice: '얼음 블록: 미끄러져 가속되고 흔들립니다! 🧊',
      scratcher: '골판지 블록: 마찰로 덜컹거리며 튑니다! 📦',
      fog: '안개 구름이 타워 꼭대기를 가립니다! 🌫️',
      melting: '아이스크림 블록: 녹기 전에 신속하게 쌓으세요! 🍦',
      tilt: '얇은 받침대: 균형을 잃으면 타워가 기웁니다! ⚖️',
      anvil: '철제 블록: 길게 누르고 있다가 떼서 낙하시킵니다! ⚙️',
      perfectionist: '오직 퍼펙트 안착만 층수로 인정됩니다! 🎯',
      shrinkRush: '시간이 지날수록 블록이 작아집니다! ⚡'
    },
    en: {
      wobble: 'Blocks sway in speed',
      sway: 'The tower sways gently',
      blink: 'Blocks flicker in and out',
      reverse: 'Sudden direction shifts',
      shrink: 'Misalignments cut extra width',
      ice: 'Ice block: slips faster with sway! 🧊',
      scratcher: 'Cardboard block: stick-slip friction! 📦',
      fog: 'Mists veil the tower top! 🌫️',
      melting: 'Ice cream melts! Stack fast before it vanishes! 🍦',
      tilt: 'Thin foundation: keep the tower balanced! ⚖️',
      anvil: 'Iron block: hold and release to drop! ⚙️',
      perfectionist: 'Only Meowfect placements count! 🎯',
      shrinkRush: 'Blocks shrink over time! ⚡'
    }
  };
  const WORLD_DEFS = [
    {
      name: 'Fluffy Village', name_ko: '털뭉치 마을', emoji: '🧶', hue: 325, mods: {},
      image: 'assets/cutscene_world_1.jpg',
      lore_ko: '포근하고 알록달록한 털실 뭉치가 굴러다니는 평화로운 냥이 마을이다냥! 기본 스택 실력을 탄탄히 다져보자냥! 🐾',
      lore_en: 'A cozy village filled with colorful soft yarn balls and gentle sunshine! Master the fundamentals of stacking, hooman! 🐾',
      gimmick_ko: '🧱 평온한 초원 · 정밀 스택 기본 훈련',
      gimmick_en: '🧱 Peaceful Meadow · Precision Basics'
    },
    {
      name: 'Churu Harbor', name_ko: '츄르 항구', emoji: '🐟', hue: 200, mods: { wobble: 0.2 },
      image: 'assets/cutscene_world_2.jpg',
      lore_ko: '시원한 바닷바람과 신선한 참치 츄르가 가득한 고양이들의 항구에 도착했다냥! 바다 물결에 배가 출렁거리니 타이밍을 맞춰라냥! ⛵',
      lore_en: 'A bustling fishing port filled with fresh tuna and Churu treats! Ocean waves make blocks wobble—time your drops carefully! ⛵',
      gimmick_ko: '🌊 파도 출렁임 (Wobble) · 흔들리는 속도',
      gimmick_en: '🌊 Ocean Wobble · Fluctuating Block Speed'
    },
    {
      name: 'Breezy Rooftop', name_ko: '산들바람 옥상', emoji: '🌬️', hue: 180, mods: { sway: 14 },
      image: 'assets/cutscene_world_3.jpg',
      lore_ko: '노을빛 도시가 한눈에 내려다보이는 높은 지붕 꼭대기다냥! 세찬 바람에 캣타워가 좌우로 흔들리니 균형을 유지하라냥! 🍃',
      lore_en: 'High rooftops overlooking a glowing golden-hour sunset! Gusting crosswinds make the tower sway—keep your balance! 🍃',
      gimmick_ko: '🌪️ 바람의 흔들림 (Sway) · 공중 균형 유지',
      gimmick_en: '🌪️ Wind Sway · Aerial Balancing'
    },
    {
      name: 'Frozen Peak', name_ko: '빙하 꼭대기', emoji: '❄️', hue: 195, mods: { ice: true, wobble: 0.15 },
      image: 'assets/cutscene_world_4.jpg',
      lore_ko: '영롱한 오로라와 신비로운 눈꽃 결정이 반짝이는 만년설 정상이다냥! 얼음 블록이 미끄러우니 젤리 발바닥에 힘을 꽉 줘라냥! 🧊',
      lore_en: 'A crystal-clear peak beneath dancing aurora skies! Icy surfaces are slippery—grip tightly with your toe beans! 🧊',
      gimmick_ko: '❄️ 미끄러운 빙판 (Ice) & 출렁임 (Wobble)',
      gimmick_en: '❄️ Slippery Ice & Shifting Speeds'
    },
    {
      name: 'Cardboard Town', name_ko: '골판지 마을', emoji: '📦', hue: 35, mods: { scratcher: true },
      image: 'assets/cutscene_world_5.jpg',
      lore_ko: '고양이들의 지상 낙원! 거대한 택배 상자와 스크래처로 세운 천혜의 요새다냥! 거친 표면 마찰을 활용해 높이 쌓아보자냥! 📦',
      lore_en: 'Cat heaven! A magnificent cardboard box fortress and giant scratcher towers! Master the high surface friction! 📦',
      gimmick_ko: '📦 거친 스크래처 (Scratcher) · 강한 표면 마찰',
      gimmick_en: '📦 Sisal Scratcher · Strong Surface Friction'
    },
    {
      name: 'Foggy Village', name_ko: '안개 마을', emoji: '🌫️', hue: 250, mods: { fog: true },
      image: 'assets/cutscene_world_3.jpg',
      lore_ko: '자욱한 밤안개 사이로 희미한 불빛이 반짝이는 신비로운 마을이다냥! 시야가 흐려져도 감각을 믿고 블록을 쌓아라냥! 🌫️',
      lore_en: 'A mystical village shrouded in swirling dense mist! Trust your feline instincts through the obscured vision! 🌫️',
      gimmick_ko: '🌫️ 짙은 안개 (Fog) · 제한된 시야',
      gimmick_en: '🌫️ Dense Mist · Obscured Vision'
    },
    {
      name: 'Melting Gelato', name_ko: '녹아내리는 젤라또', emoji: '🍦', hue: 330, mods: { melting: true, speedBoost: 1.75 },
      image: 'assets/cutscene_world_1.jpg',
      lore_ko: '달콤한 딸기 바닐라 아이스크림 산이다냥! 가만히 있으면 블록이 사르르 녹아내리니 번개처럼 빠르게 쌓아야 한다냥! 🍦⚡',
      lore_en: 'A mountain of sweet strawberry gelato! Blocks melt quickly if you hesitate—stack with lightning speed! 🍦⚡',
      gimmick_ko: '🍦 급속 융해 (Melting) & 초고속 비행 (Speed Rush)',
      gimmick_en: '🍦 Rapid Melting & High Velocity'
    },
    {
      name: 'Pinnacle Cliff', name_ko: '외줄타기 절벽', emoji: '⚖️', hue: 180, mods: { thinFoundation: true, tilt: true },
      image: 'assets/cutscene_world_4.jpg',
      lore_ko: '아찔한 낭떠러지 바위 기둥 위다냥! 밑바탕이 좁고 위태롭게 기울어지니 한 치의 오차도 없이 중앙에 올려놓아야 한다냥! ⚖️',
      lore_en: 'A breathtaking needle pinnacle high above the abyss! The thin base tilts easily—land dead center to survive! ⚖️',
      gimmick_ko: '⚖️ 좁은 기반 (Thin Base) & 기우는 탑 (Tilt)',
      gimmick_en: '⚖️ Narrow Base & Dynamic Tilting'
    },
    {
      name: 'Clockwork Forge', name_ko: '태엽 대장간', emoji: '⚙️', hue: 15, mods: { anvil: true },
      image: 'assets/cutscene_world_5.jpg',
      lore_ko: '육중한 톱니바퀴와 쇳물이 끓는 스팀펑크 공방이다냥! 묵직한 모루 블록을 꾹 누르고 있다가 원하는 위치에 정확히 떨어뜨려라냥! 🔨',
      lore_en: 'A fiery steampunk workshop humming with giant gears! Hold heavy anvil blocks and release precisely where needed! 🔨',
      gimmick_ko: '⚙️ 묵직한 모루 (Anvil) · 길게 누른 뒤 드롭',
      gimmick_en: '⚙️ Heavy Anvil · Press, Hold & Release'
    },
    {
      name: 'Hall of Perfection', name_ko: '완벽의 전당', emoji: '🎯', hue: 210, mods: { perfectionist: true },
      image: 'assets/cutscene_world_1.jpg',
      lore_ko: '단 1mm의 틈도 허용하지 않는 전설의 냥마스터 수련장이다냥! 오직 완벽한 묘펙트만이 이 탑을 쌓아 올릴 수 있다냥! 👑✨',
      lore_en: 'The sacred proving grounds of legendary cat masters! Only flawless Meowfect alignments can conquer this trial! 👑✨',
      gimmick_ko: '🎯 완벽주의 (Perfectionist) · 묘펙트 엄격 판정',
      gimmick_en: '🎯 Absolute Perfection · Strict Meowfect'
    },
    {
      name: 'Shrinking Void', name_ko: '축소의 심연', emoji: '⚡', hue: 50, mods: { shrinkRush: true, reverse: 0.2 },
      image: 'assets/cutscene_world_3.jpg',
      lore_ko: '시공간이 왜곡되어 블록이 실시간으로 쪼그라드는 이차원 공간이다냥! 갑작스런 방향 반전에 당황하지 마라냥! 🌀',
      lore_en: 'A dimension of warped spacetime where blocks shrink each second! Beware of sudden direction reversals! 🌀',
      gimmick_ko: '⚡ 블록 축소 (Shrink) & 역방향 반전 (Reverse)',
      gimmick_en: '⚡ Continuous Shrink & Sudden Reversals'
    },
    {
      name: 'Toy Workshop', name_ko: '장난감 공방', emoji: '🧸', hue: 15, mods: { scratcher: true, wobble: 0.3 },
      image: 'assets/cutscene_world_5.jpg',
      lore_ko: '알록달록 방울과 쥐돌이 인형이 가득한 즐거운 놀이터다냥! 튕겨나가는 블록 속도에 맞춰 신나게 뛰어보자냥! 🐭',
      lore_en: 'A joyful wonderland packed with jingling bell balls and plush mice! Match the bouncy shifting tempo! 🐭',
      gimmick_ko: '🧸 스크래처 마찰 & 격렬한 출렁임',
      gimmick_en: '🧸 Toy Friction & Erratic Wobble'
    },
    {
      name: 'Cloud Sanctuary', name_ko: '구름 성역', emoji: '☁️', hue: 210, mods: { fog: true, blink: 0.5 },
      image: 'assets/cutscene_world_4.jpg',
      lore_ko: '푹신한 솜사탕 구름 위에 지어진 천상의 성역이다냥! 블록이 깜빡이며 사라졌다가 나타나니 리듬을 기억하라냥! ☁️✨',
      lore_en: 'A celestial realm built on soft marshmallow clouds! Blocks blink in and out of sight—remember the cadence! ☁️✨',
      gimmick_ko: '☁️ 구름 안개 & 깜빡이는 블록 (Blink)',
      gimmick_en: '☁️ Cloud Mist & Blinking Blocks'
    },
    {
      name: 'Lava Cavern', name_ko: '용암 동굴', emoji: '🌋', hue: 5, mods: { melting: true, shrink: 0.06 },
      image: 'assets/cutscene_world_3.jpg',
      lore_ko: '이글거리는 마그마가 솟구치는 뜨거운 화산 동굴이다냥! 실수 한 번에 블록이 크게 녹아버리니 집중하라냥! 🔥',
      lore_en: 'A fiery subterranean volcanic cavern! Intense heat penalizes any misalignment with severe block erosion! 🔥',
      gimmick_ko: '🌋 용암 열기 & 실수 시 극심한 감축',
      gimmick_en: '🌋 Volcanic Heat & Severe Trim Penalty'
    },
    {
      name: 'Crystal Canyon', name_ko: '수정 협곡', emoji: '💎', hue: 170, mods: { ice: true, tilt: true },
      image: 'assets/cutscene_world_4.jpg',
      lore_ko: '빛을 굴절시키는 찬란한 다이아몬드 수정 협곡이다냥! 빙판과 기울기의 이중 시련을 극복하라냥! 💎❄️',
      lore_en: 'A canyon of towering crystalline gemstones! Conquer the perilous combination of slick ice and tilting towers! 💎❄️',
      gimmick_ko: '💎 빙판 미끄러짐 & 아찔한 탑 기울기',
      gimmick_en: '💎 Gemstone Ice & Dangerous Tower Tilt'
    },
    {
      name: 'Abyssal Aquarium', name_ko: '심해 수족관', emoji: '🐙', hue: 190, mods: { fog: true, sway: 14 },
      image: 'assets/cutscene_world_2.jpg',
      lore_ko: '거대한 유리 돔 너머로 형광 해파리와 고래가 유영하는 깊은 바다다냥! 깊은 해류가 탑을 출렁이게 만든다냥! 🌊🐙',
      lore_en: 'A deep sea observatory beneath glowing bioluminescent jellyfish! Deep ocean currents push against your tower! 🌊🐙',
      gimmick_ko: '🐙 심해 수압 안개 & 거센 조류 (Sway)',
      gimmick_en: '🐙 Abyssal Mist & Ocean Current Sway'
    },
    {
      name: 'Haunted Manor', name_ko: '유령의 저택', emoji: '👻', hue: 270, mods: { blink: 0.8, anvil: true },
      image: 'assets/cutscene_world_3.jpg',
      lore_ko: '장난꾸러기 유령 고양이들이 삐걱거리는 문 뒤에 숨어있는 저택이다냥! 깜빡이는 유령 블록을 정확히 내리쳐라냥! 👻🎃',
      lore_en: 'An eerie mansion inhabited by playful spectral felines! Time your heavy drops amidst flickering phantom lights! 👻🎃',
      gimmick_ko: '👻 유령의 깜빡임 & 묵직한 모루 낙하',
      gimmick_en: '👻 Phantom Blinking & Heavy Anvils'
    },
    {
      name: 'Desert Pyramid', name_ko: '사막 피라미드', emoji: '🏜️', hue: 35, mods: { tilt: true, shrinkRush: true },
      image: 'assets/cutscene_world_5.jpg',
      lore_ko: '고대 파라오 냥이의 황금 보물이 잠들어 있는 거대한 피라미드다냥! 모래폭풍 속에서 블록이 급격히 줄어든다냥! 🏜️👑',
      lore_en: 'An ancient pyramid guarding the pharaoh cat’s golden treasures! Sandstorms rapidly shrink oncoming blocks! 🏜️👑',
      gimmick_ko: '🏜️ 모래사구 기울기 & 급격한 축소',
      gimmick_en: '🏜️ Dune Tilting & Fast Block Shrink'
    },
    {
      name: 'Jungle Temple', name_ko: '정글 신전', emoji: '🌴', hue: 130, mods: { scratcher: true, reverse: 0.4 },
      image: 'assets/cutscene_world_1.jpg',
      lore_ko: '울창한 덩굴과 거대한 캣닢 나무가 우거진 원시 정글 신전이다냥! 덩굴을 타고 변칙적으로 방향을 바꾸는 블록을 잡아라냥! 🌿🐆',
      lore_en: 'A lush primordial jungle wrapped in wild vines and giant catnip! Predict sudden turns through dense overgrowth! 🌿🐆',
      gimmick_ko: '🌴 정글 덩굴 마찰 & 잦은 방향 반전',
      gimmick_en: '🌴 Vine Friction & Frequent Reversals'
    },
    {
      name: 'Space Station', name_ko: '우주 정거장', emoji: '🚀', hue: 260, mods: { ice: true, blink: 0.6 },
      image: 'assets/cutscene_world_4.jpg',
      lore_ko: '은하수가 흐르는 무중력 우주 궤도 기지다냥! 반짝이는 별빛 사이로 미끄러지는 블록을 우주복 냥이의 손길로 정렬하라냥! 🚀🌌',
      lore_en: 'An orbital space station gazing out upon the cosmic Milky Way! Catch shimmering zero-gravity blocks! 🚀🌌',
      gimmick_ko: '🚀 무중력 미끄러짐 & 스타 블링크',
      gimmick_en: '🚀 Zero-G Drift & Stellar Blinking'
    },
    {
      name: 'Magic Academy', name_ko: '마법 학교', emoji: '🔮', hue: 285, mods: { perfectionist: true, reverse: 0.5 },
      image: 'assets/cutscene_world_3.jpg',
      lore_ko: '떠다니는 마법 책과 신비한 비약이 가득한 대마법사 냥이의 학교다냥! 환영 마법에 속지 말고 완벽한 타이밍에 터치하라냥! 🔮✨',
      lore_en: 'A grand academy of arcane sorcery and floating grimoires! See through optical illusions with pure timing! 🔮✨',
      gimmick_ko: '🔮 절대 마법 판정 & 환영 방향 전환',
      gimmick_en: '🔮 Arcane Precision & Trick Reversals'
    },
    {
      name: 'Aurora Tundra', name_ko: '오로라 툰드라', emoji: '🌌', hue: 155, mods: { ice: true, fog: true, melting: true },
      image: 'assets/cutscene_world_4.jpg',
      lore_ko: '극지방의 장엄한 오로라 커튼 아래 펼쳐진 극한의 설원이다냥! 미끄러짐, 안개, 융해의 3중 시련을 돌파하라냥! 🌌❄️',
      lore_en: 'An extreme polar tundra under glowing green and violet auroras! Overcome the triple trial of ice, fog, and melt! 🌌❄️',
      gimmick_ko: '🌌 빙판 + 안개 + 융해 복합 시련',
      gimmick_en: '🌌 Ice + Fog + Melt Combined Trials'
    },
    {
      name: 'Pirate Galleon', name_ko: '해적선 갤리온', emoji: '🏴‍☠️', hue: 25, mods: { tilt: true, sway: 28 },
      image: 'assets/cutscene_world_2.jpg',
      lore_ko: '거친 파도를 가르는 전설의 해적 고양이 함선이다냥! 거대한 폭풍우에 돛대가 휘청거리니 최고의 평정심을 보여줘라냥! 🏴‍☠️⚔️',
      lore_en: 'A legendary pirate galleon braving raging ocean tempests! Violent sea swells make the mainmast pitch and roll! 🏴‍☠️⚔️',
      gimmick_ko: '🏴‍☠️ 폭풍우 기울기 & 격심한 좌우 요동',
      gimmick_en: '🏴‍☠️ Tempest Tilt & Violent Roll Sway'
    },
    {
      name: 'Rift of Time', name_ko: '시간의 균열', emoji: '⌛', hue: 60, mods: { shrinkRush: true, anvil: true },
      image: 'assets/cutscene_world_5.jpg',
      lore_ko: '과거와 미래의 모래시계가 뒤엉킨 시간의 끝자락이다냥! 째깍이는 초침 소리와 함께 점점 작아지는 모루를 지배하라냥! ⌛⚡',
      lore_en: 'The edge of eternity where past and future entangle! Command the shrinking hourglass anvils before time runs out! ⌛⚡',
      gimmick_ko: '⌛ 시간 가속 축소 & 찰나의 모루 낙하',
      gimmick_en: '⌛ Accelerated Shrink & Split-second Anvils'
    },
    {
      name: 'Legendary Cat Tower', name_ko: '전설의 냥타워', emoji: '👑', hue: 45, mods: { ice: true, scratcher: true, tilt: true, perfectionist: true },
      image: 'assets/cutscene_world_1.jpg',
      lore_ko: '천공을 뚫고 솟아오른 고대 냥이 왕국의 궁극의 정상이다냥! 지금까지 갈고닦은 모든 기량을 쏟아부어 전설의 캣타워를 완성하라냥! 👑✨🐾',
      lore_en: 'The zenith of the ancient cat empire piercing the heavens! Unleash your full mastery to crown the Legendary Cat Tower! 👑✨🐾',
      gimmick_ko: '👑 모든 환경 기믹의 궁극적 총집결',
      gimmick_en: '👑 The Ultimate Convergence of All Trials'
    }
  ];

  function worldHint(mods) {
    const lang = getLang();
    const dict = MOD_HINTS[lang] || MOD_HINTS.en;
    const hints = Object.keys(mods).map(k => dict[k]).filter(Boolean);
    return hints.length ? hints.join(' · ') : (lang === 'ko' ? '기본적인 스택 감각을 익히세요!' : 'Learn the basics of stacking!');
  }

  // -------------------------------------------------------------
  
  // -------------------------------------------------------------
  // I18N SYSTEM & LOCALIZATION DICTIONARY
  // -------------------------------------------------------------
  const I18N = {
    en: {
      menu: "Menu",
      sound: "Sound",
      endlessBest: "Endless BEST",
      perfectTag: "🐾 PERFECT",
      timeAttackMascot: "Time Attack!! Fast hands, hooman! ⏱️🐾",
      precisionMascot: "Meowfect focus! Line up the blocks, meow! 🎯",
      hazardMascot: "Hold steady through the hazards, meow! 🌪️🐾",
      endlessMascot: "Here we go! Stack it high, hooman! 🐾",
      bossCheerMascot: "Boss: {boss}!! Let's defeat it, meow! 🔥",
      bossEnragedMascot: "{boss} is enraged! Watch out for hairballs! 🔥",
      bossDefeatedMascot: "Boss defeated, hooman!! You did it, meow! 🎉",
      stayFocused: "Stay focused, meow...! 🐾",
      catLove: "Purrr... I love you hooman! 💖🐾",

      catLockedToast: "🔒 {cat} can be recruited from Lucky Cat Gacha! 🎁",
      readyGachaShortcut: "🎁 Cat Gacha",
      catEquippedToast: "🐾 Embarking with {name}!",
      purrfectCatTower: "A purr-fect cat tower!! 👑✨",
      stageClearMascot: "Stage Clear, meow!! 🎉🐾",
      streakGoalMascot: "Streak Goal Reached! Purr-fect timing! 💖🐾",
      pokeLineFallback: "😾 Don't poke me, meow! That tickles!",
      bestLabel: "BEST: ",

      // Archetypes
      archetype_standard: "Standard Climb",
      archetype_speed: "Speed Rush",
      archetype_precision: "Precision Streak",
      archetype_hazard: "Hazard Sway",
      archetype_bonus: "Churu Fever",
      archetype_boss: "Boss Battle",

      // Banner & Objectives
      desc_boss: "👑 BOSS: {boss} [HP {target}]\nLand Meowfect hits for 2× Critical Damage!",
      desc_speed: "⏱️ SPEED RUSH: Reach floor {target} in {time}s!\nMeowfect placements give +2s bonus time!",
      desc_precision: "🎯 PRECISION: Reach floor {target} & {streak} Perfect Streak!\nCarefully align every block!",
      desc_hazard: "🌪️ HAZARD: Overcome environmental trials!\n{hint}",
      desc_bonus: "✨ CHURU FEVER: Catch tasty treats raining down!\nScore 100+ points to collect plenty of Churu coins!",
      desc_standard: "🧱 STANDARD: Build your tower calmly and reach floor {target}!",

      // Ready Modal (Expedition Prep)
      prepTitle: "⚔️ EXPEDITION PREP",
      targetLabel: "🎯 Target: Reach Floor {target}",
      targetBoss: "👑 Target: Defeat {boss} [HP {target}]!",
      targetSpeed: "⏱️ Target: Reach Floor {target} within {time}s!",
      targetPrecision: "🎯 Target: Reach Floor {target} & {streak} Perfect Streak!",
      targetBonus: "✨ Target: Catch falling treats! (Goal: 100 pts)",
      tipDefault: "💡 Tip: Keep a steady rhythm and focus on center alignments!",
      tipSpeed: "💡 Tip: Time is running out! Miko's +3s bonus time is recommended! ⏱️",
      tipPrecision: "💡 Tip: Nero's +10% wider perfect tolerance helps build combos! 🎯",
      tipHazard: "💡 Tip: Environmental sway! Simba's 25% stability helps resist swaying! 🌪️",
      tipBoss: "💡 Tip: Battle with {boss} ({title})! Meowperor's 3× crit or Luna's rapid size recovery is effective! 👑",
      tipBonus: "💡 Tip: Move basket with touch drag or arrow keys! Golden Churu gives 3× pts and fever!",
      chooseCompanion: "🐾 Choose Cat Companion:",
      startExpedition: "▶ Start Expedition with this Cat",

      // Start Screen
      badge3d: "🐾 3D MEOW TOWER STACK 🐾",
      startTitle: "Meow Stack Tower",
      startSub: "3D CAT STACK TOWER",
      btnStart: "▶ Start Adventure",
      btnSelect: "🗺️ Stage Select",
      btnGacha: "🎁 Cat Gacha",
      btnCats: "🐱 Cat Companions",
      btnEndless: "♾️ Endless Mode",

      // Clear Screen
      clearTitle: "STAGE CLEAR!",
      clearBossTitle: "👑 BOSS CLEAR!",
      clearAllTitle: "🏆 ALL CLEAR!",
      bonusClearTitle: "🎉 CHURU FEVER CLEAR! 🎉",
      bonusRewardSummary: '+{churu} <img src="assets/churu_icon.jpg" class="churu-icon" alt="Churu"> Churu Coins Earned!',
      bonusTicketEarned: "🎟️ +1 Gacha Ticket (3★ Bonus)!",
      clearStats: "Meowfect {n} / {target} Floors",
      newRecord: "  ·  NEW RECORD!",
      btnNext: "Next Stage ▶",
      btnReplay: "🔁 Replay (Star Challenge)",
      btnMenuClear: "🗺️ Stage Select",
      clearAllNote: "All towers completed! You are a legendary hooman!! 👑 (Collect all 3★ stars!)",
      needStarsNote: "Next world needs ⭐ {gate} stars (You have {cur}). Replay earlier stages for 3 stars!",
      newWorldUnlocked: "New World Unlocked: \"{name}\"!",
      purrfect: "PURR-FECT! 👑",

      // Game Over
      gameOver: "GAME OVER",
      defeatedBy: "😾 Defeated by {boss}...",
      stageFailed: "💔 Floor {n} / {target} Collapse",
      scoreLabel: "SCORE",
      best: "BEST: {n}",
      newBest: "NEW!",
      tapRetry: "Tap anywhere to retry, meow! 🐾",
      btnRetry: "🔁 Try Again",
      btnMenu: "Menu",

      // Stage Select
      selectTitle: "🗺️ Stages",
      legendClimb: "🧱 Climb",
      legendSpeed: "⏱️ Speed",
      legendPrecision: "🎯 Precision",
      legendHazard: "🌪️ Hazard",
      legendBonus: '<img src="assets/churu_icon.jpg" class="churu-icon" alt="Churu"> Bonus',
      legendBoss: "👑 Boss",
      btnBack: "← Main",

      // Companions Modal
      companionsTitle: "🐱 Cat Companions",
      companionsSubtitle: "Defeat World Bosses and pull from Gacha to adopt adorable cat companions! Each friend brings unique passive buffs!",
      companionEquipped: "EQUIPPED",
      companionLocked: "Pull from Gacha to unlock",
      companionLockedBadge: "LOCKED",
      btnEquip: "🐾 Equip",
      btnCompToGacha: "🎁 Open Cat Gacha",

      // Gacha Modal
      gachaTitle: "🎁 Lucky Cat Gacha",
      gachaSubtitle: "Collect adorable cat companions! Each world role brings unique perks.",
      gachaPull1: "🎟️ Pull 1x",
      gachaPull1Cost: '1 Ticket or 50 <img src="assets/churu_icon.jpg" class="churu-icon" alt="Churu">',
      gachaPull10: "🌟 Pull 10x",
      gachaPull10Cost: '10 Tickets or 450 <img src="assets/churu_icon.jpg" class="churu-icon" alt="Churu">',
      gachaNewCat: "✨ NEW COMPANION! ✨",
      gachaDuplicate: '🔁 DUPLICATE (+25 <img src="assets/churu_icon.jpg" class="churu-icon" alt="Churu"> Refund)',
      gachaNotEnough: "Not enough Tickets or Churu! Clear Bonus stages or Bosses to earn more!",
      gachaRatesBtn: "📋 View 18 Companions & Rates",

      // Unlock Modal
      unlockRibbon: "🎉 NEW COMPANION UNLOCKED!",
      btnEquipUnlocked: "🐾 Equip Companion",
      btnCloseUnlock: "Later",

      // Boss Intro
      bossIntroWarning: "⚠️ WARNING: BOSS APPROACHING ⚠️",
      bossIntroFight: "⚔️ READY... FIGHT!",
      bossIntroSkip: "SKIP ⏩",

      // Language Toggle
      langBtn: "🌐 EN",

      // Settings Modal
      settingsTitle: "⚙️ Game Settings",
      settingLang: "🌐 Language",
      settingAudio: "🔊 Sound & Music",
      settingBgm: "Background Music (BGM)",
      settingBgmDesc: "Warm, relaxing procedural marimba ambient music",
      settingSfx: "Sound Effects (SFX)",
      settingSfxDesc: "Block drops, combos, boss hits & gacha sound effects",
      settingFeel: "✨ Gameplay & FX",
      settingHaptics: "Haptic Vibration",
      settingHapticsDesc: "Gentle vibration pulses on block placement & combos",
      settingShake: "Screen Shake",
      settingShakeDesc: "Screen vibration feedback on combos & hits",
      settingParticles: "Visual Particles",
      settingParticlesDesc: "3D sparkle & star bursts (toggle for battery saving)",
      settingData: "💾 Game Data & Stats",
      settingStatStars: "⭐ Stars: {stars} / 726",
      settingStatCleared: "🏆 Cleared: {cleared} / 242",
      settingResetBtn: "🔄 Reset Game Progress",
      settingResetConfirm: "Are you sure you want to reset all game data (stars, companions, churu coins)? This cannot be undone!",
      settingResetSuccess: "Game progress has been reset, meow! 🐾",
      settingVersion: "Meow Stack Tower v1.3.0 · Designed with 💖"
    },
    ko: {
      menu: "메뉴",
      sound: "사운드",
      endlessBest: "무한 최고",
      perfectTag: "🐾 퍼펙트",
      timeAttackMascot: "스피드 러시!! 빠른 손놀림이다냥! ⏱️🐾",
      precisionMascot: "퍼펙트 집중! 블록을 정확히 맞춰라냥! 🎯",
      hazardMascot: "환경 기믹을 조심해서 균형을 잡아라냥! 🌪️🐾",
      endlessMascot: "시작이다냥! 가장 높이 쌓아봐라냥! 🐾",
      bossCheerMascot: "보스: {boss}!! 어서 물리치자냥! 🔥",
      bossEnragedMascot: "{boss}이(가) 분노했다냥! 털뭉치 주의! 🔥",
      bossDefeatedMascot: "보스를 물리쳤다냥, 집사야!! 해냈다냥! 🎉",
      stayFocused: "집중하라냥, 냥...! 🐾",
      catLove: "골골송... 집사야 사랑한다냥! 💖🐾",

      catLockedToast: "🔒 {cat}은(는) 냥이 가챠에서 영입할 수 있다냥! 🎁",
      readyGachaShortcut: "🎁 냥이 가챠",
      catEquippedToast: "🐾 {name}와(과) 함께 모험을 시작합니다!",
      purrfectCatTower: "완벽한 캣타워다냥!! 👑✨",
      stageClearMascot: "스테이지 클리어다냥!! 🎉🐾",
      streakGoalMascot: "목표 콤보 달성! 완벽한 감각이다냥! 💖🐾",
      pokeLineFallback: "😾 건드리지 마라냥! 간지럽다냥!",
      bestLabel: "최고 점수: ",

      // Archetypes
      archetype_standard: "일반 등반",
      archetype_speed: "스피드 러시",
      archetype_precision: "퍼펙트 정밀",
      archetype_hazard: "환경 기믹",
      archetype_bonus: "츄르 피버",
      archetype_boss: "보스 대결",

      // Banner & Objectives
      desc_boss: "👑 보스: {boss} [HP {target}]\nMeowfect 퍼펙트로 2배 크리티컬 타격을 입히세요!",
      desc_speed: "⏱️ 스피드 러시: {time}초 안에 {target}층 도달!\n퍼펙트 적재 시 +2초 보너스 시간!",
      desc_precision: "🎯 퍼펙트 정밀: {target}층 도달 & {streak}연속 콤보 달성!\n신중하고 완벽하게 블록을 쌓으세요!",
      desc_hazard: "🌪️ 환경 기믹: 위험 환경 돌파!\n{hint}",
      desc_bonus: "✨ 츄르 피버: 하늘에서 쏟아지는 간식을 받으세요!\n100점 이상 획득하여 푸짐한 츄르 코인을 모으세요!",
      desc_standard: "🧱 일반 등반: 차분하게 탑을 올려 {target}층에 도달하세요!",

      // Ready Modal (Expedition Prep)
      prepTitle: "⚔️ 출격 준비 (EXPEDITION PREP)",
      targetLabel: "🎯 목표: {target}층 도달",
      targetBoss: "👑 목표: {boss} [HP {target}] 격파!",
      targetSpeed: "⏱️ 목표: {time}초 안에 {target}층 도달!",
      targetPrecision: "🎯 목표: {target}층 도달 & {streak}연속 퍼펙트 달성!",
      targetBonus: "✨ 목표: 쏟아지는 간식 받기! (목표: 100점)",
      tipDefault: "💡 팁: 차분하게 리듬을 맞춰 블록을 적재하세요!",
      tipSpeed: "💡 팁: 시간이 촉박합니다! 월드 1 스피드 냥이의 시간 +3초가 추천됩니다! ⏱️",
      tipPrecision: "💡 팁: 월드 2 정밀 냥이의 퍼펙트 판정 확대로 콤보를 쉽게 이어갈 수 있습니다! 🎯",
      tipHazard: "💡 팁: 환경 기믹! 월드 3 기믹 냥이의 흔들림 억제가 효과적입니다! 🌪️",
      tipBoss: "💡 팁: {boss} ({title})과의 결전! 월드 5 제왕 냥이의 크리티컬 3배 또는 월드 4의 빠른 타워 확장이 유리합니다! 👑",
      tipBonus: "💡 팁: 터치 드래그나 방향키로 이동! 황금 츄르는 3배 점수와 피버 보너스를 줍니다!",
      chooseCompanion: "🐾 함께 출격할 동료 고양이 선택:",
      startExpedition: "▶ 이 고양이와 출격하기 (Start)",

      // Start Screen
      badge3d: "🐾 3D 냥이 캣타워 스택 🐾",
      startTitle: "Meow Stack Tower",
      startSub: "3D CAT STACK TOWER",
      btnStart: "▶ 모험 시작 (Start)",
      btnSelect: "🗺️ 스테이지 선택",
      btnGacha: "🎁 냥이 가챠",
      btnCats: "🐱 동료 고양이",
      btnEndless: "♾️ 무한 모드",

      // Clear Screen
      clearTitle: "스테이지 클리어!",
      clearBossTitle: "👑 보스 격파 완료!",
      clearAllTitle: "🏆 모든 스테이지 제패!",
      bonusClearTitle: "🎉 츄르 피버 성공! 🎉",
      bonusRewardSummary: '+{churu} <img src="assets/churu_icon.jpg" class="churu-icon" alt="츄르"> 츄르 코인 획득!',
      bonusTicketEarned: "🎟️ +1 냥이 가챠 티켓 (3성 보너스)!",
      clearStats: "퍼펙트 {n} / {target} 층",
      newRecord: "  ·  신기록 달성!",
      btnNext: "다음 스테이지 ▶",
      btnReplay: "🔁 다시 도전 (별 3개 도전)",
      btnMenuClear: "🗺️ 스테이지 선택",
      clearAllNote: "모든 캣타워를 완성했습니다! 전설의 집사 탄생!! 👑",
      needStarsNote: "다음 월드 입장에는 ⭐ {gate}개의 별이 필요합니다 (현재 {cur}개). 이전 월드에서 별 3개를 모아보세요!",
      newWorldUnlocked: "새로운 월드 개방: \"{name}\"!",
      purrfect: "완벽하다냥! 👑",

      // Game Over
      gameOver: "게임 오버",
      defeatedBy: "😾 {boss}에게 완패했다냥...",
      stageFailed: "💔 {n} / {target} 층에서 무너졌다냥",
      scoreLabel: "점수",
      best: "최고 점수: {n}",
      newBest: "신기록!",
      tapRetry: "화면을 터치하여 다시 도전하세요! 🐾",
      btnRetry: "🔁 다시 도전",
      btnMenu: "메뉴",

      // Stage Select
      selectTitle: "🗺️ 스테이지 선택",
      legendClimb: "🧱 등반",
      legendSpeed: "⏱️ 스피드",
      legendPrecision: "🎯 정밀",
      legendHazard: "🌪️ 기믹",
      legendBonus: '<img src="assets/churu_icon.jpg" class="churu-icon" alt="츄르"> 보너스',
      legendBoss: "👑 보스",
      btnBack: "← 메인",

      // Companions Modal
      companionsTitle: "🐱 동료 고양이 (Cat Companions)",
      companionsSubtitle: "가챠에서 사랑스러운 고양이 친구들을 영입하세요! 각 월드 포지션별 고유 능력이 발동됩니다!",
      companionEquipped: "출격 중",
      companionLocked: "가챠에서 영입 가능",
      companionLockedBadge: "미보유",
      btnEquip: "🐾 장착하기",
      btnCompToGacha: "🎁 냥이 가챠 바로가기",

      // Gacha Modal
      gachaTitle: "🎁 행운의 냥이 가챠",
      gachaSubtitle: "다채로운 매력의 고양이들을 수집하세요! 각 월드 포지션별 고유 능력이 적용됩니다.",
      gachaPull1: "🎟️ 1회 뽑기",
      gachaPull1Cost: '티켓 1장 또는 50 <img src="assets/churu_icon.jpg" class="churu-icon" alt="츄르">',
      gachaPull10: "🌟 10회 연속 뽑기",
      gachaPull10Cost: '티켓 10장 또는 450 <img src="assets/churu_icon.jpg" class="churu-icon" alt="츄르">',
      gachaNewCat: "✨ 새로운 동료 영입! ✨",
      gachaDuplicate: '🔁 중복 획득 (+25 <img src="assets/churu_icon.jpg" class="churu-icon" alt="츄르"> 페이백)',
      gachaNotEnough: "티켓 또는 츄르가 부족합니다! 보너스 스테이지나 보스를 클리어하세요!",
      gachaRatesBtn: "📋 동료 도감 & 라인업 (18종)",

      // Unlock Modal
      unlockRibbon: "🎉 새로운 동료 고양이 합류!",
      btnEquipUnlocked: "🐾 지금 함께 모험 떠나기",
      btnCloseUnlock: "다음에",

      // Boss Intro
      bossIntroWarning: "⚠️ 경고: 보스 고양이 접근 중 ⚠️",
      bossIntroFight: "⚔️ 결전 개시... FIGHT!",
      bossIntroSkip: "스킵 ⏩",

      // Language Toggle
      langBtn: "🌐 KO",

      // Settings Modal
      settingsTitle: "⚙️ 게임 설정",
      settingLang: "🌐 언어 (Language)",
      settingAudio: "🔊 사운드 & 음악",
      settingBgm: "배경음악 (BGM)",
      settingBgmDesc: "따뜻하고 아늑한 마림바 앰비언트 배경음악",
      settingSfx: "효과음 (SFX)",
      settingSfxDesc: "블록 착지, 콤보, 보스 타격 및 가챠 효과음",
      settingFeel: "✨ 조작 & 연출 효과",
      settingHaptics: "진동 피드백 (Haptics)",
      settingHapticsDesc: "블록 적재 및 퍼펙트 시 미세 진동",
      settingShake: "화면 흔들림 (Screen Shake)",
      settingShakeDesc: "강력한 콤보 및 타격 시 화면 흔들림 연출",
      settingParticles: "파티클 효과 (Particles)",
      settingParticlesDesc: "3D 스파클 및 별빛 파티클 (배터리 절약 모드)",
      settingData: "💾 데이터 관리 & 통계",
      settingStatStars: "⭐ 별 수집: {stars} / 726",
      settingStatCleared: "🏆 스테이지 클리어: {cleared} / 242",
      settingResetBtn: "🔄 게임 데이터 초기화",
      settingResetConfirm: "정말 모든 게임 데이터(별, 동료 고양이, 츄르 등)를 초기화하시겠습니까? 되돌릴 수 없습니다!",
      settingResetSuccess: "게임 데이터가 초기화되었습니다냥! 🐾",
      settingVersion: "Meow Stack Tower v1.3.0 · Designed with 💖"
    }
  };

  function getLang() {
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      try {
        const p = new URLSearchParams(window.location.search);
        const l = p.get('lang');
        if (l === 'ko' || l === 'en') return l;
      } catch (e) { /* ignore */ }
    }
    if (typeof save !== 'undefined' && save && save.lang) return save.lang;
    return (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('ko')) ? 'ko' : 'en';
  }

  function t(key, vars = {}) {
    const lang = getLang();
    let str = (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
    }
    return str;
  }

  function getBossField(bossInfo, field) {
    if (!bossInfo || !bossInfo[field]) return '';
    const val = bossInfo[field];
    if (typeof val === 'object' && !Array.isArray(val)) {
      const lang = getLang();
      return val[lang] || val.en || val.ko || '';
    }
    return val;
  }

  function getBossQuote(bossInfo, field) {
    return getBossField(bossInfo, field);
  }

  function getCompanionField(cat, field) {
    if (!cat || !cat[field]) return '';
    const val = cat[field];
    if (typeof val === 'object' && !Array.isArray(val)) {
      const lang = getLang();
      return val[lang] || val.en || val.ko || '';
    }
    return val;
  }

  // STAGE ARCHETYPES & LEVEL DESIGN ARCHITECTURE
  // -------------------------------------------------------------
  const STAGE_TYPES = {
    standard: { key: 'standard', name: 'Standard Climb', emoji: '🧱', ko: '일반 등반', badgeCls: 'type-standard' },
    speed: { key: 'speed', name: 'Speed Rush', emoji: '⏱️', ko: '스피드 러시', badgeCls: 'type-speed' },
    precision: { key: 'precision', name: 'Meowfect Mastery', emoji: '🎯', ko: '퍼펙트 장인', badgeCls: 'type-precision' },
    hazard: { key: 'hazard', name: 'Hazard Trial', emoji: '🌪️', ko: '환경 기믹', badgeCls: 'type-hazard' },
    bonus: { key: 'bonus', name: 'Churu Fever', emoji: '✨', ko: '츄르 피버', badgeCls: 'type-bonus' },
    boss: { key: 'boss', name: 'Boss Battle', emoji: '👑', ko: '보스 대결', badgeCls: 'type-boss' }
  };

  const BOSS_PALETTES = {
    chonk_orange: { fur1: '#ffa726', fur2: '#fb8c00', fur3: '#f57c00', belly1: '#fffde7', belly2: '#fff9c4' },
    bully_brown: { fur1: '#a1887f', fur2: '#6d4c41', fur3: '#4e342e', belly1: '#d7ccc8', belly2: '#bcaaa4' },
    hobo_gray: { fur1: '#b0bec5', fur2: '#78909c', fur3: '#546e7a', belly1: '#eceff1', belly2: '#cfd8dc' },
    yakuza_black: { fur1: '#37474f', fur2: '#212121', fur3: '#111111', belly1: '#455a64', belly2: '#263238' },
    hiphop_purple: { fur1: '#ba68c8', fur2: '#8e24aa', fur3: '#4a148c', belly1: '#f3e5f5', belly2: '#e1bee7' },
    pirate_russet: { fur1: '#8d6e63', fur2: '#5d4037', fur3: '#3e2723', belly1: '#efebe9', belly2: '#d7ccc8' },
    wizard_indigo: { fur1: '#7986cb', fur2: '#3f51b5', fur3: '#283593', belly1: '#e8eaf6', belly2: '#c5cae9' },
    cyber_cyan: { fur1: '#4dd0e1', fur2: '#00acc1', fur3: '#00838f', belly1: '#e0f7fa', belly2: '#b2ebf2' },
    lava_fire: { fur1: '#ff7043', fur2: '#f4511e', fur3: '#bf360c', belly1: '#fff3e0', belly2: '#ffe0b2' },
    emperor_gold: { fur1: '#ffd54f', fur2: '#ffb300', fur3: '#ff8f00', belly1: '#fffde7', belly2: '#fff9c4' }
  };

  const WORLD_BOSS_NAMES = [
    // 1. World 1 (1-16): Big Chonk
    {
      type: 'chonk',
      name: 'Big Chonk',
      title: { en: 'King of Churu 👑', ko: '츄르의 제왕 👑' },
      emoji: '😾',
      palette: BOSS_PALETTES.chonk_orange,
      quote: { en: "All Churu is mine, meow! Don't even dare!", ko: "츄르는 내 거다냥! 넘볼 생각 마라냥!" },
      smugQuote: { en: "Hahaha! Did you think you could pierce my belly with that?", ko: "크하하! 겨우 그 정도로 내 뱃살을 뚫겠냥?" },
      hurtQuote: { en: "Meowch! A scratch on my precious royal belly...!", ko: "냥아악! 내 소중한 뱃살에 흠집이...!" },
      frenzyQuote: { en: "How dare you touch my Churu! I will eat everything! 🔥", ko: "감히 내 츄르를 건드리다니! 다 먹어치워 주마냥! 🔥" },
      defeatQuote: { en: "My... my Churu... falls over... 🏳️💦", ko: "내... 내 츄르... 털썩... 🏳️💦" },
      victoryQuote: { en: "All Churu belongs to me! *Burp*~ 🐟✨", ko: "츄르는 전부 내 차지다냥! 꺼억~ 🐟✨" }
    },
    // 2. World 2 (2-16): Bully Cat
    {
      type: 'bully',
      imagePrefix: 'boss_bully',
      name: 'Bully Cat',
      title: { en: 'Alley Rebel 🩹', ko: '골목대장 반역냥 🩹' },
      emoji: '😼',
      palette: BOSS_PALETTES.bully_brown,
      quote: { en: "Hey~ Pay the Churu toll if you want to stack here, meow!", ko: "어이~ 내 구역에서 탑을 쌓으려면 츄르 통행세를 내라냥!" },
      smugQuote: { en: "Pfft! Thought you could rule the alley with those skills? 😼", ko: "풋! 그 실력으로 골목을 주름잡으려 했냥? 😼" },
      hurtQuote: { en: "Ouch! This rookie's got sharper claws than I thought?! 💥", ko: "커헉! 이 풋내기 녀석 제법 날카롭잖아냥?! 💥" },
      frenzyQuote: { en: "I will show you the alley king's true fury! Grrr! 💢", ko: "골목대장의 진짜 매운맛을 보여주마냥! 으르렁! 💢" },
      defeatQuote: { en: "I submit... you are the new boss... 🏳️", ko: "형님으로 모시겠다냥... 꼬리 내릴게냥... 🏳️" },
      victoryQuote: { en: "The king of the alley is forever me! Clear the path! 😼✨", ko: "골목의 짱은 영원히 나다냥! 길을 비켜라냥! 😼✨" }
    },
    // 3. World 3 (3-16): Hobo Cat
    {
      type: 'hobo',
      imagePrefix: 'boss_hobo',
      name: 'Hobo Cat',
      title: { en: 'Box Fortress Hermit 📦', ko: '상자 요새 은둔냥 📦' },
      emoji: '😿',
      palette: BOSS_PALETTES.hobo_gray,
      quote: { en: "Spare just one bite of Churu... I don't even have a can... 📦", ko: "츄르 딱 한 입만 주고 가라냥... 캔 하나도 없다냥..." },
      smugQuote: { en: "Hehe~ Did you miss? Give me the scraps then! 🥫", ko: "헤헤~ 실수했냥? 남은 부스러기라도 내놔라냥! 🥫" },
      hurtQuote: { en: "Whoa! My precious cardboard box got dented! 💧", ko: "아이쿠! 내 소중한 택배 상자 찌그러졌다냥! 💧" },
      frenzyQuote: { en: "Don't you dare touch my last can of tuna!! ⚡", ko: "내 마지막 참치캔을 건드리면 가만 안 둔다냥!! ⚡" },
      defeatQuote: { en: "In the end... even my box was taken... sniff... 🏳️📦", ko: "결국 박스마저 빼앗겼다냥... 흑흑... 🏳️📦" },
      victoryQuote: { en: "Hooray! Tuna cans for life! Best day ever~ 🥫✨", ko: "만세! 참치캔을 얻었다냥! 평생 먹을 거다냥~ 🥫✨" }
    },
    // 4. World 4 (4-16): Yakuza Mobster
    {
      type: 'yakuza',
      imagePrefix: 'boss_yakuza',
      name: 'Yakuza Mobster',
      title: { en: 'Noir Syndicate Don 🕶️', ko: '느와르 조직 대부냥 🕶️' },
      emoji: '🕶️',
      palette: BOSS_PALETTES.yakuza_black,
      quote: { en: "I rule the night in this city. Stop now if you value your lives.", ko: "이 도시의 밤은 내가 지배한다냥. 목숨이 아깝다면 멈춰라냥." },
      smugQuote: { en: "Hmph... far too clumsy for a rookie's hands. 🕶️", ko: "훗... 풋내기의 손놀림치곤 너무 서투르군냥. 🕶️" },
      hurtQuote: { en: "Urgh...! A crack in my custom sunglasses...?! 💥", ko: "큭...! 내 선글라스에 금이 가다니...! 💥" },
      frenzyQuote: { en: "Making me take off my sunglasses... blood will be shed! 🔥", ko: "선글라스를 벗게 만들다니... 피를 보게 될 거다냥! 🔥" },
      defeatQuote: { en: "By syndicate code... I concede defeat... 🏳️", ko: "조직의 규율에 따라... 패배를 인정한다냥... 🏳️" },
      victoryQuote: { en: "The top of this city always belongs to me. 🚬🕶️", ko: "이 도시의 꼭대기는 언제나 내 차지다냥. 🚬🕶️" }
    },
    // 5. World 5 (5-16): Hip-Hop Gangster
    {
      type: 'hiphop',
      name: 'Hip-Hop Gangster',
      title: { en: 'Street Beat Master 🧢', ko: '스트리트 비트 마스터 🧢' },
      emoji: '🎧',
      palette: BOSS_PALETTES.hiphop_purple,
      quote: { en: "Drop the Beat, meow! Can you keep up with my rhythm?! Yo!", ko: "Drop the Beat냥! 내 리듬을 따라올 수 있겠냥?! Yo!" },
      smugQuote: { en: "Yo! Offbeat stacking won't match my groove! 🎧", ko: "Yo! 그 박자감으론 내 비트 못 따라온다냥! 🎧" },
      hurtQuote: { en: "Wh-wh-what?! Did my beat just skip?! 💥", ko: "Wh-wh-what?! 내 비트가 엇박자가 났다냥?! 💥" },
      frenzyQuote: { en: "Speaker volume MAX!! Taste my bass bombardment! 🔊🔥", ko: "스피커 볼륨 MAX!! 비트 폭격 맛을 봐라냥! 🔊🔥" },
      defeatQuote: { en: "Mic Drop, meow... my groove has collapsed... 🏳️🎤", ko: "Mic Drop냥... 내 그루브가 무너지다니... 🏳️🎤" },
      victoryQuote: { en: "SWAG! I am the supreme cat tower champion! Yeah! 🎤✨", ko: "SWAG! 내가 바로 힙합 탑의 챔피언이다냥! Yeah! 🎤✨" }
    },
    // 6. World 6 (6-16): Pirate Captain
    {
      type: 'pirate',
      name: 'Pirate Captain',
      title: { en: 'Seven Seas Marauder 🏴‍☠️', ko: '칠해의 해적선장 🏴‍☠️' },
      emoji: '🏴‍☠️',
      palette: BOSS_PALETTES.pirate_russet,
      quote: { en: "Weigh anchor! The treasure tuna belongs to me, meow!", ko: "닻을 올려라냥! 보물 참치는 모두 내 거다냥!" },
      smugQuote: { en: "A wave washed away your footing, landlubber! 🏴‍☠️", ko: "파도 한 번에 흔들리는 풋내기 솜씨로군냥! 🏴‍☠️" },
      hurtQuote: { en: "Shiver me timbers! You dented my pirate ship! 💥", ko: "으악! 내 해적선 난간이 부서졌다냥! 💥" },
      frenzyQuote: { en: "Cannons fire! I'll sink your entire tower! 💣🔥", ko: "대포 일제 사격이다냥! 모조리 수장시켜 주마! 💣🔥" },
      defeatQuote: { en: "I must surrender my pirate hat... 🏳️⚓", ko: "해적 모자를 벗어야 할 때로군... 졌소냥... 🏳️⚓" },
      victoryQuote: { en: "Yo-ho-ho! All oceans and fish are mine! 🏴‍☠️🐟", ko: "요호호! 칠해의 모든 물고기는 내 차지다냥! 🏴‍☠️🐟" }
    },
    // 7. World 7 (7-16): Wizard Felis
    {
      type: 'wizard',
      name: 'Wizard Felis',
      title: { en: 'Arcane Academy Dean 🔮', ko: '비전 아카데미 학장 🔮' },
      emoji: '🔮',
      palette: BOSS_PALETTES.wizard_indigo,
      quote: { en: "Witness the pinnacle of arcane cat tower sorcery!", ko: "비전 마법의 정점, 캣타워 매직을 보여주마냥!" },
      smugQuote: { en: "Fascinating... your blocks drift into illusion. 🔮", ko: "안타깝구나... 환영 마법에 홀린 게로군냥. 🔮" },
      hurtQuote: { en: "The magic barrier fractured... how did you bypass it?! 💥", ko: "마법 결계에 균열이... 어떻게 파고들었냥?! 💥" },
      frenzyQuote: { en: "Forbidden Arcane Unleashed! Warp space itself! ⚡🔥", ko: "금지된 고대 마법 해방! 시공을 뒤틀어 주마! ⚡🔥" },
      defeatQuote: { en: "My mana is depleted... a formidable apprentice... 🏳️📖", ko: "마나가 바닥났다냥... 훌륭한 제자로다... 🏳️📖" },
      victoryQuote: { en: "The secrets of the tower remain in my grimoire! ✨🔮", ko: "비전 마법의 진리는 언제나 내 서재에 있다냥! ✨🔮" }
    },
    // 8. World 8 (8-16): Cloud Angel
    {
      type: 'chonk',
      name: 'Cloud Angel',
      title: { en: 'Celestial Cloud Guide ☁️', ko: '천상 구름 인도자 ☁️' },
      emoji: '☁️',
      palette: BOSS_PALETTES.chonk_orange,
      quote: { en: "Can you reach all the way above the celestial clouds?", ko: "천상의 구름 위까지 닿을 수 있겠냥?" },
      smugQuote: { en: "Hehe, you slipped into the misty fog, meow! ☁️", ko: "후훗, 푹신한 구름 안개 속으로 미끄러졌냥? ☁️" },
      hurtQuote: { en: "Oh my! My celestial halo is wobbling! 💥", ko: "어머나! 천사의 링이 흔들거리잖아냥! 💥" },
      frenzyQuote: { en: "Holy Storm! Feel the celestial gale! 💨⚡", ko: "천상의 돌풍! 구름 바람을 버텨보라냥! 💨⚡" },
      defeatQuote: { en: "The stairs to the sky have been opened to you... 🏳️🌟", ko: "하늘로 향하는 문을 열어드리겠다냥... 🏳️🌟" },
      victoryQuote: { en: "The paradise in the clouds stays peaceful today~ ☁️✨", ko: "구름 위의 낙원은 언제나 평화롭다냥~ ☁️✨" }
    },
    // 9. World 9 (9-16): Lava Flare Cat
    {
      type: 'lava',
      name: 'Lava Flare Cat',
      title: { en: 'Magma Cavern Guardian 🌋', ko: '용암 동굴 수호묘 🌋' },
      emoji: '🌋',
      palette: BOSS_PALETTES.lava_fire,
      quote: { en: "Taste burning magma! Your tower will melt away!", ko: "뜨거운 마그마 맛을 보아라냥! 탑이 녹아내릴 거다냥!" },
      smugQuote: { en: "Burned right up into ash, meow! 🔥", ko: "화르륵! 재가 되어 날아가 버렸냥! 🔥" },
      hurtQuote: { en: "Sizzle! The magma core took a solid blow! 💥", ko: "치이익! 마그마 코어에 냉기가 닿았다냥! 💥" },
      frenzyQuote: { en: "VOLCANIC ERUPTION! Melt everything to slag! 🌋🔥", ko: "화산 폭발이다냥! 모든 블록을 녹여버리마! 🌋🔥" },
      defeatQuote: { en: "The flames have cooled... well played, hooman... 🏳️💧", ko: "불꽃이 식었다냥... 차분하고 대단하구나... 🏳️💧" },
      victoryQuote: { en: "The magma volcano burns eternally bright! 🌋🔥", ko: "용암 화산은 영원히 타오를 것이다냥! 🌋🔥" }
    },
    // 10. World 10 (10-16): Candy Queen
    {
      type: 'hiphop',
      name: 'Candy Queen',
      title: { en: 'Sweet Confection Ruler 🍭', ko: '달콤한 디저트 여왕 🍭' },
      emoji: '🍭',
      palette: BOSS_PALETTES.hiphop_purple,
      quote: { en: "Lose yourself in the rhythm of the candy tower~ 🍭", ko: "달콤한 사탕 타워의 리듬에 빠져보라냥~ 🍭" },
      smugQuote: { en: "Sticky syrup got you stuck, sweetie! 🍬", ko: "어머~ 끈적한 시럽에 발이 묶여버렸냥? 🍬" },
      hurtQuote: { en: "Ouch! My sugar tiara got chipped! 💥", ko: "꺅! 내 설탕 티아라에 금이 갔잖아냥! 💥" },
      frenzyQuote: { en: "Sugar Rush MAX!! Nonstop sweet overdrive! 🧁⚡", ko: "슈가 러시 폭주! 달콤함의 한계를 맛봐라냥! 🧁⚡" },
      defeatQuote: { en: "The sweet kingdom crowns a new champion... 🏳️🍰", ko: "달콤한 디저트의 왕관을 양보하겠다냥... 🏳️🍰" },
      victoryQuote: { en: "Candy and sweetness conquer everything, meow! 🍭✨", ko: "달콤한 사탕이 온 세상을 정복했다냥! 🍭✨" }
    },
    // 11. World 11 (11-16): Deep Kraken
    {
      type: 'pirate',
      name: 'Deep Kraken',
      title: { en: 'Abyssal Ocean Sovereign 🐙', ko: '심해 크라켄 군주 🐙' },
      emoji: '🐙',
      palette: BOSS_PALETTES.cyber_cyan,
      quote: { en: "Sink deep into the abyss whirlpool, meow!", ko: "심해의 소용돌이 속으로 가라앉아라냥!" },
      smugQuote: { en: "Dragged into the ocean depths, meow! 🌊", ko: "심해 바닥으로 가라앉아버렸군냥! 🌊" },
      hurtQuote: { en: "My tentacles got severed?! Inconceivable! 💥", ko: "내 촉수가 잘려나가다니?! 믿을 수 없다냥! 💥" },
      frenzyQuote: { en: "ABYSSAL TSUNAMI! Drag the entire tower down! 🌊🐙", ko: "심해 쓰나미! 바닷속으로 통째로 끌고 가마! 🌊🐙" },
      defeatQuote: { en: "Returning to the trench... respect, sailor... 🏳️🐚", ko: "심해 밑바닥으로 물러나겠다냥... 훌륭하다... 🏳️🐚" },
      victoryQuote: { en: "The dark deep abyss swallows all towers! 🐙🌊", ko: "어두운 심해는 모든 탑을 삼킨다냥! 🐙🌊" }
    },
    // 12. World 12 (12-16): Phantom Noir
    {
      type: 'yakuza',
      name: 'Phantom Noir',
      title: { en: 'Haunted Mist Gentleman 👻', ko: '유령신사 팬텀냥 👻' },
      emoji: '👻',
      palette: BOSS_PALETTES.yakuza_black,
      quote: { en: "Can you stack blocks amidst unseen shadows? Boo!", ko: "보이지 않는 어둠 속에서 쌓을 수 있겠냥... 부우!" },
      smugQuote: { en: "Ghostly tricks fooled your eyes, meow! 👻", ko: "유령의 속임수에 걸려들었군냥! 흐흐흐... 👻" },
      hurtQuote: { en: "Gasp! Physical light struck my ghost form?! 💥", ko: "앗 따가워! 유령 몸에 정타가 들어오다니?! 💥" },
      frenzyQuote: { en: "MIDNIGHT POLTERGEIST! Shake the spirit realm! 🕯️👻", ko: "심야의 폴터가이스트! 영혼의 떨림을 느껴봐라! 🕯️👻" },
      defeatQuote: { en: "Fading into the mist... rest in peace... 🏳️🌫️", ko: "안개 속으로 사라지마... 편히 가거라냥... 🏳️🌫️" },
      victoryQuote: { en: "The haunted manor stays spookily mine! 👻🕯️", ko: "유령 저택의 밤은 영원히 내 것이다냥! 👻🕯️" }
    },
    // 13. World 13 (13-16): Pharaoh Sphinx
    {
      type: 'emperor',
      name: 'Pharaoh Sphinx',
      title: { en: 'Golden Pyramid King 🏺', ko: '황금 파라오냥 🏺' },
      emoji: '🏺',
      palette: BOSS_PALETTES.emperor_gold,
      quote: { en: "Solve the millennium riddle of the pyramid!", ko: "피라미드의 수수께끼를 풀어보아라냥!" },
      smugQuote: { en: "Buried beneath eternal golden sands! 🏜️", ko: "황금 모래사막 밑에 파묻히고 말았도다냥! 🏜️" },
      hurtQuote: { en: "Sacrilege! A crack upon my golden burial mask! 💥", ko: "불경하도다! 황금 가면이 금이 가다니! 💥" },
      frenzyQuote: { en: "WRATH OF ANUBIS! Sandstorm engulfs all! ⚡🏺", ko: "아누비스의 분노! 모래폭풍이 몰아치리라! ⚡🏺" },
      defeatQuote: { en: "You have solved the eternal riddle, architect... 🏳️👑", ko: "영원의 수수께끼를 푼 자여... 인정하노라... 🏳️👑" },
      victoryQuote: { en: "The Pharaoh's golden tower stands for millennia! 🏺✨", ko: "파라오의 황금 탑은 천년만년 서있으리라! 🏺✨" }
    },
    // 14. World 14 (14-16): Jungle Beast
    {
      type: 'bully',
      name: 'Jungle Beast',
      title: { en: 'Wild Forest Apex 🐯', ko: '야생 정글의 맹수 🐯' },
      emoji: '🐯',
      palette: BOSS_PALETTES.bully_brown,
      quote: { en: "Law of the jungle! Endure the shaking branches! Roar!", ko: "정글의 법칙! 흔들림을 견뎌라냥! 크와앙!" },
      smugQuote: { en: "Prey can never outclimb the wild hunter! 🐯", ko: "사냥감은 맹수의 숲을 벗어날 수 없다냥! 🐯" },
      hurtQuote: { en: "Graaagh! My beastly pride has been struck! 💥", ko: "크아악! 맹수의 자존심에 상처를 입다니! 💥" },
      frenzyQuote: { en: "PRIMAL FRENZY! Break the trees and stone! 🌿🔥", ko: "야성의 포효! 정글을 통째로 뒤흔들어주마! 🌿🔥" },
      defeatQuote: { en: "You are the true apex predator of the tower... 🏳️🐾", ko: "네가 이 정글의 진정한 제왕이다냥... 🏳️🐾" }
    },
    // 15. World 15 (15-16): Cyber Mecha
    {
      type: 'cyber',
      name: 'Cyber Mecha',
      title: { en: 'Orbital Station AI 🤖', ko: '궤도 기지 인공지능 🤖' },
      emoji: '🤖',
      palette: BOSS_PALETTES.cyber_cyan,
      quote: { en: "System online. Blocking cat tower construction protocol.", ko: "시스템 가동. 캣타워 적재 프로세스를 차단한다냥." },
      smugQuote: { en: "Calculation error detected. Structural collapse. 🤖", ko: "연산 오차 감지. 블록 붕괴를 확인했다냥. 🤖" },
      hurtQuote: { en: "Warning: Critical CPU overload! Hull integrity 60%! 💥", ko: "경고: 코어 과열! 선체 내구도 급감! 💥" },
      frenzyQuote: { en: "OVERCLOCK PROTOCOL! Maximum laser output! ⚡🤖", ko: "오버클럭 가동! 최대 출력 빔 방출이다냥! ⚡🤖" },
      defeatQuote: { en: "System rebooting... Master architect verified... 🏳️💾", ko: "시스템 정지... 집사의 연산 능력을 인정한다냥... 🏳️💾" },
      victoryQuote: { en: "Operation complete. All logical parameters optimized. 🤖✨", ko: "임무 완료. 모든 데이터가 완벽히 계산되었다냥. 🤖✨" }
    },
    // 16. World 16 (16-16): Crystal Quartz
    {
      type: 'wizard',
      name: 'Crystal Quartz',
      title: { en: 'Canyon Mineral Spirit 💎', ko: '수정 협곡의 광물정령 💎' },
      emoji: '💎',
      palette: BOSS_PALETTES.wizard_indigo,
      quote: { en: "Behold the unyielding crystalline prism barrier!", ko: "단단하고 날카로운 수정의 결계를 보아라냥!" },
      smugQuote: { en: "Shattered upon the hard crystal surfaces! 💎", ko: "단단한 수정벽에 부딪혀 산산조각 났군냥! 💎" },
      hurtQuote: { en: "My flawless gem core has been fractured?! 💥", ko: "내 완벽한 보석 코어에 흠집이 생기다니?! 💥" },
      frenzyQuote: { en: "PRISM SHARD BARRAGE! Reflect everything away! 💎✨", ko: "크리스탈 난반사! 모든 빛을 굴절시켜주마! 💎✨" },
      defeatQuote: { en: "Gleaming light surrenders to your tower... 🏳️✨", ko: "수정의 빛이 네 탑 앞에 무릎 꿇었다냥... 🏳️✨" },
      victoryQuote: { en: "Eternal brilliance belongs to the crystals! 💎🌟", ko: "영원한 광채는 오직 수정의 것이다냥! 💎🌟" }
    },
    // 17. World 17 (17-16): Archmage Rune
    {
      type: 'wizard',
      name: 'Archmage Rune',
      title: { en: 'Spacetime Sorcerer 🔮', ko: '시공간 마도사냥 🔮' },
      emoji: '🔮',
      palette: BOSS_PALETTES.wizard_indigo,
      quote: { en: "Experience the pure essence of spacetime sorcery!", ko: "시공간 마법의 정수를 체험해보아라냥!" },
      smugQuote: { en: "Your moves were foreseen ten seconds ago, meow! ⏳", ko: "너의 손놀림은 이미 10초 전에 내다보았다냥! ⏳" },
      hurtQuote: { en: "A temporal rift created by your precision?! 💥", ko: "시간 축이 뒤틀렸다냥... 어찌 이런 적중을?! 💥" },
      frenzyQuote: { en: "CHRONO PARADOX! Reverse the flow of time! 🔮🌀", ko: "시간 역행의 파라독스! 모든 것을 되돌려주마! 🔮🌀" },
      defeatQuote: { en: "The timeline where you win has arrived... 🏳️⌛", ko: "네가 승리하는 세계선이 증명되었도다냥... 🏳️⌛" },
      victoryQuote: { en: "Time bends to the Archmage's staff forever! 🔮✨", ko: "시간과 공간은 대마도사의 손안에 있느니라! 🔮✨" }
    },
    // 18. World 18 (18-16): Clockwork Bully
    {
      type: 'bully',
      name: 'Clockwork Bully',
      title: { en: 'Steampunk Horologist ⚙️', ko: '스팀펑크 태엽장치냥 ⚙️' },
      emoji: '⚙️',
      palette: BOSS_PALETTES.bully_brown,
      quote: { en: "Tick-tock! Time never pauses for you, meow!", ko: "째깍째깍! 시간이 멈추지 않는다냥!" },
      smugQuote: { en: "Springs sprung loose! You fell out of tempo! ⚙️", ko: "태엽이 풀렸다냥! 엉성한 템포로군냥! ⚙️" },
      hurtQuote: { en: "Clang! My high-precision gears jammed! 💥", ko: "쿠당탕! 내 초정밀 톱니바퀴가 끼어버렸다냥! 💥" },
      frenzyQuote: { en: "STEAM OVERDRIVE! Turn the gears at triple speed! 💨⚙️", ko: "증기 과부하 모드! 톱니를 세 배로 돌린다냥! 💨⚙️" },
      defeatQuote: { en: "Winding down... the mainspring has snapped... 🏳️🕰️", ko: "태엽이 다 풀렸다냥... 멈춰버렸군냥... 🏳️🕰️" },
      victoryQuote: { en: "Clockwork perfection will rule all mechanical ages! ⚙️✨", ko: "기계 태엽의 정확함이 세상을 지배한다냥! ⚙️✨" }
    },
    // 19. World 19 (19-16): Frost Tiger
    {
      type: 'chonk',
      name: 'Frost Tiger',
      title: { en: 'Frozen Tundra Lord ❄️', ko: '혹한의 툰드라 군주 ❄️' },
      emoji: '❄️',
      palette: BOSS_PALETTES.chonk_orange,
      quote: { en: "Can you stack blocks amidst a sub-zero blizzard?", ko: "차가운 눈보라 앞에서도 쌓을 수 있겠냥!" },
      smugQuote: { en: "Frozen solid! Your fingers can't even move! ❄️", ko: "손이 꽁꽁 얼어붙어 꼼짝도 못하는군냥! ❄️" },
      hurtQuote: { en: "Grrr! The glacial armor took a heavy fracture! 💥", ko: "크르릉! 빙하 갑옷에 금이 쩍 갈라지다니! 💥" },
      frenzyQuote: { en: "ABSOLUTE ZERO BLIZZARD! Freeze the entire sky! 🌪️❄️", ko: "절대영도의 눈보라! 하늘을 꽁꽁 얼려버리마! 🌪️❄️" },
      defeatQuote: { en: "The winter tundra thaws before your warmth... 🏳️💧", ko: "너의 따스한 탑 앞에 눈보라가 녹아내렸냥... 🏳️💧" },
      victoryQuote: { en: "The glacial peaks remain freezing cold forever! ❄️🏔️", ko: "얼음 왕국의 정상은 언제나 혹한이다냥! ❄️🏔️" }
    },
    // 20. World 20 (20-16): Davey Jones Cat
    {
      type: 'pirate',
      name: 'Davey Jones Cat',
      title: { en: 'Flying Dutchman Phantom ⚓', ko: '유령선 플라잉더치맨 선장 ⚓' },
      emoji: '⚓',
      palette: BOSS_PALETTES.pirate_russet,
      quote: { en: "Those who covet cursed treasure shall sink to the deep!", ko: "저주받은 보물을 탐하는 자, 가라앉아라냥!" },
      smugQuote: { en: "Dragged into the phantom locker, meow! ⚓", ko: "유령선의 저주받은 보물상자에 갇혔냥! ⚓" },
      hurtQuote: { en: "By Blackbeard's ghost! My ghost anchor broke! 💥", ko: "유령 닻줄이 끊어지다니! 으아아악! 💥" },
      frenzyQuote: { en: "GHOST SHIP BROADSIDE! Haunt every single block! 👻💣", ko: "유령선 포격 개시! 모든 블록에 저주를 걸어주마! 👻💣" },
      defeatQuote: { en: "Sinking back to Davey Jones' locker... 🏳️🌊", ko: "바다 밑으로 다시 침몰하는구나냥... 🏳️🌊" },
      victoryQuote: { en: "The ghost seas belong to Davey Jones forever! ⚓💀", ko: "유령 바다의 전설은 불멸이다냥! ⚓💀" }
    },
    // 21. World 21 (21-16): Crimson Wyrm
    {
      type: 'lava',
      name: 'Crimson Wyrm',
      title: { en: 'Dragon Lair Monarch 🐉', ko: '용의 둥지 군주냥 🐉' },
      emoji: '🐉',
      palette: BOSS_PALETTES.lava_fire,
      quote: { en: "My dragon flame breath will burn everything to ash!", ko: "내 화염 숨결에 모든 것을 불태우마냥!" },
      smugQuote: { en: "Burned to cinders by dragon breath! 🔥🐉", ko: "용의 숨결 앞에 재가 되어 흩어졌도다냥! 🔥🐉" },
      hurtQuote: { en: "Gwoooar! Dragon scales pierced by a tiny cat?! 💥", ko: "크워어어! 용의 비늘을 꿰뚫은 것이냥?! 💥" },
      frenzyQuote: { en: "HELLFIRE INFERNO! Incinerate the heavens! 🔥🐉", ko: "진노의 화염지옥! 온 하늘을 불바다로 만들겠다냥! 🔥🐉" },
      defeatQuote: { en: "The dragon bows its horns to the tower master... 🏳️🔥", ko: "용의 뿔을 숙여 경의를 표하노라냥... 🏳️🔥" },
      victoryQuote: { en: "The Dragon Lair remains untouchable! Roar! 🐉👑", ko: "용의 둥지는 그 누구도 범할 수 없다냥! 🐉👑" }
    },
    // 22. World 22 (22-16): Cyberpunk DJ
    {
      type: 'hiphop',
      name: 'Cyberpunk DJ',
      title: { en: 'Neon Metropolis Beatmaster 🪩', ko: '네온 시티 신스웨이브 DJ 🪩' },
      emoji: '🪩',
      palette: BOSS_PALETTES.hiphop_purple,
      quote: { en: "Cyberpunk beat start! Electro cat tower rhythm, yo!", ko: "사이버펑크 비트 스타트! 일렉트로 캣타워다냥!" },
      smugQuote: { en: "Synthwave rhythm skipped! Lost the groove, meow! 🪩", ko: "신스웨이브 박자를 놓쳤다냥! 탈락이다냥! 🪩" },
      hurtQuote: { en: "Ouch! Neon equalizer overloaded! 💥", ko: "앗 뜨거! 네온 이퀄라이저가 펑 터졌다냥! 💥" },
      frenzyQuote: { en: "MAXIMUM SYNTH DROP! Bass canon blast! 🔊⚡", ko: "최대 출력 신스웨이브! 베이스 대포 발사냥! 🔊⚡" },
      defeatQuote: { en: "Turntable stops... incredible mix, hooman... 🏳️🎧", ko: "턴테이블 정지... 최고의 믹싱이었다냥... 🏳️🎧" },
      victoryQuote: { en: "Neon metropolis forever dances to my tune! 🪩✨", ko: "네온 시티의 밤은 언제나 내 비트로 춤춘다냥! 🪩✨" }
    },
    // 23. World 23 (23-16): Chronos Mobster
    {
      type: 'yakuza',
      name: 'Chronos Mobster',
      title: { en: 'Temporal Syndicate Boss 🕶️', ko: '시공간 범죄조직 보스 🕶️' },
      emoji: '🕶️',
      palette: BOSS_PALETTES.yakuza_black,
      quote: { en: "Both time and space lie in the palm of my syndicate.", ko: "시간도 공간도 내 조직의 손바닥 안이다냥." },
      smugQuote: { en: "Too late. Your move was wiped from history. 🕶️", ko: "이미 늦었다냥. 네 수는 과거에서 지워졌다냥. 🕶️" },
      hurtQuote: { en: "What?! The pocket watch stopped?! 💥", ko: "무어라?! 내 회중시계 바늘이 멈추다니?! 💥" },
      frenzyQuote: { en: "TEMPORAL EXECUTION! Rewind and crush! ⏳🔥", ko: "시간의 집행이다냥! 시간을 뒤흔들어 없애주마! ⏳🔥" },
      defeatQuote: { en: "The syndicate yields to your absolute timeline... 🏳️🕶️", ko: "조직의 결속도 네 정밀함 앞에 무너졌도다... 🏳️🕶️" },
      victoryQuote: { en: "Chronos syndicate rules all past, present, and future! 🕶️💼", ko: "시공간 조직은 과거 현재 미래를 모두 지배한다냥! 🕶️💼" }
    },
    // 24. World 24 (24-16): Cosmic Astral Cat
    {
      type: 'wizard',
      name: 'Cosmic Astral Cat',
      title: { en: 'Galaxy Starlight Deity 🌟', ko: '은하수 성운의 별빛신 🌟' },
      emoji: '🌟',
      palette: BOSS_PALETTES.wizard_indigo,
      quote: { en: "Can you withstand the cosmic trials of the stars?", ko: "별들의 축복과 시련을 감당할 수 있겠냥?" },
      smugQuote: { en: "Lost into the gravitational black hole, meow! 🌌", ko: "블랙홀의 중력 속으로 빨려들어가 버렸냥! 🌌" },
      hurtQuote: { en: "Supernova rupture! The starlight shook! 💥", ko: "초신성 폭발! 은하수의 결계가 찢어졌다냥! 💥" },
      frenzyQuote: { en: "GALAXY COLLISION! Rain stardust down upon all! 🌟⚡", ko: "은하 충돌의 시련! 유성우를 쏟아붓겠다냥! 🌟⚡" },
      defeatQuote: { en: "The constellation crowns you as the galactic architect... 🏳️🌌", ko: "별자리가 너를 우주의 건축가로 임명했다냥... 🏳️🌌" },
      victoryQuote: { en: "Cosmic galaxies shine for me across the universe! 🌟✨", ko: "은하의 별빛은 영원히 나를 비추느니라! 🌟✨" }
    },
    // 25. World 25 (25-16): Emperor Meowperor
    {
      type: 'emperor',
      name: 'Emperor Meowperor',
      title: { en: 'Supreme Cat Tower Monarch 👑', ko: '지존 캣타워 제왕냥 👑' },
      emoji: '👑',
      palette: BOSS_PALETTES.emperor_gold,
      quote: { en: "You dare challenge my royal empire? Foolish, meow!", ko: "짐의 캣타워 왕국에 도전하려는가? 어리석도다냥!" },
      smugQuote: { en: "Hahah! Kowtow before the supreme golden tower! 👑", ko: "크하하! 지존의 황금 옥좌 앞에 엎드리거라냥! 👑" },
      hurtQuote: { en: "Impudent hooman! The imperial crown was shaken?! 💥", ko: "무례하도다! 짐의 황금 제관이 흔들리다니?! 💥" },
      frenzyQuote: { en: "IMPERIAL DECREE! Divine wrath shall smite your tower! ⚡👑", ko: "황제의 칙령! 천벌의 번개를 내릴지어다냥! ⚡👑" },
      defeatQuote: { en: "I bestow upon you... the crown of the Supreme Hooman! 🏳️👑✨", ko: "짐의 왕관을... 진정한 전설의 집사에게 수여하노라! 🏳️👑✨" },
      victoryQuote: { en: "My cat tower empire shall stand tall for all eternity! 👑🐟", ko: "짐의 캣타워 제국은 영원히 불멸하리라냥! 👑🐟" }
    }
  ];

  // -------------------------------------------------------------
  // CAT COMPANION COLLECTION (Progression & Gacha Rewards)
  // -------------------------------------------------------------
  const CAT_COMPANIONS = [
    // --- STARTER / ROLE 0 (Base / Cozy) ---
    {
      id: 'shiro',
      image: 'assets/chara_smile.png',
      roleWorld: 0,
      rarity: 1,
      name: { en: 'Shiro', ko: '하양치즈 (Shiro)' },
      title: { en: 'Cozy Nap Cat 🤍', ko: '포근한 낮잠냥 🤍' },
      emoji: '🤍',
      desc: { en: 'A faithful starter kitten who always purrs beside you.', ko: '언제나 곁에서 골골송을 불러주는 든든한 기본 냥이.' },
      quote: { en: 'Stack the tower steady and high, meow! 🐾', ko: '탑을 차곡차곡 쌓아줘, 냥! 🐾' },
      filterStyle: 'none',
      perk: { en: 'Default Companion', ko: '기본 동료' }
    },
    {
      id: 'mochi',
      image: 'assets/cat_mochi.png',
      roleWorld: 0,
      rarity: 1,
      name: { en: 'Mochi', ko: '모찌 (Mochi)' },
      title: { en: 'Fluffy Rice Cake 🍡', ko: '말랑한 찹쌀떡냥 🍡' },
      emoji: '🍡',
      desc: { en: 'Squishy and sweet kitten with a heart of marshmallow fluff.', ko: '마시멜로처럼 말랑말랑하고 사랑스러운 하얀 아기 고양이.' },
      quote: { en: 'Squishy purrs make the best towers, meow! 🍡✨', ko: '말랑말랑 골골송으로 힐링하며 쌓자냥! 🍡✨' },
      filterStyle: 'none',
      perk: { en: 'Default Companion', ko: '기본 동료' }
    },
    {
      id: 'vanilla',
      image: 'assets/cat_vanilla.png',
      roleWorld: 0,
      rarity: 1,
      name: { en: 'Vanilla', ko: '바닐라 (Vanilla)' },
      title: { en: 'Sweet Cream 🍨', ko: '달콤한 크림냥 🍨' },
      emoji: '🍨',
      desc: { en: 'Gentle creamy kitten with frosty breath. Keeps ice cream blocks frozen longer!', ko: '향긋한 바닐라 향기처럼 온화한 크림빛 고양이. 차가운 입김으로 아이스크림 블록이 녹는 시간을 늦춰줍니다!' },
      quote: { en: 'A peaceful climb is sweeter than cream, meow! 🍨🤍', ko: '차가운 아이스크림을 지켜주겠다냥! 🍨🤍' },
      filterStyle: 'none',
      perk: { en: '🍦 Frosty Breath: Ice Cream Melts 3s Slower', ko: '🍦 차가운 입김: 아이스크림 녹는 시간 +3초 연장' }
    },

    // --- WORLD 1 / ROLE 1 (Speed Rush: Time Attack +3s) ---
    {
      id: 'miko',
      image: 'assets/cat_miko.png',
      roleWorld: 1,
      rarity: 2,
      name: { en: 'Miko', ko: '삼색이 (Miko)' },
      title: { en: 'Lucky Calico 🐾', ko: '행운의 삼색냥 🐾' },
      emoji: '🐾',
      desc: { en: 'Three-colored lucky cat! Grants bonus time in Speed Rush stages.', ko: '세 가지 색의 털을 가진 행운의 고양이! 스피드 러시에서 추가 시간을 선물합니다.' },
      quote: { en: 'Colorful and high, just like my fur, meow! 🍀', ko: '내 삼색 털처럼 알록달록 높이 쌓자냥! 🍀' },
      filterStyle: 'none',
      perk: { en: '⏱️ Time Attack +3s Bonus', ko: '⏱️ 타임어택 제한 시간 +3초 보너스' }
    },
    {
      id: 'mocha',
      image: 'assets/cat_mocha.png',
      roleWorld: 1,
      rarity: 2,
      name: { en: 'Mocha', ko: '모카 (Mocha)' },
      title: { en: 'Lantern Scout ☕', ko: '등불 탐험냥 ☕' },
      emoji: '☕',
      desc: { en: 'Lantern scout who clears mists and speeds ahead! Clears 60% of village fog + grants +3s time.', ko: '등불을 든 민첩한 탐험냥! 안개 마을의 안개를 60% 투명하게 걷어내고 타임어택 시간을 늘립니다.' },
      quote: { en: 'My lantern pierces through the thickest mists, meow! ☕🏮', ko: '내 등불로 짙은 안개를 꿰뚫어 보겠다냥! ☕🏮' },
      filterStyle: 'none',
      perk: { en: '🌫️ Lantern Scout: Clears 60% Fog & Time +3s', ko: '🌫️ 등불 탐험냥: 안개 60% 투명화 & 타임어택 +3초' }
    },
    {
      id: 'maru',
      image: 'assets/cat_maru.png',
      roleWorld: 1,
      rarity: 2,
      name: { en: 'Maru', ko: '마루 (Maru)' },
      title: { en: 'Turbo Roundie ⚡', ko: '터보 뚱냥이 ⚡' },
      emoji: '⚡',
      desc: { en: 'Chubby turbo cat that rolls at lightning speed! Grants +3s bonus time.', ko: '데굴데굴 굴러다니는 초고속 뚱냥이! 스피드 러시 시간 +3초 선물!' },
      quote: { en: 'Rolling fast like a lightning ball, meow! ⚡🧶', ko: '번개 털뭉치처럼 굴러서 전속력으로 쌓자냥! ⚡🧶' },
      filterStyle: 'none',
      perk: { en: '⏱️ Time Attack +3s Bonus', ko: '⏱️ 타임어택 제한 시간 +3초 보너스' }
    },

    // --- WORLD 2 / ROLE 2 (Precision: Perfect Tolerance +10%) ---
    {
      id: 'nero',
      image: 'assets/cat_nero.png',
      roleWorld: 2,
      rarity: 2,
      name: { en: 'Nero', ko: '턱시도 (Nero)' },
      title: { en: 'Chic Gentleman 🎩', ko: '시크한 신사냥 🎩' },
      emoji: '🎩',
      desc: { en: 'Dapper gentleman in black. Widens the Perfect tolerance range by +10%.', ko: '단정하게 차려입은 시크한 검은 고양이. 퍼펙트 판정 범위를 10% 넓혀줍니다.' },
      quote: { en: 'Place it at the perfect angle, hooman. 🎩', ko: '완벽한 각도로 배치해 주게, 휴먼. 🎩' },
      filterStyle: 'none',
      perk: { en: '🎯 Perfect Tolerance +10% Expansion', ko: '🎯 퍼펙트 판정 범위 +10% 확대' }
    },
    {
      id: 'kuro',
      image: 'assets/cat_kuro.png',
      roleWorld: 2,
      rarity: 2,
      name: { en: 'Kuro', ko: '쿠로 (Kuro)' },
      title: { en: 'Midnight Shadow 🕶️', ko: '한밤의 그림자 🕶️' },
      emoji: '🕶️',
      desc: { en: 'Mysterious ninja cat who moves noiselessly. Widens Perfect tolerance by +10%.', ko: '소리 없이 움직이는 닌자 고양이. 퍼펙트 판정 범위를 10% 넓혀줍니다.' },
      quote: { en: 'Precision is born from absolute silence, meow. 🕶️🖤', ko: '극상의 정밀함은 깊은 어둠 속에서 피어난다냥. 🕶️🖤' },
      filterStyle: 'none',
      perk: { en: '🎯 Perfect Tolerance +10% Expansion', ko: '🎯 퍼펙트 판정 범위 +10% 확대' }
    },
    {
      id: 'sebastian',
      image: 'assets/cat_sebastian.png',
      roleWorld: 2,
      rarity: 2,
      name: { en: 'Sebastian', ko: '세바스찬 (Sebastian)' },
      title: { en: 'Royal Butler 🧐', ko: '왕실 집사냥 🧐' },
      emoji: '🧐',
      desc: { en: 'Perfectionist butler feline. Ensures clean stacking with +10% Perfect tolerance.', ko: '완벽주의 왕실 집사 고양이. 퍼펙트 판정 범위를 10% 넓혀줍니다.' },
      quote: { en: 'Zero error is the standard of elegance, meow. 🧐✨', ko: '오차 없는 정밀함이야말로 진정한 품격입니다냥. 🧐✨' },
      filterStyle: 'none',
      perk: { en: '🎯 Perfect Tolerance +10% Expansion', ko: '🎯 퍼펙트 판정 범위 +10% 확대' }
    },

    // --- WORLD 3 / ROLE 3 (Hazard: Sway, Ice & Scratcher Mastery) ---
    {
      id: 'simba',
      image: 'assets/cat_simba.png',
      roleWorld: 3,
      rarity: 3,
      name: { en: 'Simba', ko: '치즈태비 (Simba)' },
      title: { en: 'Scratch Master 🧀', ko: '스크래칭 달인 🧀' },
      emoji: '🧀',
      desc: { en: 'Playful ginger cat who masters rough cardboard! Smooths cardboard stick-slip friction by 50%.', ko: '에너지가 넘치는 노란 줄무늬 냥이! 골판지 블록의 마찰 덜컹거림을 50% 완만하게 다듬어 줍니다.' },
      quote: { en: 'Cardboard scratchers are my favorite toy, meow! 🧀📦', ko: '골판지 스크래처는 내 전용 놀이터다냥! 🧀📦' },
      filterStyle: 'none',
      perk: { en: '📦 Scratch Master: Cardboard Friction -50%', ko: '📦 스크래칭 달인: 골판지 덜컹거림 -50% 완화' }
    },
    {
      id: 'cheddar',
      image: 'assets/cat_cheddar.png',
      roleWorld: 3,
      rarity: 3,
      name: { en: 'Cheddar', ko: '체다 (Cheddar)' },
      title: { en: 'Spike Mountaineer 🏔️', ko: '빙하 등반냥 🏔️' },
      emoji: '🏔️',
      desc: { en: 'Steadfast mountaineer equipped with spiked ice claws! Dampens ice slip and jitter by 50%.', ko: '빙하를 누비는 스파이크 발톱 냥이! 얼음 블록의 미끄러짐과 흔들림을 50% 억제합니다.' },
      quote: { en: 'Ice cannot slip under my razor claws, meow! 🏔️❄️', ko: '어떤 얼음도 내 날카로운 발톱 앞에선 못 미끄러진다냥! 🏔️❄️' },
      filterStyle: 'none',
      perk: { en: '🧊 Spike Claws: Ice Slip & Sway -50%', ko: '🧊 스파이크 발톱: 얼음 미끄러짐/흔들림 -50%' }
    },
    {
      id: 'toram',
      image: 'assets/cat_toram.png',
      roleWorld: 3,
      rarity: 3,
      name: { en: 'Toram', ko: '토람이 (Toram)' },
      title: { en: 'Center Anchor 🐯', ko: '무게중심 닻 🐯' },
      emoji: '🐯',
      desc: { en: 'Mighty tiger cat who acts as a heavy anchor. Reduces tower tilt angle by 60% on thin foundations!', ko: '육중한 닻 역할을 해주는 용맹한 냥이! 얇은 받침대 타워의 기울어짐을 60% 억제합니다.' },
      quote: { en: 'Firm like a mountain! Stand tall through the storms, meow! 🐯⚓', ko: '산처럼 굳건하게! 타워의 중심을 단단히 잡겠다냥! 🐯⚓' },
      filterStyle: 'none',
      perk: { en: '⚖️ Center Anchor: Tower Tilt -60%', ko: '⚖️ 무게중심 닻: 타워 기울기 -60% 억제' }
    },

    // --- WORLD 4 / ROLE 4 (Recovery & Active Magnetic Snap) ---
    {
      id: 'luna',
      image: 'assets/cat_luna.png',
      roleWorld: 4,
      rarity: 3,
      name: { en: 'Luna', ko: '샴냥이 (Luna)' },
      title: { en: 'Moonlight Mystic 🌙', ko: '달빛의 현자냥 🌙' },
      emoji: '🌙',
      desc: { en: 'Mystical Siamese kitten with sapphire eyes. Wields the Magnetic Snap active skill (Guaranteed Meowfect) + Rapid Recovery!', ko: '푸른 눈동자의 신비로운 고양이. 위기 시 100% 퍼펙트 자석 스냅 액티브 스킬을 발동하며 타워 크기를 신속 복구합니다!' },
      quote: { en: 'Watch my paws! Magnetic snap is ready, meow! 🧲✨', ko: '내 솜방망이를 봐라냥! 자석 솜방망이 장전 완료다냥! 🧲✨' },
      filterStyle: 'none',
      perk: { en: '🧲 Active: Magnetic Snap (1 Auto-Align) + Rapid Recovery', ko: '🧲 액티브: 자석 솜방망이 (1회 강제 퍼펙트) + 신속 회복' },
      activeSkill: 'magnetic_snap'
    },
    {
      id: 'stella',
      image: 'assets/cat_stella.png',
      roleWorld: 4,
      rarity: 3,
      name: { en: 'Stella', ko: '스텔라 (Stella)' },
      title: { en: 'Starlight Fairy ✨', ko: '별빛 요정냥 ✨' },
      emoji: '✨',
      desc: { en: 'Enchanting celestial kitten. Rapidly expands tower size upon 2 combos!', ko: '은하수의 별가루를 흩날리는 요정 고양이. 2연속 퍼펙트 시 타워 폭 신속 복구!' },
      quote: { en: 'Stardust heals the tower and widens our path, meow~ ✨⭐', ko: '별가루가 캣타워를 치유하여 드넓게 넓혀준다냥~ ✨⭐' },
      filterStyle: 'none',
      perk: { en: '🌙 Rapid Size Recovery (Combo 2+ Expands Tower)', ko: '🌙 신속한 타워 회복 (2연속 퍼펙트 시 타워 크기 확장)' }
    },
    {
      id: 'pearl',
      image: 'assets/cat_pearl.png',
      roleWorld: 4,
      rarity: 3,
      name: { en: 'Pearl', ko: '진주 (Pearl)' },
      title: { en: 'Ocean Siren 🦪', ko: '바다 인어냥 🦪' },
      emoji: '🦪',
      desc: { en: 'Iridescent pearl kitten. Flowing ocean waves restore tower width rapidly on combos!', ko: '영롱한 진줏빛 털결을 지닌 바다의 고양이. 2연속 퍼펙트 시 타워 크기 신속 확장!' },
      quote: { en: 'Like swelling ocean tides, our tower grows, meow! 🦪🌊', ko: '밀려오는 파도처럼 타워가 시원하게 차오른다냥! 🦪🌊' },
      filterStyle: 'none',
      perk: { en: '🌙 Rapid Size Recovery (Combo 2+ Expands Tower)', ko: '🌙 신속한 타워 회복 (2연속 퍼펙트 시 타워 크기 확장)' }
    },

    // --- WORLD 5 / ROLE 5 (Boss Battle: 3x Boss Critical Damage) ---
    {
      id: 'meowperor',
      image: 'assets/cat_meowperor.png',
      roleWorld: 5,
      rarity: 4,
      name: { en: 'Meowperor', ko: '황금냥 황제 (Meowperor)' },
      title: { en: 'Legendary Monarch 👑', ko: '전설의 캣타워 제왕 👑' },
      emoji: '👑',
      desc: { en: 'Radiates majestic golden aura! Deals 3× Critical Damage on Perfect hits against Bosses.', ko: '온몸에서 황금빛 아우라를 뿜어내는 제왕냥! 보스에게 퍼펙트 타격 시 3배 크리티컬!' },
      quote: { en: 'Build my royal throne at the highest peak, meow! 👑⚡', ko: '짐의 옥좌를 가장 높은 곳에 건설하라냥! 👑⚡' },
      filterStyle: 'none',
      perk: { en: '👑 3× Boss Critical Damage', ko: '👑 보스 크리티컬 타격 데미지 3배' }
    },
    {
      id: 'shogun',
      image: 'assets/cat_shogun.png',
      roleWorld: 5,
      rarity: 4,
      name: { en: 'Shogun', ko: '쇼군 (Shogun)' },
      title: { en: 'Crimson Warlord ⚔️', ko: '붉은 무신냥 ⚔️' },
      emoji: '⚔️',
      desc: { en: 'Fierce samurai kitten with a blazing red spirit! Deals 3× Critical Damage to Bosses.', ko: '불타는 붉은 혼을 지닌 무신 고양이! 보스에게 퍼펙트 타격 시 3배 크리티컬!' },
      quote: { en: 'One decisive strike shall shatter the boss, meow! ⚔️🔥', ko: '일격필살의 솜방망이로 보스를 단숨에 쓰러뜨린다냥! ⚔️🔥' },
      filterStyle: 'none',
      perk: { en: '👑 3× Boss Critical Damage', ko: '👑 보스 크리티컬 타격 데미지 3배' }
    },
    {
      id: 'pharaoh',
      image: 'assets/cat_pharaoh.png',
      roleWorld: 5,
      rarity: 4,
      name: { en: 'Pharaoh', ko: '파라오 (Pharaoh)' },
      title: { en: 'Sun God Bastet ☀️', ko: '태양의 바스테트 ☀️' },
      emoji: '☀️',
      desc: { en: 'Ancient Egyptian deity cat radiating solar rays! Deals 3× Critical Damage to Bosses.', ko: '고대 이집트 태양신 바스테트의 화신! 보스전 퍼펙트 타격 시 3배 크리티컬!' },
      quote: { en: 'Behold the divine wrath of the blazing sun, meow! ☀️✨', ko: '태양신의 신성한 일격으로 악을 심판하라냥! ☀️✨' },
      filterStyle: 'none',
      perk: { en: '👑 3× Boss Critical Damage', ko: '👑 보스 크리티컬 타격 데미지 3배' }
    }
  ];

  // Defensive fallback to ensure worldUnlock is never undefined
  CAT_COMPANIONS.forEach(c => {
    if (c.worldUnlock === undefined) c.worldUnlock = c.roleWorld + 1;
  });


  const ENDLESS_CFG = {
    id: -1, world: 0, idx: 0, boss: false, label: '∞', worldName: 'Endless Mode', emoji: '♾️',
    hueBase: 325, desc: '', target: Infinity, speed0: 8.5, accel: 0.016, maxSpeed: 22,
    tol: 0.22, startSize: 7.5, expandAt: 5, expandAmt: 0.4,
    wobble: 0, sway: 0, blink: 0, reverse: 0, shrink: 0, stageType: 'standard'
  };