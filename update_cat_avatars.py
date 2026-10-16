import re

file_path = 'game/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update setMascot
old_set_mascot = """      let mascotTimer = null;
      function setMascot(emotion, speechText, durationMs = 0) {
        const cat = (typeof getSelectedCat === 'function') ? getSelectedCat() : null;
        const mascotWrapper = document.getElementById('mascot-wrapper');
        if (cat && typeof getCatAvatarSvg === 'function' && mascotWrapper) {
          mascotWrapper.innerHTML = getCatAvatarSvg(cat.id, 88, { expression: emotion, withAura: true, isMascot: true });
        } else if (mascotImgEl && ASSET_PATHS[emotion]) {
          mascotImgEl.src = ASSET_PATHS[emotion];
        }
        if (speechText && speechBubbleEl) {
          speechBubbleEl.textContent = speechText;
          speechBubbleEl.style.opacity = '1';
        }
        const bounceTarget = mascotWrapper || mascotImgEl;
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
      }"""

new_set_mascot = """      let mascotTimer = null;
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
          if (emotion === 'smile') {
            mascotImg.src = (cat && cat.image) ? cat.image : ASSET_PATHS.smile;
          } else if (ASSET_PATHS[emotion]) {
            mascotImg.src = ASSET_PATHS[emotion];
          } else {
            mascotImg.src = (cat && cat.image) ? cat.image : ASSET_PATHS.smile;
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
      }"""

assert old_set_mascot in content, "old_set_mascot not found"
content = content.replace(old_set_mascot, new_set_mascot)

# 2. Update applyCompanionVisual
old_apply_companion = """      function applyCompanionVisual(emotion = 'smile') {
        const cat = getSelectedCat();
        const wrap = $('mascot-wrapper');
        if (wrap && typeof getCatAvatarSvg === 'function') {
          wrap.innerHTML = getCatAvatarSvg(cat.id, 88, { expression: emotion, withAura: true, isMascot: true });
        } else if (mascotImgEl) {
          mascotImgEl.style.filter = cat.filterStyle;
        }
      }"""

new_apply_companion = """      function applyCompanionVisual(emotion = 'smile') {
        const cat = getSelectedCat();
        const wrap = $('mascot-wrapper');
        let mascotImg = $('mascot-img');
        if (!mascotImg && wrap) {
          wrap.innerHTML = '<img id="mascot-img" src="assets/chara_smile.png" alt="Cat Mascot">';
          mascotImg = $('mascot-img');
        }
        if (mascotImg && cat) {
          mascotImg.style.filter = cat.filterStyle || 'none';
          if (emotion === 'smile' && cat.image) {
            mascotImg.src = cat.image;
          } else if (ASSET_PATHS[emotion]) {
            mascotImg.src = ASSET_PATHS[emotion];
          } else {
            mascotImg.src = ASSET_PATHS.smile;
          }
        }
      }"""

assert old_apply_companion in content, "old_apply_companion not found"
content = content.replace(old_apply_companion, new_apply_companion)

