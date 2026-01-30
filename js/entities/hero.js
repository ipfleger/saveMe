// hero.js
import { WORLD_SIZE } from './constants.js';

export default class Hero {
    // We accept x,y specifically so the Game class can spawn us in the
    // CENTER of the large world, not the center of the screen.
    constructor(x, y) {
        // --- 1. Position & Physics (Best of Both) ---
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        
        // Physics Tweaks
        this.accel = 2000;    // Snappy movement
        this.friction = 0.85; // Tight stopping
        this.maxSpeed = 400;  // Fast enough to traverse the big world

        // --- 2. State & Visuals (From Option B) ---
        this.angle = 0;       // Radians
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
        this.isBlushing = false; // "Juice" for end game

        // --- 3. Combat System (From Option B) ---
        this.weapon = 'SWORD'; // 'SWORD', 'BOW', 'MAGIC'
        this.attackCooldown = 0;
        this.isAttacking = false;

        // --- 4. Power-ups (From Option B) ---
        this.powerups = {
            spreadShot: false, // Bow shoots 3 arrows
            giantSword: false, // Sword range doubled
            fireTrail: false,  // (Future feature)
            speedBoost: false
        };
    }

    update(deltaTime, input) {
        if (this.isDead) return;

        const dt = deltaTime / 1000; 

        // --- A. MOVEMENT PHYSICS ---
        // input.move comes from the Left Stick or WASD
        if (input.move.x !== 0 || input.move.y !== 0) {
            this.velX += input.move.x * this.accel * dt;
            this.velY += input.move.y * this.accel * dt;
        }

        // Friction
        this.velX *= this.friction;
        this.velY *= this.friction;

        // Speed Cap
        const speed = Math.sqrt(this.velX**2 + this.velY**2);
        if (speed > this.maxSpeed) {
            const ratio = this.maxSpeed / speed;
            this.velX *= ratio;
            this.velY *= ratio;
        }

        // Apply Position
        this.x += this.velX * dt;
        this.y += this.velY * dt;

        // --- B. WORLD BOUNDARIES (Crucial: Option A Logic) ---
        // We clamp to WORLD_SIZE, not gameWidth/height
        if (this.x < 0) this.x = 0;
        if (this.x > WORLD_SIZE) this.x = WORLD_SIZE;
        if (this.y < 0) this.y = 0;
        if (this.y > WORLD_SIZE) this.y = WORLD_SIZE;

        // --- C. AIMING (Option B Logic) ---
        // Priority 1: Right Stick (Aiming independent of movement)
        if (Math.abs(input.aim.x) > 0.1 || Math.abs(input.aim.y) > 0.1) {
            this.angle = Math.atan2(input.aim.y, input.aim.x);
        } 
        // Priority 2: Movement Direction (If not aiming, look where you walk)
        else if ((Math.abs(input.move.x) > 0.1 || Math.abs(input.move.y) > 0.1) && !this.isAttacking) {
            this.angle = Math.atan2(input.move.y, input.move.x);
        }

        // --- D. COOLDOWNS ---
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
    }

    // Helper for the Game Loop to check if we can fire
    canShoot() {
        if (this.attackCooldown <= 0) {
            this.attackCooldown = 0.5; // Reset cooldown
            return true;
        }
        return false;
    }

    // Called by Game Loop when touching a Temple
    activatePowerUp(type) {
        this.powerups[type] = true;
        
        // Boost stats immediately if needed
        if (type === 'speedBoost') this.maxSpeed = 600;

        // Temporary effect (15 seconds)
        setTimeout(() => {
            this.powerups[type] = false;
            if (type === 'speedBoost') this.maxSpeed = 400; // Reset
        }, 15000); 
    }
}
