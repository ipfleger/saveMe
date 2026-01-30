// Princess Entity - Character to be saved
class Princess {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = PRINCESS_SIZE;
        this.color = PRINCESS_COLOR;
        this.rescued = false;
    }
    
    // Spawn princess at a random location
    spawn() {
        this.x = Math.random() * (CANVAS_WIDTH - this.size);
        this.y = Math.random() * (CANVAS_HEIGHT - this.size);
        this.rescued = false;
    }
    
    // Mark princess as rescued
    rescue() {
        this.rescued = true;
    }
    
    draw() {
        if (!this.rescued) {
            Renderer.drawPrincess(this);
        }
    }
}