# 3. Update CAT_COMPANIONS array to add image and proper filterStyles
companions_code = """      const CAT_COMPANIONS = [
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
          image: 'assets/chara_smile.png',
          roleWorld: 0,
          rarity: 1,
          name: { en: 'Mochi', ko: '모찌 (Mochi)' },
          title: { en: 'Fluffy Rice Cake 🍡', ko: '말랑한 찹쌀떡냥 🍡' },
          emoji: '🍡',
          desc: { en: 'Squishy and sweet kitten with a heart of marshmallow fluff.', ko: '마시멜로처럼 말랑말랑하고 사랑스러운 하얀 아기 고양이.' },
          quote: { en: 'Squishy purrs make the best towers, meow! 🍡✨', ko: '말랑말랑 골골송으로 힐링하며 쌓자냥! 🍡✨' },
          filterStyle: 'brightness(1.15) contrast(0.95)',
          perk: { en: 'Default Companion', ko: '기본 동료' }
        },
        {
          id: 'vanilla',
          image: 'assets/chara_smile.png',
          roleWorld: 0,
          rarity: 1,
          name: { en: 'Vanilla', ko: '바닐라 (Vanilla)' },
          title: { en: 'Sweet Cream 🍨', ko: '달콤한 크림냥 🍨' },
          emoji: '🍨',
          desc: { en: 'Gentle creamy kitten with fragrant vanilla warmth.', ko: '향긋한 바닐라 향기처럼 온화하고 부드러운 크림빛 고양이.' },
          quote: { en: 'A peaceful climb is sweeter than cream, meow! 🍨🤍', ko: '평화로운 등반은 달콤한 아이스크림 같다냥! 🍨🤍' },
          filterStyle: 'sepia(0.25) brightness(1.12)',
          perk: { en: 'Default Companion', ko: '기본 동료' }
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
          image: 'assets/cat_miko.png',
          roleWorld: 1,
          rarity: 2,
          name: { en: 'Mocha', ko: '모카 (Mocha)' },
          title: { en: 'Espresso Sprint ☕', ko: '번개 스프린터 ☕' },
          emoji: '☕',
          desc: { en: 'Caffeine-charged sprinter cat! Grants +3s bonus time in Speed Rush stages.', ko: '에스프레소처럼 진하고 번개처럼 빠른 러너냥! 스피드 러시 시간 +3초!' },
          quote: { en: 'Double espresso speed, meow! Gotta go fast! ☕💨', ko: '더블 샷의 힘으로 초고속 등반이다냥! ☕💨' },
          filterStyle: 'sepia(0.65) hue-rotate(-30deg) brightness(0.85)',
          perk: { en: '⏱️ Time Attack +3s Bonus', ko: '⏱️ 타임어택 제한 시간 +3초 보너스' }
        },
        {
          id: 'maru',
          image: 'assets/cat_miko.png',
          roleWorld: 1,
          rarity: 2,
          name: { en: 'Maru', ko: '마루 (Maru)' },
          title: { en: 'Turbo Roundie ⚡', ko: '터보 뚱냥이 ⚡' },
          emoji: '⚡',
          desc: { en: 'Chubby turbo cat that rolls at lightning speed! Grants +3s bonus time.', ko: '데굴데굴 굴러다니는 초고속 뚱냥이! 스피드 러시 시간 +3초 선물!' },
          quote: { en: 'Rolling fast like a lightning ball, meow! ⚡🧶', ko: '번개 털뭉치처럼 굴러서 전속력으로 쌓자냥! ⚡🧶' },
          filterStyle: 'saturate(1.8) hue-rotate(15deg)',
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
          image: 'assets/cat_nero.png',
          roleWorld: 2,
          rarity: 2,
          name: { en: 'Kuro', ko: '쿠로 (Kuro)' },
          title: { en: 'Midnight Shadow 🕶️', ko: '한밤의 그림자 🕶️' },
          emoji: '🕶️',
          desc: { en: 'Mysterious ninja cat who moves noiselessly. Widens Perfect tolerance by +10%.', ko: '소리 없이 움직이는 닌자 고양이. 퍼펙트 판정 범위를 10% 넓혀줍니다.' },
          quote: { en: 'Precision is born from absolute silence, meow. 🕶️🖤', ko: '극상의 정밀함은 깊은 어둠 속에서 피어난다냥. 🕶️🖤' },
          filterStyle: 'grayscale(0.85) brightness(0.7) contrast(1.3)',
          perk: { en: '🎯 Perfect Tolerance +10% Expansion', ko: '🎯 퍼펙트 판정 범위 +10% 확대' }
        },
        {
          id: 'sebastian',
          image: 'assets/cat_nero.png',
          roleWorld: 2,
          rarity: 2,
          name: { en: 'Sebastian', ko: '세바스찬 (Sebastian)' },
          title: { en: 'Royal Butler 🧐', ko: '왕실 집사냥 🧐' },
          emoji: '🧐',
          desc: { en: 'Perfectionist butler feline. Ensures clean stacking with +10% Perfect tolerance.', ko: '완벽주의 왕실 집사 고양이. 퍼펙트 판정 범위를 10% 넓혀줍니다.' },
          quote: { en: 'Zero error is the standard of elegance, meow. 🧐✨', ko: '오차 없는 정밀함이야말로 진정한 품격입니다냥. 🧐✨' },
          filterStyle: 'sepia(0.35) contrast(1.15) brightness(0.9)',
          perk: { en: '🎯 Perfect Tolerance +10% Expansion', ko: '🎯 퍼펙트 판정 범위 +10% 확대' }
        },

        // --- WORLD 3 / ROLE 3 (Hazard: Sway & Wobble -25%) ---
        {
          id: 'simba',
          image: 'assets/cat_simba.png',
          roleWorld: 3,
          rarity: 3,
          name: { en: 'Simba', ko: '치즈태비 (Simba)' },
          title: { en: 'Playful Ginger 🧀', ko: '장난꾸러기 치즈냥 🧀' },
          emoji: '🧀',
          desc: { en: 'High-energy tabby kitten! Reduces sway and wobble in hazard stages by 25%.', ko: '에너지가 넘치는 노란 줄무늬 냥이! 기믹 스테이지에서 흔들림을 25% 줄여줍니다.' },
          quote: { en: 'A cat tower taller than Churu is the best, meow! 🧀✨', ko: '츄르보다 높은 캣타워라니 최고다냥! 🧀✨' },
          filterStyle: 'none',
          perk: { en: '🌪️ Hazard Sway -25% Stabilization', ko: '🌪️ 환경 기믹 흔들림 -25% 안정화' }
        },
        {
          id: 'cheddar',
          image: 'assets/cat_simba.png',
          roleWorld: 3,
          rarity: 3,
          name: { en: 'Cheddar', ko: '체다 (Cheddar)' },
          title: { en: 'Mountain Climber 🏔️', ko: '알프스 등반냥 🏔️' },
          emoji: '🏔️',
          desc: { en: 'Steadfast mountaineer cat! Stabilizes environmental sway & wobble by 25%.', ko: '험준한 산악을 누비는 탐험냥! 환경 기믹의 흔들림을 25% 억제합니다.' },
          quote: { en: 'No cliff or tremor can shake my firm footing, meow! 🏔️🐾', ko: '어떤 절벽과 지진도 내 굳건한 발걸음을 막을 수 없다냥! 🏔️🐾' },
          filterStyle: 'sepia(0.7) saturate(2.0) hue-rotate(25deg)',
          perk: { en: '🌪️ Hazard Sway -25% Stabilization', ko: '🌪️ 환경 기믹 흔들림 -25% 안정화' }
        },
        {
          id: 'toram',
          image: 'assets/cat_simba.png',
          roleWorld: 3,
          rarity: 3,
          name: { en: 'Toram', ko: '토람이 (Toram)' },
          title: { en: 'Brave Tiger 🐯', ko: '용맹 호랑이냥 🐯' },
          emoji: '🐯',
          desc: { en: 'Brave feline with tiger stripes! Dampens environmental hazard sway by 25%.', ko: '용맹한 호랑이 기운을 품은 씩씩한 냥이! 환경 흔들림을 25% 안정화합니다.' },
          quote: { en: 'Hear my roar! Stand tall through the storms, meow! 🐯🔥', ko: '호랑이의 포효로 비바람을 뚫고 솟구치자냥! 🐯🔥' },
          filterStyle: 'saturate(1.9) hue-rotate(35deg) contrast(1.1)',
          perk: { en: '🌪️ Hazard Sway -25% Stabilization', ko: '🌪️ 환경 기믹 흔들림 -25% 안정화' }
        },

        // --- WORLD 4 / ROLE 4 (Recovery: Rapid Size Recovery Combo 2+) ---
        {
          id: 'luna',
          image: 'assets/cat_luna.png',
          roleWorld: 4,
          rarity: 3,
          name: { en: 'Luna', ko: '샴냥이 (Luna)' },
          title: { en: 'Moonlight Mystic 🌙', ko: '달빛의 현자냥 🌙' },
          emoji: '🌙',
          desc: { en: 'Mystical Siamese kitten with sapphire eyes. Restores tower width much faster on combos!', ko: '푸른 눈동자를 가진 신비로운 고양이. 2연속 퍼펙트만으로도 타워 크기를 신속하게 확장 복구합니다!' },
          quote: { en: 'Let us climb together to the starry moon, meow... 🌙✨', ko: '밤하늘 달님까지 함께 올라가자냥... 🌙✨' },
          filterStyle: 'none',
          perk: { en: '🌙 Rapid Size Recovery (Combo 2+ Expands Tower)', ko: '🌙 신속한 타워 회복 (2연속 퍼펙트 시 타워 크기 확장)' }
        },
        {
          id: 'stella',
          image: 'assets/cat_luna.png',
          roleWorld: 4,
          rarity: 3,
          name: { en: 'Stella', ko: '스텔라 (Stella)' },
          title: { en: 'Starlight Fairy ✨', ko: '별빛 요정냥 ✨' },
          emoji: '✨',
          desc: { en: 'Enchanting celestial kitten. Rapidly expands tower size upon 2 combos!', ko: '은하수의 별가루를 흩날리는 요정 고양이. 2연속 퍼펙트 시 타워 폭 신속 복구!' },
          quote: { en: 'Stardust heals the tower and widens our path, meow~ ✨⭐', ko: '별가루가 캣타워를 치유하여 드넓게 넓혀준다냥~ ✨⭐' },
          filterStyle: 'hue-rotate(200deg) saturate(1.5) brightness(1.1)',
          perk: { en: '🌙 Rapid Size Recovery (Combo 2+ Expands Tower)', ko: '🌙 신속한 타워 회복 (2연속 퍼펙트 시 타워 크기 확장)' }
        },
        {
          id: 'pearl',
          image: 'assets/cat_luna.png',
          roleWorld: 4,
          rarity: 3,
          name: { en: 'Pearl', ko: '진주 (Pearl)' },
          title: { en: 'Ocean Siren 🦪', ko: '바다 인어냥 🦪' },
          emoji: '🦪',
          desc: { en: 'Iridescent pearl kitten. Flowing ocean waves restore tower width rapidly on combos!', ko: '영롱한 진줏빛 털결을 지닌 바다의 고양이. 2연속 퍼펙트 시 타워 크기 신속 확장!' },
          quote: { en: 'Like swelling ocean tides, our tower grows, meow! 🦪🌊', ko: '밀려오는 파도처럼 타워가 시원하게 차오른다냥! 🦪🌊' },
          filterStyle: 'hue-rotate(160deg) saturate(1.1) brightness(1.15)',
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
          image: 'assets/cat_meowperor.png',
          roleWorld: 5,
          rarity: 4,
          name: { en: 'Shogun', ko: '쇼군 (Shogun)' },
          title: { en: 'Crimson Warlord ⚔️', ko: '붉은 무신냥 ⚔️' },
          emoji: '⚔️',
          desc: { en: 'Fierce samurai kitten with a blazing red spirit! Deals 3× Critical Damage to Bosses.', ko: '불타는 붉은 혼을 지닌 무신 고양이! 보스에게 퍼펙트 타격 시 3배 크리티컬!' },
          quote: { en: 'One decisive strike shall shatter the boss, meow! ⚔️🔥', ko: '일격필살의 솜방망이로 보스를 단숨에 쓰러뜨린다냥! ⚔️🔥' },
          filterStyle: 'hue-rotate(330deg) saturate(2.0) contrast(1.2) drop-shadow(0 0 8px rgba(255, 60, 60, 0.7))',
          perk: { en: '👑 3× Boss Critical Damage', ko: '👑 보스 크리티컬 타격 데미지 3배' }
        },
        {
          id: 'pharaoh',
          image: 'assets/cat_meowperor.png',
          roleWorld: 5,
          rarity: 4,
          name: { en: 'Pharaoh', ko: '파라오 (Pharaoh)' },
          title: { en: 'Sun God Bastet ☀️', ko: '태양의 바스테트 ☀️' },
          emoji: '☀️',
          desc: { en: 'Ancient Egyptian deity cat radiating solar rays! Deals 3× Critical Damage to Bosses.', ko: '고대 이집트 태양신 바스테트의 화신! 보스전 퍼펙트 타격 시 3배 크리티컬!' },
          quote: { en: 'Behold the divine wrath of the blazing sun, meow! ☀️✨', ko: '태양신의 신성한 일격으로 악을 심판하라냥! ☀️✨' },
          filterStyle: 'sepia(0.9) saturate(2.2) brightness(1.1) drop-shadow(0 0 10px rgba(255, 180, 0, 0.8))',
          perk: { en: '👑 3× Boss Critical Damage', ko: '👑 보스 크리티컬 타격 데미지 3배' }
        }
      ];"""

