// Stack Tower - Game Runtime State & Variables

  // --- GAME STATE & CONSTANTS ---
  let INITIAL_SIZE = 7.5;
  let PERFECT_TOLERANCE = 0.22; // 3D units
  let hueBase = 325;
  let swayAmp = 0;

  let gameState = 'START'; // START(menu) | SELECT | PLAYING | GAMEOVER | CLEAR
  let mode = 'ENDLESS';
  let cfg = ENDLESS_CFG;
  let gameOverTime = 0;
  let lastTapTime = 0;
  let score = 0;
  let bestScore = parseInt(localStorage.getItem('stackTowerBest') || '0', 10);
  let perfectCombo = 0;
  let perfectTotal = 0;
  let musicalStep = -1;

  let tower = [];
  let activeBlock = null;
  let fallingPieces = [];

  let cameraTargetY = 0;
  let cameraY = 0;


  // Stage Archetype Runtime State
  let timeRemaining = 0;
  let bossCurrentHp = 0;
  let bossMaxHp = 0;
  let bossFrenzy = false;
  let bossBlocksPlaced = 0;
  let precisionStreakAchieved = false;
  let lastTickSecond = -1;

  // Boss Cat Dynamic Character State & Engine
  let bossEmotionTimer = null;
  let currentBossState = 'idle';

  // --- NEW GIMMICK & MECHANIC RUNTIME STATES ---
  // Active Skill (3-Star Companion: Magnetic Snap)
  let activeSkillReady = false;
  let activeSkillTimer = 14.0; // Cooldown timer (seconds)
  let activeSkillNoticeShown = false;

  // Climbing Kitten (Climbs tower floor-by-floor; excluded in boss battles)
  let climbingKitten = {
    x: 0,
    z: 0,
    y: 0,
    targetY: 0,
    isJumping: false,
    jumpProgress: 0,
    state: 'idle', // 'idle' | 'loaf' | 'wobble' | 'jump'
    wobblePhase: 0
  };

  // Tilt Balance Mechanics
  let towerTiltX = 0;
  let towerTiltZ = 0;
  let towerTiltTargetX = 0;
  let towerTiltTargetZ = 0;

  // Melting Ice Cream Blocks
  let meltingBlocks = [];

  // Weather & Hold Mechanics
  let fogDensity = 0;
  let isPointerHolding = false;
  let holdStartTime = 0;
  let perfectionistStreak = 0;
