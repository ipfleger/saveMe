export default class Hero {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        
        // Position & Physics
        this.x = gameWidth / 2 - 100; // Start slightly left of center
        this.y = gameHeight / 2;
        this.velX = 0;
        this.velY = 0;
        this.accel = 1500; // Pixels per second squared
        this.friction = 0.85; // Slide factor (lower = slippery)
        this.maxSpeed = 350;

        // State
        this.angle = 0; // Radians facing
        this.health = 100;
        this.isDead = false;
        this.isBlushing = false; // For the win scene

        // Combat
        this.weapon = 'sword'; // 'sword', 'bow', 'magic'
        this.attackCooldown = 0;
        this.isAttacking = false;

        // Temple Power-ups (Flags)
        this.powerups = {
            spreadShot: false, // Bow shoots 3 arrows
            giantSword: false, // Sword range doubled
            fireTrail: false,  // Leave damaging particles
            speedBoost: false
        };
    }

    update(deltaTime, input) {
        if (this.isDead) return;

        const dt = deltaTime / 1000; // Convert ms to seconds

        // --- 1. Movement Physics ---
        // Apply input force
        if (input.move.x !== 0 || input.move.y !== 0) {
            this.velX += input.move.x * this.accel * dt;
            this.velY += input.move.y * this.accel * dt;
        }

        // Apply Friction (always slows down)
        this.velX *= this.friction;
        this.velY *= this.friction;

        // Cap Speed (pythagorean theorem limit)
        const speed = Math.sqrt(this.velX**2 + this.velY**2);
        if (speed > this.maxSpeed) {
            const ratio = this.maxSpeed / speed;
            this.velX *= ratio;
            this.velY *= ratio;
        }

        // Apply Velocity to Position
        this.x += this.velX * dt;
        this.y += this.velY * dt;

        // Screen Boundaries (Bounce slightly)
        if (this.x < 20) { this.x = 20; this.velX *= -0.5; }
        if (this.x > this.gameWidth - 20) { this.x = this.gameWidth - 20; this.velX *= -0.5; }
        if (this.y < 20) { this.y = 20; this.velY *= -0.5; }
        if (this.y > this.gameHeight - 20) { this.y = this.gameHeight - 20; this.velY *= -0.5; }

        // --- 2. Aiming & Interaction ---
        // If using right stick, face that way. If not, face movement direction.
        if (Math.abs(input.aim.x) > 0.1 || Math.abs(input.aim.y) > 0.1) {
            this.angle = Math.atan2(input.aim.y, input.aim.x);
        } else if (Math.abs(input.move.x) > 0.1 || Math.abs(input.move.y) > 0.1) {
            this.angle = Math.atan2(input.move.y, input.move.x);
        }

        // --- 3. Attack Handling ---
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        if (input.isAttacking && this.attackCooldown <= 0) {
            this.performAttack();
        }
    }

    performAttack() {
        // Return data about the attack for the Game Loop to create projectiles/hitboxes
        this.isAttacking = true;
        
        if (this.weapon === 'sword') {
            this.attackCooldown = 0.4; // Fast swing
            // Note: The Game class detects this flag and creates the "Hitbox"
        } 
        else if (this.weapon === 'bow') {
            this.attackCooldown = 0.6; // Slower fire rate
        }
    }

    // Called by Game Loop when touching a Temple
    activatePowerUp(type) {
        // Reset others or stack them? Let's stack for fun, but clear after time.
        this.powerups[type] = true;
        
        // Simple visual feedback (grow slightly)
        // We could play a sound here via the Audio manager
        
        setTimeout(() => {
            this.powerups[type] = false;
        }, 15000); // 15 Seconds duration
    }
}