# Replace CAT_COMPANIONS through end of getCatAvatarSvg
# Find start of CAT_COMPANIONS and end of getCatAvatarSvg
comp_start = content.find("      const CAT_COMPANIONS = [")
svg_end_marker = "        </svg>`;\n      }"
svg_end = content.find(svg_end_marker) + len(svg_end_marker)

assert comp_start != -1, "CAT_COMPANIONS start not found"
assert svg_end != -1, "getCatAvatarSvg end not found"

replacement_block = companions_code + """

      // Defensive fallback to ensure worldUnlock is never undefined
      CAT_COMPANIONS.forEach(c => {
        if (c.worldUnlock === undefined) c.worldUnlock = c.roleWorld + 1;
      });

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
      }"""

content = content[:comp_start] + replacement_block + content[svg_end:]

# 4. Update renderCompanionModal
modal_avatar_old = """                <div class="cat-avatar-wrap">
                  ${getCatAvatarSvg(cat.id, 56, { withAura: true })}
                </div>"""
modal_avatar_new = """                <div class="cat-avatar-wrap">
                  <img class="cat-avatar-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter: ${cat.filterStyle || 'none'};" alt="${getCompanionField(cat, 'name')}">
                </div>"""
assert modal_avatar_old in content, "modal_avatar_old not found"
content = content.replace(modal_avatar_old, modal_avatar_new)

