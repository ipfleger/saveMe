export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        
        // "The Juice" variables
        this.shake = 0;

        // Texture Cache
        this.textures = {
            dots: this.createDotPattern(),
            stripes: this.createStripePattern(),
            grid: this.createGridPattern()
        };
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    // --- Procedural Texture Generators (Run once at startup) ---
    createDotPattern() {
        const c = document.createElement('canvas');
        c.width = 20; c.height = 20;
        const x = c.getContext('2d');
        x.fillStyle = 'rgba(255, 255, 255, 0.2)';
        x.beginPath(); x.arc(10, 10, 2, 0, Math.PI*2); x.fill();
        return this.ctx.createPattern(c, 'repeat');
    }

    createStripePattern() {
        const c = document.createElement('canvas');
        c.width = 20; c.height = 20;
        const x = c.getContext('2d');
        x.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        x.lineWidth = 2;
        x.beginPath(); x.moveTo(0,0); x.lineTo(20,20); x.stroke();
        return this.ctx.createPattern(c, 'repeat');
    }
    
    createGridPattern() {
        const c = document.createElement('canvas');
        c.width = 40; c.height = 40;
        const x = c.getContext('2d');
        x.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        x.lineWidth = 1;
        x.strokeRect(0, 0, 40, 40);
        return this.ctx.createPattern(c, 'repeat');
    }

    // --- Main Draw Methods ---

    clear() {
        this.ctx.save();
        
        // Apply Screen Shake
        if (this.shake > 0) {
            const dx = (Math.random() - 0.5) * this.shake;
            const dy = (Math.random() - 0.5) * this.shake;
            this.ctx.translate(dx, dy);
            this.shake *= 0.9; // Decay shake
            if (this.shake < 0.5) this.shake = 0;
        }

        // Draw Background
        this.ctx.fillStyle = '#2c3e50'; // Dark Blue Base
        this.ctx.fillRect(-10, -10, this.width + 20, this.height + 20); // Oversize for shake
        
        // Draw Grid Texture
        this.ctx.fillStyle = this.textures.grid;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.restore();
    }

    // Triggered by explosions/damage
    addShake(amount) {
        this.shake = amount;
    }

    drawHero(hero, input) {
        this.ctx.save();
        this.ctx.translate(hero.x, hero.y);
        
        // Hero Body (Cyan Square)
        this.ctx.fillStyle = '#00FFFF';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00FFFF';
        this.ctx.fillRect(-15, -15, 30, 30);
        
        // Texture overlay
        this.ctx.fillStyle = this.textures.dots;
        this.ctx.fillRect(-15, -15, 30, 30);

        // Blushing Effect (End Game)
        if (hero.isBlushing) {
            this.ctx.fillStyle = '#FF69B4'; // Hot Pink
            this.ctx.beginPath();
            this.ctx.arc(-8, -2, 4, 0, Math.PI*2); // Left cheek
            this.ctx.arc(8, -2, 4, 0, Math.PI*2);  // Right cheek
            this.ctx.fill();
        }

        // Rotating Shield/Sword
        this.ctx.rotate(hero.angle);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(20, -5, 10, 10); // The "Sword" tip

        this.ctx.restore();
    }

    drawPrincess(princess) {
        this.ctx.save();
        this.ctx.translate(princess.x, princess.y);
        
        // Pulsing Effect
        const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
        this.ctx.scale(pulse, pulse);

        // Body
        this.ctx.fillStyle = '#FF007F';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI*2);
        this.ctx.fill();

        // Inner Glow
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI*2);
        this.ctx.fill();
        
        // Panic Arrow (If damaged recently)
        if (princess.isPanicking) {
            this.ctx.restore(); // Reset scale for UI element
            this.drawPanicArrow(princess);
            return;
        }

        this.ctx.restore();
    }
drawEnemy(enemy) {
        this.ctx.save();
        this.ctx.translate(enemy.x, enemy.y);
        
        // Spin effect based on health (spin faster when dying?)
        // Or just consistent rotation for visual interest
        this.ctx.rotate(Date.now() / 500 + enemy.type); // Offset rotation by type so they don't sync

        this.ctx.fillStyle = enemy.color;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;

        // Draw Polygon
        this.ctx.beginPath();
        const sides = enemy.sides;
        const r = enemy.radius;
        
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const px = r * Math.cos(angle);
            const py = r * Math.sin(angle);
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Boss Health Bar (Floating above head if boss)
        if (enemy.type === 5 || enemy.type === 9) {
            this.ctx.restore(); // Reset rotation
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
            
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(-20, -r - 15, 40, 5);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(-20, -r - 15, 40 * (enemy.health / enemy.maxHealth), 5);
        }

        this.ctx.restore();
    }
    
    drawPanicArrow(princess) {
        // Blinking Red Arrow above her
        if (Math.floor(Date.now() / 100) % 2 === 0) {
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.moveTo(princess.x, princess.y - 40);
            this.ctx.lineTo(princess.x - 10, princess.y - 60);
            this.ctx.lineTo(princess.x + 10, princess.y - 60);
            this.ctx.fill();
        }
    }

    // Visualize the Virtual Joysticks (Crucial for Mobile UX)
    drawJoysticks(input) {
        const drawStick = (stick) => {
            if (!stick.active) return;
            
            this.ctx.save();
            
            // Base
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.arc(stick.originX, stick.originY, 50, 0, Math.PI*2);
            this.ctx.stroke();

            // Knob
            this.ctx.beginPath();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.arc(stick.currentX, stick.currentY, 20, 0, Math.PI*2);
            this.ctx.fill();

            this.ctx.restore();
        };

        drawStick(input.joysticks.left);
        drawStick(input.joysticks.right);
    }
}
