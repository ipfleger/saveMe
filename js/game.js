// Game - Main game logic
const Game = {
    state: GAME_STATE.MENU,
    score: 0,
    lives: INITIAL_LIVES,
    hero: null,
    princess: null,
    temple: null,
    enemies: [],
    
    init: function() {
        // Initialize game objects
        this.hero = new Hero(50, CANVAS_HEIGHT / 2 - PLAYER_SIZE / 2);
        this.princess = new Princess(0, 0);
        this.temple = new Temple(CANVAS_WIDTH - TEMPLE_SIZE - 20, CANVAS_HEIGHT / 2 - TEMPLE_SIZE / 2);
        
        // Spawn initial princess
        this.princess.spawn();
        
        // Spawn initial enemies
        this.spawnEnemies(INITIAL_ENEMY_COUNT);
    },
    
    spawnEnemies: function(count) {
        for (let i = 0; i < count; i++) {
            const enemy = new Enemy(0, 0);
            enemy.spawn();
            this.enemies.push(enemy);
        }
    },
    
    start: function() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.hero.reset();
        this.princess.spawn();
        this.enemies = [];
        this.spawnEnemies(INITIAL_ENEMY_COUNT);
        ParticleSystem.clear();
        Audio.playBackgroundMusic();
        this.updateUI();
    },
    
    update: function() {
        if (this.state !== GAME_STATE.PLAYING) return;
        
        // Update hero
        this.hero.update();
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(this.hero));
        
        // Update particle system
        ParticleSystem.update();
        
        // Check if hero picks up princess
        if (!this.hero.hasPrincess && !this.princess.rescued && this.hero.collidesWith(this.princess)) {
            this.hero.pickupPrincess();
            this.princess.rescue();
            ParticleSystem.createExplosion(
                this.princess.x + this.princess.size / 2,
                this.princess.y + this.princess.size / 2,
                PRINCESS_COLOR
            );
        }
        
        // Check if hero delivers princess to temple
        if (this.hero.hasPrincess && this.hero.collidesWith(this.temple)) {
            this.hero.deliverPrincess();
            this.score += POINTS_PER_SAVE;
            this.princess.spawn();
            ParticleSystem.createExplosion(
                this.temple.x + this.temple.size / 2,
                this.temple.y + this.temple.size / 2,
                TEMPLE_COLOR
            );
            
            // Add more enemies as game progresses
            if (this.enemies.length < MAX_ENEMIES) {
                this.spawnEnemies(1);
            }
            
            this.updateUI();
        }
        
        // Check collision with enemies
        for (let enemy of this.enemies) {
            if (this.hero.collidesWith(enemy)) {
                this.lives--;
                this.updateUI();
                
                ParticleSystem.createExplosion(
                    this.hero.x + this.hero.size / 2,
                    this.hero.y + this.hero.size / 2,
                    '#e74c3c'
                );
                
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    // Reset hero position
                    this.hero.reset();
                    this.princess.spawn();
                }
                
                break;
            }
        }
    },
    
    draw: function() {
        Renderer.clear();
        
        // Draw game objects
        this.temple.draw();
        this.princess.draw();
        this.hero.draw();
        this.enemies.forEach(enemy => enemy.draw());
        
        // Draw particle effects
        ParticleSystem.draw();
    },
    
    gameOver: function() {
        this.state = GAME_STATE.GAME_OVER;
        Audio.stopBackgroundMusic();
        
        // Check for high score
        const isHighScore = Storage.setHighScore(this.score);
        
        // Show game over screen
        document.getElementById('finalScore').textContent = 
            `Final Score: ${this.score}` + (isHighScore ? ' - NEW HIGH SCORE!' : '');
        document.getElementById('gameOver').classList.remove('hidden');
    },
    
    updateUI: function() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
    }
};