# 5. Update showUnlockModal
unlock_old = """        const avatarWrap = $('unlock-cat-avatar');
        if (avatarWrap) {
          avatarWrap.innerHTML = getCatAvatarSvg(cat.id, 96, { withAura: true });
        }"""
unlock_new = """        const avatarWrap = $('unlock-cat-avatar');
        if (avatarWrap) {
          avatarWrap.innerHTML = `<img class="unlock-cat-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter:${cat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(cat, 'name')}">`;
        }"""
assert unlock_old in content, "unlock_old not found"
content = content.replace(unlock_old, unlock_new)

# 6. Update ready modal avatar & chips
ready_old = """        const readyAvatarWrap = $('ready-cat-avatar-wrap');
        if (readyAvatarWrap) {
          readyAvatarWrap.innerHTML = getCatAvatarSvg(curCat.id, 64, { withAura: true });
        }"""
ready_new = """        const readyAvatarWrap = $('ready-cat-avatar-wrap');
        if (readyAvatarWrap) {
          readyAvatarWrap.innerHTML = `<img class="ready-cat-img" src="${curCat.image || 'assets/chara_smile.png'}" style="filter:${curCat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(curCat, 'name')}">`;
        }"""
assert ready_old in content, "ready_old not found"
content = content.replace(ready_old, ready_new)

