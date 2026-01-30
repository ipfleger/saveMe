// Enemy Entity - Obstacles that chase the hero
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = ENEMY_SIZE;
        this.speed = ENEMY_SPEED;
        this.color = ENEMY_COLOR;
    }
    
    // Update enemy position to chase hero
    update(hero) {
        // Calculate direction to hero
        const dx = hero.x - this.x;
        const dy = hero.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Normalize and move towards hero
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        
        // Keep enemy within bounds
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.size, this.x));
        this.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.size, this.y));
    }
    
    // Check collision with hero
    collidesWith(entity) {
        return this.x < entity.x + entity.size &&
               this.x + this.size > entity.x &&
               this.y < entity.y + entity.size &&
               this.y + this.size > entity.y;
    }
    
    // Spawn enemy at random edge position
    spawn() {
        const edge = Math.floor(Math.random() * 4);
        switch(edge) {
            case 0: // Top
                this.x = Math.random() * CANVAS_WIDTH;
                this.y = 0;
                break;
            case 1: // Right
                this.x = CANVAS_WIDTH - this.size;
                this.y = Math.random() * CANVAS_HEIGHT;
                break;
            case 2: // Bottom
                this.x = Math.random() * CANVAS_WIDTH;
                this.y = CANVAS_HEIGHT - this.size;
                break;
            case 3: // Left
                this.x = 0;
                this.y = Math.random() * CANVAS_HEIGHT;
                break;
        }
    }
    
    draw() {
        Renderer.drawEnemy(this);
    }
}
