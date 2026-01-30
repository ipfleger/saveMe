// game.js
import Hero from './entities/hero.js';
import Princess from './entities/princess.js';
import { Enemy } from './entities/enemy.js';
import Temple from './entities/temple.js';
import Particle from './entities/particle.js';
import Projectile from './entities/projectile.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { WAVE_DATA } from './wave-data.js';
import { WORLD_SIZE, WORLD_CENTER } from './constants.js';
import AudioController from './audio.js';

export default class Game {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        
        this.input = new InputHandler();
        this.renderer = new Renderer(ctx);
        this.audio = new AudioController();
        
        // Local storage wrapper
        this.storage = {
            saveScore: (val) => { try { localStorage.setItem('highScore', val); } catch(e){} }
        };

        this.reset();
    }

    reset() {
        this.state = 'MENU'; 
        
        // 1. Position Hero and Princess in middle of LARGE world (Option A)
        this.hero = new Hero(WORLD_CENTER, WORLD_CENTER);
        this.princess = new Princess(WORLD_CENTER, WORLD_CENTER);
        
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        // 2. Temples far apart (Option A positioning)
        const pad = 400;
        this.temples = [
            new Temple(WORLD_CENTER, pad, 'N'),            // Top
            new Temple(WORLD_CENTER, WORLD_SIZE - pad, 'S'), // Bottom
            new Temple(WORLD_SIZE - pad, WORLD_CENTER, 'E'), // Right
            new Temple(pad, WORLD_CENTER, 'W')             // Left
        ];

        // 3. Game State (Option B structure)
        this.waveIndex = 0;
        this.score = 0;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        
        // Clean up UI
        document.getElementById('end-screen').classList.add('hidden');
    }

    start() {
        this.state = 'PLAY';
        this.startWave(0);
    }

    startWave(index) {
        // Win Condition (Option B)
        if (index >= WAVE_DATA.length) {
            this.state = 'WIN';
            this.princess.triggerWinSequence(this.audio);
            this.updateEndScreen();
            return;
        }

        this.waveIndex = index;
        const data = WAVE_DATA[index];
        this.enemiesToSpawn = data.count;
        this.spawnTimer = 0;
        
        // Audio & UI
        this.audio.playMusic(data.isBoss ? 'boss' : 'battle');
        document.getElementById('waveVal').innerText = index + 1;
        console.log(`Starting Wave ${index + 1}`);
    }

    update(deltaTime) {
        if (this.state !== 'PLAY' && this.state !== 'WIN') return;

        const dt = deltaTime / 1000;
        
        // 1. Unified Input Handling
        // We accept both Joystick (B) and Keyboard/Gesture (A)
        const inputState = this.input.getInput(); // Assumes InputHandler returns unified state
        
        // 2. Handle Combat (Option A Logic + Option B Triggering)
        this.handleCombat(inputState);

        // 3. Update Entities
        this.hero.update(deltaTime, inputState); // Pass full input state
        this.princess.update(deltaTime, this.hero);
        this.enemies.forEach(e => e.update(dt, this.hero, this.princess));
        this.projectiles.forEach(p => p.update(dt));
        this.particles.forEach(p => p.update(dt));

        // 4. Temple Logic (Option B - Powerups)
        this.temples.forEach(t => {
            const power = t.checkCollision(this.hero);
            if (power) {
                this.hero.activatePowerUp(power);
                this.audio.playSFX('powerup');
            }
        });

        // 5. Spawning (Option A - Relative to Hero)
        this.handleSpawning(dt);

        // 6. Collisions (Merged)
        this.checkCollisions();
        
        // 7. Cleanup
        this.enemies = this.enemies.filter(e => !e.isDead);
        this.projectiles = this.projectiles.filter(p => !p.toRemove);
        this.particles = this.particles.filter(p => p.life > 0);

        // 8. Lose Condition
        if ((this.hero.health <= 0 || this.princess.health <= 0) && this.state !== 'GAMEOVER') {
            this.state = 'GAMEOVER';
            this.audio.playSFX('lose');
            this.storage.saveScore(this.score);
            this.updateEndScreen();
        }
    }

    handleCombat(input) {
        // If we are using Dual Stick (Right Stick Aim), handle that
        if (input.joysticks && input.joysticks.right.active) {
            const aimAngle = input.joysticks.right.angle;
            
            // Auto-fire based on cooldown (handled inside hero or here)
            // For now, let's map it to weapon types
            if (this.hero.weapon === 'BOW' && this.hero.canShoot()) {
                this.performBowAttack(null, null, aimAngle);
            } else if (this.hero.weapon === 'SWORD' && !this.hero.isAttacking) {
                this.hero.angle = aimAngle;
                this.performSwipeAttack();
            }
        }
        // Fallback to Mouse/Touch "Command" style (Option A)
        else if (input.action) {
             if (input.action.type === 'SWORD') {
                this.hero.angle = input.action.angle;
                this.performSwipeAttack();
            } else if (input.action.type === 'BOW') {
                this.performBowAttack(input.action.x, input.action.y, null);
            } else if (input.action.type === 'MAGIC') {
                this.performMagicAttack();
            }
        }
    }

    performSwipeAttack() {
        this.hero.isAttacking = true;
        this.hero.weapon = 'SWORD';
        this.audio.playSFX('shoot'); // Whoosh sound

        // Logic from Option A (Radius Check)
        const reach = this.hero.powerups.giantSword ? 140 : 100;
        const arc = 1.5; 
        
        this.enemies.forEach(e => {
            const dx = e.x - this.hero.x;
            const dy = e.y - this.hero.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < reach) {
                const angleToEnemy = Math.atan2(dy, dx);
                let diff = angleToEnemy - this.hero.angle;
                while (diff > Math.PI) diff -= Math.PI*2;
                while (diff < -Math.PI) diff += Math.PI*2;

                if (Math.abs(diff) < arc/2) {
                    // Apply Damage & Knockback
                    this.damageEnemy(e, 50); 
                    e.x += Math.cos(angleToEnemy) * 30;
                    e.y += Math.sin(angleToEnemy) * 30;
                }
            }
        });
        
        setTimeout(() => { this.hero.isAttacking = false; }, 150);
    }

    performBowAttack(screenX, screenY, forceAngle) {
        let angle;

        if (forceAngle !== null) {
            angle = forceAngle;
        } else {
            // Option A: Convert Screen Coords to World Coords
            // This is CRITICAL for scrolling worlds
            const camX = this.hero.x - this.width / 2;
            const camY = this.hero.y - this.height / 2;
            const worldX = screenX + camX;
            const worldY = screenY + camY;
            angle = Math.atan2(worldY - this.hero.y, worldX - this.hero.x);
        }
        
        this.projectiles.push(new Projectile(this.hero.x, this.hero.y, angle, 'arrow'));
        
        // Spread Shot Powerup (Option B Feature)
        if (this.hero.powerups.spreadShot) {
            this.projectiles.push(new Projectile(this.hero.x, this.hero.y, angle - 0.3, 'arrow'));
            this.projectiles.push(new Projectile(this.hero.x, this.hero.y, angle + 0.3, 'arrow'));
        }

        this.audio.playSFX('shoot');
    }

    performMagicAttack() {
        const mine = new Projectile(this.hero.x, this.hero.y, 0, 'magic');
        mine.speed = 0;
        mine.life = 5.0;
        this.projectiles.push(mine);
    }

    handleSpawning(dt) {
        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                const data = WAVE_DATA[this.waveIndex];
                
                // Option A Spawning: Relative to Hero (Essential for Open World)
                // Spawns 800px away in random direction
                const angle = Math.random() * Math.PI * 2;
                const r = 800; 
                const ex = this.hero.x + Math.cos(angle) * r;
                const ey = this.hero.y + Math.sin(angle) * r;

                // Determine type
                let type = data.types[Math.floor(Math.random() * data.types.length)];
                if (data.isBoss && this.enemiesToSpawn === 1) {
                    type = (this.waveIndex === 9) ? 9 : 5; 
                }

                this.enemies.push(new Enemy(ex, ey, type));
                
                this.enemiesToSpawn--;
                this.spawnTimer = data.interval;
            }
        } else if (this.enemies.length === 0) {
            this.startWave(this.waveIndex + 1);
        }
    }

    checkCollisions() {
        // 1. Enemy vs Hero (Contact Damage)
        this.enemies.forEach(e => {
            const dist = Math.hypot(e.x - this.hero.x, e.y - this.hero.y);
            if (dist < e.radius + 15) {
                this.hero.health -= 1;
                // Knockback
                const angle = Math.atan2(this.hero.y - e.y, this.hero.x - e.x);
                this.hero.x += Math.cos(angle) * 5;
                this.hero.y += Math.sin(angle) * 5;
            }
        });

        // 2. Projectile vs Enemy
        this.projectiles.forEach(p => {
            this.enemies.forEach(e => {
                if (p.toRemove) return;
                const dist = Math.hypot(e.x - p.x, e.y - p.y);
                if (dist < e.radius + p.radius) {
                    this.damageEnemy(e, p.damage);
                    if (!p.piercing) p.toRemove = true;
                }
            });
        });
    }

    damageEnemy(enemy, amt) {
        if (enemy.takeDamage(amt)) {
            // DIED
            this.audio.playSFX('hit');
            this.score += enemy.scoreValue;
            document.getElementById('scoreVal').innerText = this.score;
            
            this.renderer.addShake(5); // Screen Shake (Option B)
            
            // Temple Souls (Option B)
            this.temples.forEach(t => t.absorbSoul());

            // Particles (Option B)
            for(let i=0; i<5; i++) {
                this.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
            }
        } else {
            // HIT
            this.particles.push(new Particle(enemy.x, enemy.y, '#FFF'));
        }
    }

    draw() {
        // CRITICAL: Use the Camera-Aware Method from the new Renderer
        this.renderer.clear();
        this.renderer.drawWorld(this);
    }
    
    resize(w, h) {
        this.width = w; this.height = h;
        this.renderer.resize(w, h);
    }

    updateEndScreen() {
        const endScreen = document.getElementById('end-screen');
        endScreen.classList.remove('hidden');
        document.getElementById('final-score').innerText = this.score;
        const title = document.getElementById('end-title');
        
        if (this.state === 'WIN') {
            title.innerText = "YOU WIN";
            title.style.color = "#FF007F";
        } else {
            title.innerText = "GAME OVER";
            title.style.color = "white";
        }
    }
}
