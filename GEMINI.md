# Meow Stack Tower — Project Guidelines

## 1. Architecture & 3-Way Asset Synchronization
- **Single Source of Truth**: Always edit web source files in `game/` first.
- **Zero-Drift Sync**: After any modification in `game/`, run `node scripts/verify_syntax.js --sync` to synchronize byte-for-byte across `game/`, `android/app/src/main/assets/www/`, and `ios/MeowStackTower/www/`.

## 2. Verification & Release Gate
- **Mandatory Release Gate**: Run `./scripts/release_gate.sh --fast` (50/50 E2E matrix across Android & iOS profiles) before declaring work complete or pushing to Git.
- **Physical Device Deployment**: When an iPad/iOS device is connected, deploy and verify via `./scripts/install_ipad.sh`.
- **Version Traceability**: When shipping major visual or gameplay overhauls, keep version tags synchronized across `game/index.html`, `package.json`, Android `build.gradle`, and iOS `Info.plist`.

## 3. Visual Asset & Art Direction Rules
- **Static UI Icons & Characters**: Fixed UI badges, clear stars, buttons, cutscenes, companions, and boss characters must use high-quality generated 3D kawaii raster illustrations (`assets/*.png`), not makeshift vector/SVG shapes.
- **Dynamic 3D Tower Geometry & Effects**: Real-time deforming tower blocks (e.g., waffle cones, 5-flavor melting gelato drips, rolling volumetric fog) should use lightweight procedural Canvas 2D rendering for 0 KB overhead and 60 FPS performance.
- **Strict Role Separation**: Never reuse player-collectible Companion Cat illustrations as Enemy Bosses, and never use cheap CSS hue-rotate color swaps in place of genuinely distinct character designs.
- **Visual Economy**: Avoid over-saturating the screen with a single motif (e.g., repeating cat paw silhouettes on adjacent badges and cards).

## 4. Gameplay & State Lifecycle Rules
- **Functional Efficacy & Affordance**: Stage hazards (such as fog obstruction or melting blocks) must genuinely challenge the player in practice, and blocks with different behaviors (melting vs stable) must be visually distinguishable at a glance.
- **Balanced Tuning with Organic Variance**: Avoid extreme binary swings when tuning difficulty timers; use balanced baselines with natural per-instance variance (e.g., `4.6s ± 1.0s`).
- **Idempotent UI Lifecycle**: Repeatedly opened screens and animations (such as stage clear stars and modals) must cleanly reset their DOM/CSS state on entry and teardown.
