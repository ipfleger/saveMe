// System Config
export const STORAGE_KEY = 'geo_guardian_ranks_v1';
export const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Performance Tuning
// Reduce particles on mobile to prevent lag
export const MAX_PARTICLES = IS_MOBILE ? 50 : 200; 

// Colors (The Geometric Aesthetic)
export const COLORS = {
    background: '#2c3e50',
    hero: '#00FFFF',   // Cyan
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
export const CRITICAL_HIT_MULTIPLIER = 2.0;
