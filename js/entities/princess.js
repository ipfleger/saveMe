export default class Princess {
    constructor(gameWidth, gameHeight) {
        this.x = gameWidth / 2;
        this.y = gameHeight / 2;
        
        this.maxHealth = 100;
        this.health = 100;
        
        // Panic System
        this.isPanicking = false;
        this.panicTimer = 0;

        // End Game State
        this.state = 'IDLE'; // IDLE, WIN_RUN, WIN_LOVE
    }

    update(deltaTime, hero) {
        const dt = deltaTime / 1000;

        // --- Panic Logic ---
        if (this.panicTimer > 0) {
            this.panicTimer -= dt;
            if (this.panicTimer <= 0) {
                this.isPanicking = false;
            }
        }

        // --- Win Scene Logic ---
        if (this.state === 'WIN_RUN') {
            // Calculate vector to hero
            const dx = hero.x - this.x;
            const dy = hero.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist > 40) {
                // Run towards hero
                const speed = 150 * dt;
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
            } else {
                // Arrived
                this.state = 'WIN_LOVE';
                hero.isBlushing = true;
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.isPanicking = true;
        this.panicTimer = 2.0; // Scream for help for 2 seconds

        // Trigger UI event (handled in main game loop usually, but we flag it here)
        if (this.health <= 0) {
            this.health = 0;
            // Game Over logic will check this
        }
    }

    // Called when Wave 10 is cleared
    triggerWinSequence() {
        this.state = 'WIN_RUN';
    }
}
