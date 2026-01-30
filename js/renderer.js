// renderer.js
import { WORLD_SIZE } from './constants.js';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        
        // "The Juice" variables
        this.shake = 0;

        // Texture Cache (From Code B - High Performance)
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

    // --- Procedural Texture Generators ---
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

    addShake(amount) {
        this.shake = amount;
    }

    // --- MAIN RENDER LOOP ---
    drawWorld(game) {
        this.ctx.save();

        // 1. CLEAR SCREEN (Fill with base color first)
        this.ctx.fillStyle = '#2c3e50'; // Dark Blue Base
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 2. CALCULATE CAMERA (From Code A - Centers Hero)
        // We clamp the camera so you can't see past the edge of the world? 
        // Or leave it free? Let's leave it free for now like Code A.
        const camX = game.hero.x - this.width / 2;
        const camY = game.hero.y - this.height / 2;

        // 3. APPLY SHAKE & CAMERA TRANSFORM
        let shakeX = 0, shakeY = 0;
        if (this.shake > 0) {
            shakeX = (Math.random() - 0.5) * this.shake;
            shakeY = (Math.random() - 0.5) * this.shake;
            this.shake *= 0.9; // Decay
            if (this.shake < 0.5) this.shake = 0;
        }

        // Move the "Context" to the correct place in the world
        this.ctx.translate(-camX + shakeX, -camY + shakeY);

        // 4. DRAW BACKGROUND PATTERN
        // We draw the grid pattern covering ONLY the visible screen area to save performance
        // Because we translated the context, drawing at (camX, camY) puts it exactly on screen.
        this.ctx.fillStyle = this.textures.grid;
        // Extend slightly to cover shake edges
        this.ctx.fillRect(camX - 20, camY - 20, this.width + 40, this.height + 40);

        // 5. DRAW WORLD BOUNDARY (Code A Feature)
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 10;
        this.ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);

        // 6. DRAW ENTITIES (Using Code B's polished styles)
        // Note: We assume 'game' holds arrays of these entities
        if (game.temples) game.temples.forEach(t => t.draw(this.ctx)); // Assuming Temple has its own draw
        if (game.particles) game.particles.forEach(p => p.draw(this.ctx)); 
        if (game.projectiles) game.projectiles.forEach(p => p.draw(this.ctx));

        if (game.princess) this.drawPrincess(game.princess);
        if (game.enemies) game.enemies.forEach(e => this.drawEnemy(e));
        
        // Draw Hero last so they are on top
        this.drawHero(game.hero);

        // 7. RESTORE CONTEXT (Switch back to Screen Coordinates for UI)
        this.ctx.restore();

        // 8. DRAW UI (Joysticks, Score, etc.)
        if (game.input && game.input.joysticks) {
            this.drawJoysticks(game.input);
        }
    }

    // --- ENTITY RENDERERS (Polished Visuals from Code B) ---

    drawHero(hero) {
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

        // Blushing Effect
        if (hero.isBlushing) {
            this.ctx.fillStyle = '#FF69B4'; // Hot Pink
            this.ctx.beginPath();
            this.ctx.arc(-8, -2, 4, 0, Math.PI*2); // Left cheek
            this.ctx.arc(8, -2, 4, 0, Math.PI*2);  // Right cheek
            this.ctx.fill();
        }

        // Sword/Weapon Visual
        this.ctx.rotate(hero.angle);
        
        // Render Sword swing if attacking (From Code A logic, Code B style)
        if (hero.isAttacking && hero.weapon === 'SWORD') {
            this.ctx.fillStyle = '#FFF';
            this.ctx.shadowBlur = 20;
            this.ctx.fillRect(15, -40, 10, 80); // Big swing visual
        } else {
             // Idle pointer/sword
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.shadowBlur = 0;
            this.ctx.fillRect(20, -5, 10, 10); 
        }

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
        
        // Spin effect
        this.ctx.rotate(Date.now() / 500 + enemy.type); 

        this.ctx.fillStyle = enemy.color;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;

        // Draw Polygon
        this.ctx.beginPath();
        const sides = enemy.sides || 3; // Default to triangle if undefined
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
            this.ctx.save();
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.moveTo(princess.x, princess.y - 40);
            this.ctx.lineTo(princess.x - 10, princess.y - 60);
            this.ctx.lineTo(princess.x + 10, princess.y - 60);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawJoysticks(input) {
        const drawStick = (stick) => {
            if (!stick || !stick.active) return;
            
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

        // Support both single joystick (Code A) and dual (Code B) structures
        if (input.joystick) drawStick(input.joystick);
        if (input.joysticks) {
            drawStick(input.joysticks.left);
            drawStick(input.joysticks.right);
        }
    }
}

// --- UTILS (From Code B) ---

export function resizeCanvas(canvas) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Handle High DPI displays (Retina)
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return { width, height };
}
