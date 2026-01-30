// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const FPS = 60;

// Player constants
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 5;
const PLAYER_COLOR = '#3498db';

// Princess constants
const PRINCESS_SIZE = 40;
const PRINCESS_COLOR = '#e74c3c';

// Enemy constants
const ENEMY_SIZE = 35;
const ENEMY_SPEED = 2;
const ENEMY_COLOR = '#c0392b';
const INITIAL_ENEMY_COUNT = 3;
const MAX_ENEMIES = 10;

// Temple constants
const TEMPLE_SIZE = 60;
const TEMPLE_COLOR = '#f39c12';

// Particle constants
const PARTICLE_COUNT = 20;
const PARTICLE_LIFE = 30;

// Game states
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    INSTRUCTIONS: 'instructions'
};

// Scoring
const POINTS_PER_SAVE = 100;
const POINTS_PER_ENEMY_AVOID = 10;

// Lives
const INITIAL_LIVES = 3;