chip_old = """              <div class="ready-chip-avatar">
                ${getCatAvatarSvg(cat.id, 28)}
              </div>"""
chip_new = """              <div class="ready-chip-avatar">
                <img class="ready-chip-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter:${cat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(cat, 'name')}">
              </div>"""
assert chip_old in content, "chip_old not found"
content = content.replace(chip_old, chip_new)

# 7. Update gacha reveal and roster
gacha_old = """              <div class="gacha-card-avatar-wrap">
                ${getCatAvatarSvg(cat.id, results.length > 1 ? 52 : 74, { withAura: true })}
              </div>"""
gacha_new = """              <div class="gacha-card-avatar-wrap">
                <img class="gacha-card-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter:${cat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(cat, 'name')}">
              </div>"""
assert gacha_old in content, "gacha_old not found"
content = content.replace(gacha_old, gacha_new)

roster_old = """              <div class="gacha-roster-avatar">
                ${getCatAvatarSvg(cat.id, 42)}
              </div>"""
roster_new = """              <div class="gacha-roster-avatar">
                <img class="gacha-roster-img" src="${cat.image || 'assets/chara_smile.png'}" style="filter:${cat.filterStyle || 'none'}; width: 100%; height: 100%; object-fit: contain;" alt="${getCompanionField(cat, 'name')}">
              </div>"""
assert roster_old in content, "roster_old not found"
content = content.replace(roster_old, roster_new)

# 8. Enhance CSS for full body avatars
old_css_wrap = """.cat-avatar-wrap {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0.45) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
    }
    .companion-card.equipped .cat-avatar-wrap {
      border-color: #ff4081;
      box-shadow: 0 0 12px rgba(255, 64, 129, 0.45);
    }
    .cat-avatar-img {
      width: 42px;
      height: 42px;
      object-fit: contain;
    }"""

new_css_wrap = """.cat-avatar-wrap {
      width: 58px;
      height: 58px;
      border-radius: 16px;
      background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.45) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    }
    .companion-card.equipped .cat-avatar-wrap {
      border-color: #ff4081;
      box-shadow: 0 0 14px rgba(255, 64, 129, 0.45);
    }
    .cat-avatar-img {
      width: 52px;
      height: 52px;
      object-fit: contain;
    }"""

if old_css_wrap in content:
    content = content.replace(old_css_wrap, new_css_wrap)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated game/index.html successfully!")
