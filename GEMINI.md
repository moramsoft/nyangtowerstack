# Meow Stack Tower — Project Guidelines

## 1. Architecture & 3-Way Asset Synchronization
- **Single Source of Truth**: Always edit web source files in `game/` first.
- **Zero-Drift Sync**: After any modification in `game/`, run `node scripts/verify_syntax.js --sync` to synchronize byte-for-byte across `game/`, `android/app/src/main/assets/www/`, and `ios/MeowStackTower/www/`.

## 2. Verification & Release Gate
- **Mandatory Release Gate**: Run `./scripts/release_gate.sh --fast` (50/50 E2E matrix across Android & iOS profiles) before declaring work complete or pushing to Git.
- **Physical Device Deployment**: When an iPad/iOS device is connected, deploy and verify via `./scripts/install_ipad.sh`.
- **Version Traceability**: When shipping major visual or gameplay overhauls, keep version tags synchronized across `game/index.html`, `package.json`, Android `build.gradle`, and iOS `Info.plist`.

## 3. Visual Asset & Art Direction Rules
- **Static UI Icons & Characters (2D Anime Cartoon Style)**:
  - **Strict 2D Cel Anime Art Style**: All character illustrations (bosses, companions, cutscene figures) must follow a **crisp 2D anime cartoon illustration style** with clean, thick dark outlines and soft 2D cel-shading.
  - **NO 3D CGI / Realistic 3D Renders**: Strictly prohibit 3D rendering, CGI, claymation, ambient occlusion, realistic specular reflections, or photorealistic lighting. Do NOT use "3D" keywords in character prompts.
  - **Strict Multi-Cut Consistency Anchors**:
    * Absolute spatial anchoring: Always specify facial marks relative to the viewer (e.g. `permanently anchored on viewer's right cheek`, `ear notch strictly on viewer's left ear`) to prevent flipping/hallucination across expressions.
    * Invariant wardrobe: Fasten exact clothing details (e.g., number of studs, vest cut, necklace pendant shape) identically across all action cuts.
    * Invariant Base Structure & Pedestal Geometry: When a character stands on an environmental structure, fortress rampart, crate, or pedestal, the base structure's geometry, perspective, layers, battlements, and textures MUST remain pixel-for-pixel/silhouette-identical across all action cuts (idle, smug, hurt, frenzy, defeat, victory). Only the character's facial expression, upper body pose, and action FX may change; never redraw or re-layout the pedestal/citadel between emotions.
    * Minimal background clutter: Avoid introducing transient background clutter (random fish crates, changing labels) that morphs unnaturally between sprite frames.
    * Strictly No Baked-in Text (Language-Agnostic): Character illustrations and icons must NEVER contain baked-in text (Korean Hangul, Japanese Kana, or English graffiti/labels) on crates, clothes, or signs. Use clean visual iconography (cat paws, fish bones, stars) so assets remain language-independent and crisp.
- **Dynamic 3D Tower Geometry & Effects**: Real-time deforming tower blocks (e.g., waffle cones, 5-flavor melting gelato drips, rolling volumetric fog) should use lightweight procedural Canvas 2D rendering for 0 KB overhead and 60 FPS performance.
- **Strict Role Separation**: Never reuse player-collectible Companion Cat illustrations as Enemy Bosses, and never use cheap CSS hue-rotate color swaps in place of genuinely distinct character designs.
- **Visual Economy**: Avoid over-saturating the screen with a single motif (e.g., repeating cat paw silhouettes on adjacent badges and cards).

## 4. Gameplay & State Lifecycle Rules
- **Functional Efficacy & Affordance**: Stage hazards (such as fog obstruction or melting blocks) must genuinely challenge the player in practice, and blocks with different behaviors (melting vs stable) must be visually distinguishable at a glance.
- **Balanced Tuning with Organic Variance**: Avoid extreme binary swings when tuning difficulty timers; use balanced baselines with natural per-instance variance (e.g., `4.6s ± 1.0s`).
- **Idempotent UI Lifecycle**: Repeatedly opened screens and animations (such as stage clear stars and modals) must cleanly reset their DOM/CSS state on entry and teardown.
