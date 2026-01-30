export default class Projectile {
    constructor(x, y, angle, type) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.type = type;
        
        this.toRemove = false;
        
        // Default Stats
        this.speed = 600;
        this.radius = 4;
        this.damage = 10;
        this.piercing = false;
        this.color = '#FFFFFF';
        
        if (type === 'arrow') {
            this.speed = 900;
            this.damage = 25;
            this.color = '#FFFF00'; // Yellow
        }
    }

    update(dt) {
        // Move in direction of angle
        this.x += Math.cos(this.angle) * this.speed * dt;
        this.y += Math.sin(this.angle) * this.speed * dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = this.color;
        
        // Draw Arrow Shape
        ctx.beginPath();
        ctx.moveTo(-10, -3);
        ctx.lineTo(5, -3);
        ctx.lineTo(10, 0);
        ctx.lineTo(5, 3);
        ctx.lineTo(-10, 3);
        ctx.fill();

        ctx.restore();
    }
}
