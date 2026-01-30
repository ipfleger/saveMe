// Hero Entity - Player character
class Hero {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = PLAYER_SIZE;
        this.speed = PLAYER_SPEED;
        this.color = PLAYER_COLOR;
        this.hasPrincess = false;
    }
    
    update() {
        // Move based on input
        if (Input.isUpPressed() && this.y > 0) {
            this.y -= this.speed;
        }
        if (Input.isDownPressed() && this.y < CANVAS_HEIGHT - this.size) {
            this.y += this.speed;
        }
        if (Input.isLeftPressed() && this.x > 0) {
            this.x -= this.speed;
        }
        if (Input.isRightPressed() && this.x < CANVAS_WIDTH - this.size) {
            this.x += this.speed;
        }
    }
    
    // Check collision with another entity
    collidesWith(entity) {
        return this.x < entity.x + entity.size &&
               this.x + this.size > entity.x &&
               this.y < entity.y + entity.size &&
               this.y + this.size > entity.y;
    }
    
    // Pick up princess
    pickupPrincess() {
        this.hasPrincess = true;
    }
    
    // Deliver princess to temple
    deliverPrincess() {
        this.hasPrincess = false;
    }
    
    // Reset position
    reset() {
        this.x = 50;
        this.y = CANVAS_HEIGHT / 2 - this.size / 2;
        this.hasPrincess = false;
    }
    
    draw() {
        Renderer.drawHero(this);
    }
}
