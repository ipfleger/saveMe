// Temple Entity - Safe zone where princess is delivered
class Temple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = TEMPLE_SIZE;
        this.color = TEMPLE_COLOR;
    }
    
    // Check if hero is at temple
    collidesWith(entity) {
        return this.x < entity.x + entity.size &&
               this.x + this.size > entity.x &&
               this.y < entity.y + entity.size &&
               this.y + this.size > entity.y;
    }
    
    draw() {
        Renderer.drawTemple(this);
    }
}
