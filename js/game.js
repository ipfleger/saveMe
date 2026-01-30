import Hero from './entities/hero.js';
import Princess from './entities/princess.js';
import Enemy from './entities/enemy.js';
import Temple from './entities/temple.js';
import Particle from './entities/particle.js';
import Projectile from './entities/projectile.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { WAVE_DATA, getSpawnPoint } from './wave-data.js';
import AudioController from './audio.js'; // Import the real audio controller

export default class Game {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        
        this.input = new InputHandler();
        this.renderer = new Renderer(ctx);
        
        // Initialize the real audio system
        this.audio = new AudioController();
        
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
        this.startWave(0);
    }

    startWave(index) {
        this.waveIndex = index;

        // Check for Win Condition first
        if (index >= WAVE_DATA.length) {
            // Pass the audio controller to the princess so she can play the jingle
            this.princess.triggerWinSequence(this.audio);
            this.state = 'WIN';
            return;
        }

        const data = WAVE_DATA[index];
        
        // --- AUDIO LOGIC ---
        if (data.isBoss) {
            this.audio.playMusic('boss');
        } 
        else {
            this.audio.playMusic('battle');
        }
        
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
        
        // 5. Cleanup Objects
        this.enemies = this.enemies.filter(e => !e.isDead);
        this.projectiles = this.projectiles.filter(p => !p.toRemove);
        this.particles = this.particles.filter(p => p.life > 0);

        // 6. Game Over Check
        if (this.princess.health <= 0 || this.hero.health <= 0) {
            if (this.state !== 'GAMEOVER') {
                this.state = 'GAMEOVER';
                
                this.audio.playSFX('lose'); // Play real SFX
                
                // Save Score
                // Check if storage exists (it's assigned in main.js)
                if (this.storage) this.storage.saveScore(this.score);
                
                // Update UI
                const endScreen = document.getElementById('end-screen');
                endScreen.classList.remove('hidden');
                
                document.getElementById('final-score').innerText = this.score;
                
                const title = document.getElementById('end-title');
                title.innerText = (this.princess.health > 0 && this.hero.health > 0) ? "YOU WIN" : "GAME OVER";
                title.style.color = (this.princess.health > 0) ? "#FF007F" : "white";
            }
        }
    }

    handleSpawning(dt) {
        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                const data = WAVE_DATA[this.waveIndex];
                const pt = getSpawnPoint(this.width, this.height);
                
                let type = data.types[Math.floor(Math.random() * data.types.length)];
                
                if (data.isBoss && this.enemiesToSpawn === 1) {
                    type = (this.waveIndex === 9) ? 9 : 5; 
                }

                this.enemies.push(new Enemy(pt.x, pt.y, type));
                this.enemiesToSpawn--;
                this.spawnTimer = data.interval;
            }
        } 
        else if (this.enemies.length === 0) {
            this.startWave(this.waveIndex + 1);
        }
    }

    checkCollisions() {
        // A. Hero Attack Handling
        if (this.hero.isAttacking) {
            // 1. SWORD LOGIC
            if (this.hero.weapon === 'sword') {
                const reach = this.hero.powerups.giantSword ? 100 : 60;
                const swingArc = 1.5; 

                this.enemies.forEach(enemy => {
                    const dx = enemy.x - this.hero.x;
                    const dy = enemy.y - this.hero.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < reach) {
                        const angleToEnemy = Math.atan2(dy, dx);
                        let angleDiff = angleToEnemy - this.hero.angle;
                        
                        while (angleDiff > Math.PI) angleDiff -= Math.PI*2;
                        while (angleDiff < -Math.PI) angleDiff += Math.PI*2;

                        if (Math.abs(angleDiff) < swingArc / 2) {
                            this.damageEnemy(enemy, 50);
                            enemy.x += Math.cos(angleToEnemy) * 20;
                            enemy.y += Math.sin(angleToEnemy) * 20;
                        }
                    }
                });
                this.hero.isAttacking = false;
            }
            // 2. BOW LOGIC
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
        const isDead = enemy.takeDamage(amount);
        if (isDead) {
            this.audio.playSFX('hit'); 
            this.score += enemy.scoreValue;
            document.getElementById('scoreVal').innerText = this.score;
            
            this.temples.forEach(t => t.absorbSoul());

            for(let i=0; i<5; i++) {
                this.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
            }
            
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
        this.temples.forEach(t => t.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.renderer.drawPrincess(this.princess);
        this.enemies.forEach(e => this.renderer.drawEnemy(e));
        this.renderer.drawHero(this.hero, this.input);
        this.renderer.drawJoysticks(this.input);
    }
}
