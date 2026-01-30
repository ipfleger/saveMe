export default class Temple {
    constructor(gameWidth, gameHeight, direction) {
        this.direction = direction; // 'N', 'S', 'E', 'W'
        this.width = 60;
        this.height = 60;
        
        // Position logic based on Cardinal directions
        const padding = 60;
        const midX = gameWidth / 2;
        const midY = gameHeight / 2;

        if (direction === 'N') { this.x = midX; this.y = padding; this.color = '#FF4500'; this.type = 'fireTrail'; } // Red/Fire
        if (direction === 'S') { this.x = midX; this.y = gameHeight - padding; this.color = '#00CED1'; this.type = 'speedBoost'; } // Cyan/Speed
        if (direction === 'E') { this.x = gameWidth - padding; this.y = midY; this.color = '#32CD32'; this.type = 'spreadShot'; } // Green/Bow
        if (direction === 'W') { this.x = padding; this.y = midY; this.color = '#FFD700'; this.type = 'giantSword'; } // Gold/Sword

        this.isCharged = false;
        this.energy = 0;
        this.maxEnergy = 10; // Requires 10 kills to charge
    }

    // Called whenever an enemy dies
    absorbSoul() {
        if (this.isCharged) return;
        
        this.energy++;
        if (this.energy >= this.maxEnergy) {
            this.energy = this.maxEnergy;
            this.isCharged = true;
            // Play "Charged" sound here eventually
        }
    }

    checkCollision(hero) {
        if (!this.isCharged) return false;

        // Simple box collision
        if (hero.x > this.x - this.width/2 && 
            hero.x < this.x + this.width/2 &&
            hero.y > this.y - this.height/2 && 
            hero.y < this.y + this.height/2) {
            
            // Consume charge
            this.isCharged = false;
            this.energy = 0;
            return this.type; // Return the power-up type to the Game Loop
        }
        return null;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Visual feedback for charge level
        const opacity = 0.3 + (this.energy / this.maxEnergy) * 0.7;
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity;
        
        // Draw a diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(30, 0);
        ctx.lineTo(0, 30);
        ctx.lineTo(-30, 0);
        ctx.fill();

        // If charged, add a glowing ring
        if (this.isCharged) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 40 + Math.sin(Date.now() / 200) * 5, 0, Math.PI*2);
            ctx.stroke();
            
            // Text Label
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("READY", 0, 5);
        }

        ctx.restore();
    }
}
