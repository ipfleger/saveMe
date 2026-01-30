// Renderer - Handles all drawing operations
const Renderer = {
    canvas: null,
    ctx: null,
    
    init: function(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
    },
    
    clear: function() {
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    },
    
    drawRect: function(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    },
    
    drawCircle: function(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    },
    
    drawText: function(text, x, y, color = 'white', fontSize = 20) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillText(text, x, y);
    },
    
    // Draw hero
    drawHero: function(hero) {
        // Body
        this.drawRect(hero.x, hero.y, hero.size, hero.size, hero.color);
        
        // Simple face
        this.drawCircle(hero.x + hero.size * 0.3, hero.y + hero.size * 0.35, 3, '#fff');
        this.drawCircle(hero.x + hero.size * 0.7, hero.y + hero.size * 0.35, 3, '#fff');
    },
    
    // Draw princess
    drawPrincess: function(princess) {
        // Body
        this.drawRect(princess.x, princess.y, princess.size, princess.size, princess.color);
        
        // Crown
        this.drawRect(princess.x + princess.size * 0.2, princess.y - 8, princess.size * 0.6, 8, '#f39c12');
    },
    
    // Draw enemy
    drawEnemy: function(enemy) {
        // Body
        this.drawRect(enemy.x, enemy.y, enemy.size, enemy.size, enemy.color);
        
        // Evil eyes
        this.drawCircle(enemy.x + enemy.size * 0.3, enemy.y + enemy.size * 0.35, 3, '#000');
        this.drawCircle(enemy.x + enemy.size * 0.7, enemy.y + enemy.size * 0.35, 3, '#000');
    },
    
    // Draw temple
    drawTemple: function(temple) {
        // Temple base
        this.drawRect(temple.x, temple.y, temple.size, temple.size, temple.color);
        
        // Temple roof
        this.ctx.fillStyle = '#d68910';
        this.ctx.beginPath();
        this.ctx.moveTo(temple.x - 5, temple.y);
        this.ctx.lineTo(temple.x + temple.size / 2, temple.y - 15);
        this.ctx.lineTo(temple.x + temple.size + 5, temple.y);
        this.ctx.closePath();
        this.ctx.fill();
    },
    
    // Draw particle
    drawParticle: function(particle) {
        this.ctx.globalAlpha = particle.life / PARTICLE_LIFE;
        this.drawCircle(particle.x, particle.y, particle.size, particle.color);
        this.ctx.globalAlpha = 1.0;
    }
};
