// Particle Entity - Visual effects
class Particle {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = Math.random() * 3 + 2;
        this.color = color || '#fff';
        this.life = PARTICLE_LIFE;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        
        // Apply gravity
        this.vy += 0.1;
    }
    
    isDead() {
        return this.life <= 0;
    }
    
    draw() {
        Renderer.drawParticle(this);
    }
}

// Particle system manager
const ParticleSystem = {
    particles: [],
    
    // Create particle explosion
    createExplosion: function(x, y, color) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = (Math.PI * 2 * i) / PARTICLE_COUNT;
            const speed = Math.random() * 3 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new Particle(x, y, vx, vy, color));
        }
    },
    
    update: function() {
        // Update all particles
        this.particles.forEach(particle => particle.update());
        
        // Remove dead particles
        this.particles = this.particles.filter(particle => !particle.isDead());
    },
    
    draw: function() {
        this.particles.forEach(particle => particle.draw());
    },
    
    clear: function() {
        this.particles = [];
    }
};
