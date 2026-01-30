import Game from './game.js';
import { StorageManager } from './storage.js'; // Import Storage
import { resizeCanvas } from './renderer.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const game = new Game(ctx, canvas.width, canvas.height);
const storage = new StorageManager(); // Initialize Storage

// 1. Show High Scores on Start Screen
document.getElementById('high-scores').innerHTML = storage.getHighScoresHTML();

// Handle Window Resizing (Mobile rotation)
window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    game.resize(canvas.width, canvas.height);
});

// Initial sizing
resizeCanvas(canvas);

// Start the Loop
let lastTime = 0;
function loop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    game.update(deltaTime);
    game.draw();

    requestAnimationFrame(loop);
}

// Event Listeners for UI
document.getElementById('start-btn').addEventListener('click', () => {
    // Audio context requires user interaction to start
    game.audio.init(); 
    game.start();
    requestAnimationFrame(loop);
});

document.getElementById('retry-btn').addEventListener('click', () => {
    game.reset();
    game.start();
});
