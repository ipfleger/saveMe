export default class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100 + 50;
        
        this.velX = Math.cos(angle) * speed;
        this.velY = Math.sin(angle) * speed;
        
        this.life = 1.0; // 1 second lifespan
        this.decay = Math.random() * 2 + 1; // How fast it fades
        this.size = Math.random() * 5 + 2;
    }

    update(dt) {
        this.x += this.velX * dt;
        this.y += this.velY * dt;
        this.life -= this.decay * dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}
