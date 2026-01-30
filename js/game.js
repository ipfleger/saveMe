import Hero from './entities/hero.js';
import Princess from './entities/princess.js';
import Enemy from './entities/enemy.js';
import Temple from './entities/temple.js';
import Particle from './entities/particle.js';
import Projectile from './entities/projectile.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { WAVE_DATA, getSpawnPoint } from './wave-data.js';

export default class Game {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        
        this.input = new InputHandler();
        this.renderer = new Renderer(ctx);
        
        this.audio = { play: () => {} }; // Placeholder for audio.js later
        
        this.reset();
    }

    reset() {
        this.state = 'MENU'; // MENU, PLAY, GAMEOVER, WIN
        this.hero = new Hero(this.width, this.height);
        this.princess = new Princess(this.width, this.height);
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        // Setup 4 Temples
        this.temples = [
            new Temple(this.width, this.height, 'N'),
            new Temple(this.width, this.height, 'S'),
            new Temple(this.width, this.height, 'E'),
            new Temple(this.width, this.height, 'W')
        ];

        // Wave Logic
        this.waveIndex = 0;
        this.waveTimer = 0;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.score = 0;
    }

    start() {
        this.state = 'PLAY';
        this.(0);
    }

    startWave(index) {
        this.waveIndex = index;
        
        // --- NEW AUDIO LOGIC ---
        const data = WAVE_DATA[index];
        https://github.com/ipfleger/saveMe/tree/main/js
        // If it's a Boss Wave, play "Meltdown"
        if (data.isBoss) {
            this.audio.playMusic('boss');
        } 
        // Otherwise ensure "God Mode" is playing (if not already)
        else {
            this.audio.playMusic('battle');
        }
        if (index >= WAVE_DATA.length) {
            this.princess.triggerWinSequence();
            this.state = 'WIN';
            return;
        }
        
        const data = WAVE_DATA[index];
        this.enemiesToSpawn = data.count;
        this.waveTimer = 0;
        console.log(`Starting Wave ${index + 1}`);
        
        // Update HUD
        document.getElementById('waveVal').innerText = index + 1;
    }

    // --- MAIN LOOP ---
    update(deltaTime) {
        if (this.state !== 'PLAY' && this.state !== 'WIN') return;

        const dt = deltaTime / 1000;
        const inputState = this.input.getInput();

        // 1. Update Entities
        this.hero.update(deltaTime, inputState);
        this.princess.update(deltaTime, this.hero);
        
        this.enemies.forEach(e => e.update(dt, this.hero, this.princess));
        this.projectiles.forEach(p => p.update(dt));
        this.particles.forEach(p => p.update(dt));
        
        // 2. Temple Logic
        this.temples.forEach(t => {
            const power = t.checkCollision(this.hero);
            if (power) this.hero.activatePowerUp(power);
        });

        // 3. Spawning Logic
        this.handleSpawning(dt);

        // 4. COMBAT & COLLISIONS (The Core System)
        this.checkCollisions();
        
        // 5. Cleanup  Objects
        this.enemies = this.enemies.filter(e => !e.is);
        this.projectiles = this.projectiles.filter(p => !p.toRemove);
        this.particles = this.particles.filter(p => p.life > 0);

        // 6. Game Over Check
        if (this.princess.health <= 0 || this.hero.health <= 0) {
            this.state = 'GAMEOVER';
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('final-score').innerText = this.score;
        }
    }

    handleSpawning(dt) {
        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                const data = WAVE_DATA[this.waveIndex];
                const pt = getSpawnPoint(this.width, this.height);
                
                // Pick random type from wave config
                let type = data.types[Math.floor(Math.random() * data.types.length)];
                
                // If boss wave, force boss on last spawn
                if (data.isBoss && this.enemiesToSpawn === 1) {
                    type = (this.waveIndex === 9) ? 9 : 5; // Final Boss or MiniBoss
                }

                this.enemies.push(new Enemy(pt.x, pt.y, type));
                this.enemiesToSpawn--;
                this.spawnTimer = data.interval;
            }
        } 
        else if (this.enemies.length === 0) {
            // Wave Complete
            this.startWave(this.waveIndex + 1);
        }
    }

    // --- THE COMBAT LOGIC ---
    checkCollisions() {
        // A. Hero Attack Handling
        if (this.hero.isAttacking) {
            
            // 1. SWORD LOGIC (Arc Collision)
            if (this.hero.weapon === 'sword') {
                const reach = this.hero.powerups.giantSword ? 100 : 60;
                const swingArc = 1.5; // Radians (~90 degrees)

                this.enemies.forEach(enemy => {
                    const dx = enemy.x - this.hero.x;
                    const dy = enemy.y - this.hero.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < reach) {
                        // Check angle to see if enemy is "in front"
                        const angleToEnemy = Math.atan2(dy, dx);
                        let angleDiff = angleToEnemy - this.hero.angle;
                        
                        // Normalize angle (-PI to PI)
                        while (angleDiff > Math.PI) angleDiff -= Math.PI*2;
                        while (angleDiff < -Math.PI) angleDiff += Math.PI*2;

                        if (Math.abs(angleDiff) < swingArc / 2) {
                            this.damageEnemy(enemy, 50); // High damage
                            // Pushback
                            enemy.x += Math.cos(angleToEnemy) * 20;
                            enemy.y += Math.sin(angleToEnemy) * 20;
                        }
                    }
                });
                this.hero.isAttacking = false; // Reset flag immediately after checking
            }
            
            // 2. BOW LOGIC (Spawn Projectile)
            else if (this.hero.weapon === 'bow') {
                this.audio.playSFX('shoot');
                this.projectiles.push(new Projectile(this.hero.x, this.hero.y, this.hero.angle, 'arrow'));
                
                if (this.hero.powerups.spreadShot) {
                    this.projectiles.push(new Projectile(this.hero.x, this.hero.y, this.hero.angle - 0.3, 'arrow'));
                    this.projectiles.push(new Projectile(this.hero.x, this.hero.y, this.hero.angle + 0.3, 'arrow'));
                }
                this.hero.isAttacking = false;
            }
        }

        // B. Projectile vs Enemy
        this.projectiles.forEach(proj => {
            // Screen bounds
            if (proj.x < 0 || proj.x > this.width || proj.y < 0 || proj.y > this.height) {
                proj.toRemove = true;
            }

            this.enemies.forEach(enemy => {
                if (proj.toRemove) return;
                
                const dx = enemy.x - proj.x;
                const dy = enemy.y - proj.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < enemy.radius + proj.radius) {
                    this.damageEnemy(enemy, proj.damage);
                    if (!proj.piercing) proj.toRemove = true;
                }
            });
        });
    }

    damageEnemy(enemy, amount) {
        const  = enemy.takeDamage(amount);
        if (dead) {
            this.audio.playSFX('hit'); 
            this.score += enemy.scoreValue;
            document.getElementById('scoreVal').innerText = this.score;
            
            // Charge Temples
            this.temples.forEach(t => t.absorbSoul());

            // Spawn Particles (The Juice!)
            for(let i=0; i<5; i++) {
                this.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
            }
            
            // Screen Shake
            this.renderer.addShake(5);
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.renderer.resize(w, h);
    }

    draw() {
        this.renderer.clear();
        
        // Draw Order: Temples -> Particles -> Projectiles -> Princess -> Enemies -> Hero
        this.temples.forEach(t => t.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        
        this.renderer.drawPrincess(this.princess);
        this.enemies.forEach(e => this.renderer.drawEnemy(e));
        this.renderer.drawHero(this.hero, this.input); // Hero on top
        
        // Draw Input UI
        this.renderer.drawJoysticks(this.input);
    }
}
