// System Config
// UPDATED: Changed key to match new title. This ensures a fresh scoreboard.
export const STORAGE_KEY = 'hero_save_princess_v1'; 
export const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// World Settings (Added from the "Fix")
// These are needed because we moved from a small box to a Full Screen camera view
export const WORLD_SIZE = 4000; 
export const WORLD_CENTER = WORLD_SIZE / 2;

// Performance Tuning
export const MAX_PARTICLES = IS_MOBILE ? 50 : 200; 

// Colors (The Geometric Aesthetic)
export const COLORS = {
    background: '#2c3e50',
    hero: '#00FFFF',     // Cyan
    princess: '#FF007F', // Deep Pink
    text: '#FFFFFF',
    uiOverlay: 'rgba(0, 0, 0, 0.7)',
    
    // Temple Themes
    templeNorth: '#FF4500', // Fire
    templeSouth: '#00CED1', // Ice/Speed
    templeEast: '#32CD32',  // Nature/Spread
    templeWest: '#FFD700'   // Holy/Giant
};

// Gameplay Constants
export const HERO_SPEED_CAP = 350;
export const PRINCESS_MAX_HP = 100;

// RESTORED: This was deleted by the "Fix", but we kept it.
export const CRITICAL_HIT_MULTIPLIER = 10.0;
