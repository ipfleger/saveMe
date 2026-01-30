export class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 0 to 9 (defines visuals and stats)
        
        // Stats defaults (overwritten by applyTypeStats)
        this.speed = 100;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 10;
        this.scoreValue = 10;
        this.radius = 15;
        this.color = '#ff0000';
        this.sides = 3; // For drawing (3=triangle, 4=square, etc.)
        
        this.isDead = false;
        
        // Status Effects
        this.freezeTimer = 0; // From Ice Temple
        this.burnTimer = 0;   // From Fire Temple
        
        this.applyTypeStats();
    }

    applyTypeStats() {
        // 10 Varieties of Bad Guys
        const stats = [
            { hp: 20, spd: 120, sides: 3, col: '#FF5733', val: 10 }, // 0: Fast Triangle
            { hp: 40, spd: 80, sides: 4, col: '#C70039', val: 20 },  // 1: Tanky Square
            { hp: 30, spd: 150, sides: 3, col: '#FFC300', val: 30 }, // 2: Speeder (Yellow)
            { hp: 80, spd: 60, sides: 5, col: '#900C3F', val: 40 },  // 3: Pentagon Tank
            { hp: 50, spd: 100, sides: 6, col: '#581845', val: 50 }, // 4: Hexagon
            { hp: 300, spd: 90, sides: 5, col: '#FF0000', val: 500, radius: 40 }, // 5: MINI-BOSS (Wave 5)
            { hp: 60, spd: 130, sides: 3, col: '#DAF7A6', val: 60 }, // 6: Elite Triangle
            { hp: 100, spd: 70, sides: 8, col: '#2E86C1', val: 70 }, // 7: Octagon
            { hp: 150, spd: 40, sides: 4, col: '#17202A', val: 80 }, // 8: Black Square
            { hp: 2000, spd: 50, sides: 10, col: '#FFFFFF', val: 5000, radius: 60 } // 9: FINAL BOSS
        ];

        const s = stats[this.type];
        this.health = s.hp;
        this.maxHealth = s.hp;
        this.speed = s.spd;
        this.sides = s.sides;
        this.color = s.col;
        this.scoreValue = s.val;
        if (s.radius) this.radius = s.radius;
    }

    update(dt, hero, princess) {
        if (this.isDead) return;

        // Apply Status Effects (Temple Powers)
        let actualSpeed = this.speed;
        if (this.freezeTimer > 0) {
            this.freezeTimer -= dt;
            actualSpeed *= 0.5; // Slowed by 50%
        }
        if (this.burnTimer > 0) {
            this.burnTimer -= dt;
            this.takeDamage(50 * dt); // Burn damage over time
        }

        // --- AI Logic ---
        
        // 1. Calculate distances
        const distToHero = Math.hypot(hero.x - this.x, hero.y - this.y);
        const distToPrincess = Math.hypot(princess.x - this.x, princess.y - this.y);

        let target = princess;
        
        // 2. Aggro Logic: Target Hero if closer than 200px
        // Exception: Bosses (Type 5 and 9) might ignore this rule to force pressure on Princess? 
        // Let's keep it consistent for now: they hate the hero too.
        if (distToHero < 250) {
            target = hero;
        }

        // 3. Move towards target
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
            this.x += (dx / dist) * actualSpeed * dt;
            this.y += (dy / dist) * actualSpeed * dt;
        }

        // 4. Collision with Target (Simple damage tick)
        // Note: Hero collision is usually handled in the Game Loop for "Invincibility Frames"
        // But we handle Princess damage here because she doesn't have i-frames.
        if (target === princess && dist < this.radius + 20) {
            princess.takeDamage(10 * dt); // Damage per second
            // Push back slightly to prevent sticking
            this.x -= (dx / dist) * 10;
            this.y -= (dy / dist) * 10;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            return true; // Return true to tell Game Loop to spawn particles
        }
        return false;
    }
}
